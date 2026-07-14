use anyhow::Result;
use ignore::WalkBuilder;
use serde_json::Value;
use std::collections::BTreeSet;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Debug, Clone)]
pub struct AgentLogEvent {
    pub source: String,
    pub agent_name: String,
    pub external_id: String,
    pub event_date: String,
    pub started_at: Option<String>,
    pub category: String,
    pub plan_mode: bool,
    pub input_tokens: Option<i64>,
    pub output_tokens: Option<i64>,
    pub cached_tokens: Option<i64>,
    pub total_tokens: Option<i64>,
    pub metadata: Value,
}

const MAX_FILES: usize = 2_000;
const MAX_BYTES_PER_FILE: u64 = 5 * 1024 * 1024;

pub fn collect_session_logs(include_all: bool) -> Result<Vec<AgentLogEvent>> {
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    let candidates = [
        ("codex_cli", "Codex", home.join(".codex")),
        ("open_code", "OpenCode", home.join(".local/share/opencode/opencode.db")),
        ("claude", "Claude Code", home.join(".claude/projects")),
        ("antigravity", "Antigravity", home.join("Library/Application Support/Antigravity IDE/logs")),
        ("copilot", "Copilot", home.join(".copilot")),
    ];
    let mut events = Vec::new();
    for (source, agent_name, path) in candidates {
        if path.exists() {
            eprintln!("[aistack]   reading {} logs from {}", agent_name, path.display());
            let before = events.len();
            if source == "open_code" && path.is_file() {
                collect_opencode_database(&path, source, agent_name, &mut events)?;
            } else {
                collect_agent_path(&path, source, agent_name, include_all, &mut events)?;
            }
            eprintln!("[aistack]   {}: {} events", agent_name, events.len().saturating_sub(before));
        }
    }
    Ok(events)
}

fn collect_opencode_database(path: &Path, source: &str, agent_name: &str, output: &mut Vec<AgentLogEvent>) -> Result<()> {
    let query = "select id, time_created, time_updated, agent, model, tokens_input, tokens_output, tokens_cache_read, tokens_cache_write, cost from session order by time_created";
    let result = Command::new("sqlite3").arg("-json").arg(path).arg(query).output();
    let Ok(result) = result else { return Ok(()); };
    if !result.status.success() { return Ok(()); }
    let rows: Vec<Value> = serde_json::from_slice(&result.stdout).unwrap_or_default();
    for row in rows {
        let Some(object) = row.as_object() else { continue; };
        let id = object.get("id").and_then(Value::as_str).unwrap_or("session");
        let started_ms = object.get("time_created").and_then(Value::as_i64).unwrap_or(0);
        let started_at = epoch_millis_to_iso(started_ms);
        let event_date = started_at.chars().take(10).collect::<String>();
        let input = object.get("tokens_input").and_then(Value::as_i64);
        let output_tokens = object.get("tokens_output").and_then(Value::as_i64);
        let cached = object.get("tokens_cache_read").and_then(Value::as_i64).unwrap_or(0) + object.get("tokens_cache_write").and_then(Value::as_i64).unwrap_or(0);
        output.push(AgentLogEvent { source: source.to_string(), agent_name: agent_name.to_string(), external_id: id.to_string(), event_date, started_at: Some(started_at), category: "generation".to_string(), plan_mode: false, input_tokens: input, output_tokens, cached_tokens: Some(cached), total_tokens: Some(input.unwrap_or(0) + output_tokens.unwrap_or(0) + cached), metadata: serde_json::json!({"source_file": "opencode.db", "model": object.get("model"), "agent": object.get("agent"), "cost": object.get("cost"), "privacy": "metadata_only"}) });
    }
    Ok(())
}

fn collect_agent_path(path: &Path, source: &str, agent_name: &str, include_all: bool, output: &mut Vec<AgentLogEvent>) -> Result<()> {
    let mut seen = 0;
    let walker = WalkBuilder::new(path).hidden(false).git_ignore(false).build();
    for entry in walker {
        if seen >= MAX_FILES { break; }
        let entry = match entry { Ok(entry) => entry, Err(_) => continue };
        let file = entry.path();
        if !file.is_file() || !is_log_file(file) { continue; }
        if !include_all && !is_session_like(file) { continue; }
        let metadata = match fs::metadata(file) { Ok(metadata) => metadata, Err(_) => continue };
        if metadata.len() > MAX_BYTES_PER_FILE { continue; }
        seen += 1;
        let content = match fs::read_to_string(file) { Ok(content) => content, Err(_) => continue };
        let mut parsed_any = false;
        for (line_index, line) in content.lines().enumerate() {
            if let Ok(value) = serde_json::from_str::<Value>(line) {
                if let Some(event) = parse_value(&value, file, line_index, source, agent_name) {
                    output.push(event);
                    parsed_any = true;
                }
            }
        }
        if !parsed_any && source == "antigravity" && !content.trim().is_empty() {
            let event_date = file_date(file);
            output.push(AgentLogEvent { source: source.to_string(), agent_name: agent_name.to_string(), external_id: format!("{}:log", stable_file_id(file)), event_date: event_date.clone(), started_at: (event_date != "unknown").then(|| format!("{}T00:00:00Z", event_date)), category: "session".to_string(), plan_mode: content.to_lowercase().contains("plan") || content.to_lowercase().contains("architect"), input_tokens: None, output_tokens: None, cached_tokens: None, total_tokens: None, metadata: serde_json::json!({"source_file": stable_file_id(file), "file_type": "text_log", "privacy": "metadata_only"}) });
        }
        if output.len() >= MAX_FILES { break; }
    }
    Ok(())
}

