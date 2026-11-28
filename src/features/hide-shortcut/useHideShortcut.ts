import { useCallback, useEffect, useState } from "react";
import { readJson, writeJson } from "../../lib/storage";
import { setIslandHideShortcut } from "./api";
import { normalizeHideShortcut, type HideShortcutSettings } from "./model";

const STORAGE_KEY = "skerry-hide-shortcut";
/** For this window: the storage event only reaches other windows, and Settings may be inside the island. */
const SAVED_EVENT = "skerry-hide-shortcut-saved";

const load = () => normalizeHideShortcut(readJson(STORAGE_KEY));

export function useHideShortcut() {
  const [settings, setSettings] = useState(load);
  useEffect(() => {
    const reload = () => setSettings(load());
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) reload();
    };
    window.addEventListener("storage", sync);
    window.addEventListener(SAVED_EVENT, reload);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(SAVED_EVENT, reload);
    };
  }, []);
  const update = useCallback((next: HideShortcutSettings) => {
    writeJson(STORAGE_KEY, next);
    setSettings(next);
    window.dispatchEvent(new Event(SAVED_EVENT));
  }, []);
  return [settings, update] as const;
}

/** Owned by the main window, so the keys work without Settings ever being opened. */
export function useHideShortcutRegistration() {
  const [{ enabled, shortcut }] = useHideShortcut();
  useEffect(() => {
    void setIslandHideShortcut(enabled, shortcut)
      .catch((error) => console.error("Failed to update the hide shortcut", error));
  }, [enabled, shortcut]);
}
