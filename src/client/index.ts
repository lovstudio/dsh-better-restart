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

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { en, NS, zh, type RestartKey } from './locales.ts'
import { RestartAction, type RestartActionInjected, type RestartStatus } from './RestartAction.tsx'

/** Shared restart operations consumed by other browser plugins. */
export interface BetterRestartUi {
  /** Read current agent activity before an interrupting restart. */
  status(): Promise<RestartStatus>
  /** Request an in-place Host restart and reload after reconnect. */
  restart(): void
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Browser restart service supplied by this plugin. */
    betterRestartUi: BetterRestartUi
  }
}

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

/** Read current Host activity through the plugin-owned status route. */
async function readStatus(): Promise<RestartStatus> {
  const response = await fetch(STATUS_PATH, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`better-restart.status failed: ${response.status} ${response.statusText}`)
  return response.json() as Promise<RestartStatus>
}

/** Request a restart and arm the reconnect-triggered page reload. */
function restart(): void {
  pendingReload = true
  setTimeout(() => { pendingReload = false }, RELOAD_WINDOW_MS)
  void fetch(RESTART_PATH, { method: 'POST' })
}

/**
 * Register the restart action in the settings header.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  const betterRestartUi: BetterRestartUi = { status: readStatus, restart }
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'better-restart-ui: dictionary')
  ctx.effect(() => {
    const dispose = ctx.reflect.provide('betterRestartUi', betterRestartUi)
    return () => { void dispose() }
  }, 'better-restart-ui: shared restart service')
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
      status: betterRestartUi.status,
      restart: betterRestartUi.restart,
    }),
  }, RestartAction))
}
