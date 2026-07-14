use clap::Parser;
use std::path::PathBuf;

pub const CLI_VERSION: &str = "0.3.1";
pub const DEFAULT_API_BASE: &str = "https://aistack.directory";

pub fn api_base_url() -> String {
    std::env::var("AISTACK_API_URL")
        .unwrap_or_else(|_| DEFAULT_API_BASE.to_string())
        .trim_end_matches('/')
        .to_string()
}

#[derive(Parser)]
#[command(name = "aistack", version = CLI_VERSION, about = "Scan a project directory and detect the tech stack")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Parser)]
pub enum Commands {
    /// Authenticate with aistack
    Login,
    /// Show current authenticated user
    Whoami,
    /// Scan directory and detect the tech stack
    Scan {
        /// Include package occurrence details in the scan (legacy --usage alias)
        #[arg(long = "packages", alias = "usage")]
        packages: bool,

        /// Keep the report local; upload is the default
        #[arg(long)]
        local: bool,

        /// Output as JSON
        #[arg(long)]
        json: bool,

        /// Directory to scan
        #[arg(long, short)]
        cwd: Option<PathBuf>,
    },
    /// Deeply scan a directory and optionally upload its metadata report
    #[command(name = "deepscan")]
    DeepScan {
        /// Keep the report local; upload is the default
        #[arg(long)]
        local: bool,

        /// Skip supported coding-agent session logs
        #[arg(long)]
        no_session_logs: bool,

        /// Print JSON instead of the human-readable report
        #[arg(long)]
        json: bool,

        /// Directory to scan; use --cwd / explicitly for a whole-machine scan
        #[arg(long, short)]
        cwd: Option<PathBuf>,
    },
}
