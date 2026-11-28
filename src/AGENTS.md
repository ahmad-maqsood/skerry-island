# Frontend Rules (src/)

Applies to all files under `src/`, supplementing the root [AGENTS.md](../AGENTS.md) with frontend-specific details.

## Target Architecture

```text
src/
├── main.tsx                 # Sole entry point: dispatches via ?window= to root components under windows/
├── windows/                 # One directory per Tauri window, responsible only for composition and window-level behavior
│   ├── island/              # Main window: IslandApp (composition only), IslandShell, expanded panel views (IslandPages), feature wiring hooks (useIslandNotices / Todos / Tucking / Shelf / Hover / Translation / Navigation; wire new features here, not in IslandApp), window dimension/drag/tuck hooks, automation hooks
│   ├── widgets/             # Desktop widget windows (?window=widget-<id>): WidgetWindow picks the widget
│   ├── settings/            # Settings window
│   ├── clipboard/           # Clipboard history standalone window: custom titlebar (drag, pin on top, close), reuses panel from features/clipboard
│   └── translation/         # Quick translation window
├── features/                # Business domains, each self-contained
│   ├── todos/               # Todos, daily notes, archive, Markdown export and optional reverse sync
│   ├── media/               # Media controls, global shortcuts (useMusicShortcuts), waveform, player diagnostic cards, and compatibility settings; lyrics/ for synced lyrics (LRC parsing, progress tracking, click-to-seek, settings)
│   ├── clipboard/           # Clipboard history, shortcuts
│   ├── widgets/             # Settings → Advanced → Widgets: typed IPC, switches hook, settings section; clock/ is the desktop clock (glyphs.ts weekday letters, text.ts lines, ink.ts colour choice from the backdrop, ClockWidget)
│   ├── live-wallpaper/      # Settings → Advanced live wallpaper: typed IPC, state hook, settings section (playback is native)
│   ├── config-transfer/     # Configuration backup / transfer: format validation, prefix filtering, batch storage restoration, native dialogs, and startup restore
│   ├── file-shelf/          # File shelf: files dragged to the island (stores paths only), drag-out, copy, open
│   ├── messages/            # Notification cards, previews, and reader; system-notifications/ holds the Windows toast listener hook (useSystemNotifications.ts), api.ts, storage.ts, and types
│   ├── appearance/          # Appearance settings, layout editor, presets; island settings (skerry-settings) limits in settingsLimits.ts, initial launch values in settingsDefaults.ts, domain-specific loading in normalizeLayout / BehaviorSettings.ts; add new settings across these files with settings.ts acting solely as the entry point
│   ├── translation/         # Quick translation: typed wrappers for services, model settings, credentials, shortcuts; request and auto-translate hooks, in-island translation page
│   ├── device-status/       # Typed IPC and pure change detection for device pop-ups (a Bluetooth device connecting, airplane mode or Caps Lock switching, a volume or brightness step); wired in windows/island/useDevicePopups.ts and useLevelPopups.ts
│   ├── weather/             # Built-in time and weather: city settings/cache, Open-Meteo IPC, WMO mapping, leaf time and weather, shared low-frequency refresh
│   ├── system-monitor/      # System page: CPU / memory / disk / network / battery sampling, sparklines, collapsed chip; quick-controls/ (volume and brightness sliders) is a separate feature directory
│   ├── pixel-cat/           # Optional walking pixel cat on the collapsed island: settings switch (storage.ts, usePixelCat), pure sprite grids and width helpers (sprite.ts, model.ts), the routine and cursor rules (brain.ts) run by useCatBrain, the CSS-animated PixelCat; takes the clock's place on the bar and widens the island
│   ├── privacy/             # Microphone and camera indicator on the collapsed island
│   ├── diagnostics/         # Troubleshooting log settings and frontend error capture
│   ├── plugins/             # Plugin API v1 frontend: typed IPC, snapshots, usePlugins, plugin setting rows (gated by releaseFlags.ts)
│   ├── onboarding/          # First-launch welcome content (firstLaunch.ts)
│   └── updater/             # Auto-updater
├── components/              # Domain-agnostic generic UI (controls/ switches, number inputs, dropdowns used by plugin page and island; settings/ grouped list for settings window: groups, rows, toggle rows, slider rows, number rows, colors, inputs, segmented controls, dropdowns, text links used across settings pages; reorder/ drag-to-reorder list and pointer hook)
├── lib/                     # Generic infrastructure with side effects, e.g. safe localStorage read/write
├── utils/                   # Pure functions without side effects (text measurement, color, date, numerical)
├── i18n/                    # Typed multi-language dictionary and Provider; sections/ organizes copy by section (settings/ sub-divided by settings page), types.ts and locales/ serve only as aggregators
├── styles/                  # Global CSS: variables, base styles, typography
└── assets/                  # Built-in sound effects (sounds/thumb-piano) and their README
```

