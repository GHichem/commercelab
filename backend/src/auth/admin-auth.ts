import crypto from 'node:crypto'
import type {
  NextFunction,
  Request,
  Response,
} from 'express'

export const ADMIN_COOKIE_NAME =
  'commercelab_admin'

const SESSION_DURATION_MS =
  8 * 60 * 60 * 1000

type AdminSession = {
  role: 'admin'
  expiresAt: number
}

function getSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET

  if (!secret) {
    throw new Error(
      'ADMIN_SESSION_SECRET is missing',
    )
  }

  return secret
}

export function createAdminSessionToken() {
  const payload: AdminSession = {
    role: 'admin',
    expiresAt:
      Date.now() +
      SESSION_DURATION_MS,
  }

  const encodedPayload =
    Buffer.from(
      JSON.stringify(payload),
    ).toString('base64url')

  const signature =
    crypto
      .createHmac(
        'sha256',
        getSessionSecret(),
      )
      .update(encodedPayload)
      .digest('base64url')

  return `${encodedPayload}.${signature}`
}

export function isAdminRequest(
  req: Request,
) {
  const cookies =
    parseCookies(
      req.headers.cookie ?? '',
    )

  const token =
    cookies[
      ADMIN_COOKIE_NAME
    ]

  if (!token) {
    return false
  }

  return verifyAdminSessionToken(
    token,
  )
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!isAdminRequest(req)) {
    return res.status(401).json({
      message: 'Unauthorized.',
    })
  }

  next()
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure:
      process.env.NODE_ENV ===
      'production',
    sameSite: 'lax' as const,
    maxAge:
      SESSION_DURATION_MS,
    path: '/',
  }
}

function verifyAdminSessionToken(
  token: string,
) {
  try {
    const [
      encodedPayload,
      receivedSignature,
    ] = token.split('.')

    if (
      !encodedPayload ||
      !receivedSignature
    ) {
      return false
    }

    const expectedSignature =
      crypto
        .createHmac(
          'sha256',
          getSessionSecret(),
        )
        .update(encodedPayload)
        .digest('base64url')

    if (
      !safeEqual(
        receivedSignature,
        expectedSignature,
      )
    ) {
      return false
    }

    const payload =
      JSON.parse(
        Buffer.from(
          encodedPayload,
          'base64url',
        ).toString('utf8'),
      ) as AdminSession

    return (
      payload.role === 'admin' &&
      payload.expiresAt >
        Date.now()
    )
  } catch {
    return false
  }
}

function parseCookies(
  cookieHeader: string,
) {
  const cookies:
    Record<string, string> = {}

  cookieHeader
    .split(';')
    .forEach((cookie) => {
      const separator =
        cookie.indexOf('=')

      if (separator === -1) {
        return
      }

      const key =
        cookie
          .slice(
            0,
            separator,
          )
          .trim()

      const value =
        cookie
          .slice(
            separator + 1,
          )
          .trim()

      cookies[key] =
        decodeURIComponent(
          value,
        )
    })

  return cookies
}

function safeEqual(
  first: string,
  second: string,
) {
  const firstBuffer =
    Buffer.from(first)

  const secondBuffer =
    Buffer.from(second)

  if (
    firstBuffer.length !==
    secondBuffer.length
  ) {
    return false
  }

  return crypto.timingSafeEqual(
    firstBuffer,
    secondBuffer,
  )
}