# 🎓 Project: Vite + Lustre + Gleam language

[Gleam](https://gleam.run/) project with [lustre](https://lustre.build/) library and [vitejs](https://vite.dev/) with/or not [experimental rolldown](https://rolldown.rs/) runtime.

## Plugin

- [vite-plugin-gleam](https://github.com/gleam-br/vite-plugin-gleam)

## Gleam

```sh
gleam clean
gleam build
```

## Dev

```sh
bun install
bun run dev
```

## Build

```sh
bun run build
```

## Serve

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
