#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;

#[tauri::command]
fn printfromJS(invoke_message: String) {
  println!("{}", invoke_message);
}

fn main() {
  let context = tauri::generate_context!();

  // Menu Bar
  let file_submenu = Submenu::new("File", Menu::new()
    .add_item(CustomMenuItem::new("newtextfile".to_string(), "New Text File"))
    .add_native_item(MenuItem::Separator)
    .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
  );
  let menu = Menu::new()
    .add_native_item(MenuItem::Copy)
    .add_item(CustomMenuItem::new("hide", "Hide"))
    .add_submenu(file_submenu);

  // System Tray
  let tray_menu = SystemTrayMenu::new()
    .add_item(CustomMenuItem::new("quit".to_string(), "Quit"));
  let tray = SystemTray::new().with_menu(tray_menu);

  tauri::Builder::default()
    .system_tray(tray)
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::MenuItemClick { id, .. } => {
        let item_handle = app.tray_handle().get_item(&id);
        match id.as_str() {
          "hide" => {
            let window = app.get_window("main").unwrap();
            window.hide().unwrap();
            // you can also `set_selected`, `set_enabled` and `set_native_image` (macOS only).
            item_handle.set_title("Show").unwrap();
          }
          "quit" => {
            std::process::exit(0);
          }
          _ => {}
        }
      }
      _ => {}
    })
    .menu(menu)
    .on_menu_event(|event| {
      match event.menu_item_id() {
        "newtextfile" => {
          //webview.evaluate_script("window.AddTab()");;
        }
        "quit" => {
          std::process::exit(0);
        }
        "close" => {
          event.window().close().unwrap();
        }
        _ => {}
      }
    })
    .run(context)
    .expect("error while running editor");
}
