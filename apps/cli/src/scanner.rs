use anyhow::Result;
use ignore::WalkBuilder;
use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::Path;

use crate::types::*;
use crate::cli::CLI_VERSION;

const MANIFEST_NAMES: &[&str] = &[
    "package.json",
    "Cargo.toml",
    "wrangler.json",
    "wrangler.jsonc",
    "turbo.json",
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    "bun.lockb",
];

const IGNORE_DIRS: &[&str] = &[
    "node_modules", ".git", "dist", "build", "target", ".next", ".turbo", ".env",
];

const LANG_RULES: &[(&str, &str)] = &[
    ("typescript", "TypeScript"),
    ("rust", "Rust"),
];

const FRAMEWORK_RULES: &[(&str, &str)] = &[
    ("next", "Next.js"),
    ("react", "React"),
    ("react-native", "React Native"),
    ("expo", "Expo"),
    ("@sveltejs/kit", "SvelteKit"),
    ("hono", "Hono"),
    ("vue", "Vue"),
    ("nuxt", "Nuxt"),
    ("angular", "Angular"),
    ("svelte", "Svelte"),
];

const RUNTIME_RULES: &[(&str, &str)] = &[
    ("node", "Node.js"),
    ("deno", "Deno"),
    ("bun", "Bun"),
];

const INFRA_RULES: &[(&str, &str)] = &[
    ("drizzle-orm", "Drizzle"),
    ("better-auth", "Better Auth"),
    ("wrangler", "Cloudflare Workers"),
    ("@prisma/client", "Prisma"),
    ("mongoose", "MongoDB"),
    ("pg", "PostgreSQL"),
];

pub fn scan_directory(root: &Path, include_usage: bool) -> Result<ScanResult> {
    scan_directory_with_progress(root, include_usage, |_, _| {})
}

