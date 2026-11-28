import { useEffect, useRef, useState } from "react";
import type { IslandSettings } from "../../features/appearance/types";
import { getForegroundFullscreen, listenForegroundFullscreen } from "./api";
import { desktopAction } from "./tuckRules";
import type { IslandMode } from "./types";

type DesktopIslandOptions = {
  settings: Pick<IslandSettings, "alwaysShowOnDesktop" | "autoTuck" | "alwaysShowIsland">;
  mode: IslandMode;
  isTucked: boolean;
  /** Game mode holds the island back or tucked it; the desktop does not undo that. */
  gameHolds: boolean;
  /** Tucks the collapsed island the way the idle timer does. */
  tuckForWindow: () => void;
  revealIsland: () => void;
};

/**
 * "Always display island on the desktop": while no app window is open the island sits out in its
 * collapsed form (and one that was tucked comes out); when a window opens, even a small one, it
 * tucks, if "Tuck to the edge when idle" is on. Returns whether the desktop is clear, which also
 * holds the idle tuck off (keepVisible). Does nothing while the island is always displayed.
 */
export function useDesktopIsland({ settings, mode, isTucked, gameHolds, tuckForWindow, revealIsland }: DesktopIslandOptions) {
  const watching = settings.alwaysShowOnDesktop && !settings.alwaysShowIsland;
  const desktopClear = useDesktopClear(watching);
  const { autoTuck } = settings;
  const latest = useRef({ mode, isTucked, gameHolds, autoTuck });
  const previous = useRef<boolean | null>(null);
  // Declared first: effects run in order, and the one below reads what this keeps.
  useEffect(() => {
    latest.current = { mode, isTucked, gameHolds, autoTuck };
  });
  // Only a change moves the island (tuckRules.ts), so a minimize on the clear desktop stays.
  useEffect(() => {
    const action = desktopAction(previous.current, desktopClear, latest.current);
    previous.current = desktopClear;
    if (action === "reveal") revealIsland();
    else if (action === "tuck") tuckForWindow();
  }, [desktopClear, revealIsland, tuckForWindow]);
  return desktopClear === true;
}

/**
 * Whether no app window is open, from the native check (every 800 ms). Null while not watching and
 * until the first answer, so switching the setting on does not act on an answer from before.
 */
function useDesktopClear(watching: boolean) {
  const [clear, setClear] = useState<boolean | null>(null);
  useEffect(() => {
    if (!watching) return;
    let didCancel = false;
    let unlisten: (() => void) | null = null;
    // An event is newer than the first read, which may resolve after it.
    let heard = false;
    const failed = (error: unknown) => console.error("Failed to watch for open windows", error);
    void listenForegroundFullscreen((state) => { heard = true; setClear(state.onDesktop); })
      .then((next) => {
        if (didCancel) next();
        else unlisten = next;
      })
      .catch(failed);
    void getForegroundFullscreen()
      .then((state) => { if (!didCancel && !heard && state) setClear(state.onDesktop === true); })
      .catch(failed);
    return () => {
      didCancel = true;
      unlisten?.();
      setClear(null);
    };
  }, [watching]);
  return watching ? clear : null;
}
