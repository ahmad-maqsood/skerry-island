const BASE = import.meta.env.BASE_URL || '/';

function assetUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, '');
  return `${BASE}${clean}`;
}

export const REPO_URL = 'https://github.com/ahmad-maqsood/skerry-island';
export const RELEASES_URL = 'https://github.com/ahmad-maqsood/skerry-island/releases/latest';
export const MICROSOFT_STORE_URL = 'https://apps.microsoft.com/detail/9MV21HG0T71J';
export const PLUGIN_GUIDE_URL =
  'https://github.com/ahmad-maqsood/skerry-island/blob/main/docs/plugins/README.md';
export const SECURITY_URL =
  'https://github.com/ahmad-maqsood/skerry-island/blob/main/SECURITY.md';

export const BRAND_MARK = assetUrl('src/assets/mark.svg');

export const SCREENSHOTS = {
  music: assetUrl('src/assets/screenshots/screenshot-music.webp'),
  pixelCat: assetUrl('src/assets/screenshots/screenshot-pixel-cat.webp'),
  collapsedClock: assetUrl('src/assets/screenshots/screenshot-collapsed-clock.webp'),
  collapsedNotification: assetUrl('src/assets/screenshots/screenshot-collapsed-notification.webp'),
  messages: assetUrl('src/assets/screenshots/screenshot-messages.webp'),
  todos: assetUrl('src/assets/screenshots/screenshot-todos.webp'),
  translation: assetUrl('src/assets/screenshots/screenshot-translation.webp'),
  fileShelf: assetUrl('src/assets/screenshots/screenshot-file-shelf.webp'),
  system: assetUrl('src/assets/screenshots/screenshot-system.webp'),
  settings: assetUrl('src/assets/screenshots/screenshot-settings.webp'),
  themes: assetUrl('src/assets/screenshots/screenshot-themes.webp'),
} as const;

export interface HeroScreenshotSlide {
  id: string;
  label: string;
  title: string;
  caption: string;
  src: string;
  alt: string;
}

export const HERO_SCREENSHOT_SLIDES: HeroScreenshotSlide[] = [
  {
    id: 'music',
    label: 'Music & Lyrics',
    title: 'System Media & Synced Lyrics',
    caption:
      'Global WinRT GSMTC playback controls with line-by-line LRCLIB lyrics. Colors from the playing track subtly illuminate the entire open island.',
    src: SCREENSHOTS.music,
    alt: 'Skerry expanded island showing music controls, wavy progress scrubber, and synchronized lyrics',
  },
  {
    id: 'pixel-cat',
    label: 'Pixel Cat',
    title: 'Interactive Pixel Cat Companion',
    caption:
      'On by default on a fresh install—walks, washes, loafs, yawns, dashes, and pounces on a ball of yarn. Hover over the island and it chases your cursor, swats at it, and purrs while it rests.',
    src: SCREENSHOTS.pixelCat,
    alt: 'Skerry collapsed top-edge island with the animated pixel cat',
  },
  {
    id: 'clock',
    label: 'Idle Clock',
    title: 'Glanceable Tabular Clock',
    caption:
      'Clean tabular digits tucked cleanly along the top edge of your primary display, paired with optional Open-Meteo local weather when idle.',
    src: SCREENSHOTS.collapsedClock,
    alt: 'Skerry collapsed island displaying tabular clock numerals',
  },
  {
    id: 'toast-glance',
    label: 'Toast Glance',
    title: 'One-Line Notification Preview',
    caption:
      'Incoming Windows toast notifications from Outlook, WhatsApp, Teams, and browsers appear inline without blocking the corner of your screen.',
    src: SCREENSHOTS.collapsedNotification,
    alt: 'Skerry collapsed island displaying a real-time Microsoft Outlook toast preview',
  },
  {
    id: 'messages',
    label: 'Notifications',
    title: 'Unified Windows Notification Feed',
    caption:
      'Grouped by application with newest alerts first, single-click dismiss actions, and direct click-to-open launching by Windows AUMID.',
    src: SCREENSHOTS.messages,
    alt: 'Skerry expanded notification feed grouped by Teams and WhatsApp',
  },
  {
    id: 'todos',
    label: 'To-Dos & Focus',
    title: 'Daily Tasks & Built-In Focus Timer',
    caption:
      'Check off daily tasks synced straight to local Markdown files and run an inline Pomodoro countdown right inside the island.',
    src: SCREENSHOTS.todos,
    alt: 'Skerry to-do list with active focus countdown timer and task progress bar',
  },
  {
    id: 'file-shelf',
    label: 'File Shelf',
    title: 'Drag-and-Drop File Staging Shelf',
    caption:
      'Drop files onto the island while switching windows, keep them staged across workspaces, and drag them out into your destination app.',
    src: SCREENSHOTS.fileShelf,
    alt: 'Skerry file shelf staging PDF, SVG, and CSV files',
  },
  {
    id: 'system',
    label: 'System Health',
    title: 'Live PC Health & Quick Sliders',
    caption:
      'Real-time CPU sparklines, memory consumption, NVMe disk read/write rates, network speeds, plus instant volume and brightness sliders.',
    src: SCREENSHOTS.system,
    alt: 'Skerry system monitor displaying volume and brightness sliders, CPU sparkline, and memory usage',
  },
  {
    id: 'translation',
    label: 'Translation',
    title: 'Quick Translation',
    caption:
      'Translate pasted or typed text directly inside the island or via Ctrl + Shift + F using keyless MyMemory by default or custom OpenAI-compatible endpoints.',
    src: SCREENSHOTS.translation,
    alt: 'Skerry quick translation view using keyless MyMemory',
  },
];

