import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"

// plugins
import gleam from "vite-plugin-gleam"
import tailwind from "@tailwindcss/vite"

const projectRoot = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  plugins: [gleam(), tailwind()],
  resolve: {
    alias: {
      "@gleam": resolve(projectRoot, "./build/dev/javascript")
    }
  },
  build: {
    rolldownOptions: {
      checks: {
        invalidAnnotation: false
      }
    }
  }
})