pub fn scan_directory_with_progress<F>(root: &Path, include_usage: bool, mut on_manifest: F) -> Result<ScanResult>
where
    F: FnMut(&str, &str),
{
    let mut found_manifests: Vec<(String, String)> = Vec::new();
    let mut all_deps: BTreeMap<String, Vec<DepInfo>> = BTreeMap::new();
    let mut workspaces: Vec<Workspace> = Vec::new();
    let mut project_name: Option<String> = None;

    let mut has_d1 = false;
    let mut has_r2 = false;
    let mut has_kv = false;
    let mut has_durable_objects = false;

    let walker = WalkBuilder::new(root)
        .hidden(false)
        .git_ignore(true)
        .build();

    for entry in walker {
        let entry = match entry {
            Ok(entry) => entry,
            Err(_) => continue,
        };
        let path = entry.path();

        if let Some(dir_name) = path.file_name().and_then(|n| n.to_str()) {
            if IGNORE_DIRS.contains(&dir_name) {
                continue;
            }
        }

        let file_name = match path.file_name().and_then(|n| n.to_str()) {
            Some(name) => name.to_string(),
            None => continue,
        };

        if !MANIFEST_NAMES.contains(&file_name.as_str()) {
            continue;
        }

        let relative = path
            .strip_prefix(root)
            .unwrap_or(path)
            .to_string_lossy()
            .to_string();

        let kind = detect_manifest_kind(&file_name);
        found_manifests.push((relative.clone(), kind.clone()));
        on_manifest(&relative, &kind);

        match file_name.as_str() {
            "package.json" => {
                if let Ok(content) = fs::read_to_string(path) {
                    if let Ok(pkg) = serde_json::from_str::<PackageJson>(&content) {
                        if project_name.is_none() {
                            project_name = pkg.name.clone();
                        }
                        if let Some(ws) = &pkg.workspaces {
                            detect_workspaces(ws, root, path, &mut workspaces);
                        }
                        collect_deps(&mut all_deps, &pkg.dependencies, &relative, "dependencies");
                        collect_deps(&mut all_deps, &pkg.dev_dependencies, &relative, "devDependencies");
                        collect_deps(&mut all_deps, &pkg.peer_dependencies, &relative, "peerDependencies");
                    }
                }
            }
            "Cargo.toml" => {
                if let Ok(content) = fs::read_to_string(path) {
                    if let Ok(cargo) = toml::from_str::<CargoToml>(&content) {
                        if project_name.is_none() {
                            if let Some(ref pkg) = cargo.package {
                                project_name = pkg.name.clone();
                            }
                        }
                        workspaces.push(Workspace {
                            path: relative.clone(),
                            name: cargo.package.as_ref().and_then(|p| p.name.clone()),
                            kind: "rust".to_string(),
                        });
                        collect_cargo_deps(&mut all_deps, &cargo.dependencies, &relative, "dependencies");
                        collect_cargo_deps(&mut all_deps, &cargo.dev_dependencies, &relative, "devDependencies");
                        collect_cargo_deps(&mut all_deps, &cargo.build_dependencies, &relative, "buildDependencies");
                    }
                }
            }
            "wrangler.json" | "wrangler.jsonc" => {
                let content = fs::read_to_string(path).unwrap_or_default();
                let parsed: Option<WranglerConfig> = if file_name == "wrangler.jsonc" {
                    let stripped: String = content
                        .lines()
                        .filter(|line| !line.trim_start().starts_with("//"))
                        .collect::<Vec<_>>()
                        .join("\n");
                    serde_json::from_str(&stripped).ok()
                } else {
                    serde_json::from_str(&content).ok()
                };

                if let Some(config) = parsed {
                    if project_name.is_none() {
                        project_name = config.name.clone();
                    }
                    if config.d1_databases.is_some() { has_d1 = true; }
                    if config.r2_buckets.is_some() { has_r2 = true; }
                    if config.kv_namespaces.is_some() { has_kv = true; }
                    if config.durable_objects.is_some() { has_durable_objects = true; }
                    workspaces.push(Workspace {
                        path: relative.clone(),
                        name: config.name,
                        kind: "cloudflare_worker".to_string(),
                    });
                }
            }
            "turbo.json" => {
                workspaces.push(Workspace {
                    path: relative.clone(),
                    name: None,
                    kind: "turbo".to_string(),
                });
            }
            _ => {}
        }
    }

    let mut detected = DetectedCategories {
        languages: Vec::new(),
        frameworks: Vec::new(),
        runtimes: Vec::new(),
        infra: Vec::new(),
        package_managers: Vec::new(),
    };

    let mut has_cargo_toml = false;

    for (rel, kind) in &found_manifests {
        match kind.as_str() {
            "Cargo.toml" => has_cargo_toml = true,
            "wrangler.json" | "wrangler.jsonc" => {
                detected.infra.push(DetectedItem { name: "Cloudflare Workers".to_string(), source: rel.clone() });
            }
            "turbo.json" => {
                detected.infra.push(DetectedItem { name: "Turborepo".to_string(), source: rel.clone() });
            }
            "pnpm-lock.yaml" => {
                detected.package_managers.push(DetectedItem { name: "pnpm".to_string(), source: rel.clone() });
            }
            "package-lock.json" => {
                detected.package_managers.push(DetectedItem { name: "npm".to_string(), source: rel.clone() });
            }
            "yarn.lock" => {
                detected.package_managers.push(DetectedItem { name: "yarn".to_string(), source: rel.clone() });
            }
            "bun.lockb" => {
                detected.package_managers.push(DetectedItem { name: "bun".to_string(), source: rel.clone() });
            }
            _ => {}
        }
    }

    detect_from_deps(&all_deps, LANG_RULES, &mut detected.languages);
    detect_from_deps(&all_deps, FRAMEWORK_RULES, &mut detected.frameworks);
    detect_from_deps(&all_deps, RUNTIME_RULES, &mut detected.runtimes);
    detect_from_deps(&all_deps, INFRA_RULES, &mut detected.infra);

    if has_cargo_toml {
        detected.languages.push(DetectedItem { name: "Rust".to_string(), source: "Cargo.toml".to_string() });
    }

    if has_d1 { detected.infra.push(DetectedItem { name: "Cloudflare D1".to_string(), source: "wrangler.json/jsonc".to_string() }); }
    if has_r2 { detected.infra.push(DetectedItem { name: "Cloudflare R2".to_string(), source: "wrangler.json/jsonc".to_string() }); }
    if has_kv { detected.infra.push(DetectedItem { name: "Cloudflare KV".to_string(), source: "wrangler.json/jsonc".to_string() }); }
    if has_durable_objects { detected.infra.push(DetectedItem { name: "Cloudflare Durable Objects".to_string(), source: "wrangler.json/jsonc".to_string() }); }

    dedup_detected(&mut detected.languages);
    dedup_detected(&mut detected.frameworks);
    dedup_detected(&mut detected.runtimes);
    dedup_detected(&mut detected.infra);
    dedup_detected(&mut detected.package_managers);

    let (package_usages, package_occurrences) = build_package_data(&all_deps, include_usage);

    let now = current_timestamp();

    Ok(ScanResult {
        scan: ScanMeta {
            project_name: project_name.unwrap_or_else(|| "unknown".to_string()),
            root_path_name: root.to_string_lossy().to_string(),
            scanned_at: now,
            cli_version: CLI_VERSION.to_string(),
        },
        detected,
        manifests: found_manifests.into_iter().map(|(path, kind)| Manifest { path, kind }).collect(),
        workspaces,
        package_usages,
        package_occurrences,
    })
}

// ── Helpers ─────────────────────────────────────────────────────────────

