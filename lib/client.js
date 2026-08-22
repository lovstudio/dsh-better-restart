window.__ModuleLoader__.load({ id: "@lovstudio/dsh-better-restart", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../../手工川DSH实战/dsh-workspace/dsh-better-restart/src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// ../../../手工川DSH实战/dsh-workspace/dsh-better-restart/src/client/locales.ts
var NS = "better-restart-ui";
var en = {
  restart: "Restart app",
  restarting: "Restarting\u2026",
  confirmTitle: "Restart app?",
  confirmSafe: "This restarts the whole application and reloads the current tab.",
  confirmRunning: "{count} conversations are running; restarting interrupts them and discards their progress.",
  confirmUnavailable: "Unable to check running conversations; confirm none are running before continuing.",
  acknowledge: "I understand a restart interrupts running conversations.",
  cancel: "Cancel",
  confirm: "Restart",
  confirmNow: "Restart now"
};
var zh = {
  restart: "\u91CD\u542F\u5E94\u7528",
  restarting: "\u91CD\u542F\u4E2D\u2026",
  confirmTitle: "\u91CD\u542F\u5E94\u7528\uFF1F",
  confirmSafe: "\u8FD9\u4F1A\u91CD\u65B0\u52A0\u8F7D\u6574\u4E2A\u5E94\u7528\uFF0C\u5E76\u5237\u65B0\u5F53\u524D\u9875\u9762\u3002",
  confirmRunning: "\u6709 {count} \u4E2A\u5BF9\u8BDD\u6B63\u5728\u8FD0\u884C\uFF0C\u91CD\u542F\u4F1A\u4E2D\u65AD\u5B83\u4EEC\u5E76\u4E22\u5F03\u8FDB\u5EA6\u3002",
  confirmUnavailable: "\u65E0\u6CD5\u68C0\u6D4B\u8FD0\u884C\u4E2D\u7684\u5BF9\u8BDD\uFF1B\u7EE7\u7EED\u524D\u8BF7\u786E\u8BA4\u5F53\u524D\u6CA1\u6709\u5BF9\u8BDD\u5728\u8FD0\u884C\u3002",
  acknowledge: "\u6211\u786E\u8BA4\u4F1A\u4E2D\u65AD\u8FD0\u884C\u4E2D\u7684\u5BF9\u8BDD\u3002",
  cancel: "\u53D6\u6D88",
  confirm: "\u91CD\u542F",
  confirmNow: "\u7ACB\u5373\u91CD\u542F"
};

// ../../../手工川DSH实战/dsh-workspace/dsh-better-restart/src/client/RestartAction.tsx
var import_react = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// ../../../手工川DSH实战/dsh-workspace/dsh-better-restart/src/client/styles.ts
var css = ".OLnZsa_spinner{animation:.8s linear infinite OLnZsa_restart-spin}@keyframes OLnZsa_restart-spin{to{transform:rotate(360deg)}}.OLnZsa_acknowledgement{color:var(--dsw-alias-label-primary);cursor:pointer;align-items:center;gap:8px;margin-top:12px;font-size:13px;line-height:1.5;display:flex}.OLnZsa_acknowledgement input{width:16px;height:16px;accent-color:var(--dsw-alias-brand-primary);flex-shrink:0}";
var tagId = "@lovstudio/dsh-better-restart/RestartAction.module.css";
if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="' + tagId + '"]') === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "@lovstudio/dsh-better-restart";
  tag.dataset.pluginCss = tagId;
  tag.textContent = css;
  document.head.appendChild(tag);
}
var styles_default = { spinner: "OLnZsa_spinner", acknowledgement: "OLnZsa_acknowledgement" };

// ../../../手工川DSH实战/dsh-workspace/dsh-better-restart/src/client/RestartAction.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var RESTARTING_TIMEOUT_MS = 15e3;
var STATUS_POLL_MS = 1500;
function RestartAction({ t, restart, status }) {
  const [confirming, setConfirming] = (0, import_react.useState)(false);
  const [acknowledged, setAcknowledged] = (0, import_react.useState)(false);
  const [restarting, setRestarting] = (0, import_react.useState)(false);
  const [activity, setActivity] = (0, import_react.useState)();
  const [statusUnavailable, setStatusUnavailable] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    if (!confirming) return;
    let disposed = false;
    const poll = () => {
      void status().then(
        (value) => {
          if (disposed) return;
          setActivity(value);
          setStatusUnavailable(false);
        },
        () => {
          if (!disposed) setStatusUnavailable(true);
        }
      );
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
    restart();
    setTimeout(() => {
      setRestarting(false);
    }, RESTARTING_TIMEOUT_MS);
  };
  const running = activity?.running === true;
  const canConfirm = running ? acknowledged : true;
  const description = statusUnavailable ? t("confirmUnavailable") : running ? t("confirmRunning", { count: String(activity?.active ?? 0) }) : t("confirmSafe");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_dsh_client_ui_primitives.Button,
      {
        variant: "outline",
        size: "sm",
        disabled: restarting,
        icon: restarting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconLoadingOutline16, { className: styles_default.spinner }) : void 0,
        onClick: openConfirmation,
        children: restarting ? t("restarting") : t("restart")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_dsh_client_ui_primitives.Modal,
      {
        open: confirming,
        onClose: () => {
          setConfirming(false);
        },
        title: t("confirmTitle"),
        description,
        footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", onClick: () => {
            setConfirming(false);
          }, children: t("cancel") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "primary", disabled: !canConfirm, onClick: confirm, children: running ? t("confirmNow") : t("confirm") })
        ] }),
        children: running ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: styles_default.acknowledgement, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "checkbox",
              checked: acknowledged,
              onChange: (event) => {
                setAcknowledged(event.currentTarget.checked);
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("acknowledge") })
        ] }) : null
      }
    )
  ] });
}

// ../../../手工川DSH实战/dsh-workspace/dsh-better-restart/src/client/index.ts
var inject = ["slots", "locale"];
var STATUS_PATH = "/better-restart/status";
var RESTART_PATH = "/better-restart";
var RELOAD_WINDOW_MS = 15e3;
var pendingReload = false;
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "better-restart-ui: dictionary");
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
      status: async () => {
        const response = await fetch(STATUS_PATH, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`better-restart.status failed: ${response.status} ${response.statusText}`);
        return response.json();
      },
      restart: () => {
        pendingReload = true;
        setTimeout(() => {
          pendingReload = false;
        }, RELOAD_WINDOW_MS);
        void fetch(RESTART_PATH, { method: "POST" });
      }
    })
  }, RestartAction));
}
return module.exports; } });
