/**
 * Compiled RestartAction.module.css: injects the stylesheet once and exports the
 * hashed class map. Kept as a plain module so the standalone client bundle needs
 * no CSS pipeline (the monorepo preset compiles this at build time; here the
 * plugin ships the compiled form directly).
 */
const css = ".OLnZsa_spinner{animation:.8s linear infinite OLnZsa_restart-spin}@keyframes OLnZsa_restart-spin{to{transform:rotate(360deg)}}.OLnZsa_acknowledgement{color:var(--dsw-alias-label-primary);cursor:pointer;align-items:center;gap:8px;margin-top:12px;font-size:13px;line-height:1.5;display:flex}.OLnZsa_acknowledgement input{width:16px;height:16px;accent-color:var(--dsw-alias-brand-primary);flex-shrink:0}.OLnZsa_failure{color:var(--dsw-alias-label-error,#d24b4b);cursor:pointer;background:none;border:none;padding:0 4px;font-size:12px;line-height:24px}"
const tagId = "@lovstudio/dsh-better-restart/RestartAction.module.css"
if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="' + tagId + '"]') === null) {
  const tag = document.createElement('style')
  tag.dataset.plugin = "@lovstudio/dsh-better-restart"
  tag.dataset.pluginCss = tagId
  tag.textContent = css
  document.head.appendChild(tag)
}
export default { spinner: "OLnZsa_spinner", acknowledgement: "OLnZsa_acknowledgement", failure: "OLnZsa_failure" }
