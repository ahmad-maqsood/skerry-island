/**
 * The cat as pixel grids, facing right: `k` is fur, `e` an eye, `p` pink (nose, mouth, tongue),
 * `.` nothing. Every picture is SPRITE_WIDTH by SPRITE_HEIGHT. A pose is one picture, or two
 * that swap in turn.
 */
export const SPRITE_WIDTH = 16;
export const SPRITE_HEIGHT = 9;

const BODY = [
  "..........k....k",
  ".k........kk..kk",
  ".k........kkkkkk",
  ".k........kekkkp",
  ".kkkkkkkkkkkkkk.",
  "..kkkkkkkkkkkkk.",
  "...kkkkkkkkkkk..",
] as const;
const WALK_STRIDE = [...BODY, "..k.k.......k.k.", "..k.k.......k.k."] as const;
const WALK_TOGETHER = [...BODY, "...kk........kk.", "...k.........k.."] as const;
/** Stretched out in the air: the gallop's long frame, and the pounce. */
const LEAP = [
  "..........k....k",
  "..........kk..kk",
  "k.........kkkkkk",
  "kk........kekkkp",
  ".kkkkkkkkkkkkkk.",
  "...kkkkkkkkkkk..",
  "..kkk.......kkk.",
  ".kk..........kk.",
  "................",
] as const;

const EARS = ["..........k....k", "..........kk..kk", "..........kkkkkk"] as const;
const OPEN_EYE = "..........kekkkp";
/** Eyes shut to a line: content, yawning or washing. */
const SHUT_EYE = "..........keekkp";
const SIT_BACK = [".........kkkkkk.", ".......kkkkkkk.."] as const;
const SIT_TAIL_DOWN = ["......kkkkkkkk..", ".....kkkkkkk.k..", ".kkkkkkkkkkk.kk."] as const;
const SIT_TAIL_UP = [".k....kkkkkkkk..", ".k...kkkkkkk.k..", "..kkkkkkkkkk.kk."] as const;
const sit = (eye: string, tail: readonly string[]) => [...EARS, eye, ...SIT_BACK, ...tail];

/** A front paw up at the mouth, the tongue on it, then lowered a little. */
const GROOM_LICK = [
  "................",
  ...EARS,
  ".......kkkkeekkk",
  "......kkkkkkkkp.",
  ".....kkkkkkk.kpk",
  ".....kkkkkk.kk..",
  ".kkkkkkkkkkkk...",
] as const;
const GROOM_LIFT = [
  ...EARS,
  SHUT_EYE,
  ".........kkkkkk.",
  ".......kkkkkkkpk",
  "......kkkkkkk.kk",
  ".....kkkkkkk.kk.",
  ".kkkkkkkkkkkk...",
] as const;

const yawn = (mouth: readonly [string, string]) => [...EARS, SHUT_EYE, ...mouth, ...SIT_TAIL_DOWN];
const YAWN_SMALL = yawn([".........kkkkkp.", ".......kkkkkkk.."]);
const YAWN_WIDE = yawn([".........kkkkpp.", ".......kkkkkkpp."]);

/** A front paw swiping at something just ahead. */
const BAT_LOW = [
  ...EARS, OPEN_EYE,
  ".........kkkkkk.",
  ".......kkkkkkk..",
  "......kkkkkkkkkk",
  ".....kkkkkkk....",
  ".kkkkkkkkkkk.kk.",
] as const;
const BAT_HIGH = [
  ...EARS, OPEN_EYE,
  ".........kkkkkkk",
  ".......kkkkkkk.k",
  "......kkkkkkkk..",
  ".....kkkkkkk....",
  ".kkkkkkkkkkk.kk.",
] as const;

/** Paws tucked under: the loaf. */
const LOAF = [
  "................",
  "................",
  "..........k....k",
  "..........kk..kk",
  "..........kkkkkk",
  "..........kekkkp",
  "...kkkkkkkkkkkk.",
  "..kkkkkkkkkkkkk.",
  ".kkkkkkkkkkkkk..",
] as const;

/** Head low and back end up, wiggling before a pounce. */
const crouch = (tail: readonly [string, string]) => [
  "................",
  "................",
  tail[0],
  tail[1] + "k....k",
  ".kkkk.....kk..kk",
  "..kkkkkkkkkkkkkk",
  "..kkkkkkkkkekkkp",
  "..kkkkkkkkkkkkk.",
  "..k.k......kk.kk",
];
const CROUCH_LEFT = crouch([".k..............", ".k........"]);
const CROUCH_RIGHT = crouch(["...k............", "..k......."]);

