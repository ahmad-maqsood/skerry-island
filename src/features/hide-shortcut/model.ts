import { normalizeClipboardShortcut } from "../clipboard/shortcut.ts";

/** The global shortcut that hides the island, and pressed again brings it back. */
export type HideShortcutSettings = { enabled: boolean; shortcut: string };

export const DEFAULT_HIDE_SHORTCUT = "Ctrl+Shift+H";

/** On with the default keys unless it was switched off; unusable keys fall back to the default. */
export function normalizeHideShortcut(value: unknown): HideShortcutSettings {
  const item = value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return {
    enabled: item.enabled !== false,
    shortcut: normalizeClipboardShortcut(typeof item.shortcut === "string" ? item.shortcut : "", DEFAULT_HIDE_SHORTCUT),
  };
}
