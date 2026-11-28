import type { IslandMode } from "./types";

/**
 * When the island comes out of, or goes back to, the top edge by itself. Pure, so the
 * rules can be tested apart from the hooks that apply them (useIslandTucking).
 *
 * "Stay visible while…" (keepVisible) is about automatic tucking only: it never undoes a
 * tuck the user asked for (minimize, drag to the edge) or one game mode made.
 */
export type TuckState = {
  isTucked: boolean;
  /** Out on a peek (hover or a message) and due to slide back once it ends. */
  isPeeking: boolean;
  /** The current tuck came from the idle timer, not from the user or game mode. */
  tuckedAutomatically: boolean;
  keepVisible: boolean;
  hasMessagePreview: boolean;
  /** A settings preview drives the island; nothing else moves it meanwhile. */
  isPreviewing: boolean;
  /** Game mode is holding the island back (quiet) or tucked (tuck). */
  gameHolds: boolean;
};

/**
 * Brings an island that tucked itself back out once something it should stay visible for
 * starts (a song with lyrics, a todo timer). Without this a switch like "Lyrics are
 * showing" only stopped the next tuck, and an island that had already tucked while nothing
 * played stayed a line through the whole song.
 */
export function revealsForKeepVisible(state: TuckState): boolean {
  return state.isTucked && state.tuckedAutomatically && state.keepVisible && !state.isPreviewing && !state.gameHolds;
}

/**
 * Whether the island comes out because the user has just stopped it tucking itself: "Tuck to the
 * edge when idle" switched off, or "Always display island" switched on. Without this the switch
 * only stopped the next tuck, and an island already at the edge (or peeking, due back) stayed there.
 * Only the change moves it, so minimizing afterwards still works.
 */
export function revealsForTuckingOff(
  wasTucking: boolean,
  isTucking: boolean,
  state: Pick<TuckState, "isTucked" | "isPeeking" | "gameHolds">,
): boolean {
  return wasTucking && !isTucking && (state.isTucked || state.isPeeking) && !state.gameHolds;
}

/**
 * Whether a peeking island slides back now that the peek is over. A message preview holds
 * it; and an island that tucked itself does not tuck again while it should stay visible.
 */
export function retractsPeek(state: TuckState): boolean {
  if (!state.isPeeking || state.hasMessagePreview || state.isPreviewing) return false;
  return !(state.keepVisible && state.tuckedAutomatically);
}

/**
 * How long an island that a pop-up slid out waits once the pop-up has gone before sliding back:
 * just the pop-up's own exit (200ms, CollapsedMessageContent). The longer grace of a hover peek
 * would leave an empty pill sitting out, since the ordinary content is held back meanwhile.
 */
export const MESSAGE_PEEK_RETRACT_MS = 260;

/**
 * Whether the island is done showing only what a pop-up brought. While a pop-up's peek is on, the
 * ordinary content (status light, icons, text) stays out through the pop-up's exit and the slide
 * back, so the idle island is not seen for a moment before it tucks. It ends once the cursor
 * takes the island over, or when nothing will slide it back (it should stay visible), as then
 * the ordinary content is what stays.
 */
export function messagePeekSettles(state: TuckState & { messagePeek: boolean; isHovering: boolean }): boolean {
  if (!state.messagePeek) return false;
  if (state.isHovering) return true;
  // Tucked again: held through the slide, until something brings the island out for good.
  if (state.isTucked) return false;
  if (state.hasMessagePreview) return false;
  return !retractsPeek(state);
}

/**
 * What the island does when the desktop clears or a window opens, with "Always display island on the
 * desktop" on. Pure, so the rules are tested apart from the hook that applies them
 * (useDesktopIsland). `previous` is the last answer, or null before the first one.
 *
 * - The desktop is clear: the island comes out of any tuck, a minimized one included, and sits in
 *   its collapsed form (`reveal`). It does not undo a tuck made by game mode.
 * - A window opens while the desktop was clear: with "Tuck to the edge when idle" on, a collapsed
 *   island tucks (`tuck`). An open panel is left alone: it collapses on its own, and the ordinary
 *   idle tuck follows over the window. With that switch off, a window never tucks the island.
 * - Over windows from the start (no earlier answer) nothing moves, so switching the setting on or
 *   starting the app does not slam a shown island shut; the idle tuck still applies.
 *
 * Only a change moves the island, so a minimize on the clear desktop stays minimized.
 */
export type DesktopAction = "reveal" | "tuck" | null;

export function desktopAction(
  previous: boolean | null,
  desktopClear: boolean | null,
  state: { mode: IslandMode; isTucked: boolean; gameHolds: boolean; autoTuck: boolean },
): DesktopAction {
  if (desktopClear === null || previous === desktopClear || state.gameHolds) return null;
  if (desktopClear) return state.isTucked ? "reveal" : null;
  if (previous === null || !state.autoTuck) return null;
  return state.mode === "collapsed" && !state.isTucked ? "tuck" : null;
}
