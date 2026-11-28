// What the cat does next: its own routine, and how it answers the cursor. Pure functions; the
// timers are in useCatBrain.ts.
import { PIXEL_CAT_LANE_WIDTH } from "./model.ts";
import type { CatPose } from "./sprite.ts";

/** Screen px of one sprite pixel, and the sprite's width on screen. */
export const PIXEL_SIZE = 2;
export const CAT_WIDTH = 32;
/** How far the cat's left edge can move along its lane. */
export const TRAVEL = PIXEL_CAT_LANE_WIDTH - CAT_WIDTH;

/** px per second. */
export const WALK_SPEED = 14;
export const CHASE_WALK_SPEED = 44;
export const RUN_SPEED = 110;

/** The cursor within this of the cat's middle is on the cat. */
export const REACH = 17;
/** A gap longer than this is run, not walked. */
const RUN_GAP = 30;
/** How long the cursor rests on the cat before the batting turns into a purr. */
export const PET_AFTER_MS = 700;

export type Facing = 1 | -1;
export type CatProp = "notice" | "hearts" | "snores" | "yarn" | null;

export type CatFrame = {
  pose: CatPose;
  /** Where the cat's left edge is heading, in lane px, and how long it takes to get there. */
  x: number;
  moveMs: number;
  facing: Facing;
  prop: CatProp;
};

type Step = {
  pose: CatPose;
  /** Where to move, as a share of the travel; a step without it stays where it is. */
  to?: number;
  /** px per second for a move. */
  speed?: number;
  /** How long a step that does not move lasts. */
  ms?: number;
  /** The way to face for a step that does not move; a move faces where it goes. */
  face?: Facing;
  prop?: CatProp;
};

/** One round of the cat's day, then it starts over. */
export const ROUTINE: readonly Step[] = [
  { pose: "walk", to: 1 },
  { pose: "sit", ms: 2600 },
  { pose: "groom", ms: 3900 },
  { pose: "sit", ms: 1100, face: -1 },
  { pose: "walk", to: 0.55 },
  { pose: "crouch", ms: 1560, face: -1, prop: "yarn" },
  { pose: "leap", to: 0.2, speed: 75 },
  { pose: "bat", ms: 2880, prop: "yarn" },
  { pose: "walk", to: 0 },
  { pose: "yawn", ms: 1600, face: 1 },
  { pose: "stretch", ms: 2000 },
  { pose: "loaf", ms: 5000 },
  { pose: "sleep", ms: 7000, prop: "snores" },
  { pose: "yawn", ms: 1600 },
  { pose: "sit", ms: 1500 },
  // A sudden dash there and back.
  { pose: "run", to: 1, speed: RUN_SPEED },
  { pose: "run", to: 0.1, speed: RUN_SPEED },
  { pose: "run", to: 0.7, speed: RUN_SPEED },
  { pose: "sit", ms: 1800 },
  { pose: "walk", to: 0 },
  { pose: "sit", ms: 1400, face: 1 },
];

/** Where the routine picks up after the cursor leaves: sitting, then on with the next step. */
export const RESUME_STEP = ROUTINE.length - 1;

const clampX = (x: number) => Math.min(TRAVEL, Math.max(0, x));
const moveTime = (from: number, to: number, speed: number) => Math.round((Math.abs(to - from) / speed) * 1000);
const towards = (from: number, to: number, facing: Facing): Facing => (to > from ? 1 : to < from ? -1 : facing);

/** The frame for step `index` from where the cat is now, and how long it lasts. */
export function routineFrame(index: number, x: number, facing: Facing): { frame: CatFrame; holdMs: number } {
  const step = ROUTINE[index % ROUTINE.length];
  const target = step.to === undefined ? x : step.to * TRAVEL;
  const moveMs = moveTime(x, target, step.speed ?? WALK_SPEED);
  return {
    frame: {
      pose: step.pose,
      x: target,
      moveMs,
      facing: step.to === undefined ? step.face ?? facing : towards(x, target, facing),
      prop: step.prop ?? null,
    },
    holdMs: step.to === undefined ? step.ms ?? 1000 : moveMs,
  };
}

/** Where a straight move from `from` has got to after `elapsedMs`. */
export function positionAt(from: number, to: number, moveMs: number, elapsedMs: number) {
  if (moveMs <= 0 || elapsedMs >= moveMs) return to;
  return from + (to - from) * Math.max(0, elapsedMs / moveMs);
}

/**
 * How the cat answers the cursor at `cursorX` (lane px; it may be off either end), from where it
 * is: far away it runs over, nearer it walks, on the cat it swats at the cursor, and a cursor
 * resting there (`stillMs`) is petting, so it purrs. At the end of the lane it sits and watches.
 */
export function cursorFrame(cursorX: number, x: number, facing: Facing, stillMs: number): CatFrame {
  const gap = cursorX - (x + CAT_WIDTH / 2);
  const look: Facing = Math.abs(gap) < 3 ? facing : gap > 0 ? 1 : -1;
  const stay = { x, moveMs: 0, facing: look };
  if (Math.abs(gap) <= REACH) {
    return stillMs >= PET_AFTER_MS ? { ...stay, pose: "happy", prop: "hearts" } : { ...stay, pose: "bat", prop: null };
  }
  const target = clampX(cursorX - CAT_WIDTH / 2);
  if (Math.abs(target - x) < 1) return { ...stay, pose: "alert", prop: null };
  const run = Math.abs(target - x) > RUN_GAP;
  return {
    pose: run ? "run" : "walk",
    x: target,
    moveMs: moveTime(x, target, run ? RUN_SPEED : CHASE_WALK_SPEED),
    facing: look,
    prop: null,
  };
}
