import { SettingsGroup } from "../../components/settings/SettingsGroup";
import type { IslandSettings } from "../../features/appearance/types";
import { useClipboardSettings } from "../../features/clipboard/useClipboardSettings";
import { HideShortcutRows } from "../../features/hide-shortcut/HideShortcutRows";
import { useHideShortcut } from "../../features/hide-shortcut/useHideShortcut";
import { useMusicShortcuts } from "../../features/media/useMusicShortcuts";
import { useTranslationSettings } from "../../features/translation/useTranslationSettings";
import { useTranslation } from "../../i18n";
import { findShortcutOwner } from "./shortcutConflicts";
import { useSettingsShortcutOwners } from "./useSettingsShortcutOwners";

/** Settings → General → Hide the island: right under tucking, for when the island never tucks away. */
export function HideShortcutGroup({ settings }: { settings: IslandSettings }) {
  const t = useTranslation();
  const [hide, updateHide] = useHideShortcut();
  const [clipboard] = useClipboardSettings();
  const [translation] = useTranslationSettings();
  const [music] = useMusicShortcuts();
  const owners = useSettingsShortcutOwners(settings, clipboard, translation, music);
  return (
    <SettingsGroup title={t.settings.shortcuts.hide.title} footer={t.settings.shortcuts.hide.footer}>
      <HideShortcutRows settings={hide} onChange={updateHide} takenBy={(shortcut) => findShortcutOwner(shortcut, owners, "hide")} />
    </SettingsGroup>
  );
}
