//#region src/index.ts
/** Cordis plugin name. */
const name = "better-restart";
/** Services the host half reads from the injected context. */
const inject = ["webServer", "agents"];
/** Absolute route reporting the running-conversation status. */
const STATUS_PATH = "/better-restart/status";
/** Absolute route triggering the application restart. */
const RESTART_PATH = "/better-restart";
/** Loader entry id of the root `cordis:include` mounted by `dsh-app-boot`. */
const ROOT_INCLUDE_ID = "include";
/**
* Resolve the loader entry whose reload rebuilds the whole application.
* @param ctx - cordis context that may carry the `loader` service.
* @returns the root include entry, or `undefined` when this app has no loader tree.
*/
function resolveRootInclude(ctx) {
	const loader = ctx.get("loader");
	if (loader === void 0) return void 0;
	try {
		return loader.resolve(ROOT_INCLUDE_ID);
	} catch {
		return;
	}
}
/** How long to wait for the accepted response's socket to close before recomposing anyway. */
const FLUSH_GRACE_MS = 1e3;
/**
* Tear down and re-load the root include, restarting every plugin under it.
*
* The caller's own fiber is inside that subtree, so this must run after the
* HTTP response is flushed and must not touch the disposed context afterwards
* — the captured `entry` belongs to the loader, which outlives the recompose.
*
* @param entry - the root include entry.
*/
async function recompose(entry) {
	await entry.update({ disabled: true });
	await entry.update({ disabled: null });
}
/**
* Run `start` once the accepted response has actually left the machine.
*
* Recomposing destroys the web server's sockets, so a response merely handed to
* `res.end()` is still lost in the kernel buffer and the browser reports a
* transport failure instead of the accepted restart. `Connection: close` makes
* the socket's own close event the flush signal; the grace timer keeps a client
* that holds the connection open from stalling the restart forever.
*
* @param res - the response already ended with the acceptance body.
* @param start - the restart to run once the response is out.
*/
function afterResponseFlushed(res, start) {
	let started = false;
	const run = () => {
		if (started) return;
		started = true;
		clearTimeout(grace);
		start();
	};
	const grace = setTimeout(run, FLUSH_GRACE_MS);
	grace.unref?.();
	res.socket?.once("close", run) ?? run();
}
/**
* Register the restart and status routes on the web server.
* @param ctx - cordis context carrying the webServer, agents, and loader services.
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
				const restart = ctx.get("appRestart");
				if (restart !== void 0) {
					await restart();
					res.writeHead(204).end();
					return;
				}
				const entry = resolveRootInclude(ctx);
				if (entry === void 0) {
					res.writeHead(503, {
						"Content-Type": "application/json",
						"Cache-Control": "no-store"
					});
					res.end(JSON.stringify({ error: "this DSH app provides neither an appRestart service nor a loader root include; restart the harness process yourself" }));
					return;
				}
				const logger = ctx.logger("better-restart");
				res.writeHead(202, {
					"Content-Type": "application/json",
					"Cache-Control": "no-store",
					Connection: "close"
				});
				res.end(JSON.stringify({ mode: "recompose" }));
				afterResponseFlushed(res, () => {
					recompose(entry).catch((error) => {
						logger.error("in-place recompose failed; the application tree may be down: %o", error);
					});
				});
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
