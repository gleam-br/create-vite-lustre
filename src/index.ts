/**
 *
 * Gleam template create ViteJs + Lustre + Gleam language.
 *
 */


import { resolve, dirname, basename, join } from "path"
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "fs"

import mri from "mri"
import { execa } from "execa"

import { name, version } from "../package.json"
import { deepMerge, sortDependencies } from "./utils"
import { fileURLToPath } from "url"

const DEFAULT_TARGET_DIR = `${name}-project`

enum Template {
  vanilla = 'vanilla',
  vue = 'vue',
  react = 'react',
  react_compiler = 'react-compiler',
  react_swc = 'react_swc',
  preact = 'preact',
  lit = 'lit',
  svelte = 'svelte',
  solid = 'solid',
  qwik = 'qwik',
}

enum LogLevel {
  none = "none",
  trace = "trace",
  debug = "debug",
  info = "info",
}

enum PackageManager {
  bun = "bun",
  npm = "npm",
  pnpm = "pnpm",
  yarn = "yarn",
}

interface Options {
  help: boolean, // show help
  template: Template,
  rolldown: boolean, // experimental rolldown
  overwrite: boolean // overwrite if already exist files
  immediate: boolean, // install now deps
  typescript: boolean,  // template is *.ts
  bin: {
    pm: PackageManager,
    gleam: string, // Where is gleam binary
  },
  dir: { // dirs
    cwd: string // process.cwd()
  },
  log: {
    level: LogLevel // log level
    time: boolean // if put date time
  }
}

type Argv = Partial<Options>

// New argv parser to mri lib
//
const newArgv = {
  boolean: [
    "help",
    "overwrite",
    "immediate",
    "rolldown",
    "typescript",
    "log.time",
  ],
  alias: {
    h: "help",
    t: "template",
    i: "immediate",
    r: "rolldown",
    f: "overwrite", //force
  },
  string: [
    "template",
    "bin.pm",
    "bin.gleam",
    "dir.cwd",
    "log.level",
  ],
}

async function main(argv: any): Promise<void> {
  // options from process.argv
  const options = mri<Argv>(argv, newArgv)

  // normalize options
  const {
    template,
    help,
    rolldown,
    overwrite,
    immediate,
    typescript,
    bin: { pm, gleam },
    dir: { cwd },
    log: { level, time }
  } = newOpt(options);

  // new log instance
  const log = logger(level, time)
  log(`STARTUP OK ${version} !`)

  try {
    const args: string[] = [
      "create",
      "vite",
    ]

    if (help) {
      args.push("-h")
      await runBin(log, cwd, pm, args)
      return;
    }

    args.push("--no-interactive")
    args.push("--template")
    args.push(
      typescript
        ? `${template}-ts`
        : template
    )

    if (immediate) {
      args.push("-i")
    }

    if (rolldown) {
      args.push("--rolldown")
    }

    if (overwrite) {
      args.push("--overwrite")
    }

    await runBin(log, cwd, pm, args)

    const targetDir = options._[0]
      ? formatTargetDir(String(options._[0]))
      : DEFAULT_TARGET_DIR

    const src = resolve(fileURLToPath(import.meta.url), "../..", "template")

    const dest = join(cwd, targetDir)
    const gleamName = basename(resolve(targetDir)).replace("-", "_")

    // gleam new
    await runBin(log, dest, gleam, [
      "--name",
      gleamName,
      "--skip-git",
      "--skip-github",
      "--template", "javascript",
      ".",
    ])

    // gleam add lustre
    await runBin(log, dest, gleam, [
      "add",
      "lustre",
    ])

    await copyFiles(src, dest)

  } catch (err) {
    log(`${JSON.stringify(err)}`, true)
    process.exit(1)
  }
}

async function copyFiles(src: string, dest: string): Promise<void> {
  const stats = statSync(src)

  if (stats.isDirectory()) {
    // skip node_module
    if (basename(src) === 'node_modules') {
      return
    }

    // mkdir subdirectories and copy files
    mkdirSync(dest, { recursive: true })

    for (const file of readdirSync(src)) {
      copyFiles(resolve(src, file), resolve(dest, file))
    }

    return
  }

  const filename = basename(src)
  const copiedPackageJson = await copyPackageJson(filename, src, dest)

  if (copiedPackageJson) {
    return
  }

  const copiedVsCode = copyVsCodeFiles(filename, src, dest)

  if (copiedVsCode) {
    return
  }

  dest = replaceHidden(filename, src, dest)
  const copiedGit = copyGitIgnore(filename, src, dest)

  if (copiedGit) {
    return
  }

  copyFileSync(src, dest)
}

