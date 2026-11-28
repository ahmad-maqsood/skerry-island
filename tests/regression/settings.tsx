// pnpm dev, then open /tests/regression/settings.html. Without ?test=1 the page is for visual QA:
// ?page=<category> opens that page, ?locale=en switches the language.
// ?test=1 runs the checks below; resize the viewport to 580px wide to cover the narrowest window.
import { act, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles/tokens.css";
import "../../src/styles/fonts.css";
import "../../src/styles/base.css";
import { SettingsWindow } from "../../src/windows/settings/SettingsWindow";
import { settingsCategoryFor } from "../../src/windows/settings/categories";
import { I18nProvider, LOCALE_STORAGE_KEY } from "../../src/i18n";
import { commands, translationShortcutCalls, unmockedCommands } from "./settingsMocks";
import { checkAppearance, prepareColorRegression } from "./settingsAppearance";
import { checkGeneralControls } from "./settingsGeneral";
import { checkGroups } from "./settingsGroups";
import { checkSearchIndex } from "./settingsSearchIndex";
import { checkSettingsSearch } from "./settingsSearch";
import { checkTodoRotation } from "./settingsTodoRotation";
import { checkTodoFileSync } from "./settingsTodoFileSync";
import { checkMessagePreview } from "./settingsMessagePreview";
import { checkMusicShortcuts } from "./settingsMusicShortcuts";
import { PLUGINS_ENABLED } from "../../src/features/releaseFlags.ts";

const query = new URLSearchParams(location.search);
const automated = query.has("test");
Object.assign(globalThis, { isTauri: true, IS_REACT_ACT_ENVIRONMENT: automated });
const original = new Map(Object.entries(localStorage).filter(([key]) => key.startsWith("skerry-")));
const restore = () => {
  for (const key of Object.keys(localStorage).filter(key => key.startsWith("skerry-"))) {
    if (!original.has(key)) localStorage.removeItem(key);
  }
  for (const [key, value] of original) localStorage.setItem(key, value);
};
window.addEventListener("beforeunload", restore);

localStorage.setItem(LOCALE_STORAGE_KEY, query.get("locale") === "en" ? "en" : "en");
// The checks below expect a customized look plus a General page choice that a reset must keep.
if (automated) localStorage.setItem("skerry-settings", JSON.stringify({ opacity: 60, carryOverIncompleteTodos: false, autoTuck: true }));
else localStorage.removeItem("skerry-settings");
if (automated) prepareColorRegression();
if (query.has("clockWeather")) {
  localStorage.setItem("skerry-clock-weather", JSON.stringify({ showClock: true, showWeather: true, location: { name: "Beijing · China", latitude: 39.9, longitude: 116.4 } }));
}
localStorage.setItem("skerry-save-directory", "");
localStorage.removeItem("skerry-todo-file-sync");
localStorage.setItem("skerry-qq-notification-access-requested", "true");
localStorage.removeItem("skerry-detached-settings");
localStorage.removeItem("skerry-music-shortcuts");
// The player order as the old Music page saved it.
localStorage.setItem("skerry-music-sources", JSON.stringify([{ id: "Spotify.exe", label: "Spotify" }, { id: "QQMusic", label: "QQ Music" }]));

const root = createRoot(document.getElementById("root")!);
const mount = () => root.render(<StrictMode><I18nProvider><SettingsWindow /></I18nProvider></StrictMode>);
const messages: string[] = [];
const check = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
  messages.push(`PASS ${message}`);
};
const element = <T extends HTMLElement>(selector: string) => {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`Missing ${selector}`);
  return found;
};
const click = async (selector: string) => {
  const target = element<HTMLButtonElement>(selector);
  await act(async () => { target.click(); });
};
/** Types into a controlled input the way a user would, so React sees the change. */
const type = async (input: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  await act(async () => { setter.call(input, value); input.dispatchEvent(new Event("input", { bubbles: true })); });
};
const openPage = (category: string) => click(`.settings-sidebar__item[data-category='${category}']`);
const categories = () =>
  [...document.querySelectorAll<HTMLElement>(".settings-sidebar__item[data-category]")].map(item => item.dataset.category!);

