use anyhow::{bail, Context, Result};
use colored::*;
use serde::de::DeserializeOwned;
use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, atomic::{AtomicBool, AtomicUsize, Ordering}};
use std::thread;
use std::time::Duration;
use std::time::Instant;

#[cfg(unix)]
use std::os::unix::fs::PermissionsExt;

use crate::cli::api_base_url;
use crate::types::{AuthConfig, AuthPollResponse, AuthStartResponse, WhoamiResponse};

fn stable_hash(value: &str) -> String {
    let mut hash: u64 = 0xcbf29ce484222325;
    for byte in value.as_bytes() {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(0x100000001b3);
    }
    format!("fnv64:{hash:016x}")
}

fn auth_config_path() -> PathBuf {
    let dir = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("aistack");
    fs::create_dir_all(&dir).ok();
    dir.join("auth.json")
}

pub fn load_auth() -> Result<AuthConfig> {
    let path = auth_config_path();
    if !path.exists() {
        bail!("Not logged in. Run: aistack login");
    }
    let content = fs::read_to_string(&path)?;
    let config: AuthConfig = serde_json::from_str(&content)?;
    Ok(config)
}

fn save_auth(config: &AuthConfig) -> Result<()> {
    let path = auth_config_path();
    let content = serde_json::to_string_pretty(config)?;
    fs::write(&path, content)?;
    #[cfg(unix)]
    fs::set_permissions(&path, fs::Permissions::from_mode(0o600))?;
    Ok(())
}

async fn json_response<T: DeserializeOwned>(response: reqwest::Response) -> Result<T> {
    let status = response.status();
    if !status.is_success() {
        let message = response.text().await.unwrap_or_default();
        bail!("aistack API returned {}: {}", status, message);
    }

    response
        .json::<T>()
        .await
        .context("aistack API returned an invalid response")
}

pub async fn cmd_login() -> Result<()> {
    let client = reqwest::Client::new();
    let api_base_url = api_base_url();

    println!("{}", "  aistack login".bold().green());
    println!();

    let start_url = format!("{}/api/cli/auth/start", api_base_url);
    let response = client
        .post(&start_url)
        .header("Content-Type", "application/json")
        .send()
        .await?;
    let resp: AuthStartResponse = json_response(response).await?;

    println!("  Open this URL to authenticate:");
    println!("  {}", resp.login_url.bold().cyan());
    println!("  Verification code: {}", resp.user_code.bold());
    println!();

    let _ = open::that(&resp.login_url);

    println!("  Waiting for authentication...");
    println!();

    let poll_url = format!("{}/api/cli/auth/poll", api_base_url);
    let mut attempts = 0;
    let max_attempts = (resp.expires_in / resp.poll_interval) + 1;

    loop {
        attempts += 1;
        if attempts > max_attempts {
            bail!("Login timed out. Please try again.");
        }

        tokio::time::sleep(tokio::time::Duration::from_secs(resp.poll_interval)).await;

        let response = client
            .post(&poll_url)
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "device_code": resp.device_code
            }))
            .send()
            .await?;
        let poll_resp: AuthPollResponse = json_response(response).await?;

        match poll_resp.status.as_str() {
            "complete" => {
                if let (Some(token), Some(workspace_id), Some(email)) =
                    (poll_resp.token, poll_resp.workspace_id, poll_resp.email)
                {
                    let auth = AuthConfig {
                        token,
                        api_base_url: api_base_url.clone(),
                        workspace_id,
                        email: email.clone(),
                    };
                    save_auth(&auth)?;

                    println!("  {}", "Logged in successfully!".bold().green());
                    println!("  {}", format!("Email: {}", email).dimmed());
                    println!();
                    return Ok(());
                } else {
                    bail!("Login response missing required fields");
                }
            }
            "pending" => {}
            "expired" => {
                bail!("Login expired. Please try again.");
            }
            other => {
                bail!("Unexpected login status: {}", other);
            }
        }
    }
}

