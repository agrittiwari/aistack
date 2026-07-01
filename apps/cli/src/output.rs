use colored::*;

use crate::types::{DetectedItem, ScanResult};

pub fn print_pretty(result: &ScanResult, usage: bool) {
    println!();
    println!("  {}", "aistack scan".bold().green());
    println!("  {} {}", "Project:".dimmed(), result.scan.project_name.bold());
    println!("  {} {}", "Root:".dimmed(), result.scan.root_path_name);
    println!("  {} {}", "Manifests:".dimmed(), result.manifests.len().to_string().bold());
    println!();

    print_detected_category("Languages", &result.detected.languages);
    print_detected_category("Frameworks", &result.detected.frameworks);
    print_detected_category("Runtimes", &result.detected.runtimes);
    print_detected_category("Infrastructure", &result.detected.infra);
    print_detected_category("Package Managers", &result.detected.package_managers);

    if !result.package_usages.is_empty() {
        let total_occurrences: usize = result.package_usages.iter().map(|p| p.usage_count).sum();

        println!("  {}", "Package Usage".bold().underline().cyan());
        println!(
            "    {} unique packages, {} total occurrences",
            result.package_usages.len().to_string().bold(),
            total_occurrences.to_string().bold()
        );
        println!();

        let mut sorted = result.package_usages.clone();
        sorted.sort_by(|a, b| b.usage_count.cmp(&a.usage_count));

        println!("    {:<30} {:<10} {:<10} {:<8}", "Package".bold(), "Count".bold(), "Workspaces".bold(), "Types".bold());
        println!("    {}", "─".repeat(60).dimmed());

        for pkg in sorted.iter().take(15) {
            println!(
                "    {:<30} {:<10} {:<10} {}",
                pkg.package,
                pkg.usage_count.to_string().bold(),
                pkg.workspace_count.to_string(),
                pkg.dependency_types.join(", ").dimmed()
            );
        }

        if result.package_usages.len() > 15 {
            println!("    {}", format!("... and {} more", result.package_usages.len() - 15).dimmed());
        }
        println!();
    }

    if usage && !result.package_occurrences.is_empty() {
        println!("  {}", "Package Occurrences".bold().underline().cyan());
        println!("    {:<30} {:<12} {:<10} {:<20}", "Package".bold(), "Version".bold(), "Type".bold(), "Manifest".bold());
        println!("    {}", "─".repeat(74).dimmed());

        for occ in &result.package_occurrences {
            println!(
                "    {:<30} {:<12} {:<10} {}",
                occ.package, occ.version, occ.dependency_type.dimmed(), occ.manifest.dimmed()
            );
        }
        println!();
    }

    if result.detected.languages.is_empty() && result.detected.frameworks.is_empty() && result.manifests.is_empty() {
        println!("  {}", "No manifests or tech stack detected.".yellow());
        println!();
    }
}

fn print_detected_category(name: &str, items: &[DetectedItem]) {
    if items.is_empty() {
        return;
    }
    println!("  {}", name.bold().underline().cyan());
    for item in items {
        println!("    {} {} {}", "•".yellow(), item.name.bold(), format!("({})", item.source).dimmed());
    }
    println!();
}
