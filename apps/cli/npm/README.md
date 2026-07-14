# @agrit-tiwari/aistack

Scan a project directory and detect the tech stack. Rust-backed CLI for speed.

## Install

```bash
npm install --global @agrit-tiwari/aistack
aistack scan
```

## Usage

```bash
aistack scan                    # scan current directory
aistack scan --packages         # include package occurrences (legacy --usage alias)
aistack scan --local --json     # explicitly avoid upload
aistack deepscan                 # upload the deep stack report
aistack deepscan --local --json # inspect all supported local agent logs
aistack scan --json             # JSON output
aistack scan --cwd <path>       # scan specific directory
aistack login                   # authenticate in the browser
aistack whoami                  # validate the saved CLI token
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

For a one-off invocation without a global install:

```bash
npx --package @agrit-tiwari/aistack aistack scan
```

## License

MIT
