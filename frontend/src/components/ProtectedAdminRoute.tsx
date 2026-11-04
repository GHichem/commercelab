import {
  useEffect,
  useState,
} from 'react'
import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import {
  checkAdminSession,
} from '../api/admin-auth'

export function ProtectedAdminRoute() {
  const location =
    useLocation()

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState<
    boolean | null
  >(null)

  useEffect(() => {
    checkAdminSession()
      .then(
        setIsAuthenticated,
      )
      .catch(() => {
        setIsAuthenticated(
          false,
        )
      })
  }, [])

  if (
    isAuthenticated === null
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ee] text-[#69655e]">
        Checking admin session...
      </main>
    )
  }

  if (
    !isAuthenticated
  ) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    )
  }

  return <Outlet />
}