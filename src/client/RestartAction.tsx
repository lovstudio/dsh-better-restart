/**
 * Settings-header action that restarts the whole application in place. The
 * action opens a confirmation dialog that watches agent activity live: with
 * conversations running it reports the count and gates the restart behind an
 * explicit acknowledgement, without running conversations it lets the restart
 * straight through. The button disables with a spinner while the restart is in
 * flight.
 */

import { useEffect, useState, type ReactNode } from 'react'
import { Button, IconLoadingOutline16, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import css from './styles.ts'

/** How long the restarting state lingers if the restart never lands. */
const RESTARTING_TIMEOUT_MS = 15_000

/** How often the open dialog re-reads agent activity. */
const STATUS_POLL_MS = 1_500

/** Agent activity the confirmation reads before allowing the restart. */
export interface RestartStatus {
  /** Whether at least one agent loop is mid-turn. */
  running: boolean
  /** Number of concurrently running agent loops. */
  active: number
}

/** Registrant-owned dependencies of {@link RestartAction}. */
export interface RestartActionInjected {
  /** In-place restart call, forwarding to the host remote method. */
  restart: () => void
  /** Current agent activity, polled while the confirmation is open. */
  status: () => Promise<RestartStatus>
}

/** Localized copy plus the injected restart call and status reader. */
export type RestartActionProps = PropsLocale<'better-restart-ui'> & InjectFace<RestartActionInjected>

/**
 * Render the restart action with its confirmation dialog and in-flight state.
 * @param props - localized copy, the restart call, and the status reader.
 * @returns the action button and its conditional confirmation dialog.
 */
export function RestartAction({ t, restart, status }: RestartActionProps): ReactNode {
  const [confirming, setConfirming] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [restarting, setRestarting] = useState(false)
  const [activity, setActivity] = useState<RestartStatus | undefined>()
  const [statusUnavailable, setStatusUnavailable] = useState(false)

  // Watch agent activity live while the dialog is open: the user decides with
  // current facts, not a stale snapshot from the moment they clicked.
  useEffect(() => {
    if (!confirming) return
    let disposed = false
    const poll = (): void => {
      void status().then(
        (value) => {
          if (disposed) return
          setActivity(value)
          setStatusUnavailable(false)
        },
        () => { if (!disposed) setStatusUnavailable(true) },
      )
    }
    poll()
    const timer = setInterval(poll, STATUS_POLL_MS)
    return () => { disposed = true; clearInterval(timer) }
  }, [confirming, status])

  const openConfirmation = (): void => {
    setAcknowledged(false)
    setConfirming(true)
  }

  const confirm = (): void => {
    setConfirming(false)
    setRestarting(true)
    restart()
    // A restart that never reconnects (and so never reloads the tab) must not
    // leave the button disabled forever; the window lapses after the re-boot's
    // own duration and the user can retry.
    setTimeout(() => { setRestarting(false) }, RESTARTING_TIMEOUT_MS)
  }

  const running = activity?.running === true
  // No running conversations means no reason to force an acknowledgement; the
  // acknowledgement gates the restart only when the interruption is real.
  const canConfirm = running ? acknowledged : true
  const description = statusUnavailable
    ? t('confirmUnavailable')
    : running ? t('confirmRunning', { count: String(activity?.active ?? 0) }) : t('confirmSafe')

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={restarting}
        icon={restarting ? <IconLoadingOutline16 className={css.spinner} /> : undefined}
        onClick={openConfirmation}
      >
        {restarting ? t('restarting') : t('restart')}
      </Button>
      <Modal
        open={confirming}
        onClose={() => { setConfirming(false) }}
        title={t('confirmTitle')}
        description={description}
        footer={(
          <>
            <Button variant="outline" onClick={() => { setConfirming(false) }}>
              {t('cancel')}
            </Button>
            <Button variant="primary" disabled={!canConfirm} onClick={confirm}>
              {running ? t('confirmNow') : t('confirm')}
            </Button>
          </>
        )}
      >
        {running
          ? (
            <label className={css.acknowledgement}>
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => { setAcknowledged(event.currentTarget.checked) }}
              />
              <span>{t('acknowledge')}</span>
            </label>
          )
          : null}
      </Modal>
    </>
  )
}
