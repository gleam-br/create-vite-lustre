import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { existsSync, mkdirSync, rmSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { execa } from "execa"

const rootDir = resolve(__dirname, "..")
const scratchDir = resolve(rootDir, "scratch-test")

const hasGleam = await execa("gleam", ["--version"])
  .then(() => true)
  .catch(() => false)

describe("scaffold e2e", () => {
  beforeAll(async () => {
    // Ensure dist/index.js is built before running e2e tests
    if (!existsSync(resolve(rootDir, "dist/index.js"))) {
      await execa("bun", ["run", "build"], { cwd: rootDir })
    }

    if (existsSync(scratchDir)) {
      rmSync(scratchDir, { recursive: true, force: true })
    }
    mkdirSync(scratchDir, { recursive: true })
  })

  afterAll(() => {
    if (existsSync(scratchDir)) {
      rmSync(scratchDir, { recursive: true, force: true })
    }
  })

  it.skipIf(!hasGleam)(
    "generates a vanilla template project with proper structure and builds gleam",
    async () => {
      const targetName = "test-vanilla-app"
      const targetDir = resolve(scratchDir, targetName)

      // Run create-vite-lustre with bun in non-immediate mode
      await execa(
        "node",
        [
          resolve(rootDir, "index.js"),
          targetName,
          "--template",
          "vanilla",
          "--log-level",
          "debug",
          "--skip-install"
        ],
        {
          cwd: scratchDir,
          timeout: 120000,
        }
      )

      expect(existsSync(targetDir)).toBe(true)
      expect(existsSync(resolve(targetDir, "gleam.toml"))).toBe(true)
      expect(existsSync(resolve(targetDir, "src/test_vanilla_app.gleam"))).toBe(true)
      expect(existsSync(resolve(targetDir, "src/main.js"))).toBe(true)
      expect(existsSync(resolve(targetDir, "vite.config.js"))).toBe(true)

      const gleamContent = readFileSync(resolve(targetDir, "src/test_vanilla_app.gleam"), "utf8")
      expect(gleamContent).toContain('start("#app", Nil)')
      expect(gleamContent).toContain("Increment")
      expect(gleamContent).toContain("Decrement")
      expect(gleamContent).toContain("Reset")

      const mainJs = readFileSync(resolve(targetDir, "src/main.js"), "utf8")
      expect(mainJs).toContain("./test_vanilla_app.gleam")

      const pkg = JSON.parse(readFileSync(resolve(targetDir, "package.json"), "utf8"))
      expect(pkg.devDependencies["vite-plugin-gleam"]).toBe("^0.2.3")
      expect(pkg.dependencies["tailwindcss"]).toBeDefined()
    },
    180000
  )

  it.skipIf(!hasGleam)(
    "generates a react template project with App.jsx, no orphaned main.js, and valid configuration",
    async () => {
      const targetName = "test-react-app"
      const targetDir = resolve(scratchDir, targetName)

      // Run create-vite-lustre with bun for react template
      await execa(
        "node",
        [
          resolve(rootDir, "index.js"),
          targetName,
          "--template",
          "react",
          "--log-level",
          "debug",
          "--skip-install"
        ],
        {
          cwd: scratchDir,
          timeout: 120000,
        }
      )

      expect(existsSync(targetDir)).toBe(true)
      expect(existsSync(resolve(targetDir, "gleam.toml"))).toBe(true)
      expect(existsSync(resolve(targetDir, "src/test_react_app.gleam"))).toBe(true)
      expect(existsSync(resolve(targetDir, "src/App.jsx"))).toBe(true)
      expect(existsSync(resolve(targetDir, "src/main.jsx"))).toBe(true)
      expect(existsSync(resolve(targetDir, "src/index.css"))).toBe(true)

      // CRITICAL: verify that main.js was cleaned up and is NOT present
      expect(existsSync(resolve(targetDir, "src/main.js"))).toBe(false)

      const appJsx = readFileSync(resolve(targetDir, "src/App.jsx"), "utf8")
      expect(appJsx).toContain("./test_react_app.gleam")
      expect(appJsx).toContain("startLustre")

      const viteConfig = readFileSync(resolve(targetDir, "vite.config.js"), "utf8")
      expect(viteConfig).toContain("@vitejs/plugin-react")
      expect(viteConfig).toContain("vite-plugin-gleam")
      expect(viteConfig).toContain("@gleam")

      const indexHtml = readFileSync(resolve(targetDir, "index.html"), "utf8")
      expect(indexHtml).toContain('id="root"')
      expect(indexHtml).not.toContain('id="app"')

      const pkg = JSON.parse(readFileSync(resolve(targetDir, "package.json"), "utf8"))
      expect(pkg.dependencies["react"]).toBeDefined()
      expect(pkg.dependencies["react-dom"]).toBeDefined()
      expect(pkg.devDependencies["vite-plugin-gleam"]).toBe("^0.2.3")
    },
    180000
  )

  it.skipIf(!hasGleam)(
    "generates an admin template project with correct renames and protection removal",
    async () => {
      const targetName = "test-admin-app"
      const targetDir = resolve(scratchDir, targetName)

      // Run create-vite-lustre with bun for admin template
      await execa(
        "node",
        [
          resolve(rootDir, "index.js"),
          targetName,
          "--template",
          "admin",
          "--log-level",
          "debug",
          "--skip-install",
          "--skip-build"
        ],
        {
          cwd: scratchDir,
          timeout: 120000,
        }
      )

      expect(existsSync(targetDir)).toBe(true)
      expect(existsSync(resolve(targetDir, "gleam.toml"))).toBe(true)
      expect(existsSync(resolve(targetDir, "package.json"))).toBe(true)
      expect(existsSync(resolve(targetDir, "src/test_admin_app.gleam"))).toBe(true)
      
      // Verify protected suffix was removed
      expect(existsSync(resolve(targetDir, "gleam.toml_"))).toBe(false)
      expect(existsSync(resolve(targetDir, "package.json_"))).toBe(false)

      const gleamToml = readFileSync(resolve(targetDir, "gleam.toml"), "utf8")
      expect(gleamToml).toContain('name = "test_admin_app"')

      const pkg = JSON.parse(readFileSync(resolve(targetDir, "package.json"), "utf8"))
      expect(pkg.name).toBe("test_admin_app")
    },
    180000
  )
})
