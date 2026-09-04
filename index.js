//#region src/index.ts
/** Cordis plugin name. */
const name = "better-restart";
/** Services the host half reads from the injected context. */
const inject = ["webServer", "agents"];
/** Absolute route reporting the running-conversation status. */
const STATUS_PATH = "/better-restart/status";
/** Absolute route triggering the launcher's application restart. */
const RESTART_PATH = "/better-restart";
/**
* Register the restart and status routes on the web server.
* @param ctx - cordis context carrying the webServer, agents, and appRestart services.
*/
function apply(ctx) {
	ctx.effect(() => {
		const removeStatus = ctx.webServer.register({
			kind: "exact",
			path: STATUS_PATH,
			handler: async (_req, res) => {
				const running = ctx.agents.list().filter((agent) => agent.status === "running");
				res.writeHead(200, {
					"Content-Type": "application/json",
					"Cache-Control": "no-store"
				});
				res.end(JSON.stringify({
					running: running.length > 0,
					active: running.length
				}));
			}
		});
		const removeRestart = ctx.webServer.register({
			kind: "exact",
			path: RESTART_PATH,
			handler: async (_req, res) => {
				await ctx.get("appRestart")?.();
				res.writeHead(204).end();
			}
		});
		return () => {
			removeStatus();
			removeRestart();
		};
	}, "better-restart: restart and status routes");
}
//#endregion
export { RESTART_PATH, STATUS_PATH, apply, inject, name };
