/**
 *
 * Gleam template create ViteJs + Lustre + Gleam language.
 *
 */

import {
  resolve,
  dirname,
  basename,
  join,
  sep
} from "path"

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from "fs"

import { fileURLToPath } from "url"

import mri from "mri"

import { execa } from "execa"

import { name, version } from "../package.json"

import { deepMerge, sortDependencies } from "./utils"

/** Default timeout to exec 5 min */
const DEFAULT_TIMEOUT = 300000

/** Default dest template directory */
const DEFAULT_TARGET_DIR = `${name}-project`

const TEMPLATES = [
  // only vanilla and
  "vanilla",
  // react templates for now
  "react"
  // TODO: more support vite-create templates
]
/**
 * Options to create vite lustre project.
 */
interface Options {
  help: boolean, // show help
  template: string, // see vite-create templates
  rolldown: boolean, // experimental rolldown
  overwrite: boolean // overwrite if already exist files
  immediate: boolean,  // on finish run dev mode
  bin: {
    pm: string, // bun, npm, pnpm, yarn, etc
    gleam: string, // where is gleam binary
    timeout: number // exec timeout in ms
  },
  dir: { // dirs
    cwd: string // process.cwd()
  },
  log: {
    level: string // "info" | "debug" | "trace" | "none"
    time: boolean // if put date time
  }
}

/**
 * New argv parser to mri lib
 */
const newArgv = {
  alias: { h: "help" },
  boolean: [
    "help",
    "overwrite",
    "immediate",
    "rolldown",
    "log-time",
  ],
  string: [
    "template",
    "bin-pm",
    "bin-gleam",
    "bin-timeout",
    "dir-cwd",
    "log-level",
  ],
}

// options from process.argv
const ARGS = mri(process.argv.slice(2), newArgv)
// normalize options
const OPTS = newOpt(ARGS);
// where put scaffold
const TARGET = ARGS._[0]

/**
 * Main function
 */
async function main(): Promise<void> {
  const {
    template,
    help,
    rolldown,
    overwrite,
    immediate,
    bin: { pm, gleam, timeout },
    dir: { cwd },
    log: { level, time }
  } = OPTS;

  // new log instance
  const log = logger(level, time)
  log(`$ STARTUP v${version} OK !`)
  log(`|> log: ${level}`)
  log(`|> timeout: ${timeout}`)

  try {
    const args: string[] = []

    if (help) {
      args.push("-h")
      await runBin(log, cwd, pm, args)
      return;
    }

    // support template
    const isSupported = TEMPLATES.find(t => template.startsWith(t))

    if (!isSupported) {
      throw new Error(`Only support templates: '${TEMPLATES.join("' '")}'`)
    }

    // vite-create push args
    args.push("--no-interactive")
    args.push("--template")
    let _template = template

    if (template.endsWith("-ts")) {
      log(`$ WARN | Only template javascript supported for now, sorry...`)
      log(`$ WARN | Replacing template to javascript...`)

      _template = template.replace(/-ts$/, "")
    }

    args.push(_template)

    if (rolldown) {
      args.push("--rolldown")
    }

    if (overwrite) {
      args.push("--overwrite")
    }

    const targetDir = TARGET
      ? normalizeTargetDir(TARGET)
      : DEFAULT_TARGET_DIR

    log(`:> targetDir ${targetDir}`)

    if (existsSync(targetDir) && !isEmpty(targetDir) && !overwrite) {
      throw new Error(`Target dir is not empty!\n'${cwd}${sep}${targetDir}'`)
    }

    // run create-vite
    if (pm === "bun") {
      // bun works with target dir last arg
      args.push(targetDir)
      await runBin(log, cwd, pm, ["create", "vite", ...args])
    } else {
      // npm, etc works with target dir first arg and rest args after '--'
      await runBin(log, cwd, pm, ["create", "vite", targetDir, "--", ...args])
    }

    // src dir
    const src = resolve(fileURLToPath(import.meta.url), "../..", "template")
    log(`:> src ${src}`)

    // dest dir
    const dest = join(cwd, targetDir)
    log(`:> dest ${dest}`)

    // src template dir
    const srcTemplate = resolve(fileURLToPath(import.meta.url), "../..", `template-${_template}`)
    log(`:> template ${srcTemplate}`)

    // dest src dir
    const destSrc = resolve(dest, "src")
    log(`|> dest src ${destSrc}`)

    // remove unused example files
    const toRemove = [
      "../README.md",
      "counter.js",
      "javascript.svg",
      "style.css"
    ]
    toRemove
      .map(f => resolve(destSrc, f))
      .filter(f => {
        if (existsSync(f)) {
          log(`:> remove file ${f}`)
          return true
        }
        return false
      }).forEach(f => {
        try {
          rmSync(f)
          log(`:>> remove OK !`)
        } catch (err) {
          log(`:> remove error ${f}`)
        }
      })

    // gleam name
    const gleamName = basename(resolve(targetDir)).replaceAll("-", "_")

    // gleam new
    const gleamNewArgs = [
      "new",
      "--name",
      gleamName,
      "--skip-git",
      "--skip-github",
      "--template", "javascript",
      ".",
    ]
    await runBin(log, dest, gleam, gleamNewArgs)

    // gleam add lustre
    const gleamAddArgs = [
      "add",
      "lustre",
    ]
    await runBin(log, dest, gleam, gleamAddArgs)

    // copy files
    await copyFiles(log, gleamName, src, dest)

    // if exist copy template-${_template} files
    if (existsSync(srcTemplate)) {
      await copyFiles(log, gleamName, srcTemplate, dest)
    }

    // gleam build
    const gleamBuildArgs = [
      "build",
      "--target",
      "javascript",
      "--no-print-progress"
    ]
    await runBin(log, dest, gleam, gleamBuildArgs)

    // pm install
    const pmInstallArgs = [
      "install",
    ]
    await runBin(log, dest, pm, pmInstallArgs)

    // pm run build
    const pmRunBuildArgs = [
      "run",
      "build",
    ]
    await runBin(log, dest, pm, pmRunBuildArgs)

    if (immediate) {
      log('Starting dev server...')

      // move to target dir
      const pmRunDevArgs = [
        "run",
        "dev"
      ]
      await runBin(log, dest, pm, pmRunDevArgs, true)
    }

    log("$ FINISH OK !")
    process.exit(0)

  } catch (err) {
    log(`Create project vite lustre error!`, true)
    console.error(err)
    process.exit(1)
  }
}