export interface MaterialSpecItem {
  id: 'midnight' | 'graphite' | 'liquid' | 'frosted' | 'aurora' | 'prism';
  name: string;
  tag: string;
  detail: string;
}

export const MATERIAL_LIST: MaterialSpecItem[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    tag: 'Default',
    detail:
      'Deep ink-indigo surface with a violet-to-blue-to-rose horizon glow and gradient bottom rim—pearl on light islands.',
  },
  {
    id: 'graphite',
    name: 'Graphite',
    tag: 'Satin matte',
    detail:
      'Flat satin fill that reads with consistent contrast over bright, busy, or high-detail application windows.',
  },
  {
    id: 'liquid',
    name: 'Liquid Glass',
    tag: 'Clear edge',
    detail:
      'Nearly clear translucent pane with crisp lit edges that lets your desktop color pass right through.',
  },
  {
    id: 'frosted',
    name: 'Frosted Glass',
    tag: 'Milky frost',
    detail:
      'Soft milky diffusion that calms textured wallpapers while keeping typography sharp and readable.',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    tag: 'Ambient glow',
    detail:
      'Smoky translucent shell illuminated gently from below by drifting northern-light color.',
  },
  {
    id: 'prism',
    name: 'Prism',
    tag: 'Iridescent',
    detail:
      'Clear crystal pane with an iridescent sheen and a delicate rim that splits light along the corners.',
  },
];

export const PRIVACY_TABLE = [
  {
    resource: 'Notification Listener',
    usage: 'Captures incoming Windows toast alerts for collapsed previews and grouped feeds.',
    storage: 'In-memory only; cleared immediately when Skerry quits.',
  },
  {
    resource: 'Clipboard History',
    usage: 'Stores copied text, images, and file paths when enabled (Ctrl + Shift + W).',
    storage: 'Local app data folder (clipboard-history.json + clipboard-images).',
  },
  {
    resource: 'API Keys & Secrets',
    usage: 'Optional custom translation endpoints and provider credentials.',
    storage: 'Windows Credential Manager (OS-level encrypted vault).',
  },
  {
    resource: 'Network Requests',
    usage: 'Update checks (GitHub), weather (Open-Meteo), lyrics (LRCLIB), translation, and enabled plugins.',
    storage: 'Zero analytics or third-party tracking servers are ever contacted.',
  },
];

export interface RepoMetrics {
  appVersion: string;
  materialCount: number;
  materials: string[];
  reactMajor: number;
  viteMajor: number;
  tauriMajor: number;
  rustEdition: string;
  screenshotCount: number;
  githubPluginVersion: string;
}

export function buildArchitectureLayers(meta: RepoMetrics) {
  return [
    {
      layer: 'Frontend UI',
      tech: `React ${meta.reactMajor}, TypeScript (Strict), Vite ${meta.viteMajor}`,
      role: 'Four focused windows (Island, Settings, Clipboard, Translation) sharing unified semantic tokens.',
    },
    {
      layer: 'Desktop Shell',
      tech: `Tauri ${meta.tauriMajor} (updater, opener, single-instance)`,
      role: 'Native window lifecycle, secure IPC commands, and signed silent background updates.',
    },
    {
      layer: 'Native Core',
      tech: `Rust ${meta.rustEdition} + windows crate (Win32 & WinRT)`,
      role: 'GSMTC media hooks, toast listener, click-through geometry, multi-monitor follow, and fullscreen detection.',
    },
    {
      layer: 'Unsafe Isolation',
      tech: 'src-tauri/src/win32/',
      role: 'Strict boundary — the only module permitted to call unsafe Win32 and COM APIs.',
    },
    {
      layer: 'Plugin Host',
      tech: 'Stdio Plugin API v1 (MIT SDK workspace)',
      role: `Runs isolated external processes (including github-${meta.githubPluginVersion}) with explicit manifest capabilities.`,
    },
  ];
}

export function buildPluginManifestSnippet(pluginVersion: string): string {
  return `{
  "apiVersion": 1,
  "id": "skerry.github",
  "name": "GitHub Activity",
  "version": "${pluginVersion}",
  "transport": "stdio",
  "entry": "skerry-plugin-github.exe",
  "permissions": {
    "network": ["api.github.com"],
    "secrets": ["github_pat"]
  },
  "surfaces": ["collapsed-pill", "island-tab"]
}`;
}
