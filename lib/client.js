window.__ModuleLoader__.load({
	id: "@lovstudio/dsh-better-restart",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/locales.ts
		/** Locale namespace and copy for the better-restart settings action. */
		const NS = "better-restart-ui";
		const en = {
			restart: "Restart app",
			restarting: "Restarting…",
			restartFailed: "Restart failed — copy",
			copied: "Copied",
			confirmTitle: "Restart app?",
			confirmSafe: "This restarts the whole application and reloads the current tab.",
			confirmRunning: "{count} conversations are running; restarting interrupts them and discards their progress.",
			confirmUnavailable: "Unable to check running conversations; confirm none are running before continuing.",
			acknowledge: "I understand a restart interrupts running conversations.",
			cancel: "Cancel",
			confirm: "Restart",
			confirmNow: "Restart now"
		};
		const zh = {
			restart: "重启应用",
			restarting: "重启中…",
			restartFailed: "重启失败 — 复制",
			copied: "已复制",
			confirmTitle: "重启应用？",
			confirmSafe: "这会重新加载整个应用，并刷新当前页面。",
			confirmRunning: "有 {count} 个对话正在运行，重启会中断它们并丢弃进度。",
			confirmUnavailable: "无法检测运行中的对话；继续前请确认当前没有对话在运行。",
			acknowledge: "我确认会中断运行中的对话。",
			cancel: "取消",
			confirm: "重启",
			confirmNow: "立即重启"
		};
		//#endregion
		//#region src/client/styles.ts
		/**
		* Compiled RestartAction.module.css: injects the stylesheet once and exports the
		* hashed class map. Kept as a plain module so the standalone client bundle needs
		* no CSS pipeline (the monorepo preset compiles this at build time; here the
		* plugin ships the compiled form directly).
		*/
		const css = ".OLnZsa_spinner{animation:.8s linear infinite OLnZsa_restart-spin}@keyframes OLnZsa_restart-spin{to{transform:rotate(360deg)}}.OLnZsa_acknowledgement{color:var(--dsw-alias-label-primary);cursor:pointer;align-items:center;gap:8px;margin-top:12px;font-size:13px;line-height:1.5;display:flex}.OLnZsa_acknowledgement input{width:16px;height:16px;accent-color:var(--dsw-alias-brand-primary);flex-shrink:0}.OLnZsa_failure{color:var(--dsw-alias-label-error,#d24b4b);cursor:pointer;background:none;border:none;padding:0 4px;font-size:12px;line-height:24px}";
		const tagId = "@lovstudio/dsh-better-restart/RestartAction.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=\"" + tagId + "\"]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@lovstudio/dsh-better-restart";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var styles_default = {
			spinner: "OLnZsa_spinner",
			acknowledgement: "OLnZsa_acknowledgement",
			failure: "OLnZsa_failure"
		};
		//#endregion
		//#region src/client/RestartAction.tsx
		/**
		* Settings-header action that restarts the whole application in place. The
		* action opens a confirmation dialog that watches agent activity live: with
		* conversations running it reports the count and gates the restart behind an
		* explicit acknowledgement, without running conversations it lets the restart
		* straight through. The button disables with a spinner while the restart is in
		* flight.
		*/
		/** How long the restarting state lingers if the restart never lands. */
		const RESTARTING_TIMEOUT_MS = 15e3;
		/** How often the open dialog re-reads agent activity. */
		const STATUS_POLL_MS = 1500;
		/** How long the copy confirmation stays on the failure chip. */
		const COPIED_FEEDBACK_MS = 1500;
		/**
		* Render the restart action with its confirmation dialog and in-flight state.
		* @param props - localized copy, the restart call, and the status reader.
		* @returns the action button and its conditional confirmation dialog.
		*/
		function RestartAction({ t, restart, status }) {
			const [confirming, setConfirming] = (0, react.useState)(false);
			const [acknowledged, setAcknowledged] = (0, react.useState)(false);
			const [restarting, setRestarting] = (0, react.useState)(false);
			const [activity, setActivity] = (0, react.useState)();
			const [statusUnavailable, setStatusUnavailable] = (0, react.useState)(false);
			const [failure, setFailure] = (0, react.useState)(null);
			const [copied, setCopied] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (!confirming) return;
				let disposed = false;
				const poll = () => {
					status().then((value) => {
						if (disposed) return;
						setActivity(value);
						setStatusUnavailable(false);
					}, () => {
						if (!disposed) setStatusUnavailable(true);
					});
				};
				poll();
				const timer = setInterval(poll, STATUS_POLL_MS);
				return () => {
					disposed = true;
					clearInterval(timer);
				};
			}, [confirming, status]);
			const openConfirmation = () => {
				setAcknowledged(false);
				setConfirming(true);
			};
			const confirm = () => {
				setConfirming(false);
				setRestarting(true);
				setFailure(null);
				setCopied(false);
				restart().catch((reason) => {
					setRestarting(false);
					setFailure(reason instanceof Error ? reason.message : String(reason));
				});
				setTimeout(() => {
					setRestarting(false);
				}, RESTARTING_TIMEOUT_MS);
			};
			const running = activity?.running === true;
			const canConfirm = running ? acknowledged : true;
			const description = statusUnavailable ? t("confirmUnavailable") : running ? t("confirmRunning", { count: String(activity?.active ?? 0) }) : t("confirmSafe");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					size: "sm",
					disabled: restarting,
					icon: restarting ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLoadingOutline16, { className: styles_default.spinner }) : void 0,
					onClick: openConfirmation,
					children: restarting ? t("restarting") : t("restart")
				}),
				failure === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: styles_default.failure,
					title: failure,
					onClick: () => {
						(0, _deepseek_ai_dsh_client_ui_primitives.writeClipboard)(failure).then(() => {
							setCopied(true);
							setTimeout(() => {
								setCopied(false);
							}, COPIED_FEEDBACK_MS);
						});
					},
					children: copied ? t("copied") : t("restartFailed")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open: confirming,
					onClose: () => {
						setConfirming(false);
					},
					title: t("confirmTitle"),
					description,
					footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						onClick: () => {
							setConfirming(false);
						},
						children: t("cancel")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						disabled: !canConfirm,
						onClick: confirm,
						children: running ? t("confirmNow") : t("confirm")
					})] }),
					children: running ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: styles_default.acknowledgement,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: acknowledged,
							onChange: (event) => {
								setAcknowledged(event.currentTarget.checked);
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("acknowledge") })]
					}) : null
				})
			] });
		}
		//#endregion
		//#region src/client/index.ts
		/** Required services: the settings slot registry and the locale provider. */
		const inject = ["slots", "locale"];
		/** Absolute host routes mirroring the host half's paths. */
		const STATUS_PATH = "/better-restart/status";
		const RESTART_PATH = "/better-restart";
		/** How long a pending reload waits for the reconnected generation before it lapses. */
		const RELOAD_WINDOW_MS = 15e3;
		/** Set while a restart request is in flight; the reconnected generation reloads the tab. */
		let pendingReload = false;
		/** Read current Host activity through the plugin-owned status route. */
		async function readStatus() {
			const response = await fetch(STATUS_PATH, { headers: { Accept: "application/json" } });
			if (!response.ok) throw new Error(`better-restart.status failed: ${response.status} ${response.statusText}`);
			return response.json();
		}
		/** Request a restart and arm the reconnect-triggered page reload. */
		async function restart() {
			pendingReload = true;
			const lapse = setTimeout(() => {
				pendingReload = false;
			}, RELOAD_WINDOW_MS);
			const response = await fetch(RESTART_PATH, { method: "POST" }).catch((reason) => {
				pendingReload = false;
				clearTimeout(lapse);
				throw reason instanceof Error ? reason : new Error(String(reason));
			});
			if (response.ok) return;
			pendingReload = false;
			clearTimeout(lapse);
			const body = await response.json().catch(() => ({}));
			throw new Error(typeof body.error === "string" ? body.error : `better-restart failed: ${String(response.status)} ${response.statusText}`);
		}
		/**
		* Register the restart action in the settings header.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			const betterRestartUi = {
				status: readStatus,
				restart
			};
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "better-restart-ui: dictionary");
			ctx.effect(() => {
				const dispose = ctx.reflect.provide("betterRestartUi", betterRestartUi);
				return () => {
					dispose();
				};
			}, "better-restart-ui: shared restart service");
			ctx.on("connection/reset", () => {
				if (!pendingReload) return;
				pendingReload = false;
				window.location.reload();
			});
			ctx.slots.inject("settings.action", () => ctx.slots.register({
				name: "settings.action",
				id: "restart",
				order: 10,
				locale: NS,
				inject: () => ({
					status: betterRestartUi.status,
					restart: betterRestartUi.restart
				})
			}, RestartAction));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