/**
 * Copy template files to target dir
 * - log Log instance
 * - name Gleam project name
 * - src Source template files
 * - dest Target dir to scaffolding.
 */
async function copyFiles(log: any, name: string, src: string, dest: string): Promise<void> {
  const stats = statSync(src)

  if (stats.isDirectory()) {
    // skip node_module
    if (basename(src) === 'node_modules') {
      log(`|> skip node_modules`)
      return
    }

    // subdirectories and copy files
    log(`|> mkdir ${dest}`)
    mkdirSync(dest, { recursive: true })
    log(`|>> OK !`)

    log(`|> copy recursive`)
    for (const file of readdirSync(src)) {
      await copyFiles(log, name, resolve(src, file), resolve(dest, file))
    }

    log(`|>> copy recursive OK !`)
    return
  }

  const filename = basename(src)
  log(`:> copy ${filename}`)
  const copiedPackageJson = await copyPackageJson(filename, src, dest)

  if (copiedPackageJson) {
    log(`:> OK !`)
    return
  }

  const copiedVsCode = copyVsCodeFiles(filename, src, dest)

  if (copiedVsCode) {
    log(`:> OK !`)
    return
  }

  dest = replaceApp(filename, name, dest)
  dest = replaceHidden(filename, dest)
  const copiedGit = copyGitIgnore(filename, src, dest)

  if (copiedGit) {
    log(`:> OK !`)
    return
  }

  const copiedMain = copyMain(filename, name, src, dest)

  if (copiedMain) {
    log(`:> OK !`)
    return
  }

  copyFileSync(src, dest)
  log(`:> OK !`)
}

/**
 * Replace app.gleam to 'gleam project name.gleam' file
 */
function replaceApp(filename: string, gleamName: string, dest: string): string {
  if (filename === 'app.gleam') {
    // rename `app.gleam` to `${gleamName}.gleam`
    return resolve(dirname(dest), filename.replace('app', gleamName))
  }

  return dest
}
/**
 * Replace hidden files begin with '_' to '.'
 */
function replaceHidden(filename: string, dest: string): string {
  if (filename.startsWith('_')) {
    // rename `_file` to `.file`
    return resolve(dirname(dest), filename.replace(/^_/, '.'))
  }

  return dest
}

/**
 * Replace and copy 'main.js' import to 'app.gleam' normalized to gleam name.
 */
function copyMain(
  filename: string,
  gleamName: string,
  src: string,
  dest: string,
): boolean {

  if (
    // template vanilla
    filename === 'main.js'
    // template react and others
    || filename === "main.jsx"
  ) {
    const srcMain = readFileSync(src, 'utf8')
    const srcMainReplaced = srcMain.replace("./app.gleam", `./${gleamName}.gleam`)

    writeFileSync(dest, srcMainReplaced)
    return true
  }

  return false
}
/**
 * Copy package.json
 */
async function copyPackageJson(filename: string, src: string, dest: string) {
  if (filename === 'package.json' && existsSync(dest)) {
    // merge
    const existing = JSON.parse(readFileSync(dest, 'utf8'))
    const newPackage = JSON.parse(readFileSync(src, 'utf8'))
    const pkg = sortDependencies(deepMerge(existing, newPackage))

    writeFileSync(dest, JSON.stringify(pkg, null, 2) + '\n')
    return true
  }

  return false
}

/**
 * Copy .gitignore
 */
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

/**
 * Copy .vscode files
 */
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

/**
 * Run bin executable with args from cwd and log process
 */
