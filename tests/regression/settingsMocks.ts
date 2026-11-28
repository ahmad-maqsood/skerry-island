// The Tauri commands the settings window calls, answered as the island would, for the settings
// regression pages. Importing this installs the mocks; the arrays record what was called.
import { mockIPC, mockWindows } from "@tauri-apps/api/mocks";
import type { MusicShortcuts } from "../../src/features/media/shortcuts";

let revision = 0;
export const commands: string[] = [];
/** Commands the page called that have no mock below; settings.tsx fails the run if any are listed. */
export const unmockedCommands: string[] = [];
/** Commands that return nothing and have no result worth checking. */
const NOOP_COMMANDS = new Set([
  "set_settings_window_theme",
  "plugin:window|set_title",
  "show_settings_window",
  "dock_settings_window",
  "quit_island",
  // Answered null on purpose: real data adds storage rows the clipboard page's row-count check does not expect.
  "get_clipboard_storage_directory",
  "get_clipboard_storage_size",
]);
export const systemNotificationCalls: { command: string; args: Record<string, unknown> }[] = [];
let systemNotificationsState = {
  revision: 1,
  enabled: true,
  status: "listening",
  hideText: false,
  mutedApps: [] as string[],
  knownApps: [
    { appId: "com.squirrel.WhatsApp.WhatsApp", appDisplayName: "WhatsApp" },
    { appId: "com.tdesktop.Telegram", appDisplayName: "Telegram" },
  ],
  items: [
    {
      id: 1,
      appId: "com.squirrel.WhatsApp.WhatsApp",
      appDisplayName: "WhatsApp",
      title: "Alice",
      bodyLines: ["See you at 3pm"],
      timestamp: Date.now() - 60000,
      appLogo: null,
    },
  ],
};
export const translationShortcutCalls: string[] = [];
export const mediaShortcutCalls: { enabled: boolean; shortcuts: MusicShortcuts }[] = [];
// Kept like the native store, so a page opened again reads back what was saved.
let clipboardSettings = { enabled: true, captureImages: true, maxItems: 100, shortcut: "Ctrl+Shift+V", shortcutEnabled: true };
mockIPC((command, payload) => {
  commands.push(command);
  const args = (payload ?? {}) as Record<string, unknown>;
  switch (command) {
    case "search_weather_cities": return [{ name: "London · United Kingdom", latitude: 51.5, longitude: -0.1 }];
    case "get_current_weather": return { temperature: 23, code: 2, observedAt: Date.now(), fetchedAt: Date.now() };
    case "get_media_diagnostics": return { players: [
      { sourceAppId: "Spotify.exe", label: "Spotify", hasSession: true, hasTimeline: true, hasPluginTrackId: false,
        exePath: null, directory: null, version: "1.2.0", status: "ok", neteasePluginState: null },
      { sourceAppId: "chrome.exe", label: "Google Chrome", hasSession: true, hasTimeline: false, hasPluginTrackId: false,
        exePath: null, directory: null, version: null, status: "ok", neteasePluginState: null },
    ] };
    case "get_media_state": return { sessions: [{ id: "Spotify.exe", label: "Spotify", playing: false }, { id: "chrome.exe", label: "Google Chrome", playing: true }] };
    case "fetch_release_notes": return [
      { tag: "v1.2.0", name: "Skerry 1.2", body: "## What's new\n\n- Release notes in settings", publishedAt: "2026-11-20T10:00:00Z", url: "https://github.com/ahmad-maqsood/skerry-island/releases/tag/v1.2.0", prerelease: false },
      { tag: "v1.1.0", name: "Skerry 1.1", body: "", publishedAt: "2026-11-01T10:00:00Z", url: "https://github.com/ahmad-maqsood/skerry-island/releases/tag/v1.1.0", prerelease: false },
    ];
    case "get_launch_at_startup": return false;
    case "get_config_import_report": return null;
    case "dismiss_config_import_report": return null;
    case "export_config": return true;
    case "read_config_import": return null;
    case "get_media_shortcut_errors": return {};
    case "get_island_hide_shortcut_error": return null;
    case "set_island_hide_shortcut": return null;
    case "set_media_shortcuts": mediaShortcutCalls.push({ enabled: Boolean(args.enabled), shortcuts: args.shortcuts as MusicShortcuts }); return null;
    case "set_launch_at_startup": return null;
    case "get_default_todo_save_directory": return "";
    case "get_clipboard_history": return { settings: clipboardSettings, items: [] };
    case "set_clipboard_history_settings":
      clipboardSettings = { ...clipboardSettings, ...(args.settings as object | undefined) };
      return { settings: clipboardSettings, items: [] };
    case "get_system_notifications_state": return systemNotificationsState;
    case "set_system_notifications_enabled":
      systemNotificationCalls.push({ command, args });
      systemNotificationsState = { ...systemNotificationsState, revision: ++revision, enabled: Boolean(args.enabled) };
      return systemNotificationsState;
    case "set_hide_notification_text":
      systemNotificationCalls.push({ command, args });
      systemNotificationsState = { ...systemNotificationsState, revision: ++revision, hideText: Boolean(args.hide) };
      return systemNotificationsState;
    case "set_app_muted": {
      systemNotificationCalls.push({ command, args });
      const appId = String(args.appId);
      const muted = Boolean(args.muted);
      const list = new Set(systemNotificationsState.mutedApps);
      if (muted) list.add(appId); else list.delete(appId);
      systemNotificationsState = { ...systemNotificationsState, revision: ++revision, mutedApps: Array.from(list) };
      return systemNotificationsState;
    }
    case "clear_system_notifications":
      systemNotificationCalls.push({ command, args });
      systemNotificationsState = { ...systemNotificationsState, revision: ++revision, items: [] };
      return systemNotificationsState;
    case "dismiss_system_notification":
      systemNotificationCalls.push({ command, args });
      systemNotificationsState = { ...systemNotificationsState, revision: ++revision, items: systemNotificationsState.items.filter((i) => i.id !== args.id) };
      return systemNotificationsState;
    case "dismiss_system_notification_app":
      systemNotificationCalls.push({ command, args });
      systemNotificationsState = { ...systemNotificationsState, revision: ++revision, items: systemNotificationsState.items.filter((i) => i.appId !== args.appId) };
      return systemNotificationsState;
    case "open_notification_app":
    case "request_system_notification_access":
    case "open_system_notification_settings":
      systemNotificationCalls.push({ command, args });
      return null;
    case "has_translation_secret": return args.provider === "deepseek";
    case "set_translation_shortcut":
      translationShortcutCalls.push(String(args.shortcut));
      if (args.shortcut === "Ctrl+Alt+Q") throw "Shortcut Ctrl+Alt+Q is taken or cannot be registered: hotkey already registered.";
      return args.shortcut;
    case "updater_configured": return true;
    case "updater_store_build": return false;
    case "get_updater_proxy": return null;
    case "plugin:app|version": return "0.0.0-test";
    case "get_plugins": return { registry: { installed: {}, developerMode: false, indexUrl: "" }, live: {} };
    case "get_plugins_index": return [];
    case "get_clipboard_shortcut_error": return null;
    case "get_live_wallpaper": return { settings: { enabled: false, path: "", fit: "fill", pauseOnBattery: true, unloadAfter: "threeMinutes" }, status: { kind: "off" } };
    case "get_widgets": return { clock: false };
    case "get_app_log_state": return { enabled: false, path: "", bytes: 0 };
    default:
      // A command nobody mocked is a gap in this file, not a null: answering null hid a crash once.
      if (NOOP_COMMANDS.has(command)) return null;
      unmockedCommands.push(command);
      throw new Error(`settingsMocks: no mock for the command "${command}"`);
  }
}, { shouldMockEvents: true });
mockWindows("settings");
