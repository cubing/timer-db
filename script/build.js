import { build } from "esbuild";

await build({
  target: "es2020",
  logLevel: "info",
  minify: false,
  sourcemap: true,
  format: "esm",
  entryPoints: ["./src/targets/esm/index.ts"],
  outdir: "./dist/esm",
  bundle: true,
  splitting: true,
  external: ["crypto"],
});

await build({
  target: "es2020",
  logLevel: "info",
  minify: false,
  sourcemap: true,
  format: "esm",
  entryPoints: ["./src/targets/bundle-global/timer-db.bundle-global.ts"],
  outfile: "./dist/bundle-global/timer-db.bundle-global.js",
  bundle: true,
  splitting: false,
  external: ["crypto"],
});
