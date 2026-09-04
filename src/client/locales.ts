/** Locale namespace and copy for the better-restart settings action. */
export const NS = 'better-restart-ui'

export const en = {
  restart: 'Restart app',
  restarting: 'Restarting…',
  restartFailed: 'Restart failed — copy',
  copied: 'Copied',
  confirmTitle: 'Restart app?',
  confirmSafe: 'This restarts the whole application and reloads the current tab.',
  confirmRunning: '{count} conversations are running; restarting interrupts them and discards their progress.',
  confirmUnavailable: 'Unable to check running conversations; confirm none are running before continuing.',
  acknowledge: 'I understand a restart interrupts running conversations.',
  cancel: 'Cancel',
  confirm: 'Restart',
  confirmNow: 'Restart now',
} as const

export const zh = {
  restart: '重启应用',
  restarting: '重启中…',
  restartFailed: '重启失败 — 复制',
  copied: '已复制',
  confirmTitle: '重启应用？',
  confirmSafe: '这会重新加载整个应用，并刷新当前页面。',
  confirmRunning: '有 {count} 个对话正在运行，重启会中断它们并丢弃进度。',
  confirmUnavailable: '无法检测运行中的对话；继续前请确认当前没有对话在运行。',
  acknowledge: '我确认会中断运行中的对话。',
  cancel: '取消',
  confirm: '重启',
  confirmNow: '立即重启',
} as const

export type RestartKey = keyof typeof en
