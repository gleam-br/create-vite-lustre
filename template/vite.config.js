/** vite.config.js */

import { resolve } from 'path'
import { defineConfig } from "vite"

// plugins
import gleam from "vite-plugin-gleam"
import tailwind from "@tailwindcss/vite"

export default defineConfig({
  plugins: [gleam(), tailwind()],
  resolve: {
    alias: {
      '@gleam': resolve(__dirname, "./build/dev/javascript")
    }
  }
})
