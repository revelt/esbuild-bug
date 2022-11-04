import esbuild from "esbuild";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
let name = path.basename(path.resolve("./"));
// CJS packages will have "-tbc" appended, so remove that
if (name.endsWith("-tbc")) {
  name = name.slice(0, -4);
}

const pkg = require(path.join(path.resolve("./"), `package.json`));

const isCJS = (str) => typeof str === "string" && str.endsWith(".cjs.js");

// bundle, but set dependencies as external
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

// ESM
if (
  (pkg.exports && (typeof pkg.exports === "string" || pkg.exports.default)) ||
  !pkg.type ||
  isCJS(pkg.main)
) {
  esbuild.buildSync({
    entryPoints: [path.join(path.resolve("./"), "src/main.ts")],
    platform: "node",
    format: "esm",
    bundle: true,
    define: { DEV: !!process.env.DEV },
    minify: !process.env.DEV,
    sourcemap: false,
    target: ["esnext"],
    outfile: path.join(path.resolve("../cjs-main/node_modules/esm-dep"), `dist/${name}.esm.js`),
    external,
  });
}

// CJS
if (isCJS(pkg.main)) {
  esbuild.buildSync({
    entryPoints: [path.join(path.resolve("./"), "src/main.ts")],
    platform: "node",
    format: "cjs",
    bundle: true,
    define: { DEV: !!process.env.DEV },
    sourcemap: false,
    target: ["esnext"],
    outfile: path.join(path.resolve("../cjs-main/node_modules/esm-dep"), `dist/${name}.cjs.js`),
    // no "external" - bundle everything
  });
}