async function copyPackageJson(filename: string, src: string, dest: string) {
  if (filename === 'package.json' && existsSync(dest)) {
    // merge instead of overwriting
    const existing = await import(dest);
    const newPackage = await import(src);
    // TODO: remove after test it
    // const existing = JSON.parse(readFileSync(dest, 'utf8'))
    // const newPackage = JSON.parse(readFileSync(src, 'utf8'))
    const pkg = sortDependencies(deepMerge(existing, newPackage))

    writeFileSync(dest, JSON.stringify(pkg, null, 2) + '\n')
    return true
  }

  return false
}

function replaceHidden(filename: string, src: string, dest: string): string {
  if (filename.startsWith('_')) {
    // rename `_file` to `.file`
    return resolve(dirname(dest), filename.replace(/^_/, '.'))
  }

  return dest
}

function copyGitIgnore(filename: string, src: string, dest: string): boolean {
  if (filename === '_gitignore' && existsSync(dest)) {
    // append to existing .gitignore
    const existing = readFileSync(dest, 'utf8')
    const newGitignore = readFileSync(src, 'utf8')

    writeFileSync(dest, existing + '\n' + newGitignore)
    return true
  }

  return false
}

function copyVsCodeFiles(filename: string, src: string, dest: string): boolean {
  if (filename === 'extensions.json' && existsSync(dest)) {
    // merge instead of overwriting
    const existing = JSON.parse(readFileSync(dest, 'utf8'))
    const newExtensions = JSON.parse(readFileSync(src, 'utf8'))
    const extensions = deepMerge(existing, newExtensions)
    writeFileSync(dest, JSON.stringify(extensions, null, 2) + '\n')
    return true
  }

  if (filename === 'settings.json' && existsSync(dest)) {
    // merge instead of overwriting
    const existing = JSON.parse(readFileSync(dest, 'utf8'))
    const newSettings = JSON.parse(readFileSync(src, 'utf8'))
    const settings = deepMerge(existing, newSettings)
    writeFileSync(dest, JSON.stringify(settings, null, 2) + '\n')

    return true
  }

  return false
}

async function runBin(
  log: any,
  cwd: string,
  bin: string,
  args: string[]
): Promise<void> {

  log(`$ ${bin} ${args.join(" ")}`)
  const res = await run(cwd, bin, args)

  log(`$ ${res.stdout}${res.stderr}`)
}

async function run(cwd: string, bin: string, args: string[]): Promise<any> {
  return await execa(bin, args, { cwd, encoding: "utf8", timeout: 5000 })
}

function newOpt(options: any | undefined): Options {
  // TODO: null to default normalize options
  return {
    template: Template.vanilla,
    help: false,
    rolldown: false,
    immediate: false,
    overwrite: false,
    typescript: false,
    bin: {
      pm: PackageManager.bun,
      gleam: "gleam"
    },
    dir: {
      cwd: process.cwd(),
    },
    log: {
      level: LogLevel.none,
      time: false,
    }
  }
}

export const logger = (level: string, time = false) => {
  const isNone = level === "none";
  const isTrace = level === "trace";
  const isDebug = isTrace || level === "debug";
  const isInfo = !isDebug;

  // console.log(msg)
  return (msg: string, error = false): void => {
    const isCmd = msg.startsWith("$ ");

    if ((isNone && !isCmd) || (!isTrace && msg.includes("skip"))) {
      return;
    }

    const prefix = msg.startsWith(":>") ? "[debug]" : "";

    if (!isCmd && !error && isInfo && prefix !== "") {
      return;
    }

    const prefixTime = time === true ? `${new Date().toISOString()}` : "";

    if (error) {
      console.error(`${prefixTime}[${name}]${prefix} ERROR | ${msg}`);
    }

    console.log(`${prefixTime}[${name}]${prefix} ${msg}`);
  }
}

function formatTargetDir(targetDir: string) {
  return targetDir.trim().replace(/\/+$/g, '')
}

// MAIN
//
main(process.argv.slice(2))
