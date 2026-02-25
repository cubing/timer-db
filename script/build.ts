import { build } from "esbuild";

await build({
  target: "es2020",
  logLevel: "info",
  minify: false,
  sourcemap: true,
  format: "esm",
  entryPoints: ["./src/timer-db/index.ts"],
  outdir: "./dist/esm",
  bundle: true,
  splitting: true,
  external: ["crypto"],
  banner: {
    js: `globalThis.global = globalThis;`, // Workaround for some silly `pouchdb` dep.
  },
});
