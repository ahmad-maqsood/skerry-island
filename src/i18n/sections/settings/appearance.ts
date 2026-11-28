export type SettingsAppearanceText = {
  font: string;
  fontLabel: string;
  fontSize: string;
  collapsedDimensions: { autoWidth: string; width: string; height: string; padding: string; unit: string; hint: string };
  systemFont: string;
  pixelFont: string;
  /** Material: midnight, graphite, liquid glass, frosted glass, aurora, or prism. */
  material: string;
  midnight: string;
  graphite: string;
  liquidGlass: string;
  frostedGlass: string;
  aurora: string;
  prism: string;
  glassStrength: string;
  /** How much the glass blurs the wallpaper behind it, and what it blurs. */
  glassBlur: string;
  glassBlurHint: string;
  /** Colour scheme: dark, light, or following Windows. */
  colorScheme: string;
  schemeDark: string;
  schemeLight: string;
  schemeSystem: string;
  /** Group titles, one kind of setting each (2026-11-19, docs/design/settings.md): the scheme and
      material; the font; every size; every corner. */
  themeTitle: string;
  textSizeTitle: string;
  sizeTitle: string;
  cornersTitle: string;
  /** The collapsed and the open island's overall size, two sliders. */
  collapsedScale: string;
  expandedScale: string;
  pageButtons: string;
  capsules: string;
  icons: string;
  /** Notch (flush with the top edge) or capsule (a floating pill, islandShape.ts). */
  islandShape: string;
  islandShapeHint: string;
  islandShapes: { notch: string; capsule: string };
  topEdgeShoulders: string;
  topEdgeShouldersHint: string;
  topEdgeShoulderSize: string;
  /** The open island's corner radius and shape; the collapsed bar's corners follow. */
  cornerRadius: string;
  cornerRadiusHint: string;
  collapsedCornerRadius: string;
  cornerShape: string;
  cornerShapes: { squircle: string; round: string };
  /** The island preview at the top of the page: sample content and the two captions. */
  preview: {
    label: string;
    collapsed: string;
    expanded: string;
    /** Three sample rows: the first is also the collapsed bar's title, the last is shown done. */
    samples: { first: string; second: string; third: string };
  };
  /** The "Collapsed island" group: what its text shows first, and the song's cover. */
  collapsedIsland: {
    title: string;
    priorityFooter: string;
    items: Record<"lyrics" | "todo", { name: string; hint: string }>;
    /** The drag handle of one item; arrow keys on it move the item too. */
    moveLabel: (name: string) => string;
    showCover: string;
    showCoverHint: string;
    layout: {
      title: string;
      footer: string;
      reset: string;
      slots: Record<"pulse" | "text" | "shelf" | "music" | "clock" | "weather" | "system", string>;
      textSample: string;
      moveLabel: (name: string) => string;
      /** The box under the island for what is dragged off it. */
      hidden: string;
      hiddenEmpty: string;
      hiddenLabel: (name: string) => string;
    };
  };
};


export const en: SettingsAppearanceText = {
  font: "Font",
  fontLabel: "Island font",
  fontSize: "Font size",
  collapsedDimensions: { autoWidth: "Automatic width", width: "Width", height: "Height", padding: "Side space", unit: "px", hint: "Width and height are the collapsed island's, and follow the collapsed size." },
  systemFont: "System",
  pixelFont: "Pixel",
  material: "Material",
  midnight: "Midnight",
  graphite: "Graphite",
  liquidGlass: "Liquid",
  frostedGlass: "Frosted",
  aurora: "Aurora",
  prism: "Prism",
  glassStrength: "Glass strength",
  glassBlur: "Background blur",
  glassBlurHint: "Blurs whatever is behind the island, live",
  colorScheme: "Color scheme",
  schemeDark: "Dark",
  schemeLight: "Light",
  schemeSystem: "System",
  themeTitle: "Theme",
  textSizeTitle: "Text",
  sizeTitle: "Size",
  cornersTitle: "Corners",
  collapsedScale: "Collapsed size",
  expandedScale: "Expanded size",
  pageButtons: "Page buttons",
  capsules: "Capsules",
  icons: "Icons",
  islandShape: "Island shape",
  islandShapeHint: "The capsule floats just below the top of the screen and collapses to a full pill",
  islandShapes: { notch: "Notch", capsule: "Capsule" },
  topEdgeShoulders: "Top edge curves",
  topEdgeShouldersHint: "At the top of the screen, the island's sides curve into the screen edge",
  topEdgeShoulderSize: "Curve size",
  cornerRadius: "Open corners",
  cornerRadiusHint: "The open island and the panels inside it",
  collapsedCornerRadius: "Collapsed corners",
  cornerShape: "Corner shape",
  cornerShapes: { squircle: "Smooth", round: "Round" },
  preview: {
    label: "The island with the current settings",
    collapsed: "Collapsed",
    expanded: "Expanded",
    samples: { first: "Settings page transition", second: "Weekly report outline", third: "Fix the login timeout" },
  },
  collapsedIsland: {
    title: "Island display priority",
    priorityFooter: "When several have something to show, the collapsed island shows the first. Drag to reorder.",
    items: {
      lyrics: { name: "Song", hint: "Title and artist, or lyrics if switched on in Music" },
      todo: { name: "Todos", hint: "The todo you started; until then, the count left comes last" },
    },
    moveLabel: (name) => `Reorder "${name}": drag, or press the up and down arrow keys`,
    showCover: "Show the song's cover",
    showCoverHint: "The song's cover in front of its title or lyric line",
    layout: {
      title: "On the island",
      footer: "Hold an icon and drag it left or right; icons left of the text sit on the island's left. Drop one in the box below to take it off the island. Grey ones are switched off and keep their place.",
      reset: "Reset",
      slots: { pulse: "Status light", text: "Text", shelf: "Shelf files", music: "Music waveform", clock: "Time", weather: "Weather", system: "System" },
      textSample: "Collapsed text",
      moveLabel: (name) => `Move "${name}": drag, or press the left and right arrow keys; the down arrow takes it off the island`,
      hidden: "Not on the island",
      hiddenEmpty: "Drag an icon here to take it off the island",
      hiddenLabel: (name) => `"${name}" is off the island: drag it back, or press the up arrow`,
    },
  },
};
