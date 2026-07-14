mod auth;
mod agent_logs;
mod cli;
mod output;
mod scanner;
mod types;

use anyhow::Result;
use clap::Parser;

use cli::{Cli, Commands};

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Login => auth::cmd_login().await,
        Commands::Whoami => auth::cmd_whoami().await,
        Commands::Scan { packages, local, json, cwd } => {
            let root = cwd.unwrap_or_else(|| std::env::current_dir().unwrap());
            let result = scanner::scan_directory(&root, packages)?;

            if json {
                println!("{}", serde_json::to_string_pretty(&result)?);
            } else {
                output::print_pretty(&result, packages);
            }
            if local { Ok(()) } else { auth::upload_scan(&root, &result, json).await }
        }
        Commands::DeepScan { local, no_session_logs, json, cwd } => {
            let root = cwd.unwrap_or_else(|| std::path::PathBuf::from("/"));
            auth::cmd_deepscan(&root, local, !no_session_logs, json).await
        }
    }
}
