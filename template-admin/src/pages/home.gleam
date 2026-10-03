import gbr/ui/admin/components/logo
import gbr/ui/admin/components/profile
import gbr/ui/admin/components/sidebar
import gbr/ui/admin/template/home
import gbr/ui/admin/template/home/home_header
import gbr/ui/admin/template/home/home_sidebar
import gleam/option.{None, Some}
import lustre/attribute as a
import lustre/element.{type Element}
import lustre/element/html as h

pub type Msg {
  OnToggleSidebar
  OnSelectMenu(sidebar.Menu)
}

pub fn new(brand_logo) {
  let profile = profile.new("admin", "/avatar.png", profile.dropdown_new())
  let header = home_header.new(brand_logo) |> home_header.with_profile(profile)
  
  let menus = [
    sidebar.Item("dashboard", "/home", "Dashboard"),
    sidebar.Item("users", "/users", "Gestão de Usuários"),
  ]
  let sidebar_model = 
    home_sidebar.new()
    |> home_sidebar.with_logo(brand_logo)
    |> home_sidebar.with_menus(menus)
    |> home_sidebar.with_opened(True)
    |> home_sidebar.select("dashboard")

  home.new(header, sidebar_model)
}

pub fn update(model: home.Model, msg: Msg) -> home.Model {
  case msg {
    OnToggleSidebar -> home.with_sidebar_toggle(model)
    OnSelectMenu(menu) -> home.with_sidebar_select(model, menu)
  }
}

pub fn render(model: home.Model, to_msg: fn(Msg) -> msg) -> home.Render(msg) {
  home.render(model)
  |> home.with_on_sidebar(OnToggleSidebar |> to_msg)
  |> home.with_on_sidebar_select(fn(m) { OnSelectMenu(m) |> to_msg })
}

pub fn view(model: home.Model, to_msg: fn(Msg) -> msg) -> Element(msg) {
  let render_data = render(model, to_msg)

  let stat_card = fn(title: String, value: String, trend: String, is_up: Bool) {
    let trend_color = if is_up { "text-green-600 dark:text-green-400" } else { "text-red-600 dark:text-red-400" }
    h.div([a.class("bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700")], [
      h.h3([a.class("text-sm font-medium text-gray-500 dark:text-gray-400")], [h.text(title)]),
      h.div([a.class("mt-2 flex items-baseline gap-2")], [
        h.span([a.class("text-3xl font-semibold text-gray-900 dark:text-white")], [h.text(value)]),
        h.span([a.class("text-sm font-medium " <> trend_color)], [h.text(trend)])
      ])
    ])
  }

  let content =
    h.div([a.class("p-8")], [
      h.div([a.class("mb-8")], [
        h.h1([a.class("text-2xl font-bold text-gray-900 dark:text-white")], [
          h.text("Bem-vindo ao {{project_name}}!"),
        ]),
        h.p([a.class("mt-2 text-sm text-gray-500 dark:text-gray-400")], [
          h.text("Este é o seu dashboard administrativo consolidado."),
        ]),
      ]),
      h.div([a.class("grid grid-cols-1 md:grid-cols-3 gap-6")], [
        stat_card("Receita Mensal", "R$ 45.231,89", "↑ 12%", True),
        stat_card("Novos Usuários", "1,204", "↑ 4.5%", True),
        stat_card("Taxa de Churn", "2.1%", "↓ 0.3%", False)
      ]),
      h.div([a.class("mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-64 flex items-center justify-center")], [
        h.p([a.class("text-gray-400")], [h.text("Espaço reservado para Gráficos (Ex: ApexCharts via FFI)")])
      ])
    ])

  home.view(render_data, [content], [])
}
