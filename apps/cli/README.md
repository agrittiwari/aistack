# aistack CLI

Scan a project directory and detect the tech stack. Built in Rust for speed.

## Install

```bash
# From source (requires Rust)
cd apps/cli
cargo build --release

# Via npm wrapper (once published)
npx @aistack/cli scan
```

## Usage

```bash
aistack scan                    # scan current directory
aistack scan --json             # JSON output
aistack scan --cwd <path>       # scan specific directory
aistack info                    # show version and help
```

## Architecture

```
apps/cli/
├── Cargo.toml              # Rust dependencies
├── src/main.rs             # CLI + scanner + parsers + output
├── fixtures/               # Test fixtures for development
│   ├── node-basic/
│   ├── rust-basic/
│   ├── cloudflare-worker/
│   └── monorepo-basic/
└── npm/                    # npm wrapper for `npx @aistack/cli`
    ├── package.json
    └── bin/aistack.js
```

### Core Components

**CLI (clap)** — Parses arguments: `scan`, `info`, `--json`, `--cwd`.

**Directory Walker (ignore crate)** — Recursively walks the directory tree. Respects `.gitignore`, skips `node_modules`, `.git`, `dist`, `build`, `target`, `.next`, `.turbo`, `.env`.

**Manifest Parsers** — Reads and parses metadata files:
- `package.json` — extracts dependencies + devDependencies
- `Cargo.toml` — detects Rust projects
- `wrangler.json` / `wrangler.jsonc` — detects Cloudflare Workers
- `turbo.json` — detects Turborepo
- Lock files (`pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lockb`) — detect package managers

**Detection Engine** — Maps parsed data to tech stack items using rules:
- Dependency names → frameworks (next → Next.js, react → React, hono → Hono, etc.)
- File presence → tools/platforms (turbo.json → Turborepo, wrangler.json → Cloudflare Workers)
- Lock files → package managers

**Aggregation** — If the same package appears in multiple manifests:
- One `package_usage` with `usage_count > 1`
- Multiple `package_occurrences` (one per manifest)

**Output** — Pretty colored terminal output (default) or structured JSON (`--json`).

### Data Flow

```
walk directory
  → find manifest files
  → parse each manifest
  → extract dependencies
  → apply detection rules
  → aggregate package usages
  → output results
```

### JSON Schema

```json
{
  "scan": {
    "root": "/path/to/project",
    "scanned_at": "2026-01-01T00:00:00Z",
    "manifests_found": 4
  },
  "detected": [
    { "name": "Next.js", "kind": "dependency", "source": "apps/web/package.json" }
  ],
  "manifests": [
    { "path": "apps/web/package.json", "kind": "package.json" }
  ],
  "package_usages": [
    { "package": "typescript", "version": "^5.0.0", "usage_count": 2, "found_in": ["package.json", "apps/web/package.json"] }
  ],
  "package_occurrences": [
    { "package": "typescript", "version": "^5.0.0", "manifest": "package.json" },
    { "package": "typescript", "version": "^5.0.0", "manifest": "apps/web/package.json" }
  ]
}
```

### npm Wrapper

The `npm/` directory contains a wrapper that:
1. Detects the current platform (darwin/linux/windows, arm64/x64)
2. Downloads the matching prebuilt binary from GitHub Releases
3. Caches it in `~/.cache/aistack/`
4. Forwards all arguments to the binary

### Detection Rules

| File | Detects |
|------|---------|
| `package.json` | Node.js |
| `Cargo.toml` | Rust |
| `wrangler.json` / `wrangler.jsonc` | Cloudflare Workers |
| `turbo.json` | Turborepo |
| `pnpm-lock.yaml` | pnpm |
| `package-lock.json` | npm |
| `yarn.lock` | yarn |
| `bun.lockb` | bun |

| Dependency | Detects |
|------------|---------|
| `next` | Next.js |
| `react` | React |
| `react-native` | React Native |
| `expo` | Expo |
| `@sveltejs/kit` | SvelteKit |
| `hono` | Hono |
| `drizzle-orm` | Drizzle |
| `better-auth` | Better Auth |
| `wrangler` | Cloudflare Workers |
| `typescript` | TypeScript |

### Development

```bash
# Build
cargo build

# Run tests
cargo test

# Run against fixtures
cargo run -- scan --cwd fixtures/node-basic
cargo run -- scan --cwd fixtures/monorepo-basic --json
```
