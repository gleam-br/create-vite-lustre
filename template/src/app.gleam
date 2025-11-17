import gleam/int

import lustre
import lustre/attribute as a
import lustre/effect
import lustre/element/html
import lustre/event

pub fn main() -> Nil {
  let assert Ok(_runtime) =
    lustre.application(init, update, view)
    |> lustre.start("body", Nil)

  Nil
}

type Model {
  Model(counter: Int)
}

type Msg {
  OnIncrement
}

fn init(_) {
  #(Model(counter: 0), effect.none())
}

fn update(m: Model, msg: Msg) {
  let Model(counter:) = m

  case msg {
    OnIncrement -> #(Model(counter + 1), effect.none())
  }
}

fn view(m: Model) {
  let Model(counter:) = m

  html.div([a.class("flex h-screen overflow-hidden bg-gray-100")], [
    html.div([], [
      html.h1([a.class("text-green-800 text-5xl")], [html.text("ola mundo")]),
      html.button(
        [a.class("p-2 ml-2 mt-2 bg-gray-300"), event.on_click(OnIncrement)],
        [
          html.text("Counter " <> int.to_string(counter)),
        ],
      ),
    ]),
  ])
}
