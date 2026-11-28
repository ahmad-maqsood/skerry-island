import { useCallback, useEffect, useRef, useState } from "react";
import type { IslandSettings } from "../../features/appearance/types";
import { listenIslandHover } from "./api";
import { idlePlan } from "./idleCollapse";
import { keepIslandVisible, keepVisibleChangesAt } from "./keepVisible";
import { MESSAGE_PEEK_RETRACT_MS, messagePeekSettles, retractsPeek, revealsForKeepVisible, revealsForTuckingOff } from "./tuckRules";
import { useIdleTuck, useRevealOnMessage } from "./useIslandAutomation";
import { isEditingText } from "./useHoverExpand";
import type { useIslandNavigation } from "./useIslandNavigation";
import { useDesktopIsland } from "./useDesktopIsland";
import { useTuckPeek } from "./useTuckPeek";
import { isIslandPickerOpen, useIslandPickerOpen } from "../../lib/islandPicker";

type IslandTuckingOptions = {
  settings: IslandSettings;
  navigation: ReturnType<typeof useIslandNavigation>;
  hasMessagePreview: boolean;
  /** What "Stay visible while…" looks at (keepVisible.ts). */
  activity: Parameters<typeof keepIslandVisible>[1];
  /** Game mode holds the island back or tucked it; keep-visible does not undo that. */
  gameHolds: boolean;
};

/**
 * Collapsing the open island once the cursor has been away long enough (A), tucking the
 * collapsed island away when idle (B), sliding it out for what needs to be seen, and ending a peek.
 */
export function useIslandTucking({ settings, navigation, hasMessagePreview, activity, gameHolds }: IslandTuckingOptions) {
  const { mode, page, isTucked, isPeeking, peekRetractDelayMs, tuckedAutomatically, messagePeek, settleMessagePeek, idleTuck, collapseIsland, revealIsland, revealForMessage, endPeek } = navigation;
  const isHovering = useIslandHovering();
  const pickerOpen = useIslandPickerOpen();
  const keepForActivity = useKeepVisible(settings, activity);
  // A window opening tucks the island the way idling does: a peek slides it back, if that is on.
  const tuckWhenIdle = useCallback(
    () => idleTuck(settings.autoTuckRetract ? settings.autoTuckRetractDelayMs : null),
    [idleTuck, settings.autoTuckRetract, settings.autoTuckRetractDelayMs],
  );
  // While no window is open the island stays out in its collapsed form; see useDesktopIsland.
  const onDesktop = useDesktopIsland({ settings, mode, isTucked, gameHolds, tuckForWindow: tuckWhenIdle, revealIsland });
  const keepVisible = keepForActivity || onDesktop;
  const tuckState = {
    isTucked, isPeeking, tuckedAutomatically, keepVisible, hasMessagePreview, isPreviewing: navigation.isPreviewing, gameHolds,
  };
  useRevealOnTuckingOff(settings.autoTuck && !settings.alwaysShowIsland, tuckState, revealIsland);
  const settlesMessagePeek = messagePeekSettles({ ...tuckState, messagePeek, isHovering });
  useEffect(() => {
    if (settlesMessagePeek) settleMessagePeek();
  }, [settlesMessagePeek, settleMessagePeek]);
  const revealForActivity = revealsForKeepVisible(tuckState);
  useEffect(() => {
    if (revealForActivity) revealIsland();
  }, [revealForActivity, revealIsland]);
  // A showing preview holds the idle timer, which then restarts in full once it ends.
  // Closing under a draft would lose it; the next keystroke or move starts the wait again.
  const collapseWhenIdle = useCallback(() => {
    if (!isEditingText() && !isIslandPickerOpen()) collapseIsland();
  }, [collapseIsland]);
  const plan = navigation.isPreviewing || pickerOpen ? null : idlePlan(mode, settings, hasMessagePreview, isHovering, keepVisible);
  useIdleTuck(
    plan !== null,
    plan?.seconds ?? 0,
    isTucked,
    `${mode}:${page}`,
    plan?.action === "collapse" ? collapseWhenIdle : tuckWhenIdle,
  );
  useRevealOnMessage(hasMessagePreview, isTucked, revealForMessage);
  // A preview holds the peek; the island slides back once it has gone and the cursor is away.
  useTuckPeek(retractsPeek(tuckState), endPeek, messagePeek ? MESSAGE_PEEK_RETRACT_MS : peekRetractDelayMs ?? undefined);
}

/** Brings the island out when the settings stop it tucking itself (revealsForTuckingOff). */
function useRevealOnTuckingOff(
  tucking: boolean,
  state: Parameters<typeof revealsForTuckingOff>[2] & { isPreviewing: boolean },
  revealIsland: () => void,
) {
  const wasTucking = useRef(tucking);
  const { isTucked, isPeeking, gameHolds, isPreviewing } = state;
  useEffect(() => {
    // A settings preview restores the old state when it ends, so the change waits until then.
    if (isPreviewing) return;
    const was = wasTucking.current;
    wasTucking.current = tucking;
    if (revealsForTuckingOff(was, tucking, { isTucked, isPeeking, gameHolds })) revealIsland();
  }, [tucking, isTucked, isPeeking, gameHolds, isPreviewing, revealIsland]);
}

/**
 * Whether "Stay visible while…" holds the island now. Re-checked when a todo timer that holds it
 * runs out, which nothing else re-renders for: the island used to stay out after the timer ended.
 */
function useKeepVisible(settings: IslandSettings, activity: IslandTuckingOptions["activity"]) {
  const [, rerender] = useState(0);
  const now = Date.now();
  const changesAt = keepVisibleChangesAt(settings, activity, now);
  useEffect(() => {
    if (changesAt === null) return;
    const timer = window.setTimeout(() => rerender((count) => count + 1), Math.max(0, changesAt - Date.now()) + 50);
    return () => window.clearTimeout(timer);
  }, [changesAt]);
  return keepIslandVisible(settings, activity, now);
}

/** Whether the cursor is over the island, from the native hover events. */
function useIslandHovering() {
  const [isHovering, setIsHovering] = useState(false);
  useEffect(() => {
    let didCancel = false;
    let unlisten: (() => void) | null = null;
    void listenIslandHover(setIsHovering)
      .then((next) => {
        if (didCancel) next();
        else unlisten = next;
      })
      .catch((error) => console.error("Failed to listen for island hover", error));
    return () => {
      didCancel = true;
      unlisten?.();
    };
  }, []);
  return isHovering;
}