The appearance color module is located in `features/appearance/`: `HexColorInput` / `hexColor.ts` (color value editing), `colorPalette.ts` (three-color validation), `colorRefresh.ts` (one-off refresh), `colorPresets.ts` / `ColorPresetRow` (color preset logic and UI); safe read/write for new color keys is centralized in `storage.ts` in the same directory.

Standard structure of an individual feature directory (create as needed; omit unneeded files):

```text
features/<domain>/
├── <Name>Panel.tsx / <Name>.tsx   # Component, one primary component per file
├── use<Name>.ts                   # Domain state and side-effect hook
├── api.ts                         # Typed wrappers for all invokes / listens in this domain, event name constants, types corresponding to Rust
├── storage.ts                     # localStorage keys and load / save / normalize for this domain
├── types.ts                       # Shared types for this domain (can be omitted and defined at point of use if minimal)
├── <pure-logic>.ts                # Unit-testable pure functions, e.g. markdown.ts, shortcut.ts
└── <Name>.css                     # Stylesheet sharing the component name
```

Under `features/messages/`, `system-notifications/useSystemNotifications.ts` is the domain hook behind `Messages.tsx` (panel) and `MessageCard.tsx`. Invoke calls and storage keys live in its `api.ts` and `storage.ts`.

## Layering and Dependency Direction

```text
main.tsx → windows/ → features/ → components/, lib/, utils/, i18n/, styles/
```

- Dependencies must point only rightward (downward); lower layers must not import upper layers. `components/` and `utils/` must not depend on any feature.
- `utils/` contains only pure functions, free of dependencies on React, Tauri, the DOM, or `localStorage`.
- Minimize direct dependencies between features. Types or functions that must be shared should be lifted to `utils/`, `components/`, or exported publicly via the feature directory's `index.ts`. Never deep-import another feature's internal files.
- `windows/` handles feature composition and window-level state (collapse/expand, sizing, panel switching); do not write domain logic here.

## Boundary Enforcement

- **IPC**: `invoke` and `listen` appear only in each directory's `api.ts`. Components and hooks call typed functions exported by `api.ts` rather than hardcoding command name strings.
  - Types in `api.ts` that mirror Rust structs must include comments citing the corresponding Rust file and struct name.
  - Event names must be defined as constants matching Rust-side constants.
  - Unlisten functions returned by `listen` must be invoked upon component unmount, gracefully handling cases where unmount occurs before the Promise resolves.
- **Persistence**: `localStorage` is read and written exclusively in each directory's `storage.ts`, centralized through safe read/write utilities in `lib/`. Language preference in `src/i18n/index.ts` is an existing exception covered by tests.
  - The load function must be fault-tolerant: JSON parse failures, missing fields, and legacy format data must fall back to default values without throwing exceptions.
  - Key names and data schemas constitute external contracts (see root rules). When formats evolve, maintain backward compatibility for legacy data in normalize functions.

## Files and Naming

- Component files use `PascalCase.tsx`, hooks use `useXxx.ts`, other modules use `camelCase.ts`, and directories use `kebab-case`.
- A `.tsx` file exports only one primary component; small sub-components used solely by it and under ~50 lines may live in the same file.
- Logic without JSX must not be placed in `.tsx` files.
- Use named exports consistently; convert legacy default exports such as the root `App` component to named exports during refactoring.
- File line limits follow root rules. Two additional soft guidelines are enforced during code review: single component functions should not exceed 200 lines, and single hooks should not exceed 150 lines.

## Components and State

- When a single component exceeds 8 `useState` calls, extract related state into custom hooks or switch to `useReducer`.
- Each `useEffect` must serve a single responsibility. Subscriptions, timers, and listeners must return cleanup functions.
- Values that can be derived from existing state should be computed directly or via `useMemo`; do not use effects to synchronize one state variable into another.
- Share state in the following priority order: props pass-down -> hook lifted to common ancestor -> React Context. Context is reserved for global, low-frequency data such as language and theme. Do not introduce third-party state management libraries.
- The main window is subject to performance constraints when expanded. High-frequency state updates (audio levels, timers, etc.) should reside in leaf components or isolated hooks to avoid triggering full-window re-renders.
- Never use `any` as a type; treat external data as `unknown` until validated or normalized.

