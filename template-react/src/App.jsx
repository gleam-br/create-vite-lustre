import { useState, useEffect, useRef } from 'react'
import { main as startLustre } from './app.gleam'

function LustreContainer() {
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      try {
        startLustre()
      } catch (err) {
        console.error('Failed to start Lustre application:', err)
      }
    }
  }, [])

  return (
    <div className="w-full flex justify-center">
      <div id="app" className="w-full" />
    </div>
  )
}

export default function App() {
  const [reactCount, setReactCount] = useState(0)

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-fuchsia-500 selection:text-white">
      <div className="w-full max-w-4xl space-y-8 flex flex-col items-center">
        
        {/* Header Badges */}
        <header className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50">
            React 19
          </span>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-fuchsia-950 text-fuchsia-400 border border-fuchsia-800/50">
            Gleam
          </span>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-sky-950 text-sky-400 border border-sky-800/50">
            Lustre
          </span>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-violet-950 text-violet-400 border border-violet-800/50">
            Vite
          </span>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50">
            Tailwind v4
          </span>
        </header>

        {/* Hero Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            React + Lustre + Gleam
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-lg mx-auto">
            Type-safe Gleam architecture integrated seamlessly with modern React and Tailwind CSS v4.
          </p>
        </div>

        {/* Applications Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Lustre Application Card */}
          <section className="rounded-3xl bg-neutral-900/70 border border-neutral-800 p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-between">
            <div className="w-full text-center pb-4 border-b border-neutral-800/80">
              <span className="text-xs uppercase tracking-wider font-bold text-fuchsia-400">
                Gleam / Lustre Runtime
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Lustre Component</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Compiled from type-safe Gleam into web-standard TEA runtime
              </p>
            </div>
            
            <div className="w-full my-auto py-4">
              <LustreContainer />
            </div>

            <div className="w-full text-center text-xs text-neutral-500 pt-2 border-t border-neutral-800/60">
              Mounted safely inside React lifecycle
            </div>
          </section>

          {/* React Companion Card */}
          <section className="rounded-3xl bg-neutral-900/70 border border-neutral-800 p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-between space-y-6">
            <div className="w-full text-center pb-4 border-b border-neutral-800/80">
              <span className="text-xs uppercase tracking-wider font-bold text-cyan-400">
                React Runtime
              </span>
              <h2 className="text-xl font-bold text-white mt-1">React State Counter</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Showing seamless coexistence of React and Gleam state
              </p>
            </div>

            <div className="w-full py-8 px-6 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 flex flex-col items-center space-y-4 my-auto">
              <span className="text-6xl sm:text-7xl font-black tabular-nums tracking-tighter text-cyan-300 drop-shadow">
                {reactCount}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setReactCount((c) => c - 1)}
                  className="w-12 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition-all text-xl font-bold text-neutral-200 cursor-pointer flex items-center justify-center border border-neutral-700/50 shadow-sm"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setReactCount(0)}
                  className="px-4 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition-all text-sm font-medium text-neutral-300 cursor-pointer flex items-center justify-center border border-neutral-700/50 shadow-sm"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setReactCount((c) => c + 1)}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 transition-all text-xl font-bold text-white cursor-pointer flex items-center justify-center shadow-lg shadow-cyan-950/50"
                >
                  +
                </button>
              </div>
            </div>

            <div className="w-full text-center text-xs text-neutral-500 pt-2 border-t border-neutral-800/60">
              React useState in action
            </div>
          </section>

        </div>

        {/* Documentation Links Footer */}
        <footer className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-400 pt-4">
          <a
            href="https://react.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors underline underline-offset-4"
          >
            React Docs
          </a>
          <span className="text-neutral-600">•</span>
          <a
            href="https://lustre.build"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-400 transition-colors underline underline-offset-4"
          >
            Lustre Docs
          </a>
          <span className="text-neutral-600">•</span>
          <a
            href="https://gleam.run"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fuchsia-400 transition-colors underline underline-offset-4"
          >
            Gleam Docs
          </a>
          <span className="text-neutral-600">•</span>
          <a
            href="https://vite.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-violet-400 transition-colors underline underline-offset-4"
          >
            Vite Docs
          </a>
        </footer>

      </div>
    </main>
  )
}
