export function adminCookieOptions() {
  const isProduction =
    process.env.NODE_ENV ===
    'production'

  return {
    httpOnly: true,
    secure: isProduction,

    sameSite:
      isProduction
        ? ('none' as const)
        : ('lax' as const),

    maxAge:
      SESSION_DURATION_MS,

    path: '/',
  }
}