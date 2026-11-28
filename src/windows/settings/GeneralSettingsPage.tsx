import { useTranslation, type LocaleCode } from "../../i18n";
import { SettingsGroup } from "../../components/settings/SettingsGroup";
import { BehaviorSettingsSection } from "../../features/appearance/BehaviorSettingsSection";
import { ExpandRows, GameModeRow, PositionRows, TuckRows } from "../../features/appearance/IslandBehaviorRows";
import { KeepVisibleRows } from "../../features/appearance/KeepVisibleRows";
import type { IslandSettings } from "../../features/appearance/types";
import { requestIslandPositionReset } from "./storage";
import { useLaunchAtStartup } from "./useLaunchAtStartup";
import { ConfigTransferSection } from "../../features/config-transfer/ConfigTransferSection";
import { TrayIconRow } from "./TrayIconRow";
import { IslandTabsGroup } from "./IslandTabsGroup";
import { HideShortcutGroup } from "./HideShortcutGroup";
import type { SystemNotificationsController } from "../../features/messages/system-notifications/useSystemNotifications";

/**
 * Settings → General: how the island behaves, most used first (docs/design/settings.md): startup
 * and language; which tabs the island has; opening and closing; the position; tucking to the edge, with when not to under
 * auto-tuck; the hide shortcut;
 * game mode; backup and transfer. How it looks, tucked included, is on appearance.
 */
export function GeneralSettingsPage({
  locale,
  settings,
  detachedSettings,
  systemNotifications,
  onLocaleChange,
  onSettingsChange,
  onDetachedSettingsChange,
}: {
  locale: LocaleCode;
  settings: IslandSettings;
  detachedSettings: boolean;
  systemNotifications: SystemNotificationsController;
  onLocaleChange: (locale: LocaleCode) => void;
  onSettingsChange: (settings: IslandSettings) => void;
  onDetachedSettingsChange: (detached: boolean) => void;
}) {
  const t = useTranslation();
  const [launchAtStartup, updateLaunchAtStartup, launchAtStartupError] = useLaunchAtStartup();
  const rows = { settings, onSettingsChange };

  return (
    <>
      <BehaviorSettingsSection
        launchAtStartup={launchAtStartup}
        launchAtStartupError={launchAtStartupError}
        locale={locale}
        detachedSettings={detachedSettings}
        onDetachedSettingsChange={onDetachedSettingsChange}
        onLaunchAtStartupChange={updateLaunchAtStartup}
        onLocaleChange={onLocaleChange}
      >
        <TrayIconRow />
      </BehaviorSettingsSection>
      <IslandTabsGroup settings={settings} onSettingsChange={onSettingsChange} systemNotifications={systemNotifications} />
      <SettingsGroup title={t.settings.expand.title}>
        <ExpandRows {...rows} />
      </SettingsGroup>
      <SettingsGroup title={t.settings.position.title} footer={settings.positionLocked ? undefined : t.settings.position.moveHint}>
        <PositionRows {...rows} onResetPosition={requestIslandPositionReset} />
      </SettingsGroup>
      <SettingsGroup
        title={t.settings.expand.tuckTitle}
        footer={settings.autoTuck && !settings.alwaysShowIsland
          ?<>{t.settings.keepVisible.hint}<br />{t.settings.expand.tuckLookHint}</>
          : t.settings.expand.tuckLookHint}
      >
        <TuckRows {...rows} />
        <KeepVisibleRows {...rows} />
      </SettingsGroup>
      <HideShortcutGroup settings={settings} />
      <SettingsGroup title={t.settings.layout.gameTitle}>
        <GameModeRow {...rows} />
      </SettingsGroup>
      <ConfigTransferSection />
    </>
  );
}
