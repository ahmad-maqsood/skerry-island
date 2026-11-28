import { useEffect } from "react";
import { matchesClipboardShortcut } from "../../features/clipboard/shortcut";
import { useHideShortcutRegistration } from "../../features/hide-shortcut/useHideShortcut";

/**
 * The island's keys. In the window: the clipboard history shortcut toggles its page, Escape
 * collapses the island. Everywhere: the main window registers the hide shortcut.
 */
export function useIslandKeyboard(
  clipboardShortcutEnabled: boolean,
  clipboardShortcut: string,
  onToggleClipboardHistory: () => void,
  onCollapse: () => void,
) {
  useHideShortcutRegistration();
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        clipboardShortcutEnabled &&
        matchesClipboardShortcut(event, clipboardShortcut)
      ) {
        event.preventDefault();
        onToggleClipboardHistory();
        return;
      }

      if (event.key === "Escape") {
        onCollapse();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clipboardShortcut, clipboardShortcutEnabled, onCollapse, onToggleClipboardHistory]);
}
