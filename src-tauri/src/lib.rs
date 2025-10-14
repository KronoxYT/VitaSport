#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      ping,
      save_token,
      get_token,
      clear_token,
      api_request,
      api_file_request,
      open_external,
      select_image
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn ping() -> &'static str { "pong" }

#[tauri::command]
fn save_token(token: String) -> Result<bool, String> {
  let mut dir = tauri::api::path::app_config_dir().ok_or("no app config dir")?;
  dir.push("vitasport");
  std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
  dir.push("session.json");
  let data = serde_json::json!({ "token": token });
  std::fs::write(&dir, serde_json::to_string(&data).map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
  Ok(true)
}

#[tauri::command]
fn get_token() -> Result<Option<String>, String> {
  let mut file = tauri::api::path::app_config_dir().ok_or("no app config dir")?;
  file.push("vitasport");
  file.push("session.json");
  if !file.exists() { return Ok(None); }
  let content = std::fs::read_to_string(&file).map_err(|e| e.to_string())?;
  let v: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;
  Ok(v.get("token").and_then(|t| t.as_str().map(|s| s.to_string())))
}

#[tauri::command]
fn clear_token() -> Result<bool, String> {
  let mut file = tauri::api::path::app_config_dir().ok_or("no app config dir")?;
  file.push("vitasport");
  file.push("session.json");
  if file.exists() { std::fs::remove_file(&file).map_err(|e| e.to_string())?; }
  Ok(true)
}

const API_BASE: &str = "http://localhost:3001/api";

#[tauri::command]
fn api_request(method: String, endpoint: String, body: Option<String>) -> Result<String, String> {
  let client = reqwest::blocking::Client::new();
  let url = format!("{}{}", API_BASE, endpoint);
  let resp = match method.to_uppercase().as_str() {
    "GET" => client.get(&url).send().map_err(|e| e.to_string())?,
    "POST" => {
      if let Some(b) = body { client.post(&url).body(b).header("Content-Type", "application/json").send().map_err(|e| e.to_string())? } else { client.post(&url).send().map_err(|e| e.to_string())? }
    }
    "PUT" => {
      if let Some(b) = body { client.put(&url).body(b).header("Content-Type", "application/json").send().map_err(|e| e.to_string())? } else { client.put(&url).send().map_err(|e| e.to_string())? }
    }
    "DELETE" => client.delete(&url).send().map_err(|e| e.to_string())?,
    _ => return Err("Unsupported method".into())
  };
  if !resp.status().is_success() {
    let s = resp.text().unwrap_or_else(|_| format!("HTTP {}", resp.status()));
    return Err(s);
  }
  resp.text().map_err(|e| e.to_string())
}

#[tauri::command]
fn api_file_request(endpoint: String, suggested_name: Option<String>) -> Result<String, String> {
  let client = reqwest::blocking::Client::new();
  let url = format!("{}{}", API_BASE, endpoint);
  let mut resp = client.get(&url).send().map_err(|e| e.to_string())?;
  if !resp.status().is_success() { return Err(format!("HTTP {}", resp.status())); }
  let bytes = resp.bytes().map_err(|e| e.to_string())?;
  let downloads = tauri::api::path::download_dir().ok_or("no downloads dir")?;
  let file_name = suggested_name.unwrap_or_else(|| "reporte.pdf".into());
  let path = downloads.join(&file_name);
  std::fs::write(&path, &bytes).map_err(|e| e.to_string())?;
  // Open file
  tauri::api::shell::open(&path).map_err(|e| e.to_string())?;
  path.to_string_lossy().to_string().into()
}

#[tauri::command]
fn open_external(url: String) -> Result<bool, String> {
  tauri::api::shell::open(&url).map_err(|e| e.to_string())?;
  Ok(true)
}

#[tauri::command]
fn select_image() -> Result<Option<String>, String> {
  use tauri::api::dialog::blocking::FileDialogBuilder;
  let selected = FileDialogBuilder::new().add_filter("Images", &["jpg","png","gif"]).pick_file();
  Ok(selected.map(|p| p.to_string_lossy().to_string()))
}
