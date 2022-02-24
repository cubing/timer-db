import { barelyServe } from "barely-a-dev-server";

barelyServe({
  entryRoot: "src/targets/dev",
  port: 3000,
  esbuildOptions: {
    external: ["crypto"],
    banner: {
      js: `globalThis.global = globalThis;`,
    },
  },
});
