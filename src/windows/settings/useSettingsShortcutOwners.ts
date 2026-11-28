import type { IslandSettings } from "../../features/appearance/types";
import type { ClipboardHistorySettings } from "../../features/clipboard/api";
import { MUSIC_SHORTCUT_ACTIONS, type MusicShortcuts } from "../../features/media/shortcuts";
import type { TranslationSettings } from "../../features/translation/storage";
import { useTranslation } from "../../i18n";
import { collectShortcutOwners } from "./shortcutConflicts";
import { useHideShortcut } from "../../features/hide-shortcut/useHideShortcut";

/** Each shortcut page supplies the live settings it already uses; labels stay in this window layer. */
export function useSettingsShortcutOwners(settings: IslandSettings, clipboard: ClipboardHistorySettings, translation: TranslationSettings, music: MusicShortcuts) {
  const t = useTranslation();
  const [hide] = useHideShortcut();
  return collectShortcutOwners({
    hide: { id: "hide", label: t.settings.shortcuts.hide.keys, shortcut: hide.shortcut, enabled: hide.enabled },
    clipboard: { id: "clipboard", label: t.settings.clipboard.shortcut, shortcut: clipboard.shortcut, enabled: clipboard.enabled && clipboard.shortcutEnabled },
    translation: { id: "translation", label: t.settings.shortcuts.openTranslation, shortcut: translation.shortcut, enabled: settings.translationEnabled && translation.shortcutEnabled },
    music: settings.musicEnabled ? MUSIC_SHORTCUT_ACTIONS.map((action) => ({ id: `music-${action}`, label: t.settings.shortcuts.music[action], shortcut: music[action] })) : [],
  });
}