fn detect_from_deps(
    all_deps: &BTreeMap<String, Vec<DepInfo>>,
    rules: &[(&str, &str)],
    output: &mut Vec<DetectedItem>,
) {
    for (pkg_name, tech_name) in rules {
        if all_deps.contains_key(*pkg_name) {
            let sources: Vec<String> = all_deps[*pkg_name].iter().map(|d| d.manifest.clone()).collect();
            output.push(DetectedItem {
                name: tech_name.to_string(),
                source: sources.join(", "),
            });
        }
    }
}

fn build_package_data(
    all_deps: &BTreeMap<String, Vec<DepInfo>>,
    include_usage: bool,
) -> (Vec<PackageUsage>, Vec<PackageOccurrence>) {
    let mut package_usages: Vec<PackageUsage> = Vec::new();
    let mut package_occurrences: Vec<PackageOccurrence> = Vec::new();

    for (pkg, dep_infos) in all_deps {
        // Keep uploaded stack data focused on runtime SDKs and libraries.
        // Tooling, type stubs, test runners, and formatters are noisy at the
        // workspace root and do not describe the product runtime.
        if !is_relevant_package(pkg, dep_infos) {
            continue;
        }
        let mut versions: BTreeSet<String> = BTreeSet::new();
        let mut dep_types: BTreeSet<String> = BTreeSet::new();
        let mut workspaces_set: BTreeSet<String> = BTreeSet::new();

        for info in dep_infos {
            versions.insert(info.version.clone());
            dep_types.insert(info.dependency_type.clone());
            workspaces_set.insert(manifest_to_workspace(&info.manifest));
        }

        if include_usage {
            for info in dep_infos {
                package_occurrences.push(PackageOccurrence {
                    package: pkg.clone(),
                    version: info.version.clone(),
                    manifest: info.manifest.clone(),
                    dependency_type: info.dependency_type.clone(),
                    workspace: Some(manifest_to_workspace(&info.manifest)),
                });
            }
        }

        package_usages.push(PackageUsage {
            package: pkg.clone(),
            ecosystem: detect_ecosystem(pkg),
            usage_count: dep_infos.len(),
            workspace_count: workspaces_set.len(),
            versions: versions.into_iter().collect(),
            dependency_types: dep_types.into_iter().collect(),
        });
    }

    package_usages.sort_by(|a, b| b.usage_count.cmp(&a.usage_count).then(a.package.cmp(&b.package)));
    package_occurrences.sort_by(|a, b| a.package.cmp(&b.package));

    (package_usages, package_occurrences)
}

fn is_relevant_package(package: &str, dep_infos: &[DepInfo]) -> bool {
    let lower = package.to_ascii_lowercase();
    let noisy = lower.starts_with("@types/")
        || lower.starts_with("eslint")
        || lower.starts_with("prettier")
        || lower.starts_with("typescript")
        || lower.starts_with("ts-node")
        || lower.starts_with("jest")
        || lower.starts_with("@jest/")
        || lower.starts_with("mocha")
        || lower.starts_with("chai")
        || lower.starts_with("vitest")
        || lower.starts_with("cypress")
        || lower.starts_with("playwright")
        || lower.starts_with("@playwright/")
        || lower.contains("lint")
        || lower.contains("formatter");
    if noisy {
        return false;
    }

    dep_infos.iter().any(|info| matches!(
        info.dependency_type.as_str(),
        "dependencies" | "peerDependencies" | "buildDependencies"
    ))
}

fn detect_manifest_kind(file_name: &str) -> String {
    match file_name {
        "package.json" => "package.json".to_string(),
        "Cargo.toml" => "Cargo.toml".to_string(),
        "wrangler.json" => "wrangler.json".to_string(),
        "wrangler.jsonc" => "wrangler.jsonc".to_string(),
        "turbo.json" => "turbo.json".to_string(),
        "pnpm-lock.yaml" => "pnpm-lock.yaml".to_string(),
        "package-lock.json" => "package-lock.json".to_string(),
        "yarn.lock" => "yarn.lock".to_string(),
        "bun.lockb" => "bun.lockb".to_string(),
        _ => file_name.to_string(),
    }
}

fn detect_ecosystem(package: &str) -> String {
    if package.starts_with('@') || package.contains("react") || package.contains("vue") || package.contains("svelte") {
        "npm".to_string()
    } else if package.starts_with("serde") || package.contains("tokio") || package.contains("reqwest") {
        "cargo".to_string()
    } else {
        "npm".to_string()
    }
}

fn manifest_to_workspace(manifest: &str) -> String {
    let parts: Vec<&str> = manifest.split('/').collect();
    if parts.len() > 1 { parts[0].to_string() } else { ".".to_string() }
}