fn is_log_file(path: &Path) -> bool {
    matches!(path.extension().and_then(|value| value.to_str()), Some("json" | "jsonl" | "ndjson" | "log"))
}

fn is_session_like(path: &Path) -> bool {
    let name = path.to_string_lossy().to_lowercase();
    name.contains("session") || name.contains("conversation") || name.contains("event") || name.contains("usage") || name.ends_with(".jsonl") || name.ends_with(".ndjson")
}

fn epoch_millis_to_iso(millis: i64) -> String {
    if millis <= 0 { return "1970-01-01T00:00:00Z".to_string(); }
    let seconds = (millis / 1000) as u64;
    format!("{}T00:00:00Z", date_from_seconds(seconds))
}

fn parse_value(value: &Value, file: &Path, line_index: usize, source: &str, agent_name: &str) -> Option<AgentLogEvent> {
    let object = value.as_object()?;
    let explicit_started_at = find_string(value, &["started_at", "created_at", "timestamp", "created", "date"]);
    let event_date = explicit_started_at.as_deref().map(|value| value.chars().take(10).collect()).unwrap_or_else(|| file_date(file));
    let started_at = explicit_started_at.or_else(|| (event_date != "unknown").then(|| format!("{}T00:00:00Z", event_date)));
    let input_tokens = find_number(value, &["input_tokens", "prompt_tokens", "promptTokens"]);
    let output_tokens = find_number(value, &["output_tokens", "completion_tokens", "completionTokens"]);
    let cached_tokens = find_number(value, &["cached_tokens", "cache_read_input_tokens", "cachedTokens"]);
    let total_tokens = find_number(value, &["total_tokens", "totalTokens"]).or_else(|| match (input_tokens, output_tokens, cached_tokens) { (Some(i), Some(o), Some(c)) => Some(i + o + c), (Some(i), Some(o), _) => Some(i + o), _ => None });
    let plan_mode = contains_text(value, "plan") || contains_text(value, "architecture") || find_bool(value, &["plan_mode", "planMode"]);
    let category = if plan_mode { "planning" } else if contains_text(value, "tool") { "tooling" } else if total_tokens.is_some() { "generation" } else { "session" };
    let external_id = format!("{}:{}:{}", stable_file_id(file), find_string(value, &["session_id", "sessionId", "run_id", "runId", "id"]).unwrap_or_else(|| "event".to_string()), line_index);
    let keys = object.keys().cloned().collect::<BTreeSet<_>>();
    Some(AgentLogEvent {
        source: source.to_string(), agent_name: agent_name.to_string(), external_id,
        event_date, started_at, category: category.to_string(), plan_mode,
        input_tokens, output_tokens, cached_tokens, total_tokens,
        metadata: serde_json::json!({"source_file": stable_file_id(file), "line": line_index + 1, "payload_keys": keys, "privacy": "redacted_metadata"}),
    })
}

fn find_string(value: &Value, keys: &[&str]) -> Option<String> {
    if let Some(object) = value.as_object() {
        for key in keys { if let Some(value) = object.get(*key).and_then(Value::as_str) { return Some(value.to_string()); } }
        for child in object.values() { if let Some(found) = find_string(child, keys) { return Some(found); } }
    }
    if let Some(array) = value.as_array() { for child in array { if let Some(found) = find_string(child, keys) { return Some(found); } } }
    None
}

fn find_number(value: &Value, keys: &[&str]) -> Option<i64> {
    if let Some(object) = value.as_object() {
        for key in keys { if let Some(value) = object.get(*key).and_then(Value::as_i64) { return Some(value); } }
        for child in object.values() { if let Some(found) = find_number(child, keys) { return Some(found); } }
    }
    None
}

fn find_bool(value: &Value, keys: &[&str]) -> bool {
    value.as_object().map(|object| keys.iter().any(|key| object.get(*key).and_then(Value::as_bool).unwrap_or(false))).unwrap_or(false)
}

fn contains_text(value: &Value, needle: &str) -> bool {
    match value { Value::String(value) => value.to_lowercase().contains(needle), Value::Object(object) => object.values().any(|child| contains_text(child, needle)), Value::Array(array) => array.iter().any(|child| contains_text(child, needle)), _ => false }
}

fn file_date(path: &Path) -> String {
    let seconds = fs::metadata(path).ok().and_then(|metadata| metadata.modified().ok()).and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok()).map(|duration| duration.as_secs());
    let Some(seconds) = seconds else { return "unknown".to_string(); };
    date_from_seconds(seconds)
}

fn date_from_seconds(seconds: u64) -> String {
    let mut year = 1970u32;
    let mut days = seconds / 86400;
    loop {
        let year_days = if is_leap(year) { 366 } else { 365 };
        if days < year_days { break; }
        days -= year_days;
        year += 1;
    }
    let month_days = [31u64, if is_leap(year) { 29 } else { 28 }, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let mut month = 1;
    for month_length in month_days {
        if days < month_length { break; }
        days -= month_length;
        month += 1;
    }
    format!("{year:04}-{month:02}-{:02}", days + 1)
}

fn is_leap(year: u32) -> bool { (year % 4 == 0 && year % 100 != 0) || year % 400 == 0 }

fn stable_file_id(path: &Path) -> String {
    let mut hash: u64 = 0xcbf29ce484222325;
    for byte in path.to_string_lossy().as_bytes() { hash ^= u64::from(*byte); hash = hash.wrapping_mul(0x100000001b3); }
    format!("fnv64:{hash:016x}")
}
