#!/usr/bin/env node

"use strict";

const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PLATFORM_MAP = {
  darwin: "apple-darwin",
  linux: "unknown-linux-gnu",
  win32: "pc-windows-msvc",
};

const ARCH_MAP = {
  arm64: "aarch64",
  x64: "x86_64",
};

function getTarget() {
  const platform = os.platform();
  const arch = os.arch();

  const osName = PLATFORM_MAP[platform];
  const archName = ARCH_MAP[arch];

  if (!osName || !archName) {
    console.error(
      `Unsupported platform: ${platform}-${arch}. Supported: darwin-arm64, darwin-x64, linux-x64, linux-arm64, win32-x64`
    );
    process.exit(1);
  }

  return `${archName}-${osName}`;
}

function getBinaryName() {
  return os.platform() === "win32" ? "aistack.exe" : "aistack";
}

function getCacheDir() {
  const cacheDir = process.env.AISTACK_CACHE_DIR || path.join(os.homedir(), ".cache", "aistack");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  return cacheDir;
}

function getBinaryPath() {
  const target = getTarget();
  const binaryName = getBinaryName();
  const cacheDir = getCacheDir();
  return path.join(cacheDir, `${target}`, binaryName);
}

function downloadBinary() {
  if (process.env.AISTACK_BINARY_PATH) {
    const localBinary = path.resolve(process.env.AISTACK_BINARY_PATH);
    if (!fs.existsSync(localBinary)) {
      console.error(`AISTACK_BINARY_PATH does not exist: ${localBinary}`);
      process.exit(1);
    }
    return localBinary;
  }

  const target = getTarget();
  const binaryName = getBinaryName();
  const binaryPath = getBinaryPath();

  if (fs.existsSync(binaryPath)) {
    return binaryPath;
  }

  const version = require("../package.json").version;
  const url = `https://github.com/agrittiwari/aistack/releases/download/v${version}/aistack-${target}.tar.gz`;

  console.log(`Downloading aistack v${version} for ${target}...`);

  const cacheDir = path.dirname(binaryPath);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const archivePath = path.join(cacheDir, `aistack-${target}.tar.gz`);
  try {
    execFileSync("curl", ["-fsSL", url, "-o", archivePath], { stdio: "inherit" });
    execFileSync("tar", ["-xzf", archivePath, "-C", cacheDir], { stdio: "inherit" });
  } catch (e) {
    console.error(`Failed to download aistack from ${url}`);
    console.error("Please download manually from:");
    console.error(`  https://github.com/agrittiwari/aistack/releases`);
    process.exit(1);
  } finally {
    if (fs.existsSync(archivePath)) {
      fs.unlinkSync(archivePath);
    }
  }

  if (!fs.existsSync(binaryPath)) {
    // Check if it was extracted with a different name
    const extractedBinary = path.join(cacheDir, binaryName);
    if (fs.existsSync(extractedBinary)) {
      fs.renameSync(extractedBinary, binaryPath);
    }
  }

  // Make executable on Unix
  if (os.platform() !== "win32") {
    fs.chmodSync(binaryPath, 0o755);
  }

  return binaryPath;
}

function main() {
  const binaryPath = downloadBinary();
  const result = spawnSync(binaryPath, process.argv.slice(2), { stdio: "inherit" });
  if (result.error) {
    console.error(`Failed to run aistack: ${result.error.message}`);
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}

main();
