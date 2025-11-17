import { defineConfig } from "bunup";
import { exports, unused } from 'bunup/plugins';

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  target: "node",
  clean: true,
  plugins: [exports(), unused()]
});
