use anyhow::{bail, Result};
use colored::*;
use std::fs;
use std::path::PathBuf;

use crate::types::{AuthConfig, AuthPollResponse, AuthStartResponse, WhoamiResponse};
use crate::cli::API_BASE;

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
        bail!("Not logged in. Run: npx @aistack/cli login");
    }
    let content = fs::read_to_string(&path)?;
    let config: AuthConfig = serde_json::from_str(&content)?;
    Ok(config)
}

fn save_auth(config: &AuthConfig) -> Result<()> {
    let path = auth_config_path();
    let content = serde_json::to_string_pretty(config)?;
    fs::write(&path, content)?;
    Ok(())
}

pub async fn cmd_login() -> Result<()> {
    let client = reqwest::Client::new();

    println!("{}", "  aistack login".bold().green());
    println!();

    let start_url = format!("{}/api/cli/auth/start", API_BASE);
    let resp: AuthStartResponse = client
        .post(&start_url)
        .header("Content-Type", "application/json")
        .send()
        .await?
        .json()
        .await?;

    println!("  Open this URL to authenticate:");
    println!("  {}", resp.login_url.bold().cyan());
    println!();

    let _ = open::that(&resp.login_url);

    println!("  Waiting for authentication...");
    println!();

    let poll_url = format!("{}/api/cli/auth/poll", API_BASE);
    let mut attempts = 0;
    let max_attempts = (resp.expires_in / resp.poll_interval) + 1;

    loop {
        attempts += 1;
        if attempts > max_attempts {
            bail!("Login timed out. Please try again.");
        }

        tokio::time::sleep(tokio::time::Duration::from_secs(resp.poll_interval)).await;

        let poll_resp: AuthPollResponse = client
            .post(&poll_url)
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "device_code": resp.device_code
            }))
            .send()
            .await?
            .json()
            .await?;

        match poll_resp.status.as_str() {
            "complete" => {
                if let (Some(token), Some(workspace_id), Some(email)) =
                    (poll_resp.token, poll_resp.workspace_id, poll_resp.email)
                {
                    let auth = AuthConfig {
                        token,
                        api_base_url: API_BASE.to_string(),
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
    let resp: WhoamiResponse = client
        .get(&whoami_url)
        .header("Authorization", format!("Bearer {}", auth.token))
        .send()
        .await?
        .json()
        .await?;

    println!("{}", "  aistack whoami".bold().green());
    println!();
    println!("  {}", format!("Email: {}", resp.email).bold());
    println!("  {}", format!("Workspace: {}", resp.workspace_id).dimmed());
    println!();

    Ok(())
}
