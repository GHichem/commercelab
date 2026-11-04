import { Router } from 'express'

import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSessionToken,
  isAdminRequest,
} from '../auth/admin-auth.js'

export const adminAuthRouter =
  Router()

adminAuthRouter.post(
  '/login',
  (req, res) => {
    const {
      username,
      password,
    } = req.body

    const adminUsername =
      process.env.ADMIN_USERNAME ??
      'admin'

    const adminPassword =
      process.env.ADMIN_PASSWORD ??
      'admin'

    if (
      username !==
        adminUsername ||
      password !==
        adminPassword
    ) {
      return res
        .status(401)
        .json({
          message:
            'Invalid username or password.',
        })
    }

    const token =
      createAdminSessionToken()

    res.cookie(
      ADMIN_COOKIE_NAME,
      token,
      adminCookieOptions(),
    )

    return res.json({
      authenticated: true,
    })
  },
)

adminAuthRouter.get(
  '/me',
  (req, res) => {
    if (!isAdminRequest(req)) {
      return res
        .status(401)
        .json({
          authenticated: false,
        })
    }

    return res.json({
      authenticated: true,
    })
  },
)

adminAuthRouter.post(
  '/logout',
  (_req, res) => {
    res.clearCookie(
      ADMIN_COOKIE_NAME,
      {
        ...adminCookieOptions(),
        maxAge: undefined,
      },
    )

    return res.json({
      authenticated: false,
    })
  },
)