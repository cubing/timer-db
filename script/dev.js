import { barelyServe } from "barely-a-dev-server";

barelyServe({
  entryRoot: "src/dev",
  port: 3000,
  esbuildOptions: {
    external: ["crypto"],
    banner: {
      js: `globalThis.global = globalThis;`, // Workaround for some silly `pouchdb` dep.
    },
  },
});
