# @deepseek-ai/dsh-better-restart（+ dsh-better-restart-ui）

DeepSeek Harness 前端插件：**一键原地重启整个应用**（含后端）。从浏览器设置页发起，无需手动停进程。

本仓库是「重启」插件的**单一入口**，bundle 两个 npm 包：

| npm 包 | 角色 |
|---|---|
| `@deepseek-ai/dsh-better-restart` | host 半：`FrontendRestartController`（`@Remote('restart')` 转发 launcher 的 `appRestart`；`@Remote('status')` 注入 `agents` 查询运行状态） |
| `@deepseek-ai/dsh-better-restart-ui` | 浏览器 UI 半：设置页重启按钮、确认弹窗、运行状态实时监测、重启中 loading |

## 功能

- 设置页「重启应用」按钮 → 应用树 re-boot（dispose 当前 fiber + 重新 boot，PID 不变）
- 确认弹窗实时监测运行中的对话（`@Remote('status')`，1.5s 轮询）：有对话运行时需勾选确认，无运行直接放行
- 重启进行中按钮 loading + 防重复；完成后当前页自动刷新，不新开标签页

## 安装

两个包一起安装（bundle patch 各自注册进 profile）：

```sh
dsh plugin --profile web add @deepseek-ai/dsh-better-restart
dsh plugin --profile web add @deepseek-ai/dsh-better-restart-ui
```

安装后浏览器「设置」页头出现「重启应用」按钮。

## 架构

完整实现位于 `deepseek-harness` monorepo：`packages/core/better-restart`（host）与 `packages/client/better-restart-ui`（UI）。本仓库为独立展示与发布入口：

- 上游：https://github.com/deepseek-ai/deepseek-harness
- 完整代码（含本插件）：https://github.com/lovstudio/deepseek-harness

## License

MIT
