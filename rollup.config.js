import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import svgr from "@svgr/rollup";
import url from "@rollup/plugin-url";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "esm",
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript({
      typescript: require("typescript"),
    }),
    postcss({ plugins: [] }),
    url(),
    svgr(),
    commonjs(),
    nodeResolve(),
  ],
};
