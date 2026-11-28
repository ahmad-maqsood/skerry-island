//! The global shortcut that hides the island and brings it back, owned by a message-only window.
//! It works while the island is hidden. Opening the app again also shows it (`tray::on_relaunch`).

use std::{sync::{Mutex, MutexGuard, PoisonError}, thread};
use tauri::{AppHandle, Emitter};
use windows::Win32::{
    Foundation::{HWND, LPARAM, LRESULT, WPARAM},
    UI::WindowsAndMessaging::{WM_APP, WM_HOTKEY},
};

use crate::{clipboard_history::parse_shortcut_binding, win32::{hotkey, message_window::{self, WindowMessages}}};

// Mirrored in src/features/hide-shortcut/api.ts.
const STATUS_EVENT: &str = "island-hide-shortcut-status";
const REFRESH_MESSAGE: u32 = WM_APP + 0x65;
const HOTKEY_ID: i32 = 0x4648;
const CLASS_NAME: &str = "SkerryIslandHideHotkey";

struct State {
    app: Option<AppHandle>,
    window: Option<isize>,
    started: bool,
    enabled: bool,
    shortcut: String,
    registered: bool,
    error: Option<String>,
}

static STATE: Mutex<State> = Mutex::new(State {
    app: None, window: None, started: false, enabled: false, shortcut: String::new(), registered: false, error: None,
});

fn state() -> MutexGuard<'static, State> {
    STATE.lock().unwrap_or_else(PoisonError::into_inner)
}

/// Why the keys could not be registered, or null while they are registered or switched off.
#[tauri::command]
pub fn get_island_hide_shortcut_error() -> Result<Option<String>, String> {
    Ok(state().error.clone())
}

/// The main webview supplies the saved setting at startup and whenever it changes.
#[tauri::command]
pub async fn set_island_hide_shortcut(app: AppHandle, enabled: bool, shortcut: String) -> Result<(), String> {
    let (window, start) = {
        let mut state = state();
        state.app = Some(app);
        state.enabled = enabled;
        state.shortcut = shortcut;
        let start = !state.started && enabled;
        state.started |= start;
        (state.window, start)
    };
    if start {
        thread::Builder::new().name("island-hide-hotkey".into()).spawn(|| {
            if let Err(error) = run_window() {
                let mut state = state();
                state.started = false;
                state.window = None;
                state.error = Some(error);
                publish(&state);
            }
        }).map_err(|error| {
            state().started = false;
            format!("Failed to start the hide shortcut thread: {error}")
        })?;
    } else if let Some(window) = window {
        message_window::post_message(HWND(window as *mut _), REFRESH_MESSAGE)
            .map_err(|error| format!("Failed to update the hide shortcut: {error}"))?;
    }
    Ok(())
}

fn publish(state: &State) {
    if let Some(app) = &state.app {
        let _ = app.emit(STATUS_EVENT, &state.error);
    }
}

fn run_window() -> Result<(), String> {
    let instance = message_window::module_instance().map_err(|error| error.to_string())?;
    message_window::register_class::<HideHotkeyWindow>(instance, CLASS_NAME).map_err(|error| error.to_string())?;
    let window = match message_window::create_message_only_window(instance, CLASS_NAME, "Skerry Hide Shortcut") {
        Ok(window) => window,
        Err(error) => {
            let _ = message_window::unregister_class(instance, CLASS_NAME);
            return Err(error.to_string());
        }
    };
    state().window = Some(window.0 as isize);
    apply(window);
    message_window::run_message_loop();
    let _ = message_window::destroy_window(window);
    let _ = message_window::unregister_class(instance, CLASS_NAME);
    Ok(())
}

fn apply(window: HWND) {
    let mut state = state();
    if state.registered {
        let _ = hotkey::unregister(window, HOTKEY_ID);
        state.registered = false;
    }
    state.error = None;
    if state.enabled {
        let result = match parse_shortcut_binding(&state.shortcut) {
            Some(binding) => hotkey::register(window, HOTKEY_ID, binding.modifiers, binding.key_code)
                .map_err(|error| error.to_string()),
            None => Err("This key combination is invalid or reserved by Windows.".to_string()),
        };
        match result {
            Ok(()) => state.registered = true,
            Err(error) => state.error = Some(error),
        }
    }
    publish(&state);
}

fn pressed() {
    let Some(app) = state().app.clone() else { return };
    // Window changes run on the UI thread, as the tray's Show / Hide item does.
    let queued = app.clone();
    if let Err(error) = app.run_on_main_thread(move || super::toggle_island(&queued)) {
        eprintln!("failed to toggle the island: {error}");
    }
}

struct HideHotkeyWindow;
impl WindowMessages for HideHotkeyWindow {
    fn handle(window: HWND, message: u32, wparam: WPARAM, _: LPARAM) -> Option<LRESULT> {
        match message {
            WM_HOTKEY if wparam.0 == HOTKEY_ID as usize => pressed(),
            REFRESH_MESSAGE => apply(window),
            _ => return None,
        }
        Some(LRESULT(0))
    }
}