async function runBin(
  log: any,
  cwd: string,
  bin: string,
  args: string[],
  noTimeout = false,
): Promise<void> {
  log(`$ ${bin} ${args.join(" ")}`)
  const { stderr, exitCode } = await run(cwd, bin, args, noTimeout)

  if (stderr) {
    console.error(stderr)
    process.exit(exitCode)
  }

  log(`:> RUN OK !`)
}

/**
 * New normalized options
 */
function newOpt(options: any | undefined): Options {
  // create-vite
  let template = typeof options.template === "string" && options.template !== ""
    ? options.template
    : "vanilla"
  const help = typeof options.help === "boolean"
    ? options.help
    : false
  const rolldown = typeof options.rolldown === "boolean"
    ? options.rolldown
    : false
  const overwrite = typeof options.overwrite === "boolean"
    ? options.overwrite
    : false
  let immediate = typeof options.immediate === "boolean"
    ? options.immediate
    : false
  // bin
  const pm = typeof options["bin-pm"] === 'string' && options["bin-pm"] !== ""
    ? options["bin-pm"]
    : getBinPmFromUserAgent()
  const gleam = typeof options["bin-gleam"] === "string" && options["bin-gleam"] !== ""
    ? options["bin-gleam"]
    : "gleam"
  const cwd = typeof options["dir-cwd"] === "string" && options["dir-cwd"] !== ""
    ? options["dir-cwd"]
    : process.cwd()
  const timeout = typeof options["timeout"] === "number" && options["timeout"] >= 0
    ? options["timeout"]
    : DEFAULT_TIMEOUT
  // log
  const level = typeof options["log-level"] === "string" && options["log-level"] !== ""
    ? options["log-level"]
    : "none"
  const time = typeof options["log-time"] === "boolean"
    ? options["log-time"]
    : false

  return {
    template,
    help,
    rolldown,
    overwrite,
    immediate,
    bin: {
      pm,
      gleam,
      timeout,
    },
    dir: {
      cwd,
    },
    log: {
      level,
      time,
    }
  }
}

/**
 * Exec command in child process asynchronous.
 *
 * return e.g. Promise<{
 *   command: "bun create vite --no-interactive --template vanilla create-vite-lustre-project",
 *   escapedCommand: "bun create vite --no-interactive --template vanilla create-vite-lustre-project",
 *   cwd: "C:\\work\\tools\\create-vite-lustre",
 *   durationMs: 220.2958,
 *   failed: false,
 *   timedOut: false,
 *   isCanceled: false,
 *   isGracefullyCanceled: false,
 *   isTerminated: false,
 *   isMaxBuffer: false,
 *   isForcefullyTerminated: false,
 *   exitCode: 0,
 *   stdout: "\u001b[90m└\u001b[39m  \u001b[31mOperation cancelled\u001b[39m\n",
 *   stderr: "",
 *   stdio: [ undefined, "\u001b[90m└\u001b[39m  \u001b[31mOperation cancelled\u001b[39m\n",
 *     ""
 *   ],
 *   ipcOutput: [],
 *   pipedFrom: [],
 * }>
 */
async function run(
  cwd: string,
  bin: string,
  args: string[],
  noTimeout = false,
): Promise<any> {
  const { bin: { timeout } } = OPTS
  const opts = !noTimeout && timeout > 0 ? { timeout } : { timeout: 0 }

  return await execa(bin, args, {
    cwd,
    encoding: "utf8",
    stdio: "inherit",
    ...opts
  })
}

/**
 * New log instance
 */
function logger(level: string, time = false) {
  const isNone = level === "none"
  const isTrace = level === "trace"
  const isDebug = isTrace || level === "debug"
  const isInfo = !isDebug

  return (msg: string, error = false): void => {
    const isCmd = msg.startsWith("$ ")

    if (isNone && !isCmd) {
      return
    }

    const prefixTrace = msg.startsWith("|>") ? "[trace]" : ""
    const prefixDebug = msg.startsWith(":>") ? "[debug]" : ""

    if (!isCmd && !error && (isDebug || isInfo) && prefixTrace !== "") {
      return
    }

    if (!isCmd && !error && isInfo && prefixDebug !== "") {
      return
    }

    const prefix = `${prefixTrace}${prefixDebug}`
    const prefixTime = time === true ? `${new Date().toISOString()}` : ""

    if (error) {
      console.error(`${prefixTime}[${name}]${prefix} ERROR | ${msg}`)
    }

    console.log(`${prefixTime}[${name}]${prefix} ${msg}`)
  }
}

/**
 * Normalize target dir, remove all '/'.
 */
function normalizeTargetDir(targetDir: string) {
  return targetDir.trim().replace(/\/+$/g, '')
}

/**
 * Get binary package manager from user agent (process.env.npm_config_user_agent)
 */
function getBinPmFromUserAgent(): string {
  const userAgent = process.env.npm_config_user_agent

  if (!userAgent) {
    return "bun"
  }

  const pkgSpec: any = userAgent.split(' ')[0]
  const pkgSpecArr = pkgSpec.split('/')

  return pkgSpecArr[0]
}

/**
 * Path dir is empty
 */
function isEmpty(path: string) {
  const files = readdirSync(path)
  return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

/**
 * MAIN
 */
main()