pub async fn cmd_whoami() -> Result<()> {
    let auth = load_auth()?;
    let client = reqwest::Client::new();

    let whoami_url = format!("{}/api/cli/whoami", auth.api_base_url);
    let response = client
        .get(&whoami_url)
        .header("Authorization", format!("Bearer {}", auth.token))
        .send()
        .await?;
    let resp: WhoamiResponse = json_response(response).await?;

    println!("{}", "  aistack whoami".bold().green());
    println!();
    println!("  {}", format!("Email: {}", resp.email).bold());
    println!("  {}", format!("Workspace: {}", resp.workspace_id).dimmed());
    println!();

    Ok(())
}

pub async fn upload_scan(root: &std::path::Path, report: &crate::types::ScanResult, json: bool) -> Result<()> {
    let auth = load_auth()?;
    let payload = scan_payload(root, report, "scan");
    let response = reqwest::Client::new()
        .post(format!("{}/api/cli/usage", auth.api_base_url))
        .bearer_auth(auth.token)
        .json(&payload)
        .send()
        .await?;
    let result: serde_json::Value = json_response(response).await?;
    if !json { println!("  Uploaded: {}", result); }
    Ok(())
}

fn scan_payload(root: &std::path::Path, report: &crate::types::ScanResult, scan_kind: &str) -> serde_json::Value {
    let path = root.canonicalize().unwrap_or_else(|_| root.to_path_buf());
    let root_hash = stable_hash(&path.to_string_lossy());
    let hostname_hash = std::env::var("HOSTNAME").ok().map(|value| stable_hash(&value));
    let technologies = report.detected.languages.iter()
        .chain(report.detected.frameworks.iter())
        .chain(report.detected.runtimes.iter())
        .chain(report.detected.infra.iter())
        .chain(report.detected.package_managers.iter())
        .map(|item| serde_json::json!({"project_key": root_hash, "ecosystem": "detected", "name": item.name, "evidence_kind": "manifest", "occurrence_count": 1}))
        .chain(report.package_usages.iter().map(|package| serde_json::json!({"project_key": root_hash, "ecosystem": package.ecosystem, "name": package.package, "version": package.versions.first(), "evidence_kind": "dependency_manifest", "occurrence_count": package.usage_count})))
        .collect::<Vec<_>>();
    serde_json::json!({
        "scan": {
            "scan_kind": scan_kind,
            "client_run_id": format!("{}:{}", root_hash, report.scan.scanned_at),
            "root_path_hash": root_hash,
            "hostname_hash": hostname_hash,
            "manifest_count": report.manifests.len(),
            "coverage": "observed",
            "metadata": {"cli_version": report.scan.cli_version, "scanned_at": report.scan.scanned_at, "workspace_count": report.workspaces.len(), "privacy": "metadata_only"}
        },
        "projects": [{"project_key": root_hash, "project_name": report.scan.project_name, "project_root_hash": root_hash, "workspace_type": scan_kind, "stack_summary": report.detected}],
        "technologies": technologies
    })
}

