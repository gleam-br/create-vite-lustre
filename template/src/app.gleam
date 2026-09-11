import gleam/int
import lustre
import lustre/attribute as a
import lustre/effect
import lustre/element/html
import lustre/event

pub fn main() -> Nil {
  let assert Ok(_runtime) =
    lustre.application(init, update, view)
    |> lustre.start("#app", Nil)

  Nil
}

pub type Model {
  Model(counter: Int)
}

pub type Msg {
  Increment
  Decrement
  Reset
}

fn init(_) {
  #(Model(counter: 0), effect.none())
}

fn update(m: Model, msg: Msg) {
  case msg {
    Increment -> #(Model(counter: m.counter + 1), effect.none())
    Decrement -> #(Model(counter: m.counter - 1), effect.none())
    Reset -> #(Model(counter: 0), effect.none())
  }
}

fn view(m: Model) {
  html.div(
    [
      a.class(
        "w-full flex flex-col items-center justify-center p-4 selection:bg-fuchsia-500 selection:text-white",
      ),
    ],
    [
      html.div(
        [
          a.class(
            "w-full max-w-md p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-6",
          ),
        ],
        [
          html.div([a.class("flex items-center gap-2")], [
            html.span(
              [
                a.class(
                  "px-3 py-1 text-xs font-semibold rounded-full bg-fuchsia-950 text-fuchsia-400 border border-fuchsia-800/50",
                ),
              ],
              [html.text("Gleam")],
            ),
            html.span(
              [
                a.class(
                  "px-3 py-1 text-xs font-semibold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50",
                ),
              ],
              [html.text("Lustre")],
            ),
            html.span(
              [
                a.class(
                  "px-3 py-1 text-xs font-semibold rounded-full bg-violet-950 text-violet-400 border border-violet-800/50",
                ),
              ],
              [html.text("Vite")],
            ),
            html.span(
              [
                a.class(
                  "px-3 py-1 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50",
                ),
              ],
              [html.text("Tailwind v4")],
            ),
          ]),
          html.div([a.class("space-y-1")], [
            html.h1(
              [
                a.class(
                  "text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-400 via-pink-300 to-cyan-400 bg-clip-text text-transparent",
                ),
              ],
              [html.text("Vite + Lustre")],
            ),
            html.p(
              [a.class("text-sm text-neutral-400")],
              [html.text("Type-safe, fast and delightful web development")],
            ),
          ]),
          html.div(
            [
              a.class(
                "w-full py-8 px-6 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 flex flex-col items-center space-y-4",
              ),
            ],
            [
              html.span(
                [
                  a.class(
                    "text-6xl sm:text-7xl font-black tabular-nums tracking-tighter text-white drop-shadow",
                  ),
                ],
                [html.text(int.to_string(m.counter))],
              ),
              html.div([a.class("flex items-center gap-3")], [
                html.button(
                  [
                    a.class(
                      "w-12 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition-all text-xl font-bold text-neutral-200 cursor-pointer flex items-center justify-center border border-neutral-700/50 shadow-sm",
                    ),
                    event.on_click(Decrement),
                  ],
                  [html.text("-")],
                ),
                html.button(
                  [
                    a.class(
                      "px-4 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition-all text-sm font-medium text-neutral-300 cursor-pointer flex items-center justify-center border border-neutral-700/50 shadow-sm",
                    ),
                    event.on_click(Reset),
                  ],
                  [html.text("Reset")],
                ),
                html.button(
                  [
                    a.class(
                      "w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 active:scale-95 transition-all text-xl font-bold text-white cursor-pointer flex items-center justify-center shadow-lg shadow-fuchsia-950/50",
                    ),
                    event.on_click(Increment),
                  ],
                  [html.text("+")],
                ),
              ]),
            ],
          ),
          html.div([a.class("flex items-center gap-4 text-xs text-neutral-400 pt-2")], [
            html.a(
              [
                a.href("https://lustre.build"),
                a.target("_blank"),
                a.rel("noopener noreferrer"),
                a.class("hover:text-cyan-400 transition-colors underline underline-offset-4"),
              ],
              [html.text("Lustre Docs")],
            ),
            html.span([a.class("text-neutral-600")], [html.text("•")]),
            html.a(
              [
                a.href("https://gleam.run"),
                a.target("_blank"),
                a.rel("noopener noreferrer"),
                a.class("hover:text-fuchsia-400 transition-colors underline underline-offset-4"),
              ],
              [html.text("Gleam Docs")],
            ),
            html.span([a.class("text-neutral-600")], [html.text("•")]),
            html.a(
              [
                a.href("https://vite.dev"),
                a.target("_blank"),
                a.rel("noopener noreferrer"),
                a.class("hover:text-violet-400 transition-colors underline underline-offset-4"),
              ],
              [html.text("Vite Docs")],
            ),
          ]),
        ],
      ),
    ],
  )
}
