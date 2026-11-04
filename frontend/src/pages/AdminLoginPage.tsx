import {
  type FormEvent,
  useState,
} from 'react'
import {
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  checkAdminSession,
  loginAdmin,
} from '../api/admin-auth'

export function AdminLoginPage() {
  const navigate =
    useNavigate()

  const location =
    useLocation()

  const [username, setUsername] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [error, setError] =
    useState<string | null>(
      null,
    )

  const [isLoading, setIsLoading] =
    useState(false)

  const [
    alreadyAuthenticated,
    setAlreadyAuthenticated,
  ] = useState(false)

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError(null)
    setIsLoading(true)

    try {
      await loginAdmin(
        username,
        password,
      )

      const from =
        (
          location.state as {
            from?: string
          } | null
        )?.from ??
        '/admin/products'

      navigate(
        from,
        {
          replace: true,
        },
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Login failed.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Simple check when component mounts.
  useState(() => {
    checkAdminSession()
      .then(
        setAlreadyAuthenticated,
      )
      .catch(() => {
        setAlreadyAuthenticated(
          false,
        )
      })
  })

  if (
    alreadyAuthenticated
  ) {
    return (
      <Navigate
        to="/admin/products"
        replace
      />
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ee] px-6 text-[#1c1c18]">
      <section className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c3b24]">
          CommerceLab
        </p>

        <h1 className="font-editorial mt-3 text-5xl">
          Admin login
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#69655e]">
          Manage products,
          stock and images.
        </p>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-8 space-y-5"
        >
          {error && (
            <div className="border border-[#b46a58] bg-[#f7ebe7] px-4 py-3 text-sm text-[#8c3b24]">
              {error}
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#69655e]">
              Username
            </span>

            <input
              value={
                username
              }
              onChange={(
                event,
              ) =>
                setUsername(
                  event.target
                    .value,
                )
              }
              autoComplete="username"
              className="w-full border border-[#cfc8bc] bg-[#fbf9f5] px-4 py-3 outline-none focus:border-[#1c1c18]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#69655e]">
              Password
            </span>

            <input
              type="password"
              value={
                password
              }
              onChange={(
                event,
              ) =>
                setPassword(
                  event.target
                    .value,
                )
              }
              autoComplete="current-password"
              className="w-full border border-[#cfc8bc] bg-[#fbf9f5] px-4 py-3 outline-none focus:border-[#1c1c18]"
            />
          </label>

          <button
            type="submit"
            disabled={
              isLoading
            }
            className="w-full border border-[#1c1c18] bg-[#1c1c18] px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {isLoading
              ? 'Signing in...'
              : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 border-t border-[#d8d2c8] pt-4 text-sm text-[#69655e]">
          Demo access:{' '}
          <strong>
            admin / admin
          </strong>
        </p>
      </section>
    </main>
  )
}