# @aistack/cli

Scan a project directory and detect the tech stack. Rust-backed CLI for speed.

## Install

```bash
npx @aistack/cli scan
```

## Usage

```bash
npx @aistack/cli scan                    # scan current directory
npx @aistack/cli scan --usage            # include package occurrences
npx @aistack/cli scan --json             # JSON output
npx @aistack/cli scan --cwd <path>       # scan specific directory
npx @aistack/cli whoami                  # show current user
npx @aistack/cli login                   # authenticate
```

## What it detects

**Languages:** TypeScript, Rust, JavaScript
**Frameworks:** Next.js, React, React Native, Expo, SvelteKit, Hono, Vue, Nuxt, Angular, Svelte
**Runtimes:** Node.js, Deno, Bun
**Infrastructure:** Cloudflare Workers, D1, R2, KV, Durable Objects, Drizzle, Better Auth, Prisma
**Package Managers:** pnpm, npm, yarn, bun
**Monorepo Tools:** Turborepo

## Metadata files scanned

- `package.json`
- `Cargo.toml`
- `wrangler.json` / `wrangler.jsonc`
- `turbo.json`
- `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lockb`

## How it works

This npm package downloads the prebuilt Rust binary for your platform on first run. The binary is cached in `~/.cache/aistack/`.

## License

MIT
