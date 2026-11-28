import test from "node:test";
import assert from "node:assert/strict";
import {
  catBesideText,
  FIRST_LAUNCH_PIXEL_CAT,
  PIXEL_CAT_LANE_WIDTH,
  normalizePixelCatSettings,
  pixelCatShown,
  pixelCatWidth,
  slotsHiddenWithCat,
} from "../../src/features/pixel-cat/model.ts";
import { SPRITE_HEIGHT, SPRITE_WIDTH, POSES, PROPS, spriteRuns } from "../../src/features/pixel-cat/sprite.ts";
import {
  CAT_WIDTH, cursorFrame, PET_AFTER_MS, positionAt, RESUME_STEP, ROUTINE, routineFrame, TRAVEL,
} from "../../src/features/pixel-cat/brain.ts";

test("the pixel cat is off unless it was switched on", () => {
  for (const value of [undefined, null, [], "bad", 1, {}, { enabled: "true" }, { enabled: 1 }]) {
    assert.deepEqual(normalizePixelCatSettings(value), { enabled: false });
  }
  assert.deepEqual(normalizePixelCatSettings({ enabled: true }), { enabled: true });
});

test("the cat is never on the island while a song plays, whatever an older version saved", () => {
  const on = normalizePixelCatSettings({ enabled: true });
  assert.deepEqual(on, { enabled: true });
  assert.equal(pixelCatShown(on, false), true);
  assert.equal(pixelCatShown(on, true), false);
  assert.equal(pixelCatShown({ enabled: false }, false), false);
});

test("a fresh install starts with the cat on, and a missing key on an older install stays off", () => {
  assert.deepEqual(FIRST_LAUNCH_PIXEL_CAT, { enabled: true });
  assert.deepEqual(normalizePixelCatSettings(undefined), { enabled: false });
});

test("the cat's lane widens the island within what the window accepts", () => {
  assert.equal(pixelCatWidth(200), 200 + PIXEL_CAT_LANE_WIDTH + 8);
  assert.equal(pixelCatWidth(200.2), 321);
  assert.equal(pixelCatWidth(450), 480);
  // The measured status icons set a floor, but never past the widest island.
  assert.equal(pixelCatWidth(100, 400), 400);
  assert.equal(pixelCatWidth(100, 600), 480);
});

test("the clock's slot stays on the island while the cat is on", () => {
  const hidden = ["clock", "weather"];
  assert.deepEqual(slotsHiddenWithCat(hidden, false), ["clock", "weather"]);
  assert.deepEqual(slotsHiddenWithCat(hidden, true), ["weather"]);
});

test("the cat's lane moves up beside the text so the status icons gather at the right", () => {
  const layout = ["pulse", "text", "shelf", "music", "clock", "weather", "system"];
  assert.deepEqual(catBesideText(layout, "clock", "text"), ["pulse", "text", "clock", "shelf", "music", "weather", "system"]);
  // Already beside the text, placed before it, or no text on the bar: left as arranged.
  assert.deepEqual(catBesideText(["pulse", "text", "clock", "system"], "clock", "text"), ["pulse", "text", "clock", "system"]);
  assert.deepEqual(catBesideText(["clock", "pulse", "text", "shelf"], "clock", "text"), ["clock", "pulse", "text", "shelf"]);
  assert.deepEqual(catBesideText(["pulse", "shelf", "clock"], "clock", "text"), ["pulse", "shelf", "clock"]);
});

test("every frame of every pose fits the grid the component draws", () => {
  for (const [name, art] of Object.entries(POSES)) {
    assert.ok(art.frames.length === 1 || (art.frames.length === 2 && art.frameMs > 0), name);
    for (const rows of art.frames) {
      assert.equal(rows.length, SPRITE_HEIGHT, name);
      for (const row of rows) assert.match(row, new RegExp(`^[kep.]{${SPRITE_WIDTH}}$`), name);
    }
  }
});

