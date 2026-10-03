import { defineConfig } from "vite";
import gleam from "vite-plugin-gleam";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  plugins: [gleam({ mock: { dir: "./mock", prefix: "/api" } }), tailwind()],
  build: {
    outDir: "./server/priv/static"
  }
});
