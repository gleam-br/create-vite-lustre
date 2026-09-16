import { describe, it, expect } from "vitest"
import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

describe("templates integrity", () => {
  const rootDir = resolve(__dirname, "..")

  it("includes template-react in root package.json files array", () => {
    const rootPkg = JSON.parse(readFileSync(resolve(rootDir, "package.json"), "utf8"))
    expect(rootPkg.files).toContain("template")
    expect(rootPkg.files).toContain("template-react")
    expect(rootPkg.version).toBe("0.1.9")
  })

  it("template/package.json uses vite-plugin-gleam ^0.1.9", () => {
    const pkg = JSON.parse(readFileSync(resolve(rootDir, "template/package.json"), "utf8"))
    expect(pkg.devDependencies["vite-plugin-gleam"]).toBe("^0.2.0")
  })

  it("template-react/package.json uses vite-plugin-gleam ^0.1.9 and react", () => {
    const pkgPath = resolve(rootDir, "template-react/package.json")
    expect(existsSync(pkgPath)).toBe(true)

    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
    expect(pkg.devDependencies["vite-plugin-gleam"]).toBe("^0.2.0")
    expect(pkg.dependencies["react"]).toBeDefined()
    expect(pkg.dependencies["react-dom"]).toBeDefined()
    expect(pkg.devDependencies["@vitejs/plugin-react"]).toBeDefined()
  })

  it("template/vite.config.js has @gleam alias and plugins", () => {
    const content = readFileSync(resolve(rootDir, "template/vite.config.js"), "utf8")
    expect(content).toContain("vite-plugin-gleam")
    expect(content).toContain("@tailwindcss/vite")
    expect(content).toContain("@gleam")
  })

  it("template-react/vite.config.js has @gleam alias, react plugin, and gleam plugin", () => {
    const content = readFileSync(resolve(rootDir, "template-react/vite.config.js"), "utf8")
    expect(content).toContain("@vitejs/plugin-react")
    expect(content).toContain("vite-plugin-gleam")
    expect(content).toContain("@tailwindcss/vite")
    expect(content).toContain("@gleam")
  })

  it("template/index.html mounts on #app", () => {
    const content = readFileSync(resolve(rootDir, "template/index.html"), "utf8")
    expect(content).toContain('id="app"')
    expect(content).toContain('/src/main.js')
  })

  it("template-react/index.html mounts on #root", () => {
    const content = readFileSync(resolve(rootDir, "template-react/index.html"), "utf8")
    expect(content).toContain('id="root"')
    expect(content).toContain('/src/main.jsx')
  })

  it("template-react has App.jsx, index.css and main.jsx", () => {
    expect(existsSync(resolve(rootDir, "template-react/src/App.jsx"))).toBe(true)
    expect(existsSync(resolve(rootDir, "template-react/src/index.css"))).toBe(true)
    expect(existsSync(resolve(rootDir, "template-react/src/main.jsx"))).toBe(true)

    const appContent = readFileSync(resolve(rootDir, "template-react/src/App.jsx"), "utf8")
    expect(appContent).toContain("./app.gleam")
    expect(appContent).toContain("startLustre")
  })
})
