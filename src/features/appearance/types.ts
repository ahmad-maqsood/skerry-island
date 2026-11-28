export type TranslationTarget = "window" | "island";

/**
 * The island's material: midnight (the default: a solid ink-indigo fill with a horizon glow along
 * the bottom edge and a gradient rim), graphite (a flat fill with a satin finish; it took the place of "classic"
 * on 2026-11-27), liquid glass (a nearly clear pane with lit edges),
 * frosted glass (a milky pane), aurora (a smoky pane lit from below by drifting northern-light
 * colour) or prism (a clear crystal pane with an iridescent film and a rim that splits the light).
 * All the glasses are drawn in CSS over a clear window: nothing blurs the desktop behind them
 * (island/glass.rs).
 */
export type Material = "midnight" | "graphite" | "liquidGlass" | "frostedGlass" | "aurora" | "prism";
/** Colour scheme of the island and the windows: dark, light, or whichever Windows uses. */
export type ColorScheme = "dark" | "light" | "system";
export type IslandFont = "system" | "pixel";
export type PageButtonStyle = "capsule" | "icon";
/** Shape of the island's corners: CSS `corner-shape: squircle`, or a circular arc. */
export type IslandCornerShape = "squircle" | "round";
/** Notch: flush with the top edge (the original look). Capsule: a floating pill below it (islandShape.ts). */
export type IslandShape = "notch" | "capsule";
/** Which monitor the island sits on: the primary one, or it follows the pointer or the foreground window there. */
export type IslandMonitor = "primary" | "cursor" | "foreground";
/** How the collapsed island opens: a click, or resting the pointer on it. */
export type ExpandTrigger = "click" | "hover";
/** What the expanded island's minimize button does: hide to the tray, or tuck to the top edge. */
export type MinimizeAction = "tray" | "tuck";
/** Retired: no longer in Settings, always loads as "reveal"; tucked hover now follows ExpandTrigger (tuckedHover.ts). */
export type TuckedHoverAction = "reveal" | "expand";
export type TuckStyle = "edge" | "line" | "hidden";
/** What double-clicking a file shelf entry does. */
export type ShelfDoubleClick = "open" | "reveal";
/** What the collapsed island can show in its text: the lyric line, a todo. */
export type CollapsedItem = "lyrics" | "todo";
/**
 * What sits on the collapsed island, in the order the user arranged it (Appearance -> Collapsed
 * island): the text (pulse, cover and the lyric or todo line) and the status icons:
 * files on the shelf, the music waveform, the tuck dot. Icons before the text sit on its left.
 */
export type CollapsedSlot = "pulse" | "text" | "shelf" | "music" | "clock" | "weather" | "system";
/** The page dots in the expanded island's header, which the user can drag into any order. */
export type PageDot = "todo" | "music" | "clipboard" | "shelf" | "translation" | "system";

