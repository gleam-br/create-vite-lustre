# 🪄 Scaffolding Vite + Lustre + Gleam

Create project with [ViteJs](https://vite.dev/) + [Lustre](https://lustre.build/) and [Gleam](https://gleam.run) scaffold.

🚧 **Work in progress** not production ready.
> Only javascript templates

## 🌸 Options

Using [bun](https://bun.com/):

```sh
bun create vite-lustre --overwrite --immediate --rolldown --template react my-first-project
```

Using [npm](https://npmjs.com/) or [others](https://pnpm.io/):

```sh
npm create vite-lustre my-first-project -- --overwrite --immediate --rolldown --template react
```

### Vite create

- `--help|-h`: Show help
- `--rolldown`: New vite bundler (experimental)
- `--immediate`: Run dev mode after finish
- `--overwrite`: Overwrite all target dir files (danger)
- `--template`: See [vite-create](https://github.com/vitejs/vite/tree/main/packages/create-vite#readme)
  - 💔 Only 'vanilla' and 'react' for now.

### Inner

- `--bin-gleam`: (string) where is binary gleam (default 'gleam')
- `--bin-pm`: (string) "bun", "npm", "pnpm", etc. (default userAgent or 'bun')
- `--bin-timeout`: (number) exec commands timeout (default 60000)
- `--log-level`: (string) "info" | "debug" | "trace" | "none" (default 'none')
- `--log-time`: (bool) If has date and time log (default false)
- `--dir-cwd`: (string) Path to root dir (default `process.cwd()`)

## How to

Help me:

```sh
bun create vite-lustre --help # or -h
```

Create `my-first-lustre`:

```sh
bun create vite-lustre my-first-lustre
cd my-first-lustre
```

Dev `my-first-lustre`:

```sh
bun install
bun run dev
```

Build `my-first-lustre`:

```sh
bun install
bun run build
```

## Serve `my-first-lustre`:

```ts
// Serving ./dist/index.html on localhost:3000
import {join} from "path"

const path = join(".", "dist", "index.html")
const file = Bun.file(path)
const port = 3000
const hostname = "0.0.0.0"

Bun.serve({
  port,
  hostname,
  fetch(req) {
    return new Response(file)
  },
  error(err) {
    console.error("Server error:", err);
    return new Response("Internal Server Error", { status: 500 });
  },
})

console.log(`Serving ${path} on 'http://${hostname}:${port}'!`);
```

## ✅ Plugin

- [vite-plugin-gleam](https://github.com/gleam-br/vite-plugin-gleam)

## 🌄 Roadmap

- [ ] Javascript templates
  - [x] vanilla
  - [x] react
  - [ ] ...others
- [ ] Typescript templates
  - [ ] ... all
- [ ] VSCode not auto-comple import gleam files
  [ ] ...Why?
