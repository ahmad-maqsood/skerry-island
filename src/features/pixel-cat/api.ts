import { listen, type UnlistenFn } from "@tauri-apps/api/event";

// Mirrors ISLAND_HOVER_CHANGED_EVENT in src-tauri/src/island/passthrough.rs.
const ISLAND_HOVER_CHANGED_EVENT = "island-hover-changed";

/** Calls `handler` when the cursor leaves the island shape, which the page may not see itself. */
export function listenCursorLeftIsland(handler: () => void): Promise<UnlistenFn> {
  return listen<boolean>(ISLAND_HOVER_CHANGED_EVENT, ({ payload }) => {
    if (!payload) handler();
  });
}