/** Front paws down, back end up. */
const STRETCH = [
  ".k..............",
  ".k..............",
  ".kkkk...........",
  ".kkkkkk...k....k",
  "..kkkkkkk.kk..kk",
  "..kk.kkkkkkkkkkk",
  "..k..kkkkkkekkkp",
  "..k...kkkkkkkkk.",
  "..k........kkkkk",
] as const;
/** Curled up, the eye shut to a line. */
const SLEEP = [
  "................",
  "................",
  "................",
  "..........k...k.",
  "....kkkkkkkk.kk.",
  "..kkkkkkkkkkkkk.",
  ".kkkkkkkkkeekkk.",
  ".kkkkkkkkkkkkkp.",
  "..kkkkkkkkkkkkk.",
] as const;

export type CatPose =
  | "walk" | "run" | "sit" | "alert" | "groom" | "yawn" | "bat" | "happy"
  | "loaf" | "crouch" | "leap" | "stretch" | "sleep";

export type PoseArt = {
  frames: readonly (readonly string[])[];
  /** How long one swap of the two frames takes, both together. */
  frameMs?: number;
  /** Where the open eye is, if the pose blinks: a blink covers it with fur. */
  blink?: { x: number; y: number };
};

const EYE = { x: 11, y: 3 } as const;

export const POSES: Record<CatPose, PoseArt> = {
  walk: { frames: [WALK_STRIDE, WALK_TOGETHER], frameMs: 480, blink: EYE },
  run: { frames: [LEAP, WALK_TOGETHER], frameMs: 240 },
  sit: { frames: [sit(OPEN_EYE, SIT_TAIL_DOWN), sit(OPEN_EYE, SIT_TAIL_UP)], frameMs: 900, blink: EYE },
  /** Watching the cursor: sitting up with a quick tail. */
  alert: { frames: [sit(OPEN_EYE, SIT_TAIL_UP), sit(OPEN_EYE, SIT_TAIL_DOWN)], frameMs: 420, blink: EYE },
  groom: { frames: [GROOM_LICK, GROOM_LIFT], frameMs: 560 },
  yawn: { frames: [YAWN_WIDE, YAWN_SMALL], frameMs: 1600 },
  bat: { frames: [BAT_LOW, BAT_HIGH], frameMs: 360, blink: EYE },
  happy: { frames: [sit(SHUT_EYE, SIT_TAIL_DOWN), sit(SHUT_EYE, SIT_TAIL_UP)], frameMs: 640 },
  loaf: { frames: [LOAF], blink: { x: 11, y: 5 } },
  crouch: { frames: [CROUCH_LEFT, CROUCH_RIGHT], frameMs: 260 },
  leap: { frames: [LEAP], blink: EYE },
  stretch: { frames: [STRETCH] },
  sleep: { frames: [SLEEP] },
};

const SNORE = ["kk.", ".k.", ".kk"] as const;
const HEART = [".p.p.", "ppppp", ".ppp.", "..p.."] as const;
const NOTICE = ["k", "k", "k", ".", "k"] as const;
const YARN = [".pp.", "pkpp", "ppkp", ".pp."] as const;

export type PixelKind = "fur" | "eye" | "nose";
/** `width` pixels of one kind in a row, starting at column `x`. */
export type PixelRun = { x: number; y: number; width: number; kind: PixelKind };

const KINDS: Record<string, PixelKind | undefined> = { k: "fur", e: "eye", p: "nose" };

/** The rows as horizontal runs of one kind: the fewest rects to draw. */
export function spriteRuns(rows: readonly string[], firstRow = 0): PixelRun[] {
  const runs: PixelRun[] = [];
  rows.forEach((row, index) => {
    let current: PixelRun | null = null;
    for (const [x, char] of [...row].entries()) {
      const kind = KINDS[char];
      if (current && kind === current.kind && current.x + current.width === x) {
        current.width += 1;
        continue;
      }
      current = kind ? { x, y: firstRow + index, width: 1, kind } : null;
      if (current) runs.push(current);
    }
  });
  return runs;
}

/** The small pictures beside the cat. */
export const PROPS = { snore: SNORE, heart: HEART, notice: NOTICE, yarn: YARN } as const;
