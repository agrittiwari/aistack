use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanResult {
    pub scan: ScanMeta,
    pub detected: DetectedCategories,
    pub manifests: Vec<Manifest>,
    pub workspaces: Vec<Workspace>,
    pub package_usages: Vec<PackageUsage>,
    pub package_occurrences: Vec<PackageOccurrence>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanMeta {
    pub project_name: String,
    pub root_path_name: String,
    pub scanned_at: String,
    pub cli_version: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DetectedCategories {
    pub languages: Vec<DetectedItem>,
    pub frameworks: Vec<DetectedItem>,
    pub runtimes: Vec<DetectedItem>,
    pub infra: Vec<DetectedItem>,
    pub package_managers: Vec<DetectedItem>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DetectedItem {
    pub name: String,
    pub source: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Manifest {
    pub path: String,
    pub kind: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Workspace {
    pub path: String,
    pub name: Option<String>,
    pub kind: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PackageUsage {
    pub package: String,
    pub ecosystem: String,
    pub usage_count: usize,
    pub workspace_count: usize,
    pub versions: Vec<String>,
    pub dependency_types: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PackageOccurrence {
    pub package: String,
    pub version: String,
    pub manifest: String,
    pub dependency_type: String,
    pub workspace: Option<String>,
}

#[derive(Debug, Clone)]
pub struct DepInfo {
    pub version: String,
    pub manifest: String,
    pub dependency_type: String,
}

// ── Manifest parsing structs ────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct PackageJson {
    pub name: Option<String>,
    pub dependencies: Option<BTreeMap<String, String>>,
    #[serde(rename = "devDependencies")]
    pub dev_dependencies: Option<BTreeMap<String, String>>,
    #[serde(rename = "peerDependencies")]
    pub peer_dependencies: Option<BTreeMap<String, String>>,
    pub workspaces: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
pub struct CargoToml {
    pub package: Option<CargoPackage>,
    pub dependencies: Option<BTreeMap<String, toml::Value>>,
    #[serde(rename = "dev-dependencies")]
    pub dev_dependencies: Option<BTreeMap<String, toml::Value>>,
    #[serde(rename = "build-dependencies")]
    pub build_dependencies: Option<BTreeMap<String, toml::Value>>,
}

#[derive(Debug, Deserialize)]
pub struct CargoPackage {
    pub name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct WranglerConfig {
    pub name: Option<String>,
    #[serde(rename = "d1_databases")]
    pub d1_databases: Option<serde_json::Value>,
    pub r2_buckets: Option<serde_json::Value>,
    pub kv_namespaces: Option<serde_json::Value>,
    #[serde(rename = "durable_objects")]
    pub durable_objects: Option<serde_json::Value>,
}

// ── Auth structs ────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthConfig {
    pub token: String,
    pub api_base_url: String,
    pub workspace_id: String,
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct AuthStartResponse {
    pub device_code: String,
    pub user_code: String,
    pub login_url: String,
    pub expires_in: u64,
    pub poll_interval: u64,
}

#[derive(Debug, Deserialize)]
pub struct AuthPollResponse {
    pub token: Option<String>,
    pub workspace_id: Option<String>,
    pub email: Option<String>,
    pub status: String,
}

#[derive(Debug, Deserialize)]
pub struct WhoamiResponse {
    pub email: String,
    pub workspace_id: String,
}
