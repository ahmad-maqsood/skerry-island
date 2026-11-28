// settings.html: each page's groups (docs/design/settings.md, 2026-11-14 regrouping, 2026-11-18 tidy-up,
// 2026-11-19 appearance: one kind of setting per group, every corner in one).
import { act } from "react";

const GROUPS: Record<string, string[]> = {
  general: ["Startup & language", "Island tabs", "Opening & closing", "Position", "Tuck to the edge", "Hide the island", "Game mode", "Backup & transfer"],
  appearance: ["Theme", "Colors", "Text", "Size", "Corners", "On the island", "Island display priority", "Clock & Weather", "Pixel cat", "Tuck to the edge", "Appearance presets"],
  todos: ["Tasks", "Focus timer", "Collapsed island", "Save location"],
  clipboard: ["What's saved", "Display & window", "Shortcuts", "Storage", "File shelf"],
};

/** Row titles of the group with this title. */
const rowsOf = (panel: HTMLElement, title: string) => {
  const group = [...panel.querySelectorAll<HTMLElement>(".settings-group")].find((item) => item.querySelector(".settings-group__title")?.textContent === title);
  return [...group?.querySelectorAll<HTMLElement>(".settings-row") ?? []];
};
const titles = (rows: HTMLElement[]) => rows.map((row) => row.querySelector(".settings-row__title")?.textContent ?? "");

export async function checkGroups(category: string, panel: HTMLElement, check: (condition: unknown, message: string) => void) {
  const expected = GROUPS[category];
  if (!expected) return;
  const shown = [...panel.querySelectorAll<HTMLElement>(".settings-group__title")].map((title) => title.textContent);
  check(shown.join("|") === expected.join("|"), `${category}: groups in order (${shown.join(" / ")})`);
  if (category === "general") {
    check(titles(rowsOf(panel, "Opening & closing")).join() === "Open the island by,Collapse the open island,Ctrl + wheel switches pages", "General: opening, auto-collapse and Ctrl + wheel share a group");
    const game = () => rowsOf(panel, "Game mode");
    check(titles(game()).join() === "Quiet in full screen,Still show notifications", "General: game mode has its own group, its notifications indented under it");
    check(game()[1]?.classList.contains("settings-row--indent"), "General: game-mode notifications hang indented under game mode");
    const quiet = game()[0].querySelector<HTMLInputElement>("[role='switch']")!;
    await act(async () => quiet.click());
    check(game().length === 1, "General: game-mode notifications hide while game mode is off");
    await act(async () => quiet.click());
    const tuck = () => rowsOf(panel, "Tuck to the edge");
    check(titles(tuck()).join() === "Always display island,Always display island on the desktop,Show minimize button,Tuck to the edge when idle,Tuck the collapsed island,Stay out while lyrics show,Stay out while a to-do is timed"
      && tuck().slice(4).every((row) => row.classList.contains("settings-row--indent")), "General: both always-display switches and the minimize button first, then auto-tuck with its delay and when not to tuck, all indented under it");
    const always = tuck()[0].querySelector<HTMLInputElement>("[role='switch']")!;
    await act(async () => always.click());
    check(titles(tuck()).join() === "Always display island,Show minimize button", "General: with the island always displayed, the idle-tuck rows step aside and the minimize button stays");
    await act(async () => always.click());
    check(titles(rowsOf(panel, "Position")).join() === "Distance from top,Back to the default position,Lock island position", "General: the position rows come last");
  } else if (category === "todos") {
    check(titles(rowsOf(panel, "Tasks")).join() === "Carry unfinished tasks to next day,Drag to reorder,Visible rows", "Todos: the list options share a group");
    check(titles(rowsOf(panel, "Focus timer")).join() === "Use the focus timer", "Todos: the focus timer has its own group (reminders hidden while it is off)");
  } else if (category === "clipboard") {
    check(titles(rowsOf(panel, "What's saved")).join() === "Pause recording,Record images,Max entries,Keep history for,Image cache budget", "Clipboard: what is recorded comes first");
    check(titles(rowsOf(panel, "Display & window"))[0] === "Visible rows", "Clipboard: how the list shows is its own group");
  } else {
    check(titles(rowsOf(panel, "Theme")).join() === "Color scheme,Material,Opacity", "Appearance: the theme holds scheme, material and opacity");
    check(titles(rowsOf(panel, "Text")).join() === "Font,Font size", "Appearance: the text group holds the font and its size");
    // The island shape row joins the front of the corners group once the capsule ships (islandShape.ts).
    check(titles(rowsOf(panel, "Corners")).join() === "Open corners,Collapsed corners,Corner shape,Top edge curves", "Appearance: every corner setting is in one group");
    check(titles(rowsOf(panel, "On the island")).includes("Page buttons"), "Appearance: page buttons sit with the island's arrangement");
    const size = () => rowsOf(panel, "Size");
    check(titles(size()).join() === "Collapsed size,Expanded size,Automatic width,Height,Side space", "Appearance: every size is in one group; manual width hidden while automatic");
    const auto = size()[2].querySelector<HTMLInputElement>("[role='switch']")!;
    await act(async () => auto.click());
    const width = size().find((row) => row.querySelector(".settings-row__title")?.textContent === "Width");
    check(width?.classList.contains("settings-row--indent"), "Appearance: the manual width hangs indented under automatic width");
    await act(async () => auto.click());
    const tuck = () => rowsOf(panel, "Tuck to the edge");
    const looks = () => [...panel.querySelectorAll<HTMLButtonElement>("[role='group'][aria-label='Tucked look'] button")];
    check(titles(tuck()).join() === "Tucked look" && looks().map((button) => button.textContent).join() === "Edge,Line,Hidden" && looks()[1].getAttribute("aria-pressed") === "true",
      "Appearance: the tucked look has its own group, edge, line and hidden, line by default");
    localStorage.removeItem("skerry-panel-preview");
    await act(async () => looks()[1].click());
    check(JSON.parse(localStorage.getItem("skerry-settings")!).tuckStyle === "line"
      && JSON.parse(localStorage.getItem("skerry-panel-preview")!).mode === "tucked", "Choosing even the current tucked look saves it and shows the island tucked");
    await act(async () => looks()[0].click());
    check(titles(tuck()).join() === "Tucked look,Visible edge" && tuck()[1].classList.contains("settings-row--indent"), "Appearance: the edge look reveals its height, indented");
    await act(async () => looks()[1].click());
  }
}
