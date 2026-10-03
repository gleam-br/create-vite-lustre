import app
import gbr/ui/admin/api
import gleam/option.{None, Some}
import gleam/result
import gleam/uri
import lustre

// FFI para JS
@external(javascript, "./js_ffi.mjs", "get_env")
pub fn get_env(name: String) -> Result(String, Nil)

pub fn main() {
  // Inicialização básica do cliente API
  let api_uri_str =
    get_env("VITE_API_URL")
    |> result.unwrap("http://localhost:8080")

  let api_client =
    uri.parse(api_uri_str)
    |> result.map(api.create)
    |> result.unwrap(api.create(uri.empty))

  // Inicia o app Lustre
  let app = lustre.application(app.init, app.update, app.view)
  let assert Ok(_) = lustre.start(app, "body", api_client)

  Nil
}
