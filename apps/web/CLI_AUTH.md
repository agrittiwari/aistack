# CLI authentication deployment

The CLI uses a device authorization flow:

1. `aistack login` calls `POST /api/cli/auth/start`.
2. The CLI opens `/cli/authorize` and polls `POST /api/cli/auth/poll`.
3. The user signs in through the existing Supabase OAuth flow and approves the request.
4. The poll response returns a revocable opaque token once.
5. `aistack whoami` validates that token through `GET /api/cli/whoami`.

## Database

Run the SQL in:

```text
supabase/migrations/20260714061645_add_cli_device_auth.sql
```

The migration creates two backend-only tables:

- `cli_auth_requests`: short-lived device login state and encrypted token handoff.
- `cli_access_tokens`: hashed, revocable CLI credentials.

The tables have RLS enabled, no `anon` or `authenticated` policies, and explicit
access only for `service_role`. All access goes through the Next.js routes.

After applying the migration, refresh the checked TypeScript schema when your
Supabase CLI session is available:

```bash
pnpm --filter web supabase:gen:types
```

## Deployment environment

Configure these server variables before deploying:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
SUPABASE_SECRET_KEY=sb_secret_your_key
CLI_TOKEN_ENCRYPTION_KEY=replace-with-a-random-secret-at-least-32-characters
```

Never expose `SUPABASE_SECRET_KEY` or `CLI_TOKEN_ENCRYPTION_KEY` to the browser.
Keep the encryption key stable across deployments.

## Production smoke test

Release in this order so the npm downloader never points at missing binaries:

1. Apply the SQL migration and deploy the web app with the new environment variables.
2. Push the code, create and push tag `v0.3.0`.
3. Wait for `.github/workflows/release-cli.yml` to publish all GitHub Release archives.
4. From `apps/cli/npm`, run `npm pack --dry-run` and then `npm publish --access public`.
5. Test from a clean npm cache:

```bash
curl -i -X POST https://aistack.directory/api/cli/auth/start

npm install --global @agrit-tiwari/aistack
aistack login
aistack whoami
```

The start request should return `device_code`, `user_code`, `login_url`,
`expires_in`, and `poll_interval`. The browser approval page must show the same
`user_code` printed by the CLI.

## Usage reporting (incremental)

`20260714064504_usage_reporting.sql` adds owner-scoped metadata tables for
filesystem scans, projects, technologies, and agent runs. The CLI endpoint is
`POST /api/cli/usage` and accepts bounded batches of `scan`, `projects`,
`technologies`, and/or `events`; `GET /api/cli/usage?days=30` returns a private
summary. The browser session endpoint is `GET /api/usage/me`.

The current `scan --packages` flag reports package occurrences only. It is not
an AI-token counter; `--usage` remains a compatibility alias. Provider adapters
must report `coverage` when a source is unavailable. Do not scrape private
dashboards or upload prompts/source files.

### Deep scan

Run a report locally first:

```bash
aistack deepscan --cwd /path/to/workspace --json > deepscan.json
```

After `aistack login`, upload is the default for both scan commands:

```bash
aistack scan --cwd /path/to/workspace
aistack deepscan --cwd /path/to/workspace
```

Include supported coding-agent session logs and token metadata:

```bash
aistack deepscan --local --json > /tmp/aistack-deepscan.json
aistack deepscan
```

The log collector is enabled by default. Use `--no-session-logs` to skip it.
It checks known user-owned locations for Codex, OpenCode,
Claude, Antigravity, and Copilot. It reads bounded JSON/JSONL/log files,
extracts dates, token counters, plan/architecture signals, source category,
and session identifiers, and stores only redacted metadata in JSONB. It does
not upload prompts or raw log lines. Provider-specific formats may expose no
tokens; those records remain marked `partial` or `unsupported`.

Use `--local` when you explicitly want no network request:

```bash
aistack deepscan --cwd /path/to/workspace --local --json
```

The command hashes the canonical root and hostname, sends project/technology
metadata, and binds ownership on the server from the bearer token. It never
trusts a user id supplied by the CLI. Whole-machine scans require the explicit
`--cwd /` choice and may encounter permission-denied paths.

Apply the additional identity migration after the base usage migration:

```text
supabase/migrations/20260714065209_deep_scan_identity.sql
```

Apply the coding-agent log migration as the next migration:

```text
supabase/migrations/20260714071556_coding_agent_log_usage.sql
```

It adds `category`, `plan_mode`, `event_date`, `total_tokens`, and
`log_payload jsonb` to `agent_usage_events`, plus the daily rollup table
`agent_usage_daily` for per-day token and timelog statistics. The supported
source categories are `codex_cli`, `codex_cloud`, `open_code`, `claude`,
`antigravity`, `copilot`, `aistack`, and `other`.

For a local `Unable to start CLI login` 500, restart the web server after
changing `.env`, verify `SUPABASE_SECRET_KEY` and
`CLI_TOKEN_ENCRYPTION_KEY`, then inspect the server log. The route returns
`CLI_AUTH_DATABASE` for schema/database failures and
`CLI_AUTH_NOT_CONFIGURED` for missing server configuration.
