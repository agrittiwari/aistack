# aistack CLI

Scan a project directory and detect the tech stack. Built in Rust for speed.

## Install

```bash
# From source (requires Rust)
cd apps/cli
cargo build --release

# Via npm wrapper (once published)
npm install --global @agrit-tiwari/aistack
aistack scan
```

## Usage

```bash
aistack scan                    # scan current directory
aistack scan --json             # JSON output
aistack scan --cwd <path>       # scan specific directory
aistack login                   # authenticate in the browser
aistack whoami                  # validate the saved CLI token
aistack --help                  # show version and help
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
└── npm/                    # npm wrapper for `@agrit-tiwari/aistack`
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
  → aggregate package occurrences (this is not agent token usage)

`scan` and `deepscan` upload metadata by default when authenticated. Pass
`--local` to keep a report on the machine.
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

### Test the npm package against a local build

You do not need to publish to npm for every CLI change. The npm wrapper accepts
`AISTACK_BINARY_PATH`, which skips the GitHub Release download and executes the
locally built Rust binary.

```bash
cd apps/cli
cargo build

cd npm
npm pack
AISTACK_BINARY_PATH=../target/debug/aistack node bin/aistack.js scan --cwd ../fixtures/node-basic
```

To exercise the packed tarball from a clean consumer project:

```bash
mkdir -p /tmp/aistack-consumer
cd /tmp/aistack-consumer
npm init -y
npm install /absolute/path/to/agrit-tiwari-aistack-0.3.0.tgz
AISTACK_BINARY_PATH=/absolute/path/to/apps/cli/target/debug/aistack npm exec -- aistack scan
```

### Test authentication against the local web app

Apply `apps/web/supabase/migrations/20260714061645_add_cli_device_auth.sql` to
your Supabase project, configure the variables in `apps/web/.env.example`, then:

```bash
# Terminal 1
pnpm --filter web dev

# Terminal 2
cd apps/cli
AISTACK_API_URL=http://localhost:3000 cargo run -- login
AISTACK_API_URL=http://localhost:3000 cargo run -- whoami
```

`login` opens the browser, uses the existing Supabase Google/GitHub session, and
saves the resulting CLI credential under the operating system's config directory.
