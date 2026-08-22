/**
 * Better-restart UI plugin, browser half: registers the settings-header
 * restart action. The action opens a confirmation dialog that watches running
 * conversations live and, on confirm, POSTs the host's restart route — which
 * re-boots the whole application and reloads the current tab on reconnect.
 *
 * The client reaches the host through the two plain `webServer` routes the
 * host half registers (`/better-restart/status`, `/better-restart`), so it
 * needs no Remote assembly.
 *
 * @module @lovstudio/dsh-better-restart/client
 */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { en, NS, zh, type RestartKey } from './locales.ts'
import { RestartAction, type RestartActionInjected } from './RestartAction.tsx'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'better-restart-ui': RestartKey
  }
}

/** Required services: the settings slot registry and the locale provider. */
export const inject = ['slots', 'locale']

/** Absolute host routes mirroring the host half's paths. */
const STATUS_PATH = '/better-restart/status'
const RESTART_PATH = '/better-restart'

/** How long a pending reload waits for the reconnected generation before it lapses. */
const RELOAD_WINDOW_MS = 15_000

/** Set while a restart request is in flight; the reconnected generation reloads the tab. */
let pendingReload = false

/**
 * Register the restart action in the settings header.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'better-restart-ui: dictionary')
  ctx.on('connection/reset', () => {
    if (!pendingReload) return
    pendingReload = false
    window.location.reload()
  })
  ctx.slots.inject('settings.action', () => ctx.slots.register({
    name: 'settings.action',
    id: 'restart',
    order: 10,
    locale: NS,
    inject: (): RestartActionInjected => ({
      status: async () => {
        const response = await fetch(STATUS_PATH, { headers: { Accept: 'application/json' } })
        if (!response.ok) throw new Error(`better-restart.status failed: ${response.status} ${response.statusText}`)
        return response.json()
      },
      restart: () => {
        pendingReload = true
        setTimeout(() => { pendingReload = false }, RELOAD_WINDOW_MS)
        void fetch(RESTART_PATH, { method: 'POST' })
      },
    }),
  }, RestartAction))
}
