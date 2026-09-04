# dsh-better-restart

Lovstudio's in-place application restart plugin for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web surface. The settings header gains a **Restart app** action that re-boots the whole application in place (reloading the current tab, not opening a new one), with a confirmation dialog that watches running conversations live.

This is a **Lovstudio** plugin, not a DeepSeek-AI package, distributed under the `@lovstudio` scope.

## What it does

- **Host half** exposes two `webServer` routes:
  - `POST /better-restart/status` — `{ running, active }` (how many agent loops are mid-turn).
  - `POST /better-restart` — triggers the launcher's in-place restart.
- **Client half** (settings-header button):
  - Confirmation dialog that polls agent activity live (1.5s). With conversations running it reports the count and gates the restart behind an explicit acknowledgement; without running conversations the restart passes straight through.
  - In-flight spinner + disabled button while restarting; the current tab reloads on reconnect.
  - A `betterRestartUi` Cordis service exposing the same `status()` and `restart()` operations to other browser plugins.

The plugin is completely runtime and self-contained: it reaches DSH capabilities through the injected Cordis `ctx` only (`webServer`, `agents`, `appRestart`), and the client page reaches the host through plain fetch to those routes — no Remote assembly, no build-time transforms. It has no package dependencies beyond node builtins.

## Install

Plugins distribute as a **bundle** (`dsh.bundle.patch` → `cordis.patch.yml`). Install into the `web` profile (the one `dsh web` boots):

```sh
# from git (append #<sha> to pin a commit)
dsh plugin --profile web add github:lovstudio/dsh-better-restart

# or straight from npm
dsh plugin --profile web add @lovstudio/dsh-better-restart
```

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

DSH_HOME=/Users/mark/.dsh-lov-dev pnpm --dir /path/to/deepseek-harness dsh plugin --profile web add link:/path/to/dsh-better-restart
```

The Host consumes the generated `index.js`, while the browser module system consumes `lib/client.js`. Client-only rebuilds are detected by the Harness Client HMR watcher; Host, manifest, patch, and bundle-membership changes require a profile restart. The package build does not import a Harness tsconfig or workspace source path.

## Notes

- Requires the `webServer`, `agents`, and `appRestart` services, all provided by the harness launcher / `@deepseek-ai/dsh-base`.
- Copy lives under `@lovstudio/dsh-better-restart` (zh/en), auto-registered to the `better-restart-ui` locale namespace.

## License

[MIT](LICENSE)
