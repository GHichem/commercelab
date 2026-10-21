import { useEffect, useState } from 'react'
import { getHealth } from './api/health'

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...')

  useEffect(() => {
    async function checkBackend() {
      try {
        const data = await getHealth()

        setBackendStatus(
          `${data.service}: ${data.status}`
        )
      } catch {
        setBackendStatus('Backend unavailable')
      }
    }

    checkBackend()
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">
          Built by Hichem
        </p>

        <h1 className="text-4xl font-bold">
          CommerceLab
        </h1>

        <p className="mt-4 text-slate-300">
          A reliable online shop, built one feature at a time.
        </p>

        <div className="mt-6 rounded-lg bg-slate-800 p-4">
          <p className="text-sm text-slate-400">
            Backend status
          </p>

          <p className="mt-1 font-medium">
            {backendStatus}
          </p>
        </div>
      </section>
    </main>
  )
}

export default App