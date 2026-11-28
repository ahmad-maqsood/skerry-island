import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_SETTINGS } from "../../src/features/appearance/settings.ts";
import { keepIslandVisible, keepVisibleChangesAt } from "../../src/windows/island/keepVisible.ts";
import { MESSAGE_PEEK_RETRACT_MS, desktopAction, messagePeekSettles, retractsPeek, revealsForKeepVisible, revealsForTuckingOff } from "../../src/windows/island/tuckRules.ts";

const base = { isTucked: true, isPeeking: false, tuckedAutomatically: true, keepVisible: true,
  hasMessagePreview: false, isPreviewing: false, gameHolds: false };

test("an island that tucked itself comes back out when a keep-visible activity starts", () => {
  assert.equal(revealsForKeepVisible(base), true);
  assert.equal(revealsForKeepVisible({ ...base, keepVisible: false }), false, "nothing to stay visible for");
  assert.equal(revealsForKeepVisible({ ...base, isTucked: false }), false, "already out");
});

test("tucks by the user or game mode are never undone", () => {
  assert.equal(revealsForKeepVisible({ ...base, tuckedAutomatically: false }), false, "minimized or dragged to the edge");
  assert.equal(revealsForKeepVisible({ ...base, gameHolds: true }), false, "game mode");
  assert.equal(revealsForKeepVisible({ ...base, isPreviewing: true }), false, "settings preview");
});

test("a peek slides back unless a preview or a keep-visible activity holds an auto-tucked island", () => {
  const peeking = { ...base, isTucked: false, isPeeking: true, keepVisible: false };
  assert.equal(retractsPeek(peeking), true);
  assert.equal(retractsPeek({ ...peeking, hasMessagePreview: true }), false, "message still showing");
  assert.equal(retractsPeek({ ...peeking, keepVisible: true }), false, "lyrics after a message peek");
  assert.equal(retractsPeek({ ...peeking, keepVisible: true, tuckedAutomatically: false }), true, "minimized: peeks only");
  assert.equal(retractsPeek({ ...peeking, isPeeking: false }), false);
});

test("a todo timer that holds the island is re-checked when it runs out", () => {
  const settings = { ...DEFAULT_SETTINGS, keepVisibleWhileTodoRunning: true, todoEnabled: true };
  const activity = { collapsedItem: "todo", songPlaying: false, activeTodoId: null,
    timer: { endsAt: 5000 } };
  assert.equal(keepIslandVisible(settings, activity, 1000), true);
  assert.equal(keepVisibleChangesAt(settings, activity, 1000), 5000);
  assert.equal(keepIslandVisible(settings, activity, 5000), false);
  assert.equal(keepVisibleChangesAt(settings, activity, 5000), null);
  assert.equal(keepVisibleChangesAt(settings, { ...activity, activeTodoId: "a" }, 1000), null, "a started todo holds without end");
  assert.equal(keepVisibleChangesAt({ ...settings, keepVisibleWhileTodoRunning: false }, activity, 1000), null);
});

test("a pop-up's peek keeps the ordinary content out until the island has tucked back", () => {
  const out = { ...base, isTucked: false, isPeeking: true, keepVisible: false, messagePeek: true, isHovering: false };
  assert.equal(messagePeekSettles(out), false, "pop-up gone, island about to slide back");
  assert.equal(messagePeekSettles({ ...out, isTucked: true, isPeeking: false }), false, "held through the slide to the edge");
  assert.equal(messagePeekSettles({ ...out, hasMessagePreview: true }), false, "pop-up still showing");
});

test("the ordinary content returns when the cursor takes the island, or when nothing will tuck it", () => {
  const out = { ...base, isTucked: false, isPeeking: true, keepVisible: false, messagePeek: true, isHovering: false };
  assert.equal(messagePeekSettles({ ...out, isHovering: true }), true, "cursor on it");
  assert.equal(messagePeekSettles({ ...out, keepVisible: true }), true, "stays out for lyrics or a timer");
  assert.equal(messagePeekSettles({ ...out, isPeeking: false }), true, "no peek left to end");
  assert.equal(messagePeekSettles({ ...out, messagePeek: false }), false, "not a pop-up's peek at all");
});

test("a pop-up's peek retracts within the pop-up's own exit", () => {
  assert.ok(MESSAGE_PEEK_RETRACT_MS >= 200 && MESSAGE_PEEK_RETRACT_MS <= 400);
});

const desk = { mode: "collapsed", isTucked: false, gameHolds: false, autoTuck: true };

test("the desktop clearing brings out a tucked island, however it was tucked", () => {
  assert.equal(desktopAction(false, true, { ...desk, isTucked: true }), "reveal");
  assert.equal(desktopAction(null, true, { ...desk, isTucked: true }), "reveal", "tucked already when the first answer comes");
  assert.equal(desktopAction(false, true, desk), null, "already out");
});

test("a window opening tucks the collapsed island, however small the window is", () => {
  assert.equal(desktopAction(true, false, desk), "tuck");
});

test("an open panel is left alone when a window opens", () => {
  assert.equal(desktopAction(true, false, { ...desk, mode: "expanded" }), null);
  assert.equal(desktopAction(true, false, { ...desk, isTucked: true }), null, "already tucked");
});

test("only a change moves the island: a minimize on the clear desktop stays minimized", () => {
  assert.equal(desktopAction(true, true, { ...desk, isTucked: true }), null);
  assert.equal(desktopAction(false, false, desk), null, "over windows, the idle tuck is what applies");
  assert.equal(desktopAction(null, false, desk), null, "windows were already open at the first answer");
  assert.equal(desktopAction(true, null, desk), null, "no answer yet");
});

test("game mode's hold is never undone by the desktop", () => {
  assert.equal(desktopAction(false, true, { ...desk, isTucked: true, gameHolds: true }), null);
  assert.equal(desktopAction(true, false, { ...desk, gameHolds: true }), null);
});

test("switching idle tucking off brings a tucked or peeking island out, once", () => {
  const tucked = { isTucked: true, isPeeking: false, gameHolds: false };
  assert.equal(revealsForTuckingOff(true, false, tucked), true);
  assert.equal(revealsForTuckingOff(true, false, { ...tucked, isTucked: false, isPeeking: true }), true);
  assert.equal(revealsForTuckingOff(false, false, tucked), false, "minimized later stays minimized");
  assert.equal(revealsForTuckingOff(false, true, tucked), false);
  assert.equal(revealsForTuckingOff(true, false, { ...tucked, gameHolds: true }), false);
});

test("with idle tucking off the desktop still brings the island out, and a window does not tuck it", () => {
  const state = { mode: "collapsed", isTucked: false, gameHolds: false, autoTuck: false };
  assert.equal(desktopAction(false, true, { ...state, isTucked: true }), "reveal");
  assert.equal(desktopAction(true, false, state), null);
});