export type IslandSettings = {
  topEdgeLayoutVersion: 1;
  material: Material;
  colorScheme: ColorScheme;
  fontFamily: IslandFont;
  islandFontPercent: number;
  pageButtonStyle: PageButtonStyle;
  glassIntensity: number;
  /** 0–100: how much the glass blurs what is behind it (island/glass_capture.rs). */
  glassBlur: number;
  opacity: number;
  collapsedScale: number;
  collapsedAutoWidth: boolean;
  collapsedWidth: number;
  collapsedHeight: number;
  /** Space (px) between the collapsed island's sides and its first and last items. */
  collapsedPadding: number;
  expandedScale: number;
  marginY: number;
  /** Prevent moving the island by dragging; explicit position reset still works. */
  positionLocked: boolean;
  islandMonitor: IslandMonitor;
  /** Bottom corner radius (px) of the expanded island; its detached and inner panel radii follow it. */
  islandCornerRadius: number;
  /** Corner radius (px) of the collapsed bar; tucked and detached collapsed corners follow it. */
  collapsedCornerRadius: number;
  islandCornerShape: IslandCornerShape;
  islandShape: IslandShape;
  // Optional concave corners where the island joins the screen top.
  topEdgeShoulders: boolean;
  topEdgeShoulderSize: number;
  /** Tallest expanded panel (px) before the todo list, clipboard and messages scroll. */
  maxPanelHeight: number;
  taskTextColor: string;
  /** Text on the expanded pages; "" follows the background's ink (stageStyle.ts). */
  pageTextColor: string;
  pulseColor: string;
  pulseBrightness: number;
  islandBackgroundColor: string;
  todoBackgroundColor: string;
  showTitle: boolean;
  showCollapsedText: boolean;
  showIdleTodoCount: boolean;
  carryOverIncompleteTodos: boolean;
  enableTodoReorder: boolean;
  todoReorderVersion: 1;
  todoTimerEnabled: boolean;
  rotateTodos: boolean;
  todoRotationSeconds: number;
  todoRotationMode: "switch" | "scroll";
  /** Vertical travel in logical pixels per second. */
  todoScrollSpeed: number;
  messagePreviewSeconds: number;
  /** A message preview grows with its text, up to the two sizes below, and scrolls past them. */
  messageAutoExpand: boolean;
  /** Largest width and height (before the collapsed scale) of an adaptive preview. */
  messageExpandMaxWidth: number;
  messageExpandMaxHeight: number;
  /** Which kinds of preview grow when `messageAutoExpand` is on; the others show as the normal one-line preview. */
  messageExpandApps: boolean;
  messageExpandClipboard: boolean;
  messageExpandMusic: boolean;
  messageExpandCharger: boolean;
  /** Seconds an adaptive preview stays (instead of `messagePreviewSeconds`). */
  messageExpandSeconds: number;
  /** Game mode still shows message previews, for `gameNoticeSeconds`, without taking clicks. */
  gameShowNotices: boolean;
  gameNoticeSeconds: number;
  /** Starting a todo timer can also ask for a reminder before it ends; optionally with a sound. */
  todoTimerReminder: boolean;
  todoTimerReminderSound: boolean;
  /**
   * Never hides by itself: no idle tuck, so the island stays on screen. Game mode, the tray
   * menu and the minimize button still follow their own settings.
   */
  alwaysShowIsland: boolean;
  /**
   * While no app window is open (the desktop is clear) the island sits out in its collapsed form,
   * and one that was tucked comes out; as soon as any window opens, even a small one, it tucks.
   * Part of "Tuck to the edge": it does nothing with that off, or with `alwaysShowIsland` on.
   */
  alwaysShowOnDesktop: boolean;
  /** The minimize button on the collapsed bar, the expanded header and the message reader. */
  showMinimizeButton: boolean;
  autoTuck: boolean;
  tuckStyle: TuckStyle;
  /** Px of the island left on screen by the "edge" tuck (TUCK_EDGE_HEIGHT). */
  tuckEdgeHeight: number;
  /**
   * (B) Seconds the collapsed island idles before it tucks into a line (TUCK_DELAY_SECONDS).
   * Replaces `autoTuckSeconds`, which older versions saved and is no longer read.
   */
  tuckDelaySeconds: number;
  /** (A) Seconds after the cursor leaves the open island before it collapses; 0 never (AUTO_COLLAPSE_SECONDS). */
  autoCollapseSeconds: number;
  /** An island tucked after idling slides back once the cursor that brought it out leaves. */
  autoTuckRetract: boolean;
  /** How long (ms) it waits after the cursor leaves before sliding back. */
  autoTuckRetractDelayMs: number;
  /** A tucked island slides back into view to show a new message preview. */
  revealOnMessage: boolean;
  /** The island pops out to show a text as it is copied (needs clipboard history on). */
  clipboardPopup: boolean;
  /** The island pops out to show the song when a new one starts playing. */
  musicPopup: boolean;
  /** The island pops out when the charger is plugged in or unplugged (laptops only). */
  chargerPopup: boolean;
  /** The island pops out with the device's name when a Bluetooth device connects. */
  bluetoothPopup: boolean;
  /** The island pops out when airplane mode is switched on or off. */
  airplanePopup: boolean;
  /** The island pops out when Caps Lock is switched on or off. */
  capsLockPopup: boolean;
  /** The island pops out with a level bar when the system volume changes. */
  volumePopup: boolean;
  /** The island pops out with a level bar when the built-in display's brightness changes. */
  brightnessPopup: boolean;
  expandTrigger: ExpandTrigger;
  /** Pointer rest time (ms) before a hover opens the island. */
  hoverExpandDelayMs: number;
  /** Time (ms) a hover-opened panel stays open after the pointer leaves it. */
  hoverCollapseDelayMs: number;
  minimizeAction: MinimizeAction;
  tuckedHoverAction: TuckedHoverAction;
  // Keep the collapsed island visible during selected activities (idle timer B only).
  keepVisibleWhileLyrics: boolean;
  keepVisibleWhileTodoRunning: boolean;
  /**
   * Module switches. Off hides the module on the island and stops its background work;
   * its data is kept. QQ, WeChat and clipboard history use their existing switches.
   */
  todoEnabled: boolean;
  musicEnabled: boolean;
  shelfEnabled: boolean;
  systemMonitorEnabled: boolean;
  /** Off hides the island's translate button and releases the global translation shortcut. */
  translationEnabled: boolean;
  /** Where translation opens: its own window, or a page of the expanded island. */
  translationTarget: TranslationTarget;
  /** Dragging files onto a collapsed or tucked island opens the shelf as a drop zone. */
  shelfExpandOnDrop: boolean;
  /** Days after which shelf entries leave the list (0 keeps them). */
  shelfAutoCleanupDays: number;
  /** Entries whose file was moved or deleted leave the list instead of showing as missing. */
  shelfRemoveMissing: boolean;
  /** An entry leaves the list once it has been dragged out somewhere. */
  shelfRemoveAfterDragOut: boolean;
  shelfMaxItems: number;
  shelfDoubleClick: ShelfDoubleClick;
  /** The collapsed island shows how many files are on the shelf. */
  shelfShowCount: boolean;
  /** Folder of .lrc files searched for the playing song's lyrics; empty for none. */
  lyricsFolder: string;
  /** Lyrics not in the folder are looked up on LRCLIB. */
  lyricsOnline: boolean;
  /** The music page shows the synced lyrics (on by default; off, it shows the cover and song). */
  lyricsOnMusicPage: boolean;
  /** The collapsed island shows the line being sung (off by default: it shows the title and artist). */
  lyricsOnCollapsed: boolean;
  /** Fill word-timed lyrics as they are sung, in both island states. */
  lyricWordFill: boolean;
  /** Lyrics shown this many ms later (positive) or earlier than the position Windows reports. */
  lyricsOffsetMs: number;
  /** Copy a newly arrived mail verification code without adding it to clipboard history. */
  autoCopyOtp: boolean;
  /** Which of the lyric line and a todo the collapsed island shows first when several could. */
  collapsedPriority: CollapsedItem[];
  /** The playing song's cover on the collapsed island. */
  collapsedShowCover: boolean;
  /** Where the text and each status icon sit on the collapsed island, left to right. */
  collapsedLayout: CollapsedSlot[];
  /** Slots dragged off the island in Appearance → On the island; never the text. */
  collapsedHidden: CollapsedSlot[];
  /** Order of the page dots in the expanded island's header. */
  pageOrder: PageDot[];
  /** While a full-screen app (game, video, slides) is in front: no hover opening or focus, no message pop-ups. */
  gameDoNotDisturb: boolean;
  /** While a full-screen app is in front, the island tucks to the top edge and comes back after. */
  gameAutoTuck: boolean;
  /** Ctrl + mouse wheel over the expanded island switches its page. */
  ctrlWheelPages: boolean;
  /** Clipboard: rows visible in the island before scrolling (3–8). */
  clipboardVisibleRows: number;
  /** Todos: rows the todo page shows before it scrolls (3–12), within the panel height limit. */
  todoVisibleRows: number;
  /** Clipboard: open history in its own window instead of inside the island. */
  clipboardDetached: boolean;
  /** The unpinned clipboard window closes when it loses focus (off by default). */
  clipboardCloseOnBlur: boolean;
};

export type LegacyIslandSettings = Partial<IslandSettings> & {
  /** Before 2026-11-14: "classic" or "liquidGlass", now `material` ("classic" reads as the default). */
  appearanceMode?: unknown;
  margin?: number;
  sizeScale?: number;
  taskTitleColor?: string;
  pendingTodoColor?: string;
};
