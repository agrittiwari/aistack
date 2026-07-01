use clap::Parser;
use std::path::PathBuf;

pub const CLI_VERSION: &str = "0.2.0";
pub const API_BASE: &str = "https://aistack.directory";

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
        /// Include usage data (package occurrences)
        #[arg(long)]
        usage: bool,

        /// Output as JSON
        #[arg(long)]
        json: bool,

        /// Directory to scan
        #[arg(long, short)]
        cwd: Option<PathBuf>,
    },
}
