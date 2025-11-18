# 🪄 Scaffolding Vite + Lustre + Gleam

Create project with [ViteJs](https://vite.dev/) + [Lustre](https://lustre.build/) and [Gleam](https://gleam.run) scaffold.

## Plugin

- [vite-plugin-gleam](https://github.com/gleam-br/vite-plugin-gleam)

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