test("a pose that blinks has its open eye under the blink in every frame", () => {
  for (const [name, art] of Object.entries(POSES)) {
    if (!art.blink) continue;
    for (const rows of art.frames) {
      // The galloping and leaping frames share the head, so the eye never moves between frames.
      assert.equal(rows[art.blink.y][art.blink.x], "e", name);
    }
  }
});

test("the small pictures are rectangular", () => {
  for (const rows of Object.values(PROPS)) {
    for (const row of rows) assert.equal(row.length, rows[0].length);
  }
});

test("sprite runs join neighbouring pixels of one kind and split at other kinds and gaps", () => {
  assert.deepEqual(spriteRuns(["kk.kekp"], 3), [
    { x: 0, y: 3, width: 2, kind: "fur" },
    { x: 3, y: 3, width: 1, kind: "fur" },
    { x: 4, y: 3, width: 1, kind: "eye" },
    { x: 5, y: 3, width: 1, kind: "fur" },
    { x: 6, y: 3, width: 1, kind: "nose" },
  ]);
  assert.deepEqual(spriteRuns(["...."]), []);
});

test("the routine uses many poses, stays in its lane and moves only while moving poses show", () => {
  let x = 0;
  let facing = 1;
  const seen = new Set();
  for (let index = 0; index < ROUTINE.length * 2; index++) {
    const { frame, holdMs } = routineFrame(index, x, facing);
    assert.ok(holdMs > 0, `step ${index}`);
    assert.ok(frame.x >= 0 && frame.x <= TRAVEL);
    if (frame.moveMs > 0) {
      assert.ok(["walk", "run", "leap"].includes(frame.pose), `step ${index}`);
      assert.equal(frame.facing, frame.x > x ? 1 : -1, "a moving cat faces where it goes");
    }
    seen.add(frame.pose);
    ({ x, facing } = frame);
  }
  for (const pose of ["walk", "run", "sit", "groom", "yawn", "bat", "loaf", "crouch", "leap", "stretch", "sleep"]) {
    assert.ok(seen.has(pose), pose);
  }
  assert.equal(ROUTINE[RESUME_STEP].pose, "sit");
});

test("a move under way is found part of the way along", () => {
  assert.equal(positionAt(0, 80, 1000, 250), 20);
  assert.equal(positionAt(80, 0, 1000, 500), 40);
  assert.equal(positionAt(0, 80, 1000, 5000), 80);
  assert.equal(positionAt(0, 80, 0, 0), 80);
});

test("the cat runs to a far cursor, walks to a near one and faces it", () => {
  const far = cursorFrame(90, 0, -1, 0);
  assert.equal(far.pose, "run");
  assert.equal(far.facing, 1);
  assert.equal(far.x, 90 - CAT_WIDTH / 2);
  assert.ok(far.moveMs > 0);
  const near = cursorFrame(40, 0, 1, 0);
  assert.equal(near.pose, "walk");
  assert.equal(cursorFrame(10, 60, 1, 0).facing, -1);
});

test("the cat swats at a cursor on it and purrs when the cursor rests there", () => {
  assert.deepEqual(cursorFrame(20, 0, 1, 0), { pose: "bat", x: 0, moveMs: 0, facing: 1, prop: null });
  const petted = cursorFrame(20, 0, 1, PET_AFTER_MS);
  assert.equal(petted.pose, "happy");
  assert.equal(petted.prop, "hearts");
});

test("a cursor past the end of the lane is watched from the end", () => {
  const going = cursorFrame(400, 0, 1, 0);
  assert.equal(going.x, TRAVEL);
  const there = cursorFrame(400, TRAVEL, -1, 5000);
  assert.deepEqual(there, { pose: "alert", x: TRAVEL, moveMs: 0, facing: 1, prop: null });
  assert.equal(cursorFrame(-300, 0, 1, 0).facing, -1);
});
