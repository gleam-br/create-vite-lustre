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
  statSync,
  writeFileSync
} from "fs"

import { fileURLToPath } from "url"

import mri from "mri"

import { execa } from "execa"

import { name, version } from "../package.json"

import { deepMerge, sortDependencies } from "./utils"

/** Default dest template directory */
const DEFAULT_TARGET_DIR = `${name}-project`

/**
 * Options to create vite lustre project.
 */
interface Options {
  help: boolean, // show help
  template: string, // see vite-create templates
  rolldown: boolean, // experimental rolldown
  overwrite: boolean // overwrite if already exist files
  typescript: boolean,  // template is *.ts
  bin: {
    pm: string, // bun, npm, pnpm, yarn, etc
    gleam: string, // Where is gleam binary
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
  boolean: [
    "help",
    "overwrite",
    "immediate",
    "rolldown",
    "typescript",
    "log-time",
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
    "bin-pm",
    "bin-gleam",
    "dir-cwd",
    "log-level",
  ],
  defualt: {
    template: "vanilla",
    help: false,
    rolldown: false,
    immediate: false,
    overwrite: false,
    typescript: false,
  }
}

/**
 * Main function
 */
async function main(argv: any): Promise<void> {
  // options from process.argv
  const options = mri(argv, newArgv)
  // normalize options
  const opts = newOpt(options);
  const {
    template,
    help,
    rolldown,
    overwrite,
    typescript,
    bin: { pm, gleam },
    dir: { cwd },
    log: { level, time }
  } = opts;

  // new log instance
  const log = logger(level, time)
  log(`STARTUP v${version} OK !`)

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

    if (rolldown) {
      args.push("--rolldown")
    }

    if (overwrite) {
      args.push("--overwrite")
    }

    const targetDir = options._[0]
      ? normalizeTargetDir(String(options._[0]))
      : DEFAULT_TARGET_DIR

    log(`:> targetDir ${targetDir}`)

    if (existsSync(targetDir) && !isEmpty(targetDir) && !overwrite) {
      throw new Error(`Target dir is not empty!\n'${cwd}${sep}${targetDir}'`)
    }

    // run create-vite
    args.push(targetDir)
    await runBin(log, cwd, pm, args)

    const src = resolve(fileURLToPath(import.meta.url), "../..", "template")
    log(`:> srcDir ${src}`)

    const dest = join(cwd, targetDir)
    log(`:> destDir ${dest}`)

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

    await copyFiles(log, src, dest)

    // gleam build
    const gleamBuildArgs = [
      "build",
      "--target",
      "javascript",
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

    log("FINISH OK !")
    process.exit(0)

  } catch (err) {
    log(`Create vite lustre template error!`, true)
    console.error(err)
    process.exit(1)
  }
}

/**
 * Copy template files to target dir
 */
async function copyFiles(log: any, src: string, dest: string): Promise<void> {
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
      await copyFiles(log, resolve(src, file), resolve(dest, file))
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

  dest = replaceHidden(filename, src, dest)
  const copiedGit = copyGitIgnore(filename, src, dest)

  if (copiedGit) {
    log(`:> OK !`)
    return
  }

  copyFileSync(src, dest)
  log(`:> OK !`)
}

/**
 * Replace hidden files begin with '_' to '.'
 */
function replaceHidden(filename: string, src: string, dest: string): string {
  if (filename.startsWith('_')) {
    // rename `_file` to `.file`
    return resolve(dirname(dest), filename.replace(/^_/, '.'))
  }

  return dest
}

/**
 * Copy package.json
 */
async function copyPackageJson(filename: string, src: string, dest: string) {
  if (filename === 'package.json' && existsSync(dest)) {
    // merge instead of overwriting
    // const existing = await import(dest);
    // const newPackage = await import(src);
    // TODO: remove after test it
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
  args: string[]
): Promise<void> {
  log(`$ ${bin} ${args.join(" ")}`)
  const { stdout } = await run(cwd, bin, args)

  if (stdout) {
    console.log(stdout)
  }

  log(`:> RUN OK !`)
}

/**
 * New normalized options
 */
function newOpt(options: any | undefined): Options {
  const help = typeof options.help === "boolean"
    ? options.help
    : false
  const rolldown = typeof options.rolldown === "boolean"
    ? options.rolldown
    : false
  const overwrite = typeof options.overwrite === "boolean"
    ? options.overwrite
    : false
  const pm = typeof options["bin-pm"] === 'string' && options["bin-pm"] !== ""
    ? options["bin-pm"]
    : getBinPmFromUserAgent()
  const gleam = typeof options["bin-gleam"] === "string" && options["bin-gleam"] !== ""
    ? options["bin-gleam"]
    : "gleam"
  const cwd = typeof options["dir-cwd"] === "string" && options["dir-cwd"] !== ""
    ? options["dir-cwd"]
    : process.cwd()
  const level = typeof options["log-level"] === "string" && options["log-level"] !== ""
    ? options["log-level"]
    : "none"
  const time = typeof options["log-time"] === "boolean"
    ? options["log-time"]
    : false

  let template = typeof options.template === "string" && options.template !== ""
    ? options.template
    : "vanilla"
  let typescript = typeof options.typescript === "boolean"
    ? options.typescript
    : false

  if (template.endsWith("-ts")) {
    template = template.slice(0, template.length - 3)
    typescript = true
  }

  return {
    template,
    help,
    rolldown,
    overwrite,
    typescript,
    bin: {
      pm,
      gleam
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
async function run(cwd: string, bin: string, args: string[]): Promise<any> {
  return await execa(bin, args, { cwd, encoding: "utf8", timeout: 5000 })
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
main(process.argv.slice(2))
