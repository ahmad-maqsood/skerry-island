import { useEffect, useState } from "react";
import { ShortcutRecordButton } from "../../components/controls/ShortcutRecordButton";
import { ShortcutResetButton } from "../../components/controls/ShortcutResetButton";
import { SettingsToggleRow } from "../../components/settings/SettingsToggleRow";
import { useTranslation } from "../../i18n";
import { buildShortcutFromEvent } from "../clipboard/shortcut";
import { getIslandHideShortcutError, listenIslandHideShortcutStatus } from "./api";
import { DEFAULT_HIDE_SHORTCUT, type HideShortcutSettings } from "./model";
import "../clipboard/ClipboardSettingsSection.css";

/** The switch for the hide shortcut and its keys, recorded in place like the other shortcuts. */
export function HideShortcutRows({ settings, onChange, takenBy }: {
  settings: HideShortcutSettings;
  onChange: (settings: HideShortcutSettings) => void;
  takenBy: (shortcut: string) => string | null;
}) {
  const t = useTranslation();
  const text = t.settings.shortcuts.hide;
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [conflict, setConflict] = useState("");
  const { enabled, shortcut } = settings;

  useEffect(() => {
    let cancelled = false;
    let stop: (() => void) | undefined;
    let received = false;
    void listenIslandHideShortcutStatus((error) => {
      received = true;
      if (!cancelled) setRegisterError(error);
    }).then((unlisten) => {
      if (cancelled) { unlisten(); return; }
      stop = unlisten;
      return getIslandHideShortcutError().then((error) => { if (!cancelled && !received) setRegisterError(error); });
    }).catch((error) => console.error("Failed to read the hide shortcut status", error));
    return () => { cancelled = true; stop?.(); };
  }, []);

  const apply = (next: string) => {
    const owner = takenBy(next);
    setConflict(owner ? t.settings.shortcuts.taken(next, owner) : "");
    if (owner) return;
    setRegisterError(null);
    onChange({ ...settings, shortcut: next });
  };
  const error = enabled
    ? conflict || (registerError ? `${t.settings.shortcuts.registerFailed(shortcut)} ${registerError}` : "")
    : "";

  return (
    <>
      <SettingsToggleRow
        title={text.enable}
        description={text.enableHint(shortcut)}
        checked={enabled}
        onChange={(next) => { setConflict(""); onChange({ ...settings, enabled: next }); }}
      />
      <div className="shortcut-row">
        <div className={`shortcut-control${enabled ? "" : " shortcut-control--disabled"}`}>
          <div className="shortcut-control__meta"><span>{text.keys}</span></div>
          <div className="shortcut-control__actions">
            <ShortcutResetButton label={t.settings.shortcuts.reset(DEFAULT_HIDE_SHORTCUT)}
              isDefault={shortcut === DEFAULT_HIDE_SHORTCUT} disabled={!enabled} onReset={() => apply(DEFAULT_HIDE_SHORTCUT)} />
            <ShortcutRecordButton
              shortcut={shortcut}
              pressKeysLabel={t.settings.clipboard.pressKeys}
              disabled={!enabled}
              toShortcut={buildShortcutFromEvent}
              onRecord={apply}
              onInterrupted={() => setConflict(t.settings.shortcuts.takenElsewhere)}
            />
          </div>
        </div>
        {error && <p className="shortcut-control__error" role="alert">{error}</p>}
      </div>
    </>
  );
}
