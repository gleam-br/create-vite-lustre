import gbr/ui/admin/components/hero
import gbr/ui/admin/components/input
import gbr/ui/admin/components/input/checkbox
import gbr/ui/admin/components/logo
import gbr/ui/admin/template/login
import gbr/ui/admin/template/login/form
import gbr/ui/admin/template/login/title
import gleam/option.{None, Some}

pub type Msg {
  OnUsername(String)
  OnPassword(String)
  OnPasswordVisible
  OnKeepLogged
  OnSubmit
}

pub fn new(brand_logo) {
  let hero = hero.new()
  let title = title.new(brand_logo, "Entrar no {{project_name}}")
  let form = form.new("Continuar")

  login.new(hero, title, form)
}

pub fn update(model: login.Model, msg: Msg) -> login.Model {
  case msg {
    OnUsername(value) -> {
      let updated_username =
        model.form.username
        |> input.with_value(value)
        |> input.with_valid(True)
      login.with_form_username_input(model, updated_username)
    }
    OnPassword(value) -> {
      let updated_password =
        model.form.password
        |> input.with_value(value)
        |> input.with_valid(True)
      login.with_form_password_input(model, updated_password)
    }
    OnPasswordVisible -> login.with_form_password_visible_toggle(model)
    OnKeepLogged -> login.with_form_keep_logged_toggle(model)
    OnSubmit -> model
  }
}

pub fn render(
  model: login.Model,
  to_msg: fn(Msg) -> msg,
  on_darkmode,
) -> login.Render(msg) {
  login.render(model, Some(on_darkmode), None)
  |> login.with_on_username(fn(v) { OnUsername(v) |> to_msg })
  |> login.with_on_password(fn(v) { OnPassword(v) |> to_msg })
  |> login.with_on_password_visible(OnPasswordVisible |> to_msg)
  |> login.with_on_keep_logged(OnKeepLogged |> to_msg)
  |> login.with_on_submit(OnSubmit |> to_msg)
}
