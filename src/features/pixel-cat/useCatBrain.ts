import { useEffect, useRef, useState, type RefObject } from "react";
import { listenCursorLeftIsland } from "./api";
import {
  CAT_WIDTH, cursorFrame, positionAt, RESUME_STEP, routineFrame, TRAVEL, type CatFrame, type Facing,
} from "./brain";
import { PIXEL_CAT_LANE_WIDTH } from "./model";

/** How long the cat sits up with a "!" when the cursor arrives. */
const NOTICE_MS = 450;
/** How often it looks at the cursor again. */
const LOOK_MS = 120;
/** A movement smaller than this still counts as resting, so petting survives a shaky hand. */
const STILL_PX = 3;

const START: CatFrame = { pose: "sit", x: 0, moveMs: 0, facing: 1, prop: null };
const REDUCED: CatFrame = { ...START, x: TRAVEL / 2 };

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Runs the cat: its routine, until the cursor is over the collapsed bar around `laneRef`; then it
 * watches, chases and plays with the cursor, and goes back to its routine once the cursor leaves.
 * Nothing runs while `active` is false or with reduced motion.
 */
export function useCatBrain(laneRef: RefObject<HTMLDivElement | null>, active: boolean): CatFrame {
  const [frame, setFrame] = useState<CatFrame>(() => (prefersReducedMotion() ? REDUCED : START));
  // The move under way, to tell where the cat is when something interrupts it.
  const motion = useRef({ from: START.x, frame: START, startedAt: 0 });
  const step = useRef(0);

  useEffect(() => {
    const lane = laneRef.current;
    if (!active || !lane || prefersReducedMotion()) return;
    const bar = lane.parentElement ?? lane;
    let routineTimer = 0;
    let lookTimer = 0;
    let noticeUntil = 0;
    let cursor: { x: number; restX: number; restSince: number } | null = null;

    const here = () => {
      const { from, frame: moving, startedAt } = motion.current;
      return positionAt(from, moving.x, moving.moveMs, performance.now() - startedAt);
    };
    const show = (next: CatFrame) => {
      motion.current = { from: here(), frame: next, startedAt: performance.now() };
      setFrame(next);
    };
    const stop = (): CatFrame => ({ ...motion.current.frame, x: here(), moveMs: 0 });

    const runRoutine = () => {
      const { frame: next, holdMs } = routineFrame(step.current, here(), motion.current.frame.facing);
      show(next);
      routineTimer = window.setTimeout(() => {
        step.current += 1;
        runRoutine();
      }, holdMs);
    };

    const look = () => {
      if (!cursor || performance.now() < noticeUntil) return;
      const facing: Facing = motion.current.frame.facing;
      const next = cursorFrame(cursor.x, here(), facing, performance.now() - cursor.restSince);
      const now = motion.current.frame;
      // Only a change is applied: restarting the same move or pose would make it stutter.
      const sameMove = next.moveMs > 0 && Math.abs(next.x - now.x) < 1;
      const sameStay = next.moveMs === 0 && now.moveMs === 0;
      if (next.pose === now.pose && next.facing === now.facing && next.prop === now.prop && (sameMove || sameStay)) return;
      // A run closing in keeps running to its target rather than dropping to a walk at the end.
      if (sameMove && now.pose === "run" && next.pose === "walk") return;
      show(next);
    };

    const leave = () => {
      if (!cursor) return;
      cursor = null;
      window.clearInterval(lookTimer);
      show(stop());
      step.current = RESUME_STEP;
      runRoutine();
    };

    const move = (event: PointerEvent) => {
      const box = lane.getBoundingClientRect();
      if (!box.width) return;
      // The bar is scaled (Appearance → Size), so screen px are turned back into lane px.
      const x = ((event.clientX - box.left) * PIXEL_CAT_LANE_WIDTH) / box.width;
      const now = performance.now();
      if (!cursor) {
        window.clearTimeout(routineTimer);
        cursor = { x, restX: x, restSince: now };
        noticeUntil = now + NOTICE_MS;
        const at = here();
        show({ pose: "alert", x: at, moveMs: 0, facing: x < at + CAT_WIDTH / 2 ? -1 : 1, prop: "notice" });
        lookTimer = window.setInterval(look, LOOK_MS);
        return;
      }
      const moved = Math.abs(x - cursor.restX) > STILL_PX;
      cursor = { x, restX: moved ? x : cursor.restX, restSince: moved ? now : cursor.restSince };
    };

    let disposed = false;
    let unlisten: (() => void) | undefined;
    void listenCursorLeftIsland(leave)
      .then((stopListening) => {
        if (disposed) stopListening();
        else unlisten = stopListening;
      })
      .catch(() => { /* Outside Tauri the page's own pointerleave is enough. */ });

    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerleave", leave);
    // One tick late, so the first position is painted before the first move starts from it.
    routineTimer = window.setTimeout(runRoutine, 60);

    return () => {
      disposed = true;
      unlisten?.();
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerleave", leave);
      window.clearTimeout(routineTimer);
      window.clearInterval(lookTimer);
      show(stop());
    };
  }, [active, laneRef]);

  return frame;
}