## Styling

- Component styles reside in a co-located `.css` file of the same name and are imported by the component itself.
- Global styles live strictly under `styles/`: `tokens.css` (CSS variables: colors, corner radii, spacing, font sizes), `base.css` (resets and base elements), and `fonts.css`.
- Class names use domain prefixes (e.g. `todo-`, `music-`, `clipboard-`, `shelf-`, `system-`, `message-`); new classes must not collide with existing ones. Maintain existing class names when relocating code.
- Prioritize CSS variables for colors, corner radii, and spacing; do not introduce scattered hardcoded values.
- Maintain the established visual design: floating island, compact panels, transparent backgrounds, and clear control states. Refer to `DESIGN.md` for UI direction.
- Use lucide-react for icons; do not write manual SVGs for icons already available in the icon library.
- Accessibility: interactive controls reachable by keyboard must provide `:focus-visible` styling (`base.css` hides button focus outlines for mouse interactions); icon-only buttons must include `aria-label`. New `animation` definitions must include `@media (prefers-reduced-motion: reduce)` in the same file to disable or flatten motion (`tests/unit/reduced-motion.test.mjs` verifies this); `transition` is handled globally by `base.css`. Island expand/collapse animations along with panel entry/exit, tab cross-fades, and tuck/slide behaviors are exceptions that always play in full, scoped locally within the island (product decision dated 2026-11-13; see "Full motion for all users" in [docs/design/island.md](../docs/design/island.md)).

## Internationalization (i18n)

- All user-visible strings, including `aria-label` and `title`, must be retrieved via `useTranslation()` rather than hardcoded.
- Add new copy strictly to the corresponding section file under `i18n/sections/<section>.ts` (settings page copy lives under `i18n/sections/settings/<sub-section>.ts`): each file contains type definitions and `en` in one place, ensuring completeness via TypeScript type checking. Modifying aggregator files (`i18n/types.ts` and `locales/*.ts`) is only required when introducing an entirely new section.
- User-provided content (todos, notes, preset names, raw message text) remains unchanged and is not translated. Error messages returned from native services are displayed verbatim.

## Testing

- Pure logic resides in `.ts` files free of JSX, covered by `tests/unit/*.test.mjs` using `node:test`.
- Because Node loads `.ts` source files directly, tested modules must satisfy:
  - Runtime relative imports must include full `.ts` extensions (pure type imports using `import type` may omit the extension);
  - Use only erasable TypeScript syntax: no `enum`, `namespace`, or constructor parameter properties.
- `tests/unit/updater-controller.test.mjs` and `tests/unit/island-automation.test.mjs` load source code via `vm` and inject mocks keyed by import path. When modifying imports in these tested modules, update mock mappings in the tests synchronously.
- When relocating tested modules, update import paths in `tests/` simultaneously and confirm tests pass.
- Browser regression pages `tests/regression/*.html` check visual presentation and data compatibility: `pnpm test:regression` runs all pages automatically (when adding a page, register it and its query params in `PAGES` within `scripts/run-regression.mjs`, recording results as `<html data-test-result>` or PASS / FAIL lines in `#results`); pages can also be inspected manually by opening `/tests/regression/<name>.html` with `pnpm dev` running. When the settings window is opened outside Tauri it renders blank; use `settings.html` (`?page=<category>` directly opens a specific page) to inspect settings pages. Mocks for settings pages reside in `tests/regression/settingsMocks.ts`. Regression pages do not pass through `main.tsx`; when creating new regression pages, manually import `src/styles/tokens.css` so component CSS variables resolve correctly. Regression page `.tsx` files are strictly type-checked via `tsconfig.tests.json` (`check:tests-types` within `pnpm check`); update mocks in regression pages whenever component props or `api.ts` types change.

## New Tauri Command Checklist

1. Implement the command on the Rust side and register it in `generate_handler!` (see `src-tauri/AGENTS.md`).
2. Add typed wrappers and return types in the corresponding feature's `api.ts`.
3. If plugin or core permissions are required, update `src-tauri/capabilities/default.json`.
4. Run `pnpm build` and validations required on the Rust side.

Plugin API v1: `features/plugins/` holds the typed IPC wrappers, protocol types, and shared snapshots; the settings page is `windows/settings/PluginsSettingsPage.tsx`. New UI continues to reuse SettingsRow and native island components. The page is gated by `features/releaseFlags.ts` (`release-features.json`).
