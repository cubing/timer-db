import { barelyServe } from "barely-a-dev-server";

barelyServe({
  entryRoot: "src",
  port: 3000,
  esbuildOptions: {
    external: ["crypto"],
  },
});
