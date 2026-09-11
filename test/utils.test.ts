import { describe, it, expect } from "vitest"
import { deepMerge, sortDependencies, sanitizeGleamName } from "../src/utils"

describe("utils", () => {
  describe("deepMerge", () => {
    it("merges objects recursively", () => {
      const target = { a: 1, b: { c: 2 } }
      const source = { b: { d: 3 }, e: 4 }
      const result = deepMerge(target, source)

      expect(result).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4,
      })
    })

    it("merges and deduplicates arrays", () => {
      const target = { items: [1, 2, 3] }
      const source = { items: [2, 3, 4, 5] }
      const result = deepMerge(target, source)

      expect(result.items).toEqual([1, 2, 3, 4, 5])
    })

    it("overwrites primitives with new values", () => {
      const target = { name: "old", count: 1 }
      const source = { name: "new", count: 2 }
      const result = deepMerge(target, source)

      expect(result).toEqual({ name: "new", count: 2 })
    })
  })

  describe("sortDependencies", () => {
    it("sorts dependencies alphabetically", () => {
      const pkg = {
        name: "test-pkg",
        dependencies: {
          "zebra": "^1.0.0",
          "apple": "^2.0.0",
          "banana": "^1.5.0",
        },
        devDependencies: {
          "vite": "^6.0.0",
          "bunup": "^0.15.0",
        },
      }

      const sorted = sortDependencies(pkg)

      expect(Object.keys(sorted.dependencies)).toEqual(["apple", "banana", "zebra"])
      expect(Object.keys(sorted.devDependencies)).toEqual(["bunup", "vite"])
    })

    it("preserves non-dependency fields untouched", () => {
      const pkg = {
        name: "test",
        version: "1.0.0",
        scripts: { build: "vite build" },
      }

      const sorted = sortDependencies(pkg)
      expect(sorted).toEqual(pkg)
    })
  })

  describe("sanitizeGleamName", () => {
    it("converts dashes to underscores", () => {
      expect(sanitizeGleamName("create-vite-lustre")).toBe("create_vite_lustre")
      expect(sanitizeGleamName("my-awesome-project")).toBe("my_awesome_project")
    })

    it("converts uppercase to lowercase", () => {
      expect(sanitizeGleamName("MyProject")).toBe("myproject")
      expect(sanitizeGleamName("React_Lustre_App")).toBe("react_lustre_app")
    })

    it("prefixes with app_ if starting with numbers or invalid characters", () => {
      expect(sanitizeGleamName("123project")).toBe("app_123project")
      expect(sanitizeGleamName("0_test")).toBe("app_0_test")
    })

    it("removes invalid characters and trims consecutive underscores", () => {
      expect(sanitizeGleamName("@my-scope/app!name")).toBe("my_scope_app_name")
      expect(sanitizeGleamName("___special___name___")).toBe("special_name")
    })

    it("handles empty or purely symbol inputs gracefully", () => {
      expect(sanitizeGleamName("")).toBe("app")
      expect(sanitizeGleamName("...")).toBe("app")
      expect(sanitizeGleamName("---")).toBe("app")
    })
  })
})
