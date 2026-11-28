# Settings

- 2026-11-19 (, issue #87): General page adds "Backup & transfer" at bottom, reusing settings groups and text buttons, offering "Export configuration...", "Import configuration...", and explanatory text; "Include clipboard history" unselected by default before export; import verifies and prompts double confirmation before overwrite and restart, completion summary lists credentials needing re-entry and missing plugins. Buttons wrap in narrow windows.

- Music page adds three clearable global shortcuts, checked for conflicts against clipboard, translation, and approval reserved keys; unassigned by default, recording controls and error prompts reuse existing shortcut styles. (

- **Island arrangement preview and drag** : shares theme, material fill, text color, font size, collapsed dimensions, corner radius, and shape with main appearance preview; items follow pointer on drag, neighbors smoothly yielding in real time, transitioning into position on release. Animation active only in this editor, without altering page button, vertical list, or message source reordering. Yield and drop transitions disabled under reduced motion. (Shared calculations and opt-in animations by Agent inference)

- Todo save path: folder icon button ("Select folder") placed to right of input box, opening Windows native folder picker, prioritizing currently entered directory. Selection saves immediately and shows "Saved", without needing to click "Save"; cancellation preserves path; displays inline error below input on failure. Manual entry still requires clicking "Save" or pressing Enter. (#79, 2026-11-18)

- **Plugin Store** (, built-in plugins arranged in square card grid (`auto-fill, minmax(168px, 1fr)`, 10px gap, square, 16px continuous corners), replacing long lists. Top-left of card features 44px brand tile (10px radius, subtle border and soft shadow), with faint brand-color glow behind; top-right category pill (Messages / Agent); 14px / 600 name and up to three lines of 11.5px secondary description below; bottom 26px capsule button: accent tint "Install" when uninstalled, gray "Installed" when installed, turning red "Uninstall" on hover or keyboard focus, green checkmark at bottom-right of tile. Installation takes effect immediately (built into source, no executable downloads), installed list stored in `skerry-native-plugins`. Original plugin development roadmap and external host remain below store, toggled by release flag. (Card details designed by Agent)

- Release availability controlled via root `release-features.json`. Plugin categories and routing always visible; when `plugins: false`, displays development roadmap, specification links, and PR instructions only, reusing settings groups, rows, and text links, links occupying standalone lines for narrow windows, prompting inline retry on open failure. Suppresses plugin host subscriptions and index requests, hiding install, enable, and developer mode features; restores full plugin page when `plugins: true`. Hides "Auto-copy verification code" when mail OTP is disabled. Preserves saved user choices. (

- Messages page top "On-island notifications" group provides shared dwell duration slider (3-30 seconds, default 5), omitting explanatory paragraphs; changes take effect from next new notification. QQ and mail merge bursts within this duration, with continuous preview ceiling capped at twice duration; WeChat resets timer on each new alert. (

- **Always display island on the desktop** (`alwaysShowOnDesktop`, default on): row right under "Always display island", hidden only while "Always display island" is on. It works with "Tuck to the edge when idle" off too. Switching that off, or "Always display island" on, brings a tucked or peeking island out (`revealsForTuckingOff`). While no app window is open (the native `onDesktop` check: every window minimized or closed, such as after Win+D) the island sits out in its collapsed form, and one that was tucked, a minimized one included, comes out (`useDesktopIsland.ts`, rules in `tuckRules.ts` `desktopAction`). With idle tucking on, the moment any window opens, even a small one that does not fill the screen, a collapsed island tucks (hovering peeks it out, and it slides back if "retract" is on); an open panel is left to collapse on its own. Only a change moves the island, so a minimize on a clear desktop stays minimized, and a tuck made by game mode is never undone. Starting the app or switching the setting on over open windows moves nothing: the idle tuck applies. Windows that do not count as open: minimized or cloaked ones (a suspended Store app, another virtual desktop), the shell (desktop, taskbar, Start, search), tool and overlay windows (tool windows not in the taskbar, no-activate and click-through windows), windows owned by another window, windows parked off every monitor, and this app's own windows (`win32/open_windows.rs`).
- **Show minimize button** (`showMinimizeButton`, default on): row under the always-display rows. Draws or removes the minimize button on the collapsed bar, the expanded header and the message reader, with the clock or the pixel cat, and whether or not "Always display island" is on. Saved before this setting existed, it follows the old behaviour (removed when "Always display island" was on).
- **Always display island** (`alwaysShowIsland`, default off): first row under "Tuck to the edge" on the General page. While on, the collapsed island never idle-tucks (`idleCollapse.ts`), so it stays on screen; the minimize button follows "Show minimize button". The idle-tuck rows and "Do not tuck during these activities" are hidden meanwhile, their values kept. Auto-collapse of the open panel, game mode and the tray menu's Hide Island are unaffected.
- General page adds "Do not tuck during these activities" after "Island" group: Agent running, island showing lyrics, todo timer running, all three toggles disabled by default, saved independently. Reuses existing toggle rows and footnotes; hidden when auto-tuck is off, preserving selections when re-enabled. Pauses collapsed auto-tuck only, restarting full wait timer after completion. Clicking todo "Start" directly counts as in-progress without starting Pomodoro timer. (

- Numeric rows use 28px capsule steppers: minus on left, plus on right, centered bold number, unit separated by 6px on right; step is 1 for seconds and clipboard items. Supports long-press stepping and direct typing, clamping and saving on Enter or blur, avoiding native number spinners. (

Global direction see [DESIGN.md](../../DESIGN.md).

## Category and Grouping Conventions 

Adjusts layout, grouping, order, and copy only, without deleting setting items or modifying localStorage keys, field names, defaults, or behavior. Conventions:

- **One feature per group**: feature master toggle occupies first row of group, child options indented beneath it, hidden when toggle is off; child options only took effect when toggle was on, so hiding does not alter behavior.
- **Common first, infrequent last**: pages ordered as feature toggles (untitled group) -> common options -> display details -> infrequent items like storage paths.
- **Consistent group granularity**: 1-5 rows per group, avoiding catch-all groups exceeding 8 rows; group titles use short nouns, distinct from the first row within the group.
- Related features do not cross pages: shortcuts remain on translation and clipboard pages; game mode notifications attach to game mode (effective only when game mode is on).

| Page | Groups (in order) |
|---|---|
| General | Startup & language \| Opening & closing (Expansion mode, Auto-collapse when expanded, Ctrl + wheel switch pages) \| Tuck to the edge (Idle tuck, -> Delay after collapse, Tuck style, -> Reveal height) \| Do not tuck during these activities \| **Game mode** (Quiet in full screen, -> Show notifications anyway, -> Notification dwell duration) \| Position |
| Appearance | Preview \| Theme (Color scheme, Material, -> Glass strength, -> Background blur, Opacity) \| Color \| Typography & size \| Island arrangement \| Island display priority \| **Notch size** (Auto-width, -> Notch width, Notch height, Side padding) \| **Corners** (Expanded radius, Collapsed radius, Corner shape, Edge fillets, -> Fillet size) \| Appearance presets |
| Todos | Feature toggle \| Tasks (Rollover to next day, Drag to reorder) \| **Focus timer** (Enable focus timer, -> Reminder before end, -> Play sound on reminder) \| Collapsed island \| Save location |
| Music | Feature toggle \| Player order \| Lyrics \| Player compatibility (unchanged) |
| Translation | Feature toggle \| Translation services (including keyless services) \| Shortcuts (unchanged) |
| Clipboard & Files | Feature toggle \| **What's saved** (Save images, Max items to save) \| **Display & window** (Visible rows when expanded, Detached window, -> Close when clicking outside window) \| Shortcuts \| Storage location \| File shelf |
| Messages | On-island notifications (Dwell duration, Adaptive expansion for long messages and its 3 sliders) \| QQ \| WeChat \| Mail (unchanged) |
| AI Sessions / Connect AI Tools / Plugins / About | Unchanged |

Previous state: game mode and notifications were embedded in "Opening & closing", with notification options still visible when game mode was off; appearance "Notch & shape" had 8 rows mixing dimensions and corners; todo "Tasks" mixed task settings with focus timers; clipboard mixed capture settings with display. Copy adjustments: "Game mode" row renamed to "Quiet in full screen" (group retains Game mode), "Show notifications in game mode / Game dwell" renamed to "Show notifications anyway / Notification dwell duration", "Todo list save path" renamed to "Save location", "Clipboard history" group renamed to "What's saved"; English synchronized. Verified zero horizontal overflow in 560x420 narrow English windows.

## Groupings for General / Appearance Pages 

Adjusts grouping and order only, without deleting options or altering storage formats (retaining `skerry-settings` fields). Ordered as: frequent first, infrequent last; related items grouped together; dependent options indented below parent toggles and hidden when parent is off.

Previous state:
- General: System (Startup, Language, Detached settings) | Island (Expansion mode, Auto-collapse, Idle tuck, -> Delay, Tuck style, Game mode, Reset position, Lock position) | Do not tuck during these activities (3 toggles, hidden when tuck is off). "Island" was an 8-row catch-all mixing expansion, tucking, position, and game mode.
- Appearance: Preview | Style (Color scheme, Material, -> Glass strength, Font, Font size, Page buttons, Opacity, Collapsed size, Expanded size) | Notch size (Auto-width, Width, Height) | Island arrangement | Shape (Fillets, -> Size) | Display priority (Priority, Album cover) | Color. "Style" mixed theme, typography, sizing, and buttons across 9 rows; Color sat at the very end, separated from themes.

Updated state:

| Page | Group | Rows |
|---|---|---|
| General | Startup & language | Launch at startup, Interface language, Detached settings window |
| | Opening & closing | Expansion mode, Auto-collapse when expanded (seconds), Game mode |
| | Tuck to the edge | Idle tuck, -> Delay after collapse (seconds, visible when on), Tuck style (used for manual tuck, always visible) |
| | Do not tuck during these activities | Agent running, Showing lyrics, Todo timer running (hidden when tuck is off, logic unchanged) |
| | Position | Reset position, Lock island position; footnote explains dragging when unlocked |
| Appearance | (Preview) | |
| | Theme | Color scheme, Material, -> Glass strength (when glass selected), Opacity |
| | Color | Island background, Text, Status light, Presets |
| | Typography & size | Font, Island font size, Collapsed size, Expanded size |
| | Island arrangement | Collapsed item arrangement, Page buttons (capsules / icons) |
| | Island display priority | Priority list, Show album cover |
| | Notch & shape (infrequent, placed last) | Auto-width, -> Notch width (when auto-width off), Notch height, Edge fillets, -> Fillet size (when on); footnote notes scaling with collapsed size |

- 2-5 rows per group; bilingual titles: Startup & language, Opening & closing, Tuck to the edge, Position, Theme, Typography & size, Notch & shape.
- "Notch width" indented below "Auto-width", matching other dependent options.
- Scope of "Restore default appearance" unchanged. Max rows in regression pages unchanged: General 14, Appearance 16.

## Settings Window

- Appearance -> Shape adds "Edge fillets" (default off); enabling reveals indented "Fillet size" slider 4-20px (default 10px), reusing settings row and reset button. (
- Settings opens in detached window by default (gear button, tray "Settings" share entry); disabling "General -> Detached settings window" embeds settings back into island. Stored separately (`skerry-detached-settings`), excluded from appearance presets; explicit saved preferences preserved, defaults to enabled when unconfigured. (
- Settings window features two columns: left navigation menu, right content scrolling independently. (User confirmed)
- Detached window dimensions: 800w x 660h (logical pixels), right content max width 600px centered, not widening if window is stretched; shrinks to fit small screens, minimum 560x420. (Sized down 2026-11-10: previous 1080x860 was considered too large. Dimensions by Agent inference)
- **Embedded settings page adapts height to content** : island height adjusts with active settings page; pages with fewer options (todos, music) avoid large empty gaps; min 340px, max 560px, taller pages scroll in right column. Height matches taller of right content or left menu (`useSettingsContentHeight`, passed to island via `useSettingsPageHeight`); expands when opening toggles that reveal child rows.
- Embedded layout is more compact: left column 128px, menu items 12px font, approx 27px row, long English labels wrap instead of truncating; right column title 15px, group headers 12px gray, row height approx 40px, row titles 13px, descriptions 11.5px; subtle panel background and corner radius matching other island pages. (Agent inference)
- Switching categories fades in new page title and cards with 6px upward shift (220ms, 30ms stagger, non-staggered from fourth card onward), active sidebar indicator grows from center (180ms); old page swaps immediately without exit animation. Switches instantly under reduced motion. (
- Sidebar groups: "Basic" General, Appearance; "Features" Todos, Music, Translation, Clipboard & Files, Messages; "AI Agent" AI Sessions, Connect AI Tools (renamed from "Sessions & Reminders", "Connections" on 2026-11-13); final untitled group contains "Plugins", "About", situated directly below "Connect AI Tools" (Plugins added 2026-11-13; About moved into list from sidebar bottom on 2026-11-11). A search box tops the sidebar (see "Settings search" below), no export/restore, no separate shortcuts page (shortcuts live on translation and clipboard pages). Old page names (file shelf, reminders, sounds, approvals) open their merged target pages. (
- **Minimal settings** (. Each page retains essential rows only; niche options removed and governed by code defaults (`settingsDefaults.ts`). Removed options read from legacy data are treated as defaults (`normalizeSettings`), without altering localStorage keys. Current page contents:
  - General (grouping see above): launch at startup, language, detached window; island group: expansion mode (click / hover), auto-collapse (seconds), idle tuck and delay after collapse (seconds), tuck style (edge / line / hidden, , reset position, lock position. Position lock defaults to off; when on, UI and native entry points disable window dragging, while click/hover expansion, tucking, and reset work as usual; saved persistently, unaffected by restoring defaults. (, idle duration, minimize button, tuck hover behavior, message reveal, monitors, the top margin is configurable again (below).
  - **Game mode** : row under "Idle tuck": when fullscreen games / video / presentations are foregrounded, suppresses hover expansion, focus stealing, and message popups, enabled by default; disabling stops listening to fullscreen states. "Auto-tuck in fullscreen" (`gameAutoTuck`) remains unconfigurable and default off: General page allows up to 10 rows after adding auto-collapse and tuck delay, other pages 8 rows.
  - **Two idle timers** : two numeric input rows in seconds, integer values taking effect on Enter or blur, clamped to bounds. (A) "Auto-collapse when expanded" below expansion mode: seconds after cursor leaves expanded island before returning to collapsed state, 0-600, 0 means never, default 30; paused while cursor rests on expanded island or while typing. Governs collapse only, never tucks directly. (B) "Tuck after collapse" indented below idle tuck toggle, visible when on: idle seconds after collapsing before tucking to screen top, 3-600, default 30. Replaced previous dropdown where >=30s tucked directly, causing user confusion; now both stages operate independently: leaves expanded island for 30s to collapse, idles for 30s more to tuck. `autoCollapseSeconds` retained (legacy 3/5/10/30/0 valid; missing reads as 30 if tuck on, 0 if off); (B) is new field `tuckDelaySeconds`, legacy `autoTuckSeconds` ignored. Blur collapse and hover leave collapse operate as before. (`idleCollapse.ts`, `useIslandTucking.ts`)
  - Appearance (grouping see above): preview, style (color scheme, material, glass strength, font, font size, opacity, collapsed size, expanded size), notch size, display priority (Agent tasks / lyrics / todos display order, reorderable; show album cover), colors (island background, text, status light).
  - **Font size and notch dimensions**: font size 90%-120%, step 5%, default 100%, applied to collapsed and expanded island. Dragging updates both previews, saving on release. Notch defaults to auto-width (280-340px); when disabled, configurable to 240-480px, initial 340px. Height configurable to 32-60px, default 38px. Stored in unscaled logical pixels. Restoring defaults resets these options.
  - **Expanded size** : slider below collapsed size slider in style group, 0.85x-1.2x, step 0.01, default 1.00x, with "Restore default" button (scales width, height, and text together). Dragging updates value, track, and expanded preview in real time; preview reads transient value without saving or resizing native windows. Saves on release (or arrow key release / blur), animating island with spring once: settings page may reside inside island, so resizing during drag would pull slider out from under cursor. Real island expands briefly to demonstrate size after saving, collapsing after 1.5s. All pages verified across 0.85 and 1.2 bounds via `island-tour.html?test=1&scale=...`. Retains `expandedScale`: 3.0.0 small/medium/large (0.9/1/1.1) preserved, older arbitrary floats (0.75-1.4) clamped to slider range. Native window allocates height as "page height x scale" and calculates hit testing, accommodating 1.2x width of 672px within 820px window. (Agent inference: range and steps)
  - Todos: feature toggle, retain unfinished todos, focus timer (default off), drag to reorder (default on), save path. Two new toggles reuse settings rows, explaining duration picker with alert, and vertical handle dragging. Synced across windows via storage events; disabling focus timer clears active round timer while preserving active tasks. Legacy reorder settings without version tag migrate to on.
  - Music: feature toggle, search online lyrics (and Kugou / NetEase underneath). Removed local lyrics folder, global offset, source priority; individual track calibration remains on music page.
  - Music · Player order (Restored 2026-11-10, , sharing reorderable numbered list with appearance priority (`components/reorder/ReorderList`), rows showing player name and status dot (green: playing, gray: open, dim: closed), draggable or reorderable with arrow keys. Island follows highest priority playing session, falling back to open sessions. Persists in `skerry-music-sources` (format unchanged, legacy order preserved).
  - Translation: feature toggle, services (provider, endpoint, model, API key), shortcuts. Removed open position, paste clipboard on open, auto-translate on rest.
  - Clipboard & Files: clipboard toggle, save images, max items, shortcuts; file shelf group: toggle, auto-cleanup.
  - Plugins: installed and available plugins use standard groups and setting rows; empty installed list displays Puzzle icon and "No plugins yet". Developer group located at bottom, collapsed by default.
- Per-page details:
  - Appearance: **Island preview** at top renders collapsed and expanded island according to current settings (background, opacity, material, font, radius, top offset, scale, accent light, task text color), followed by style and color groups. Preview is an illustrative rendering rather than real window; dragging island size sliders updates real island on screen. Both previews display Agent sessions matching actual layout: collapsed shows accent dot, provider icon, session title, and session count pill; expanded renders proportional to real island (660px width), max 1.2x scale occupying 92% of preview box width, all dimensions scaling proportionally with box width; renders top bar (Agent status light, page dots, circular buttons), quota rings, session list (default list layout), session rows showing waiting for confirmation (red dot, model tag, tool row), waiting for reply (yellow dot), completed (gray dot), right side showing status, time, provider icon, archive icon. Status, timestamp, and usage text reuse Agent page copy; text follows island background tone. Preview background features color gradient illustrative wallpaper to demonstrate opacity and glass (swapped briefly to dark wallpaper on 2026-11-11, reverted same day per . Todos are no longer drawn in preview, omitting todo paper colors. (
  - Messages: QQ, WeChat, and Mail merged into single page with individual toggles; mail accounts render as rows, "Add account" as text link at group bottom. Legacy qq / wechat / mail routes all navigate here.
    - WeChat snippet explains that clicking "X" to dismiss still allows snippets to appear. Enabling snippets reveals "Hide WeChat taskbar icon when minimized" toggle (default off), controlling taskbar icon behavior on "-" minimize.
  - About : name and version card; **single group** with rows: Star on GitHub, view license, ending with "Quit Skerry". Removed "Check for updates" (checks automatically on startup, update button appears in todos), "Version history" (view changelog). Red dot is a one-time notice. Removed "Reset all settings".
    - Removed standalone "Version" group: eliminated nested card boxes. Check for updates merged into first row, displaying checking / update available (download & install) / downloading (progress bar below row) / downloaded (restart to update) / error states inline. Builds without updater keys open latest GitHub Release page.
    - Hovering "Check for updates" no longer spins icon; spins only while checking, downloading, or installing.
    - "Release notes" renamed to "Version history", opens full Release list.
    - Typography matches settings rows: regular weight titles, gray descriptions, 18px line icons on left, external links open in system browser (opener plugin).
  (User confirmed: merge messages, update integrated into About)
- Feature toggles: Todos and Music reside in first row of respective settings pages; QQ, WeChat, Mail in respective groups on Messages page; QQ, WeChat, Clipboard reuse existing receive/capture toggles. Disabling hides island entrances and halts background work, preserving data: Todos hides page dot, collapsed task, and counts; Music hides dot and waveform, halting polling; QQ / WeChat / Mail hides corresponding tabs, hiding bell when all three are off; Mail pauses sync for logged-in accounts, resuming on re-enable; Clipboard releases global shortcuts. Switching to first available active page if active page is disabled; clicking or hovering does not expand when all are disabled. (User confirmed)
- Sidebar (D9, user confirmed 2026-11-07: previous groupings were indistinct with weak active indicators):
  - Width 164px (128px embedded on island), darker background than page, right border divider. Group header subtitles removed (removed 2026-11-10 for lighter sidebar), groups separated by whitespace; group names retained as aria-labels for screen readers.
  - Compact row spacing (approx 30px per row), 10px gaps between groups; thinner icon strokes (1.5).
  - Selected state: light accent background, left accent vertical bar, accent icon, bold text.
  - "About" is final item, directly below "Plugins", sharing untitled final group with whitespace separation, active state matching other items; no longer anchored to bottom or divided by borders. (
- Left navigation items use lucide icons with text. Automatically switches to "Todos" when island requests save path navigation. (Agent inference)
- Shortcut rows (Translation, Clipboard) maintain standard padding and regular titles, key bindings shown on right-side recording buttons only, removing redundant subtitle duplication. (Fixed 2026-11-10)
- "Restore default appearance" button placed to right of Appearance title row; clicking transforms button in place to "Confirm / Cancel", auto-canceling after 4 seconds of inactivity; resets appearance fields only, preserving todo settings and auto-collapse. (User confirmed)
- Appearance "Color" remains single card, three rows showing uppercase hex strings and 36px circular color swatches (faint stroke) on right. Hex values inherit UI font, 14px, 400 weight, tabular numbers; editable inline, fixed input width; supports omitting # and 3-digit shorthand, saving on Enter / blur, canceling on Esc, silently reverting invalid entries. Enter / Escape stop propagation to prevent closing island; swatches open system color pickers. Omits visible instructions or title tooltips. 
- Default colors: background `#2F2F37`, text `#FFFFFF`, accent `#3AE489`. Existing users overwritten on first load after backing up original colors; if colors already match new defaults (case-insensitive), writes migration flag only without new backup, preventing empty undo icons. New users do not generate backups. With backup present, "Color" title displays dimmed Undo2 icon, brightening on hover, clicking swaps current colors with backup; clicking again restores. Restoring defaults also writes backup; manual edits do not overwrite backup. (Confirmed 2026-11-13)
- Final row of Color card "Presets": 24px tri-color circular fan chips, active combination marked with thin ring; presets cover entire color group, including expanded text custom color or "Follow background". Trailing + saves current palette, deduplicating across four colors and auto state, up to 8 presets; legacy presets lacking expanded text preserve current value on apply. Reuses three-color backup scope. Hover / focus reveals X at top right, first click transforms to red confirmation icon with prompt "Click again to delete", clicking again deletes; auto-cancels on leave or after approx 3 seconds. Confirmation neither applies nor deletes. Aria-labels synchronize confirmation status and saved colors; chips wrap on narrow rows. 
- Style presets (including theme import/export) removed on 2026-11-09; legacy data in `skerry-setting-presets` retained but unread.
- Settings pages use grouped lists (`components/settings/`): group headers are bold small titles outside cards; cards contain rows divided by inset hairlines, group notes written in gray footnotes below cards; groups ideally 2-4 rows. Row titles use regular weight, descriptions explain outcomes, controls sit on right. Conditional options indent beneath parent toggles, hidden when toggle is off. Controls: accent toggles; unboxed "Current value ⌄" dropdowns for >2 options; segmented buttons for 2-3 options; full-width sliders for numeric values with value pill at top right and restore button when modified; accent text links for secondary actions rather than solid buttons. Time displayed in seconds. Bold applied to page and group titles only. Sidebar uses line icons without colored blocks. (User confirmed 2026-11-06)
- Terminology: "Collapse" refers strictly to returning from expanded to collapsed state; island docking to screen top with edge exposed is "Tuck to edge", revealing is "Reveal". (User confirmed)
- Live preview: adjusting appearance (collapsed items preview collapsed island, expanded items preview expanded island) or selecting tuck style (immediately tucks per selected style) previews effect on island, reverting to original state after approx 2.5 seconds of inactivity; does not auto-revert when mouse rests on island, clicked, or in game mode. (
- Top row of Appearance -> Style is "Color scheme": Dark / Light / Follow system segmented buttons, default Dark, non-wrapping on narrow windows. Settings, clipboard, translation, and on-island settings switch together. (
- Below "Color scheme" sits "Material": Midnight / Graphite / Liquid / Frosted / Aurora / Prism, default Midnight (since 2026-11-28); selecting glass displays indented "Glass strength" slider. Non-wrapping on narrow windows. (

## Plugins Page (API v1)

Full feature page displays when `plugins: true` only; falls back to development roadmap and specification entry points at top when false. (

Reuses visual system. Installed and available groups, native setting rows, toggles, inputs, dropdowns, text buttons; displays name, version, status, and permission tags without intro paragraphs. Disabled on install by default, duplicate operations blocked when busy, failures preserve context. Unavailable index displays single bilingual status row and retry, detailed errors logged. Bottom "Developer" collapsed by default, expandable to toggle developer mode, configure local Windows index path, or load directories; switches to local index if network index fails. Quotas, sessions, and notifications reuse native island components, forbidding plugins from defining custom chrome.  When there is nothing to install, Available says why: "All available plugins are installed" (naming them, with "View installed") or, for an empty index, "No plugins are published yet"; neither is the unavailable-index state.

## Real-Time Preview 

- Color swatches open in-page color picker (saturation/brightness square + hue bar, `components/settings/SettingsColor.tsx`), replacing WebView2 native pickers (which reported colors on release only). Saves at most once per frame during drag, island updating via storage events in real time. Dismisses on outside click or Esc.
- "Expanded radius" and "Background blur" sliders take effect on drag without waiting for release: they do not alter island dimensions, redrawing only. Sliders modifying dimensions (scale, etc.) still commit on release.

## General Page Re-organization 

- Group order: Startup & language -> Opening & closing -> Position -> Tuck to the edge -> Game mode. Position moved earlier due to frequency of use.
- "Do not tuck during these activities" merged as indented children under "Idle tuck" (Agent running / showing lyrics / todo timing), visible only when auto-tuck is active, explained in group footnote.
- Todos page adds "Visible rows when expanded" (3-12, default 8), matching clipboard, scrolling thereafter within maximum panel height.
- Clipboard type filters (Text / Image / File) display icon + text, Favorites adds star icon. Top bar page buttons remain icons only, avoiding adding text for clipboard alone. (User confirmed 2026-11-18)
- Initial startup for new users includes welcome todo and intro txt on file shelf, avoiding an empty appearance.

## General / Appearance Re-organization 

Supersedes General "Tuck to edge" and Appearance groupings from preceding sections. Preserves localStorage keys, field names, and defaults.

Rule established: **One setting category per group, each category in one place only.**

- **General manages island behavior and motion**:
  - Groups: Startup & language | Opening & closing | Position | Tuck to the edge (Idle tuck, -> Delay after collapse, -> Suppress when Agent running / showing lyrics / todo timing) | Game mode.
  - Tuck style moved to appearance, child toggles indented continuously. Footnote adds "Tucked appearance configured under Appearance -> Tuck to the edge".
  - Position footnote condensed.
- **Appearance manages visual presentation**:
  - Preview
  - Theme: Color scheme, Material, -> Glass strength, -> Background blur, Opacity
  - Color: Island background, Collapsed text, Status light, Expanded text, Presets
  - Typography: Font, Font size
  - **Size**: Collapsed size, Expanded size, Auto-width, -> Width, Height. Footnote clarifies dimensions refer to collapsed island.
  - **Corners**: Expanded radius, Collapsed radius, Corner shape, Edge fillets, -> Fillet size. All corner settings unified here.
  - Island arrangement (including page buttons)
  - Island display priority
  - **Tuck to the edge**: Tuck style (Edge reveal / Thin line / Hidden, moved from General), -> Reveal height
  - Appearance presets
- Renamed three color rows for clarity:
  - "Task/todo text" -> "Collapsed text"
  - "Accent light color" -> "Status light"
  - "Page text" -> "Expanded text"
- Dimension rows under "Size": "Notch width / Notch height" renamed to "Width / Height"; "Island font size" renamed to "Font size" since group is Typography.
- Tuck style and reveal height included in "Restore default appearance" and appearance presets (`APPEARANCE_SETTING_KEYS`). Applying legacy presets preserves current values when fields are absent.
- Regression page max rows: General 16 -> 15, Appearance 22 -> 23.
- **Tray icon** : tray menu follows interface language, ordering: Show / Hide Island, Settings, Check for updates, separator, Hide tray icon, Exit; hover tooltip is Skerry. General -> Startup & language adds "Show icon in notification area", default on; restored here when hidden, or recovered by launching Skerry again to open Settings. Windows determines tray placement (overflow vs taskbar); app controls visibility only.

#

- Plugin Store uses CloudSun lucide icon and desaturated cyan accent `#63b9b6`, category "Island". Once installed, displays independent toggles and city search reusing SettingsGroup/Row directly without new pages or windows. Bilingual, long city names wrap.
- Shows "Select city to display weather" when unconfigured, querying on search or Enter only without automatic geolocation. Reinstalling enables both toggles while preserving city. (Agent inference)
- Arrangement editor hides slots when uninstalled; reorderable when installed, disabled or unconfigured slots dim while retaining positions. Preview uses static time/temperature samples, avoiding extra re-renders or weather requests in settings. (Agent inference)

- **Island tabs** (General, right after Startup & language): one switch per island tab (Todos, Music, Clipboard history, File shelf, Messages, Quick translation, System monitor). Each is the same switch as on that module's own page, so both stay in step; an off tab is hidden from the island and its module stops its background work. The last tab that is on cannot be switched off, so the expanded island always has a page. The System monitor switch sets `systemMonitorEnabled` (what hides the tab) as well as the monitor's own sampling switch.

- **Distance from top** (2026-11-23, General -> Position): a number row in pixels (0-160, default 0, Rust clamps the same range) above "Back to the default position". Dragging snaps flush within 16px of the top, which made a small gap impossible to keep; this places the island exactly. 0 attaches it to the edge; above 0 it floats with the detached shape. A dragged position ignores the margin, so changing the value drops the dragged position (`useMarginReplacesDrag.ts`). "Reset" sets it back to 0. Not part of appearance presets.

- **Settings search** (2026-11-27, user requested; chosen over regrouping because the pages and groups are already one kind of setting each and links and tests depend on them): a search box tops the sidebar. Typing replaces the page list with up to 8 matches (pages, group headings and setting rows) whose names hold every word typed, in any order and case: names starting with the first word first, then names holding all words, then those matching only through their page or group. Each result shows its name and "Page › Group". Picking one (click, or Enter for the first; Down and Up move through the list) opens the page, scrolls the row or group to the middle and outlines it for about two seconds, then clears the box and restores the page list. A row that only shows under a switch that is off opens its page without scrolling. The first Esc clears the box, the next one reaches the island's own Esc. What can be found lives in `src/windows/settings/searchIndex.ts` (rows built from the user's own data, the Plugins page and the Changelog are left out; the pages themselves are always found by name); `pnpm test:regression settings` fails when a page shows a group or row the index lacks, or the index lists one the page no longer shows, so a new setting needs its line there. Logic in `searchSettings.ts`, scroll and mark in `settingsJump.ts`, UI in `SettingsSearch.tsx`.
