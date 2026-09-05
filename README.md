# dsh-better-restart

Lovstudio's in-place application restart plugin for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web surface. The settings header gains a **Restart app** action that re-boots the whole application in place (reloading the current tab, not opening a new one), with a confirmation dialog that watches running conversations live.

This is a **Lovstudio** plugin, not a DeepSeek-AI package, distributed under the `@lovstudio` scope.

## What it does

- **Host half** exposes two `webServer` routes:
  - `POST /better-restart/status` — `{ running, active }` (how many agent loops are mid-turn).
  - `POST /better-restart` — restarts the application, preferring the launcher's `appRestart` service and falling back to a root-include recompose.
- **Client half** (settings-header button):
  - Confirmation dialog that polls agent activity live (1.5s). With conversations running it reports the count and gates the restart behind an explicit acknowledgement; without running conversations the restart passes straight through.
  - In-flight spinner + disabled button while restarting; the current tab reloads on reconnect.
  - A `betterRestartUi` Cordis service exposing the same `status()` and `restart()` operations to other browser plugins.

The plugin is completely runtime and self-contained: it reaches DSH capabilities through the injected Cordis `ctx` only (`webServer`, `agents`, `appRestart`), and the client page reaches the host through plain fetch to those routes — no Remote assembly, no build-time transforms. It has no package dependencies beyond node builtins.

## Install

Prerequisites: Node.js 22.19+ or 24+, pnpm 11 (`corepack enable` or `npm i -g pnpm`) — `dsh plugin` forwards to pnpm inside the profile directory.

**From a DeepSeek Harness source checkout (recommended — you get the harness source too):**

```sh
git clone --depth 1 --branch dsh-v0.1.2-rc.1 https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness && pnpm install && pnpm run build
pnpm dsh plugin --profile web add -w github:lovstudio/dsh-better-restart#v0.1.4
pnpm dsh web
```

**Without a checkout (npx; compiled harness only):**

```sh
npx @deepseek-ai/dsh plugin --profile web add -w github:lovstudio/dsh-better-restart#v0.1.4
npx @deepseek-ai/dsh web
```

### How the restart happens

Two mechanisms, in order of preference:

1. **`appRestart`** — a launcher-provided service that re-boots the process. `dsh` 0.1.2-rc.1 provides none; this is the path a future or embedding launcher takes, and the route answers `204`.
2. **Root-include recompose** — the fallback that makes the button work under plain `dsh web`. The loader's root `cordis:include` entry is disabled and re-enabled, which re-reads the composed `cordis.yml` plus the user patch layers and restarts every plugin under it, the web server included. The node process itself survives, so the terminal that launched `dsh web` keeps owning it. The route answers `202 {"mode":"recompose"}` and only then tears the tree down — the response is held until its socket closes, because a recompose that races the flush reaches the browser as a transport failure rather than an accepted restart.

An app with neither lever answers `503` with that reason, the settings action shows a copyable failure instead of pretending to restart, and any plugin driving this service — the plugin marketplace, for one — sees the same rejection.

Because the process is reused, a recompose re-reads configuration and loads newly installed plugins, but Node's ESM cache means edited source of an already-loaded module is picked up only through the profile's own HMR watcher.

`web` is the profile `dsh web` boots. The tag pins a commit whose `lib/` is prebuilt and committed, so nothing is compiled on your machine. Verified on 2026-09-05 against `dsh-v0.1.2-rc.1` in both forms, including the recompose fallback end to end in the browser. Remove with `dsh plugin --profile web remove @lovstudio/dsh-better-restart`.

The client half (`dsh.client`) is served to the page automatically by the client module system once the plugin is composed — no rebuild of the web application is needed.

## Use

1. Start the web UI: `dsh web`.
2. Open the settings header → **Restart app**.
3. Confirm; the app restarts in place and the current tab reloads.

## Local development

Keep this checkout outside the DeepSeek Harness repository. Install and build it here, then link the package into an isolated development profile:

```sh
pnpm install
pnpm run watch

DSH_HOME=/Users/mark/.dsh-lov-dev pnpm --dir /path/to/deepseek-harness dsh plugin --profile web add -w link:/path/to/dsh-better-restart
```

The Host consumes the generated `index.js`, while the browser module system consumes `lib/client.js`. Client-only rebuilds are detected by the Harness Client HMR watcher; Host, manifest, patch, and bundle-membership changes require a profile restart. The package build does not import a Harness tsconfig or workspace source path.

## Notes

- Requires `webServer` and `agents` (both from `@deepseek-ai/dsh-base`); `appRestart` and `loader` are each optional, and the route reports when neither is there.
- Copy lives under `@lovstudio/dsh-better-restart` (zh/en), auto-registered to the `better-restart-ui` locale namespace.

## License

[MIT](LICENSE)
