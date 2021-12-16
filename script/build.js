import { barelyServe } from "barely-a-dev-server";

barelyServe({
  entryRoot: "src/targets/esm",
  outDir: "dist",
  port: 3000,
  dev: false,
  esbuildOptions: {
    external: ["crypto", "pouchdb"],
  },
});
