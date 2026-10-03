import gbr/ui/admin/api/client
import gbr/ui/admin/components/logo
import gbr/ui/admin/components/sidebar
import gbr/ui/admin/js/darkmode
import gbr/ui/admin/template/login as core_login
import lustre/effect as e
import lustre/element.{type Element}
import pages/home
import pages/login
import pages/users

// -----------------------------------------------------------------------------
// ADTs e Modelo
// -----------------------------------------------------------------------------

pub type Page {
  LoginPage(core_login.Model)
  HomePage(home.Model)
  UsersPage(users.Model)
}

pub type Msg {
  OnDarkmode
  LoginMsg(login.Msg)
  HomeMsg(home.Msg)
  UsersMsg(users.Msg)
  NavigateTo(String)
}

pub type Model {
  Model(api: client.Api, page: Page, darkmode: darkmode.DarkMode)
}

// -----------------------------------------------------------------------------
// Orquestração
// -----------------------------------------------------------------------------

fn create_logo() -> logo.Logo {
  logo.new("/icon-96x96.png") |> logo.with_href("/home")
}

pub fn init(api: client.Api) -> #(Model, e.Effect(Msg)) {
  let darkmode = darkmode.new() |> darkmode.from_media()
  let login_model = login.new(create_logo())
  let page = LoginPage(login_model)
  #(Model(api:, page:, darkmode:), e.none())
}

pub fn update(model: Model, msg: Msg) -> #(Model, e.Effect(Msg)) {
  case msg, model.page {
    OnDarkmode, _ -> {
      let darkmode = darkmode.toggle(model.darkmode)
      #(Model(..model, darkmode:), e.none())
    }

    NavigateTo("/home"), _ -> {
      let home_model = home.new(create_logo())
      #(Model(..model, page: HomePage(home_model)), e.none())
    }
    
    NavigateTo("/users"), _ -> {
      let users_model = users.new(create_logo())
      #(Model(..model, page: UsersPage(users_model)), e.none())
    }

    LoginMsg(login.OnSubmit), LoginPage(_) -> {
      let home_model = home.new(create_logo())
      #(Model(..model, page: HomePage(home_model)), e.none())
    }

    LoginMsg(login_msg), LoginPage(login_model) -> {
      let new_login = login.update(login_model, login_msg)
      #(Model(..model, page: LoginPage(new_login)), e.none())
    }

    HomeMsg(home.OnSelectMenu(menu)), _ -> {
      // Push State / History API would go here in a real app
      let path = case menu {
        sidebar.Item(href:, ..) -> href
        _ -> "/home"
      }
      // Delegate to NavigateTo
      let #(new_model, eff) = update(model, NavigateTo(path))
      // Update the visual selection in home model if we are staying on it
      let final_model = case new_model.page {
        HomePage(h_model) -> Model(..new_model, page: HomePage(home.update(h_model, home.OnSelectMenu(menu))))
        _ -> new_model
      }
      #(final_model, eff)
    }

    HomeMsg(home_msg), HomePage(home_model) -> {
      let new_home = home.update(home_model, home_msg)
      #(Model(..model, page: HomePage(new_home)), e.none())
    }
    
    UsersMsg(users.OnSelectMenu(menu)), _ -> {
      let path = case menu {
        sidebar.Item(href:, ..) -> href
        _ -> "/users"
      }
      let #(new_model, eff) = update(model, NavigateTo(path))
      let final_model = case new_model.page {
        UsersPage(u_model) -> Model(..new_model, page: UsersPage(users.update(u_model, users.OnSelectMenu(menu))))
        _ -> new_model
      }
      #(final_model, eff)
    }

    UsersMsg(users_msg), UsersPage(users_model) -> {
      let new_users = users.update(users_model, users_msg)
      #(Model(..model, page: UsersPage(new_users)), e.none())
    }

    _, _ -> #(model, e.none())
  }
}

pub fn view(model: Model) -> Element(Msg) {
  case model.page {
    LoginPage(login_model) -> {
      let render_data = login.render(login_model, LoginMsg, OnDarkmode)
      core_login.view(render_data, [], [])
    }
    HomePage(home_model) -> {
      // In a real app, the sidebar links would trigger NavigateTo.
      // For now we just render the home view.
      home.view(home_model, HomeMsg)
    }
    UsersPage(users_model) -> {
      users.view(users_model, UsersMsg)
    }
  }
}
