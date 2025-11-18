/** Counter vite + lustre + gleam example */
import './style.css'

import viteLogo from '/vite.svg'
import gleamBrLogo from '../assets/logo.svg'

import javascriptLogo from './javascript.svg'
import lustreLogo from './lustre-logo.png'

import { setup_counter } from './counter.gleam'

export function main() {
  document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://lustre.build" target="_blank">
      <img src="${lustreLogo}" class="logo vanilla" alt="Lustre logo" />
    </a>
    <a href="https://github.com/gleam-br" target="_blank">
      <img src="${gleamBrLogo}" class="logo vanilla" alt="Gleam BR logo" />
    </a>
    <a href="https://developer.mozilla.org/pt-BR/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="Javascript logo" />
    </a>
    <h1>Vite + Lustre + Gleam + Javascript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and Javascript logos to learn more
    </p>
  </div>
`

  setup_counter(document.querySelector('#counter'))
}
