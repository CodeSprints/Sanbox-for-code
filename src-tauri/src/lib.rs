use serde::Serialize;

#[derive(Serialize)]
pub struct HostInfo {
    pub platform: String,
    pub family: String,
    pub app_version: String,
}

#[tauri::command]
fn host_info() -> HostInfo {
    let platform = std::env::consts::OS.to_string();
    let family = match platform.as_str() {
        "android" | "ios" => "mobile",
        "windows" | "macos" | "linux" => "desktop",
        _ => "unknown",
    }
    .to_string();

    HostInfo {
        platform,
        family,
        app_version: env!("CARGO_PKG_VERSION").to_string(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_clipboard_manager::init());

    #[cfg(desktop)]
    let builder = builder.plugin(tauri_plugin_window_state::Builder::default().build());

    builder
        .invoke_handler(tauri::generate_handler![host_info])
        .run(tauri::generate_context!())
        .expect("error while running Code Sandbox");
}