fn detect_workspaces(
    ws_value: &serde_json::Value,
    root: &Path,
    pkg_path: &Path,
    workspaces: &mut Vec<Workspace>,
) {
    let pkg_dir = pkg_path.parent().unwrap_or(root);

    match ws_value {
        serde_json::Value::Array(arr) => {
            for pattern in arr {
                if let Some(pattern_str) = pattern.as_str() {
                    let glob_path = pkg_dir.join(pattern_str);
                    if let Some(parent) = glob_path.parent() {
                        if let Some(dir_name) = glob_path.file_name().and_then(|n| n.to_str()) {
                            if dir_name == "*" {
                                if let Ok(entries) = fs::read_dir(parent) {
                                    for entry in entries.flatten() {
                                        if entry.path().is_dir() {
                                            let name = entry.file_name().to_string_lossy().to_string();
                                            let ws_path = parent.join(&name).strip_prefix(root).unwrap_or(&entry.path()).to_string_lossy().to_string();
                                            workspaces.push(Workspace { path: ws_path, name: Some(name), kind: "npm".to_string() });
                                        }
                                    }
                                }
                            } else {
                                let ws_path = glob_path.strip_prefix(root).unwrap_or(&glob_path).to_string_lossy().to_string();
                                workspaces.push(Workspace { path: ws_path, name: None, kind: "npm".to_string() });
                            }
                        }
                    }
                }
            }
        }
        serde_json::Value::Object(obj) => {
            if let Some(packages) = obj.get("packages") {
                detect_workspaces(packages, root, pkg_path, workspaces);
            }
        }
        _ => {}
    }
}

fn collect_deps(
    map: &mut BTreeMap<String, Vec<DepInfo>>,
    deps: &Option<BTreeMap<String, String>>,
    manifest: &str,
    dep_type: &str,
) {
    if let Some(deps) = deps {
        for (name, version) in deps {
            map.entry(name.clone()).or_default().push(DepInfo {
                version: version.clone(),
                manifest: manifest.to_string(),
                dependency_type: dep_type.to_string(),
            });
        }
    }
}

fn collect_cargo_deps(
    map: &mut BTreeMap<String, Vec<DepInfo>>,
    deps: &Option<BTreeMap<String, toml::Value>>,
    manifest: &str,
    dep_type: &str,
) {
    if let Some(deps) = deps {
        for (name, value) in deps {
            let version = match value {
                toml::Value::String(s) => s.clone(),
                toml::Value::Table(t) => t.get("version").and_then(|v| v.as_str()).unwrap_or("*").to_string(),
                _ => "*".to_string(),
            };
            map.entry(name.clone()).or_default().push(DepInfo {
                version,
                manifest: manifest.to_string(),
                dependency_type: dep_type.to_string(),
            });
        }
    }
}

fn dedup_detected(items: &mut Vec<DetectedItem>) {
    let mut seen: BTreeSet<String> = BTreeSet::new();
    items.retain(|item| {
        if seen.contains(&item.name) { false } else { seen.insert(item.name.clone()); true }
    });
}

fn current_timestamp() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    let days = secs / 86400;
    let sub_day = secs % 86400;
    let hours = sub_day / 3600;
    let minutes = (sub_day % 3600) / 60;
    let seconds = sub_day % 60;

    let mut year = 1970u32;
    let mut remaining_days = days;
    loop {
        let days_in_year = if is_leap(year) { 366 } else { 365 };
        if remaining_days < days_in_year { break; }
        remaining_days -= days_in_year;
        year += 1;
    }

    let mut month = 1u32;
    let days_in_months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (i, &dim) in days_in_months.iter().enumerate() {
        let dim = if i == 1 && is_leap(year) { dim + 1 } else { dim };
        if remaining_days < dim as u64 { month = (i + 1) as u32; break; }
        remaining_days -= dim as u64;
    }
    let day = (remaining_days + 1) as u32;

    format!("{:04}-{:02}-{:02}T{:02}:{:02}:{:02}Z", year, month, day, hours, minutes, seconds)
}

fn is_leap(year: u32) -> bool {
    (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn dep(kind: &str) -> DepInfo {
        DepInfo { version: "*".to_string(), manifest: "package.json".to_string(), dependency_type: kind.to_string() }
    }

    #[test]
    fn filters_workspace_tooling_and_type_packages() {
        assert!(!is_relevant_package("typescript", &[dep("devDependencies")]));
        assert!(!is_relevant_package("@types/node", &[dep("devDependencies")]));
        assert!(!is_relevant_package("eslint", &[dep("dependencies")]));
        assert!(!is_relevant_package("mocha", &[dep("devDependencies")]));
    }

    #[test]
    fn keeps_runtime_sdks_and_libraries() {
        assert!(is_relevant_package("next", &[dep("dependencies")]));
        assert!(is_relevant_package("openai", &[dep("dependencies")]));
        assert!(is_relevant_package("@supabase/supabase-js", &[dep("dependencies")]));
        assert!(is_relevant_package("tokio", &[dep("dependencies")]));
    }
}
