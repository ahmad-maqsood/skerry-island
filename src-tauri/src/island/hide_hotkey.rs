//! The global shortcut that hides the island and brings it back, owned by a message-only window.
//! It works while the island is hidden. Opening the app again also shows it (`tray::on_relaunch`).

use std::{sync::{Mutex, MutexGuard, PoisonError}, thread};
use tauri::{AppHandle, Emitter};
use tokio::sync::oneshot;
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

/// `MOD_*` bits and the virtual key code of a registered combination.
type Keys = (u32, u32);

/// A change waiting for the hotkey thread, and where to report how it went.
struct Request {
    enabled: bool,
    shortcut: String,
    reply: oneshot::Sender<Result<(), String>>,
}

struct State {
    app: Option<AppHandle>,
    window: Option<isize>,
    started: bool,
    pending: Vec<Request>,
    registered: Option<Keys>,
    error: Option<String>,
}

static STATE: Mutex<State> = Mutex::new(State {
    app: None, window: None, started: false, pending: Vec::new(), registered: None, error: None,
});

fn state() -> MutexGuard<'static, State> {
    STATE.lock().unwrap_or_else(PoisonError::into_inner)
}

/// Why the keys could not be registered, or null while they are registered or switched off.
#[tauri::command]
pub fn get_island_hide_shortcut_error() -> Result<Option<String>, String> {
    Ok(state().error.clone())
}

/// The main webview supplies the saved setting at startup and whenever it changes; Settings
/// also calls this to try new keys, and saves them only if it succeeds. Keys that cannot be
/// registered leave the previous ones working.
#[tauri::command]
pub async fn set_island_hide_shortcut(app: AppHandle, enabled: bool, shortcut: String) -> Result<(), String> {
    let (reply, result) = oneshot::channel();
    let (window, start) = {
        let mut state = state();
        state.app = Some(app);
        // Switched off before the thread ever ran: nothing is registered.
        if !state.started && !enabled {
            return Ok(());
        }
        state.pending.push(Request { enabled, shortcut, reply });
        let start = !state.started;
        state.started = true;
        (state.window, start)
    };
    if start {
        thread::Builder::new().name("island-hide-hotkey".into()).spawn(|| {
            if let Err(error) = run_window() {
                fail(&error);
            }
        }).map_err(|error| {
            let message = format!("Failed to start the hide shortcut thread: {error}");
            fail(&message);
            message
        })?;
    } else if let Some(window) = window {
        message_window::post_message(HWND(window as *mut _), REFRESH_MESSAGE)
            .map_err(|error| format!("Failed to update the hide shortcut: {error}"))?;
    }
    // Without a window yet, the starting thread takes the request once it has one.
    result.await.map_err(|_| "The hide shortcut thread stopped.".to_string())?
}

/// The thread could not run: everyone waiting is told, and the next call starts it again.
fn fail(error: &str) {
    let mut state = state();
    state.started = false;
    state.window = None;
    state.registered = None;
    state.error = Some(error.to_string());
    for request in state.pending.drain(..) {
        let _ = request.reply.send(Err(error.to_string()));
    }
    publish(&state);
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

/// Registers `wanted` (None when switched off) once the previous keys are released. If it
/// is refused, `previous` is registered again. Returns the keys now registered and the outcome.
fn swap_keys(
    previous: Option<Keys>,
    wanted: Result<Option<Keys>, String>,
    mut register: impl FnMut(Keys) -> Result<(), String>,
) -> (Option<Keys>, Result<(), String>) {
    let outcome = wanted.and_then(|keys| match keys {
        Some(keys) => register(keys).map(|()| Some(keys)),
        None => Ok(None),
    });
    match outcome {
        Ok(keys) => (keys, Ok(())),
        Err(error) => (previous.filter(|keys| register(*keys).is_ok()), Err(error)),
    }
}

/// Works through the waiting changes on the thread that owns the hotkey.
fn apply(window: HWND) {
    let mut state = state();
    for request in std::mem::take(&mut state.pending) {
        let previous = state.registered.take();
        if previous.is_some() {
            let _ = hotkey::unregister(window, HOTKEY_ID);
        }
        let wanted = if request.enabled {
            parse_shortcut_binding(&request.shortcut)
                .map(|binding| Some((binding.modifiers, binding.key_code)))
                .ok_or_else(|| "This key combination is invalid or reserved by Windows.".to_string())
        } else {
            Ok(None)
        };
        let (registered, outcome) = swap_keys(previous, wanted, |(modifiers, key_code)| {
            hotkey::register(window, HOTKEY_ID, modifiers, key_code).map_err(|error| error.to_string())
        });
        state.registered = registered;
        // The lasting status is about having no working keys; a refused change that left the
        // old ones working is only reported to whoever asked for it.
        state.error = if registered.is_none() { outcome.clone().err() } else { None };
        let _ = request.reply.send(outcome);
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

#[cfg(test)]
mod tests {
    use super::swap_keys;

    const OLD: (u32, u32) = (6, 0x48);
    const NEW: (u32, u32) = (3, 0x4B);

    #[test]
    fn accepted_keys_replace_the_old_ones() {
        assert_eq!(swap_keys(Some(OLD), Ok(Some(NEW)), |_| Ok(())), (Some(NEW), Ok(())));
    }

    #[test]
    fn refused_keys_leave_the_old_ones_registered() {
        let mut tried = Vec::new();
        let result = swap_keys(Some(OLD), Ok(Some(NEW)), |keys| {
            tried.push(keys);
            if keys == NEW { Err("taken".to_string()) } else { Ok(()) }
        });
        assert_eq!(result, (Some(OLD), Err("taken".to_string())));
        assert_eq!(tried, [NEW, OLD]);
    }

    #[test]
    fn invalid_keys_leave_the_old_ones_registered() {
        let result = swap_keys(Some(OLD), Err("invalid".to_string()), |_| Ok(()));
        assert_eq!(result, (Some(OLD), Err("invalid".to_string())));
    }

    #[test]
    fn nothing_is_registered_when_off_or_when_nothing_can_be() {
        assert_eq!(swap_keys(Some(OLD), Ok(None), |_| Ok(())), (None, Ok(())));
        let refused = || |_| Err("taken".to_string());
        assert_eq!(swap_keys(None, Ok(Some(NEW)), refused()), (None, Err("taken".to_string())));
        assert_eq!(swap_keys(Some(OLD), Ok(Some(NEW)), refused()), (None, Err("taken".to_string())));
    }
}
