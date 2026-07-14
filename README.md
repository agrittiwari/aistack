# AiStack

AiStack is a personal, shareable inventory of the tools people use to build software with coding agents. It combines a directory scanner, agent-session usage importer, authenticated profile, and public `My AI Stack` page.

The project has two surfaces:

- **CLI** — `aistack scan` records project manifests and `aistack deepscan` walks the machine, discovers package manifests, and imports supported coding-agent logs.
- **Web profile** — `/my-stack` is the private owner dashboard; `/my-ai-stack/[handle]` is the public profile and usage report.

## What the CLI captures

The scanner is metadata-first. It does not upload source code or prompt contents.

### Project and stack fingerprints

`scan` and `deepscan` inspect supported manifests such as `package.json`, Cargo manifests, Python metadata, Go modules, and common lockfiles. For Node projects, dependencies and devDependencies from `package.json` become technology fingerprints with:

- ecosystem (`npm`, `rust`, `python`, and so on)
- package name and version/range
- project/workspace hash
- evidence kind (`manifest` or `lockfile`)
- occurrence count across the scan

The web UI renders these as **Stack fingerprints**. This is a useful public summary of a builder's stack without exposing repository paths or source files.

### Agent usage

`deepscan` imports supported local session stores and normalizes them into usage events. Current source categories include Codex CLI, Codex Cloud, OpenCode, Claude Code, Antigravity, Copilot, AiStack, and `other`.

Each event can contain:

- source agent, model, project hash, and coverage status
- category such as planning, coding, review, or session
- plan-mode flag
- started/ended timestamps and event date
- input, output, cached, and total tokens when the provider exposes them
- a redacted JSONB metadata payload for provider-specific fields

The profile UI segregates this data by agent, work category, model, plan-mode sessions, daily token burn, active time, completed runs, and package fingerprints.

## Upload and privacy flow

Upload is the default for authenticated CLI users:

```bash
aistack scan
aistack deepscan
```

Use `--local` to produce a report without uploading:

```bash
aistack deepscan --local --json > /tmp/aistack-report.json
```

The CLI authenticates with the device flow and sends reports to `/api/cli/usage`. The API writes scan metadata, projects, technologies, agent events, and daily aggregates to Supabase. Events are deduplicated by `user_id`, source, and external event id.

Public usage is opt-in through `profile_usage_settings`:

- `visibility = public` enables the public activity report
- `show_tokens` controls token totals and per-day token bars
- `show_projects` controls package/project fingerprints
- `window_days` controls the displayed timeline

When token visibility is disabled, the public page still shows non-sensitive session segmentation but never renders token values.

## Database model

The migrations in `apps/web/supabase/migrations/` create the following reporting tables:

- `usage_scans` — one record per scan/deepscan run
- `usage_projects` — hashed project/workspace metadata
- `usage_technologies` — package/manifest fingerprints
- `agent_usage_events` — normalized session events and JSONB metadata
- `agent_usage_daily` — source/category/day aggregates for fast charts
- `profile_usage_settings` — per-profile visibility controls

The CLI API uses the service role only on the server. Browser requests use the authenticated Supabase session, and public profile reads are gated by the profile visibility settings.

## Local development

Install dependencies and run the web app:

```bash
pnpm install
pnpm dev
```

Build and verify the web app:

```bash
pnpm --filter web exec tsc --noEmit --pretty false
pnpm build
```

Run the CLI tests and build:

```bash
cargo test --offline --manifest-path apps/cli/Cargo.toml
npm test --prefix apps/cli/npm
cargo build --release --manifest-path apps/cli/Cargo.toml
```

To run the npm wrapper against a locally built binary:

```bash
AISTACK_BINARY_PATH="$PWD/apps/cli/target/release/aistack" \
  node apps/cli/npm/bin/aistack.js deepscan --local
```

## Publishing the CLI

The npm package is `@agrit-tiwari/aistack`. The package is a small platform wrapper; it downloads the matching archive from the GitHub release tag declared by its version. Therefore a release must contain assets named like:

```text
aistack-aarch64-apple-darwin.tar.gz
aistack-x86_64-apple-darwin.tar.gz
aistack-x86_64-unknown-linux-gnu.tar.gz
aistack-aarch64-unknown-linux-gnu.tar.gz
aistack-x86_64-pc-windows-msvc.tar.gz
```

Release workflow:

```bash
git tag v0.3.1
git push origin v0.3.1
npm publish --access public ./apps/cli/npm
```

The workflow in `.github/workflows/release-cli.yml` builds the five targets and attaches the archives to the matching GitHub release. Keep the Cargo version, CLI version constant, npm version, and tag aligned.

## Product direction

AiStack should evolve from a tool directory into a trustworthy “how I build with agents” profile. The useful distinction is:

1. **Observed facts** — package manifests, agent source, event dates, token metadata, and timing.
2. **Derived signals** — daily totals, category distribution, plan-to-code ratio, active days, and recurring technologies.
3. **Shareable presentation** — a compact public profile that demonstrates practice without exposing prompts, source, secrets, or absolute paths.

Future enrichments can add model/provider cost, project-level trends, architecture signals, and comparison views while keeping raw provider payloads in JSONB and applying the same visibility controls.
