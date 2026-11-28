import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

// Corresponds to the commands and STATUS_EVENT in src-tauri/src/island/hide_hotkey.rs.
export function setIslandHideShortcut(enabled: boolean, shortcut: string) {
  return invoke<void>("set_island_hide_shortcut", { enabled, shortcut });
}
export function getIslandHideShortcutError() {
  return invoke<string | null>("get_island_hide_shortcut_error");
}
export function listenIslandHideShortcutStatus(handler: (error: string | null) => void) {
  return listen<string | null>("island-hide-shortcut-status", (event) => handler(event.payload));
}
