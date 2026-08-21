# @deepseek-ai/dsh-frontend-restart

DeepSeek Harness 前端插件：**一键原地重启整个应用**（含后端）。从浏览器设置页发起，无需手动停进程。

## 功能

- 设置页「重启应用」按钮 → 应用树 re-boot（dispose 当前 fiber + 重新 boot，PID 不变）
- 确认弹窗实时监测运行中的对话（`@Remote('status')`），有对话运行时需勾选确认，无运行直接放行
- 重启进行中按钮 loading + 防重复；完成后当前页自动刷新，不新开标签页

## 安装

插件以 **bundle** 形式安装到 DeepSeek Harness profile：

```sh
dsh plugin --profile web add @deepseek-ai/dsh-frontend-restart
dsh plugin --profile web add @deepseek-ai/dsh-frontend-restart-ui
```

浏览器侧 UI（按钮/弹窗）由 `dsh-frontend-restart-ui` 提供。

## 架构

- **host**：`packages/core/frontend-restart` — `FrontendRestartController`（`@Remote('restart')` 转发 launcher 的 `appRestart`；`@Remote('status')` 注入 `agents` 查询运行状态）
- **UI**：`packages/client/frontend-restart-ui` — 设置页重启按钮 + 确认弹窗 + loading

完整实现位于 `deepseek-harness` monorepo，本仓库为独立展示与发布入口：

- 上游：https://github.com/deepseek-ai/deepseek-harness
- 完整代码（含本插件）：https://github.com/lovstudio/deepseek-harness

## License

MIT
