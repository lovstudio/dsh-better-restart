// ../../../手工川DSH实战/dsh-workspace/dsh-better-restart/src/index.ts
var name = "better-restart";
var inject = ["webServer", "agents"];
var STATUS_PATH = "/better-restart/status";
var RESTART_PATH = "/better-restart";
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
        res.end(JSON.stringify({ running: running.length > 0, active: running.length }));
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
export {
  RESTART_PATH,
  STATUS_PATH,
  apply,
  inject,
  name
};
