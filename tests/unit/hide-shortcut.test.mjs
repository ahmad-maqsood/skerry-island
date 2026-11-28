import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_HIDE_SHORTCUT, normalizeHideShortcut } from "../../src/features/hide-shortcut/model.ts";
import { collectShortcutOwners, findShortcutOwner } from "../../src/windows/settings/shortcutConflicts.ts";

test("the hide shortcut is on with its default keys until changed", () => {
  for (const value of [undefined, null, [], "bad", {}, { shortcut: "H" }]) {
    assert.deepEqual(normalizeHideShortcut(value), { enabled: true, shortcut: DEFAULT_HIDE_SHORTCUT });
  }
  assert.deepEqual(normalizeHideShortcut({ enabled: false, shortcut: "alt+ctrl+k" }), { enabled: false, shortcut: "Ctrl+Alt+K" });
});

test("the hide shortcut's keys are taken only while it is on", () => {
  const off = { id: "x", label: "x", shortcut: "", enabled: false };
  const owners = (enabled) => collectShortcutOwners({
    clipboard: off, translation: off, music: [], hide: { id: "hide", label: "Hide", shortcut: DEFAULT_HIDE_SHORTCUT, enabled },
  });
  assert.equal(findShortcutOwner(DEFAULT_HIDE_SHORTCUT, owners(true), "clipboard"), "Hide");
  assert.equal(findShortcutOwner(DEFAULT_HIDE_SHORTCUT, owners(false), "clipboard"), null);
});
