import lustre
import lustre/attribute as a
import lustre/effect
import lustre/element/html
import lustre/element/svg

pub fn app() -> Nil {
  let assert Ok(_runtime) =
    lustre.application(init, update, view)
    |> lustre.start("body", Nil)

  Nil
}

type Model {
  Model
}

type Msg

fn init(_) {
  #(Model, effect.none())
}

fn update(m: Model, _msg: Msg) {
  #(m, effect.none())
}

fn view(_m: Model) {
  html.div([a.class("app")], [
    html.header([], [
      html.img([
        a.width(125),
        a.height(125),
        a.alt("Logo"),
        a.class("logo"),
        a.src("/logo.svg"),
      ]),
      html.div([a.class("wrapper")], [
        html.div([a.class("greetings")], [
          html.h1([a.class("green")], [html.text("ola mundo")]),
          html.h3([], [
            html.text("You’ve successfully created a project with"),
            html.a([a.href("https://vite.dev"), a.target("_blank")], [
              html.text("Vite"),
            ]),
            html.a([a.href("https://lustre.build"), a.target("_blank")], [
              html.text("Lustre"),
            ]),
          ]),
        ]),
        html.style([a.attribute("scoped", "true")], welcome_styles),
      ]),
      html.main([], [
        html.style([a.attribute("scoped", "true")], welcome_item_styles),
        // the welcome
        welcome_item(svg_tool(), "This project is served and bundled with", [
          html.a(
            [
              a.href("https://vite.dev/guide/features.html"),
              a.rel("noopener"),
              a.target("_blank"),
            ],
            [html.text("Vite")],
          ),
          html.text("The recommended IDE setup is "),
          html.a(
            [
              a.href("https://code.visualstudio.com/"),
              a.rel("noopener"),
              a.target("_blank"),
            ],
            [html.text("VSCode")],
          ),
          html.text(" + "),
          html.a(
            [
              a.href("https://gleam.run/"),
              a.rel("noopener"),
              a.target("_blank"),
            ],
            [html.text("Gleam - Official")],
          ),
          html.text(
            ". If you need to test your components and web pages, check out ",
          ),
          html.a(
            [
              a.href("https://vitest.dev/"),
              a.rel("noopener"),
              a.target("_blank"),
            ],
            [html.text("Vitest")],
          ),
          html.text("and "),
          html.a(
            [
              a.href("https://www.cypress.io/"),
              a.rel("noopener"),
              a.target("_blank"),
            ],
            [html.text("Cypress")],
          ),
          html.text("/"),
          html.a(
            [
              a.href("https://playwright.dev/"),
              a.rel("noopener"),
              a.target("_blank"),
            ],
            [html.text("Playwright")],
          ),
        ]),
      ]),
    ]),
  ])
}

fn welcome_item(svg, title, inner) {
  html.div([a.class("item")], [
    html.i([], [svg]),
    html.h3([], [html.text(title)]),
    ..inner
  ])
}

fn svg_tool() {
  html.svg(
    [
      a.aria_hidden(True),
      a.role("img"),
      a.class("iconify iconify-mdi"),
      a.width(24),
      a.height(24),
    ],
    [
      svg.path([
        a.attribute("fill", "currentColor"),
        a.attribute(
          "d",
          "M20 18v-4h-3v1h-2v-1H9v1H7v-1H4v4h16M6.33 8l-1.74 4H7v-1h2v1h6v-1h2v1h2.41l-1.74-4H6.33M9 5v1h6V5H9m12.84 7.61c.1.22.16.48.16.8V18c0 .53-.21 1-.6 1.41c-.4.4-.85.59-1.4.59H4c-.55 0-1-.19-1.4-.59C2.21 19 2 18.53 2 18v-4.59c0-.32.06-.58.16-.8L4.5 7.22C4.84 6.41 5.45 6 6.33 6H7V5c0-.55.18-1 .57-1.41C7.96 3.2 8.44 3 9 3h6c.56 0 1.04.2 1.43.59c.39.41.57.86.57 1.41v1h.67c.88 0 1.49.41 1.83 1.22l2.34 5.39z",
        ),
      ]),
    ],
  )
}

const welcome_styles = "
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
"

const welcome_item_styles = "
.item {
  margin-top: 2rem;
  display: flex;
  position: relative;
}

.details {
  flex: 1;
  margin-left: 1rem;
}

i {
  display: flex;
  place-items: center;
  place-content: center;
  width: 32px;
  height: 32px;

  color: var(--color-text);
}

h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: var(--color-heading);
}

@media (min-width: 1024px) {
  .item {
    margin-top: 0;
    padding: 0.4rem 0 1rem calc(var(--section-gap) / 2);
  }

  i {
    top: calc(50% - 25px);
    left: -26px;
    position: absolute;
    border: 1px solid var(--color-border);
    background: var(--color-background);
    border-radius: 8px;
    width: 50px;
    height: 50px;
  }

  .item:before {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    bottom: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .item:after {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    top: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .item:first-of-type:before {
    display: none;
  }

  .item:last-of-type:after {
    display: none;
  }
}
"
