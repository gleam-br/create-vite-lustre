/** vite.config.js */

import { defineConfig } from "vite"

// plugins
import gleam from "vite-plugin-gleam"
import tailwind from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react(), gleam(), tailwind()],
})
