/**
 * Better-restart plugin, host half: exposes an in-place application restart and
 * the running-conversation status to the browser through two `webServer`
 * routes. The client half (settings-header button) fetches these routes to
 * decide whether a restart is safe and to trigger it.
 *
 * Two restart mechanisms, in order of preference:
 *
 * 1. `appRestart` — a launcher-provided service that re-boots the process.
 *    Nothing in `dsh` 0.1.2-rc.1 provides it, so this is the path a future or
 *    embedding launcher takes.
 * 2. Root-include recompose — tearing down and re-loading the loader's root
 *    `cordis:include` entry re-reads the composed `cordis.yml` plus the user
 *    patch layers and restarts every plugin under it. This is what `npx
 *    @deepseek-ai/dsh web` gets: the node process survives (it owns the
 *    terminal), while the whole application tree is rebuilt.
 *
 * DSH capabilities are reached through the injected Cordis `ctx` only — the
 * `webServer` service serves the two routes, the `agents` service reports the
 * running-conversation count, and `loader` owns the entry being recomposed.
 * There are no package dependencies beyond node builtins.
 *
 * @module @lovstudio/dsh-better-restart
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
// Type-only: brings the `ctx.agents` merge (AgentRegistry) and `ctx.appRestart`.
import type {} from '@deepseek-ai/dsh-agent'

/** Cordis plugin name. */
export const name = 'better-restart'

/** Services the host half reads from the injected context. */
export const inject = ['webServer', 'agents']

/** Absolute route reporting the running-conversation status. */
export const STATUS_PATH = '/better-restart/status'

/** Absolute route triggering the application restart. */
export const RESTART_PATH = '/better-restart'

/** Loader entry id of the root `cordis:include` mounted by `dsh-app-boot`. */
const ROOT_INCLUDE_ID = 'include'

/** How the restart was carried out, reported back to the caller. */
export type RestartMode = 'app-restart' | 'recompose'

/** The slice of a loader entry this plugin drives; kept structural to avoid a loader dependency. */
interface LoaderEntry {
  update(options: { disabled?: boolean | null }): Promise<void>
}

/** The slice of the loader service this plugin reads. */
interface LoaderLike {
  resolve(id: string): LoaderEntry | undefined
}

/**
 * Resolve the loader entry whose reload rebuilds the whole application.
 * @param ctx - cordis context that may carry the `loader` service.
 * @returns the root include entry, or `undefined` when this app has no loader tree.
 */
function resolveRootInclude(ctx: Context): LoaderEntry | undefined {
  const loader = ctx.get<LoaderLike>('loader')
  if (loader === undefined) return undefined
  try {
    return loader.resolve(ROOT_INCLUDE_ID)
  } catch {
    // `resolve` throws for an unknown id; an app composed without the boot
    // include simply has no tree-wide restart lever.
    return undefined
  }
}

/** How long to wait for the accepted response's socket to close before recomposing anyway. */
const FLUSH_GRACE_MS = 1_000

/**
 * Tear down and re-load the root include, restarting every plugin under it.
 *
 * The caller's own fiber is inside that subtree, so this must run after the
 * HTTP response is flushed and must not touch the disposed context afterwards
 * — the captured `entry` belongs to the loader, which outlives the recompose.
 *
 * @param entry - the root include entry.
 */
async function recompose(entry: LoaderEntry): Promise<void> {
  await entry.update({ disabled: true })
  // `null` deletes the key, restoring the entry's original options rather than
  // writing an explicit `disabled: false` into the tree.
  await entry.update({ disabled: null })
}

/**
 * Run `start` once the accepted response has actually left the machine.
 *
 * Recomposing destroys the web server's sockets, so a response merely handed to
 * `res.end()` is still lost in the kernel buffer and the browser reports a
 * transport failure instead of the accepted restart. `Connection: close` makes
 * the socket's own close event the flush signal; the grace timer keeps a client
 * that holds the connection open from stalling the restart forever.
 *
 * @param res - the response already ended with the acceptance body.
 * @param start - the restart to run once the response is out.
 */
function afterResponseFlushed(res: ServerResponse, start: () => void): void {
  let started = false
  const run = (): void => {
    if (started) return
    started = true
    clearTimeout(grace)
    start()
  }
  const grace = setTimeout(run, FLUSH_GRACE_MS)
  grace.unref?.()
  res.socket?.once('close', run) ?? run()
}

/**
 * Register the restart and status routes on the web server.
 * @param ctx - cordis context carrying the webServer, agents, and loader services.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => {
    const removeStatus = ctx.webServer.register({
      kind: 'exact',
      path: STATUS_PATH,
      handler: async (_req: IncomingMessage, res: ServerResponse): Promise<void> => {
        const running = ctx.agents.list().filter((agent) => agent.status === 'running')
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        })
        res.end(JSON.stringify({ running: running.length > 0, active: running.length }))
      },
    })
    const removeRestart = ctx.webServer.register({
      kind: 'exact',
      path: RESTART_PATH,
      handler: async (_req: IncomingMessage, res: ServerResponse): Promise<void> => {
        const restart = ctx.get<() => Promise<void>>('appRestart')
        if (restart !== undefined) {
          await restart()
          res.writeHead(204).end()
          return
        }
        const entry = resolveRootInclude(ctx)
        // Neither lever exists. Answering 204 there makes a dead button look
        // like a working one, so say what happened.
        if (entry === undefined) {
          res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
          res.end(JSON.stringify({
            error: 'this DSH app provides neither an appRestart service nor a loader root include; restart the harness process yourself',
          }))
          return
        }
        // The recompose disposes this very route, so answer before starting it.
        // A logger captured now survives the teardown that follows.
        const logger = ctx.logger('better-restart')
        res.writeHead(202, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          Connection: 'close',
        })
        res.end(JSON.stringify({ mode: 'recompose' satisfies RestartMode }))
        afterResponseFlushed(res, () => {
          recompose(entry).catch((error: unknown) => {
            logger.error('in-place recompose failed; the application tree may be down: %o', error)
          })
        })
      },
    })
    return () => {
      removeStatus()
      removeRestart()
    }
  }, 'better-restart: restart and status routes')
}
