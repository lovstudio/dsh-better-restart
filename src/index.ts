/**
 * Better-restart plugin, host half: exposes the launcher's in-place application
 * restart and the running-conversation status to the browser through two
 * `webServer` routes. The client half (settings-header button) fetches these
 * routes to decide whether a restart is safe and to trigger it.
 *
 * DSH capabilities are reached through the injected Cordis `ctx` only — the
 * `webServer` service serves the two routes, the `agents` service reports the
 * running-conversation count, and the launcher-provided `appRestart` service
 * performs the restart. There are no package dependencies beyond node builtins.
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

/** Absolute route triggering the launcher's application restart. */
export const RESTART_PATH = '/better-restart'

/**
 * Register the restart and status routes on the web server.
 * @param ctx - cordis context carrying the webServer, agents, and appRestart services.
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
        await ctx.get<() => Promise<void>>('appRestart')?.()
        res.writeHead(204).end()
      },
    })
    return () => {
      removeStatus()
      removeRestart()
    }
  }, 'better-restart: restart and status routes')
}
