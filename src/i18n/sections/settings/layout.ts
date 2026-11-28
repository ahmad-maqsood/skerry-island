export type SettingsLayoutText = {
  title: string;
  opacity: string;
  launchAtStartup: string;
  alwaysShowIsland: string;
  alwaysShowIslandHint: string;
  alwaysShowOnDesktop: string;
  alwaysShowOnDesktopHint: string;
  showMinimizeButton: string;
  showMinimizeButtonHint: string;
  autoTuck: string;
  autoTuckHint: string;
  /** Game mode: quiet while a full-screen app (usually a game) is in front. */
  gameTitle: string;
  gameQuiet: string;
  gameQuietHint: string;
  resetToDefault: string;
};


export const en: SettingsLayoutText = {
  title: "Size & position",
  opacity: "Opacity",
  launchAtStartup: "Launch at startup",
  alwaysShowIsland: "Always display island",
  alwaysShowIslandHint: "The island never tucks to the edge when idle. Game mode, the tray menu and the minimize button still work as set.",
  alwaysShowOnDesktop: "Always display island on the desktop",
  alwaysShowOnDesktopHint: "While no window is open, the island sits out in its collapsed form, even if it was tucked. With \"Tuck to the edge when idle\" on, it tucks as soon as any window opens, even a small one.",
  showMinimizeButton: "Show minimize button",
  showMinimizeButtonHint: "A button on the island, collapsed or open, that tucks it away. It works with the clock or the pixel cat, and while the island is always displayed.",
  autoTuck: "Tuck to the edge when idle",
  autoTuckHint: "After a while without use, the collapsed island slides up to the top of the screen and shows only an edge.",
  gameTitle: "Game mode",
  gameQuiet: "Quiet in full screen",
  gameQuietHint: "While a full-screen game, video or slideshow is in front, the island doesn't open on hover, take the focus or pop up messages.",
  resetToDefault: "Reset to default",
};