if (!automated) {
  mount();
  // Old names of merged pages (qq, wechat, mail) open the page they became.
  const page = settingsCategoryFor(query.get("page") ?? "");
  const openRequestedPage = () => {
    const item = document.querySelector<HTMLButtonElement>(`.settings-sidebar__item[data-category='${page}']`);
    if (!item) {
      setTimeout(openRequestedPage, 20);
      return;
    }
    item.click();
  };
  if (page) openRequestedPage();
} else {
  try {
    await act(async () => { mount(); });
    check(categories().length > 0, "The sidebar lists the settings pages");

    for (const category of categories()) {
      await openPage(category);
      const item = element(`.settings-sidebar__item[data-category='${category}']`);
      const panel = element(".editor-panel");
      check(item.getAttribute("aria-current") === "page", `${category}: the sidebar marks the open page`);
      check(element(".settings-page__title").textContent === item.textContent, `${category}: the page title matches the sidebar`);
      check(panel.querySelector(".settings-group, .settings-section"), `${category}: the page has content`);
      check(panel.scrollWidth <= panel.clientWidth, `${category}: nothing overflows horizontally`);
      check(!panel.querySelector("input[type=number]"), `${category}: no native number inputs`);
      // Settings stay short: a handful of rows per page (Messages lists mailboxes, so it is left out).
      const rowCount = panel.querySelectorAll(".settings-row").length;
      // Appearance: 9 -> 12 on 2026-11-13 for island font size (+1) and notch auto-width/height (+2).
      // 12 -> 13: 2026-11-13 Color presets row (+1) requested by the boss; auto-width initially hides the manual width row.
      // General 11 -> 14: the three independent keep-visible switches requested 2026-11-13.
      // Appearance +1: optional top-edge curves (2026-11-13); the size row is hidden by default.
      // Appearance 14 -> 16: the colour scheme and the material the owner asked for on 2026-11-14
      // (the glass strength row shows only with a glass).
      checkSearchIndex(category, panel, check);
      await checkGroups(category, panel, check);
      if (category === "todos") {
        await checkTodoRotation(panel, check);
        await checkTodoFileSync(panel, check);
      }
      // Appearance 16 -> 19: the page text colour row and the whole-look presets (empty state + name row).
      // General: v3.2.6 adds Ctrl + wheel and game mode's "still show notifications"; appearance +3 open and collapsed corners; clipboard +1 storage folder.
      // 2026-11-19: the tucked look (+1) moves from general (16 -> 15) to appearance (22 -> 23).
      // Clock & Weather became built-in appearance settings (+5, 24 -> 29).
      // Clipboard 9 -> 12: pause recording, keep-history-for and the image cache budget joined the "What's saved" group (still 5 rows, the per-group limit in docs/design/settings.md).
      // Clipboard 12 -> 13: the file shelf group gained "Show the file count" (hides the shelf icon from the collapsed island).
      // System 8 -> 9: the system monitor page (sampling, collapsed chip and visible cards) has nine rows.
      // Appearance 29 -> 30: Clock & Weather now has six rows (time format, seconds and the hover date chip join the two switches and the city).
      // General: 14 existing rows + 7 Island tabs switches; the tabs are intentionally one row each.
      // System 9 -> 11: the WiFi and quick-controls cards and the privacy indicator joined the page.
      // General 21 -> 22: 2026-11-23 the Distance from top row joined the Position group.
      // General 22 -> 23: 2026-11-27 the Always display island row opened the Tuck to the edge group.
      // General 23 -> 24: the Always display island on the desktop row.
      // General 24 -> 25: the Show minimize button row.
      // Appearance 30 -> 31: the Pixel cat switch.
      // General 25 -> 26: the Hide shortcut switch.
      const maxRows = category === "general" ? 26 : category === "appearance" ? 31 : category === "clipboard" ? 13 : category === "system" ? 11 : category === "todos" ? 9 : 8;
      if (category === "appearance") {
        const row = [...panel.querySelectorAll<HTMLElement>(".settings-row")].find((item) => item.textContent?.includes("Top edge curves"))!;
        const toggle = row.querySelector<HTMLInputElement>("[role='switch']")!;
        const size = () => [...panel.querySelectorAll<HTMLElement>(".settings-row")].find((item) => item.textContent?.includes("Curve size"));
        check(!toggle.checked && !size(), "Top edge curves default off with size hidden");
        await act(async () => toggle.click());
        check(size()?.classList.contains("settings-row--indent") && size()?.querySelector<HTMLInputElement>("input[type=range]")?.value === "10", "Curves reveal an indented size slider at 10px");
        const slider = size()!.querySelector<HTMLInputElement>("input[type=range]")!;
        await act(async () => {
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(slider, "16");
          slider.dispatchEvent(new Event("input", { bubbles: true }));
        });
        check(JSON.parse(localStorage.getItem("skerry-settings")!).topEdgeShoulderSize === 16
          && JSON.parse(localStorage.getItem("skerry-panel-preview")!).mode === "collapsed", "Dragging curves saves each step and previews the attached collapsed shape");
        await act(async () => toggle.click());
        check(!size(), "Disabling curves hides the slider again");
      }
      if (category === "general") await checkGeneralControls(panel, check, type);
      if (category === "messages") {
        await checkMessagePreview(panel, check);
      }
      check(category === "messages" || rowCount <= maxRows, `${category}: the page keeps to a handful of rows (${rowCount})`);
    }
    await checkSettingsSearch({ check, openPage, type });
    check(settingsCategoryFor("qq") === "messages" && settingsCategoryFor("mail") === "messages" && settingsCategoryFor("shelf") === "clipboard"
      && settingsCategoryFor("agents") === null, "Old names of merged pages open the page they became; retired pages open nothing");
    if (PLUGINS_ENABLED) {
      await openPage("plugins");
      const plugins = element(".editor-panel .plugins-settings");
      check(plugins.textContent?.includes("No plugins yet") && Boolean(plugins.querySelector("svg.lucide-puzzle")),
        "The plugins page renders its installed section and puzzle empty state");
    } else {
      await openPage("plugins");
      check(document.querySelector(".plugin-development") && !document.querySelector(".plugins-settings"), "The release shows the plugin guide without runtime controls");
    }
    await checkAppearance(check);
    const materialButton = (label: string) => [...document.querySelectorAll<HTMLButtonElement>(".editor-panel button")].find((button) => button.textContent === label);
    const strengthRow = () => [...document.querySelectorAll(".settings-row")].some((row) => row.textContent?.includes("Glass strength"));
    check(!document.querySelector(".island-preview__island--glass") && materialButton("Midnight") && materialButton("Graphite") && materialButton("Frosted") && !strengthRow(),
      "The material defaults to midnight with the glasses offered, and no glass strength row");
    await act(async () => materialButton("Liquid")!.click());
    check(document.querySelector(".island-preview__island--liquidGlass") && strengthRow(), "Liquid glass draws on the preview and shows the glass strength");
    for (const [label, material] of [["Aurora", "aurora"], ["Prism", "prism"]] as const) {
      await act(async () => materialButton(label)!.click());
      check(document.querySelector(`.island-preview__island--${material}`) && strengthRow(), `${label} draws on the preview and shows the glass strength`);
    }
    await act(async () => materialButton("Midnight")!.click());
    check(document.querySelectorAll("[title]").length === 0, "No hover tooltips anywhere in Settings");

    await openPage("general");
    const generalTitles = [...document.querySelectorAll<HTMLElement>(".editor-panel .settings-row__title")].map((title) => title.textContent);
    check(generalTitles.includes("Open the island by") && generalTitles.includes("Tuck to the edge when idle") && !generalTitles.includes("Hover over the hidden island") && !generalTitles.includes("Show on"),
      "General keeps opening and tucking; hover timings, the monitor and game mode are gone");
    const detachedRow = [...document.querySelectorAll<HTMLElement>(".settings-row")].find((row) => row.querySelector(".settings-row__title")?.textContent === "Separate settings window");
    const detachedSwitch = detachedRow?.querySelector<HTMLInputElement>("[role='switch']");
    check(detachedSwitch?.checked && !commands.includes("dock_settings_window"), "Settings start in a separate window by default");
    await act(async () => { detachedSwitch!.click(); });
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
    check(localStorage.getItem("skerry-detached-settings") === "false" && commands.includes("dock_settings_window"),
      "Switching it off from the window moves settings back into the island");
    await act(async () => { detachedSwitch!.click(); });
    check(localStorage.getItem("skerry-detached-settings") === "true" && detachedSwitch!.checked,
      "Choosing the separate window is saved on its own");
    const lockRow = [...document.querySelectorAll<HTMLElement>(".settings-row")].find((row) => row.querySelector(".settings-row__title")?.textContent === "Lock island position");
    const lockSwitch = lockRow?.querySelector<HTMLInputElement>("[role='switch']");
    check(lockSwitch && !lockSwitch.checked, "The island position is unlocked by default");
    await act(async () => { lockSwitch!.click(); });
    await openPage("appearance");
    await openPage("general");
    check((JSON.parse(localStorage.getItem("skerry-settings") ?? "{}") as { positionLocked?: boolean }).positionLocked === true
      && [...document.querySelectorAll<HTMLElement>(".settings-row")].find((row) => row.textContent?.includes("Lock island position"))?.querySelector<HTMLInputElement>("[role='switch']")?.checked,
      "Locking the position is saved and stays on after changing pages");

    await act(async () => {
      localStorage.setItem("skerry-settings-focus", JSON.stringify({ section: "savePath", requestedAt: Date.now() }));
      window.dispatchEvent(new StorageEvent("storage", { key: "skerry-settings-focus", newValue: "x", storageArea: localStorage }));
    });
    check(element(".settings-sidebar__item[data-category='todos']").getAttribute("aria-current") === "page", "A save path request from the island opens the todos page");
    check(document.querySelector(".editor-panel .save-path-panel--attention"), "A save path request from the island highlights the save path");
    await click(".save-path-panel .settings-link-button");
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 1_500)); });
    check(document.querySelector(".save-path-panel .save-path-saved"), "The saved confirmation stays long enough to notice");

    await openPage("messages");
    const muteRows = document.querySelectorAll(".settings-row .messages-settings__app-icon");
    check(muteRows.length >= 1, "The messages page lists registered apps with mute toggles");

    // Settings → Music → Player order: the saved order, new players added after it, each one's
    // state, and moving a row saves the old format.
    await openPage("music"); await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
    const musicPanels = [...document.querySelectorAll(".editor-panel, .settings-group")].map((panel) => panel.textContent ?? "").join("\n");
    // A healthy player (status "ok") has no description under its name any more, so the old
    // "Progress sync is working" line is no longer expected.
    check(musicPanels.includes("Player compatibility") &&
      musicPanels.includes("Spotify") && musicPanels.includes("Google Chrome") &&
      !musicPanels.includes("Progress sync is working"), "Music settings lists detected players and compatibility status using settings rows");
    const players = () => [...document.querySelectorAll<HTMLElement>(".reorder-list__item")].map((row) => row.querySelector(".reorder-list__name")?.textContent);
    const hints = [...document.querySelectorAll<HTMLElement>(".reorder-list__hint")].map((hint) => hint.textContent);
    check(players().join() === "Spotify,QQ Music,Google Chrome" && hints.join() === "Open,Not open,Playing",
      `The Music page lists the saved player order, then newly seen players, with their state (${players().join()} / ${hints.join()})`);
    await act(async () => {
      document.querySelectorAll<HTMLElement>(".reorder-list__handle")[2].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    });
    const savedPlayers = JSON.parse(localStorage.getItem("skerry-music-sources") ?? "[]") as { id: string; label: string }[];
    check(players().join() === "Spotify,Google Chrome,QQ Music" && savedPlayers.map((source) => source.id).join() === "Spotify.exe,chrome.exe,QQMusic"
      && savedPlayers[1].label === "Google Chrome", "Moving a player saves the order in the same key and format");

    // Shortcuts: the recorder reads the physical key (Shift+1 gives "!" and IME input
    await checkMusicShortcuts(check, openPage);
    // gives "Process"), and another part of the page saving later keeps the new keys.
    // In the app, clicking into a window that was not active makes WebView2 put the focus
    // back where it was before (wry's WM_SETFOCUS handler), so the keys arrive somewhere
    // other than the record button: they go to the focused sidebar item here.
    const record = async (init: KeyboardEventInit, { focusMoves = true, releaseOnly = false } = {}) => {
      const button = element<HTMLButtonElement>(".editor-panel .shortcut-record-button");
      await act(async () => { button.focus(); button.click(); });
      if (focusMoves) await act(async () => { element<HTMLButtonElement>(".settings-sidebar__item[data-category='general']").focus(); });
      const target = document.activeElement ?? document.body;
      const press = (type: string) => target.dispatchEvent(new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init }));
      // A combination another program holds as its global hotkey: Windows keeps the press, only the release arrives.
      await act(async () => { if (!releaseOnly) press("keydown"); press("keyup"); });
      await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
    };
    const recordButtonText = () => element(".editor-panel .shortcut-record-button").textContent;
    const storedShortcut = () => (JSON.parse(localStorage.getItem("skerry-translation-settings") ?? "{}") as { shortcut?: string }).shortcut;
    // The default provider (Google) needs no model; the model field only exists for a keyed one.
    localStorage.setItem("skerry-translation-settings", JSON.stringify({ provider: "openai" }));
    await openPage("translation");
    await record({ key: "!", code: "Digit1", ctrlKey: true, shiftKey: true }, { focusMoves: false });
    check(translationShortcutCalls[translationShortcutCalls.length - 1] === "Ctrl+Shift+1" && storedShortcut() === "Ctrl+Shift+1",
      "Recording Ctrl+Shift+1 registers and saves Ctrl+Shift+1, not the shifted symbol");
    await record({ key: "k", code: "KeyK", ctrlKey: true, altKey: true });
    check(storedShortcut() === "Ctrl+Alt+K" && recordButtonText() === "Ctrl+Alt+K",
      `A shortcut recorded after the focus left the record button is registered, saved and shown (${recordButtonText()})`);
    await record({ key: "u", code: "KeyU", ctrlKey: true, shiftKey: true }, { releaseOnly: true });
    check(storedShortcut() === "Ctrl+Shift+U", "A combination whose key press another program swallowed records from its release");
    await record({ key: "Process", code: "KeyJ", ctrlKey: true, altKey: true });
    check(storedShortcut() === "Ctrl+Alt+J", "Keys pressed with IME input on record by their physical key");
    await record({ key: "q", code: "KeyQ", ctrlKey: true, altKey: true });
    check(storedShortcut() === "Ctrl+Alt+J" && recordButtonText() === "Ctrl+Alt+J"
      && element(".shortcut-control__error").textContent === "Ctrl+Alt+Q could not be set as a global shortcut; another program may be using it. Choose another. Still using Ctrl+Alt+J.",
      "Keys Windows refuses keep the old shortcut and say so in the interface language");
    // Another program's hotkey (NetEase Cloud Music's Ctrl+Alt+M) brings up its window mid-combination.
    await act(async () => { element<HTMLButtonElement>(".editor-panel .shortcut-record-button").click(); });
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Alt", code: "AltLeft", ctrlKey: true, altKey: true, bubbles: true, cancelable: true }));
      window.dispatchEvent(new Event("blur"));
      await new Promise(resolve => setTimeout(resolve, 300));
    });
    check(storedShortcut() === "Ctrl+Alt+J" && recordButtonText() === "Ctrl+Alt+J"
      && element(".shortcut-control__error").textContent?.startsWith("That combination belongs to another program"),
      "Another program taking the keys mid-combination stops recording and says so");
    await type(element<HTMLInputElement>("input[aria-label='Model']"), "demo-model");
    check(storedShortcut() === "Ctrl+Alt+J" && recordButtonText() === "Ctrl+Alt+J",
      "Editing the model afterwards keeps the new translation shortcut");
    await openPage("clipboard");
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
    await record({ key: "?", code: "Slash", ctrlKey: true, shiftKey: true });
    const clipboardSaved = commands.lastIndexOf("set_clipboard_history_settings") >= 0;
    check(clipboardSaved && recordButtonText() === "Ctrl+Shift+/",
      "Recording Ctrl+Shift+/ for clipboard history saves it");
    await record({ key: "J", code: "KeyJ", ctrlKey: true, altKey: true });
    check(element(".shortcut-control__error").textContent?.includes("Ctrl+Alt+J"), "Keys translation already uses are refused for clipboard history");
    // Reopening the pages reads the keys back from where they are kept.
    await openPage("translation");
    check(recordButtonText() === "Ctrl+Alt+J", "The translation page shows the recorded shortcut when opened again");
    await openPage("clipboard");
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
    check(recordButtonText() === "Ctrl+Shift+/", `The clipboard page shows the recorded shortcut when opened again (${recordButtonText()})`);

    // About: links section and quit button
    await openPage("about");
    const linkCard = [...document.querySelectorAll<HTMLElement>(".settings-group__card")].find((card) => card.querySelector(".project-link"));
    const linkTitles = [...(linkCard?.querySelectorAll<HTMLElement>(".project-link__copy strong") ?? [])].map((title) => title.textContent);
    check(linkTitles.length === 2, `About lists the repository and licence/credits links (${linkTitles.join()})`);

    const aboutLink = (label: string) =>
      [...document.querySelectorAll<HTMLButtonElement>(".settings-link-button")].find((button) => button.textContent === label);
    await act(async () => { aboutLink("Quit")?.click(); });
    check(commands.includes("quit_island"), "Quit asks the island to exit");

    check(unmockedCommands.length === 0, `Every command the settings pages call is mocked (${[...new Set(unmockedCommands)].join() || "none missing"})`);

    await act(async () => { root.unmount(); });
    document.documentElement.dataset.testResult = "passed";
  } catch (error) {
    document.documentElement.dataset.testResult = "failed";
    messages.push(`FAIL ${String(error)}`);
    console.error(error);
  } finally {
    restore();
    document.getElementById("results")!.textContent = messages.join("\n");
  }
}