pub async fn cmd_deepscan(root: &std::path::Path, local: bool, session_logs: bool, json: bool) -> Result<()> {
    let started = Instant::now();
    eprintln!("[aistack] deep scan started: {}", root.display());
    eprintln!("[aistack] scanning project manifests and workspaces...");
    let mut manifest_count = 0usize;
    let progress_count = Arc::new(AtomicUsize::new(0));
    let progress_done = Arc::new(AtomicBool::new(false));
    let spinner_count = Arc::clone(&progress_count);
    let spinner_done = Arc::clone(&progress_done);
    let spinner_thread = thread::spawn(move || {
        let frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let mut frame = 0;
        while !spinner_done.load(Ordering::Relaxed) {
            eprint!("\r[aistack] {} scanning ({} manifests found)\x1b[K", frames[frame % frames.len()], spinner_count.load(Ordering::Relaxed));
            frame += 1;
            thread::sleep(Duration::from_millis(120));
        }
    });
    let report_result = crate::scanner::scan_directory_with_progress(root, true, |path, kind| {
        manifest_count += 1;
        progress_count.store(manifest_count, Ordering::Relaxed);
        let _ = (path, kind);
    });
    progress_done.store(true, Ordering::Relaxed);
    let _ = spinner_thread.join();
    eprintln!();
    let report = report_result?;
    eprintln!("[aistack] stack scan complete: {} manifests, {} workspaces ({:.1}s)", report.manifests.len(), report.workspaces.len(), started.elapsed().as_secs_f32());
    let path = root.canonicalize().unwrap_or_else(|_| root.to_path_buf());
    let root_hash = stable_hash(&path.to_string_lossy());
    let hostname_hash = std::env::var("HOSTNAME").ok().map(|value| stable_hash(&value));

    let technologies = report
        .detected
        .languages.iter().chain(report.detected.frameworks.iter())
        .chain(report.detected.runtimes.iter()).chain(report.detected.infra.iter())
        .chain(report.detected.package_managers.iter())
        .map(|item| serde_json::json!({
            "project_key": root_hash,
            "ecosystem": "detected",
            "name": item.name,
            "evidence_kind": "manifest",
            "occurrence_count": 1
        }))
        .chain(report.package_usages.iter().map(|package| serde_json::json!({
            "project_key": root_hash,
            "ecosystem": package.ecosystem,
            "name": package.package,
            "version": package.versions.first(),
            "evidence_kind": "dependency_manifest",
            "occurrence_count": package.usage_count
        })))
        .collect::<Vec<_>>();

    let payload = serde_json::json!({
        "scan": {
            "scan_kind": "deep_scan",
            "client_run_id": format!("{}:{}", root_hash, report.scan.scanned_at),
            "root_path_hash": root_hash,
            "hostname_hash": hostname_hash,
            "manifest_count": report.manifests.len(),
            "coverage": "observed",
            "metadata": {
                "cli_version": report.scan.cli_version,
                "scanned_at": report.scan.scanned_at,
                "workspace_count": report.workspaces.len(),
                "privacy": "metadata_only"
            }
        },
        "projects": [{
            "project_key": root_hash,
            "project_name": report.scan.project_name,
            "project_root_hash": root_hash,
            "workspace_type": "deep_scan",
            "stack_summary": report.detected
        }],
        "technologies": technologies
    });
    let mut payload = payload;
    if session_logs {
        eprintln!("[aistack] collecting supported coding-agent session logs...");
        let events = crate::agent_logs::collect_session_logs(true)?;
        let event_payloads = events.iter().map(|event| serde_json::json!({
            "source": event.source,
            "agent_name": event.agent_name,
            "external_id": event.external_id,
            "category": event.category,
            "plan_mode": event.plan_mode,
            "event_date": event.event_date,
            "started_at": event.started_at,
            "input_tokens": event.input_tokens,
            "output_tokens": event.output_tokens,
            "cached_tokens": event.cached_tokens,
            "total_tokens": event.total_tokens,
            "coverage": "partial",
            "metadata": event.metadata,
            "log_payload": event.metadata
        })).collect::<Vec<_>>();
        payload["events"] = serde_json::Value::Array(event_payloads);
        eprintln!("[aistack] session-log collection complete: {} events", events.len());
        if !json { println!("  Agent log events: {}", events.len()); }
    }

    if json {
        println!("{}", serde_json::to_string_pretty(&payload)?);
    } else {
        println!("{}", "  aistack deepscan".bold().green());
        println!("  Root: {}", path.display());
        println!("  Manifests: {}", report.manifests.len());
        println!("  Workspaces: {}", report.workspaces.len());
        println!("  Technologies: {}", technologies.len());
    }

    if !local {
        eprintln!("[aistack] uploading metadata and usage events...");
        let auth = load_auth()?;
        let response = reqwest::Client::new()
            .post(format!("{}/api/cli/usage", auth.api_base_url))
            .bearer_auth(auth.token)
            .json(&payload)
            .send()
            .await?;
        let result: serde_json::Value = json_response(response).await?;
        eprintln!("[aistack] upload complete ({:.1}s)", started.elapsed().as_secs_f32());
        if !json { println!("  Uploaded: {}", result); }
    } else if !json {
        println!("  Upload skipped because --local was supplied.");
    }
    Ok(())
}
