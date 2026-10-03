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
  OnUsersLoaded
}

pub type User {
  User(id: Int, name: String, email: String, role: String, status: String)
}

pub type Model {
  Model(
    layout: home.Model,
    users: List(User),
  )
}

pub fn new(brand_logo: logo.Logo) -> Model {
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
    |> home_sidebar.select("users")

  let layout = home.new(header, sidebar_model)

  // Mocked users
  let users = [
    User(1, "Alice Smith", "alice@example.com", "Admin", "Active"),
    User(2, "Bob Jones", "bob@example.com", "Editor", "Offline"),
    User(3, "Carol White", "carol@example.com", "Viewer", "Active"),
  ]

  Model(layout:, users:)
}

pub fn update(model: Model, msg: Msg) -> Model {
  case msg {
    OnToggleSidebar -> Model(..model, layout: home.with_sidebar_toggle(model.layout))
    OnSelectMenu(menu) -> Model(..model, layout: home.with_sidebar_select(model.layout, menu))
    OnUsersLoaded -> model
  }
}

pub fn render_layout(model: Model, to_msg: fn(Msg) -> msg) -> home.Render(msg) {
  home.render(model.layout)
  |> home.with_on_sidebar(OnToggleSidebar |> to_msg)
  |> home.with_on_sidebar_select(fn(m) { OnSelectMenu(m) |> to_msg })
}

pub fn view(model: Model, to_msg: fn(Msg) -> msg) -> Element(msg) {
  let render_data = render_layout(model, to_msg)

  let header = h.div([a.class("flex justify-between items-center mb-6")], [
    h.h1([a.class("text-2xl font-semibold text-gray-800 dark:text-white")], [h.text("Gestão de Usuários")]),
    h.button([a.class("bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors")], [h.text("+ Novo Usuário")])
  ])

  let thead = h.thead([a.class("bg-gray-50 dark:bg-gray-800")], [
    h.tr([], [
      h.th([a.class("px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider")], [h.text("Nome")]),
      h.th([a.class("px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider")], [h.text("Email")]),
      h.th([a.class("px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider")], [h.text("Papel")]),
      h.th([a.class("px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider")], [h.text("Status")])
    ])
  ])

  let tbody = h.tbody([a.class("bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700")], 
    gleam/list.map(model.users, fn(u) {
      let status_color = case u.status {
        "Active" -> "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
        _ -> "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      }
      h.tr([], [
        h.td([a.class("px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white")], [h.text(u.name)]),
        h.td([a.class("px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400")], [h.text(u.email)]),
        h.td([a.class("px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400")], [h.text(u.role)]),
        h.td([a.class("px-6 py-4 whitespace-nowrap")], [
          h.span([a.class("px-2 inline-flex text-xs leading-5 font-semibold rounded-full " <> status_color)], [h.text(u.status)])
        ])
      ])
    })
  )

  let table_container = h.div([a.class("shadow overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg")], [
    h.table([a.class("min-w-full divide-y divide-gray-200 dark:divide-gray-700")], [thead, tbody])
  ])

  let content = h.div([a.class("p-6")], [header, table_container])

  home.view(render_data, [content], [])
}
