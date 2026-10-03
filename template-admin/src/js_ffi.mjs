export function get_env(name) {
  try {
    const value = import.meta.env[name];
    if (value === undefined) {
      return new Error();
    }
    return new Ok(value);
  } catch (e) {
    return new Error();
  }
}
