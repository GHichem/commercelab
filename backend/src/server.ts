import 'dotenv/config'

import cors from 'cors'
import express from 'express'

import {
  requireAdmin,
} from './auth/admin-auth.js'

import {
  adminAuthRouter,
} from './routes/admin-auth.js'

import {
  adminImagesRouter,
} from './routes/admin-images.js'

import {
  adminOrdersRouter,
} from './routes/admin-orders.js'

import {
  adminProductsRouter,
} from './routes/admin-products.js'

import {
  ordersRouter,
} from './routes/orders.js'

import {
  productsRouter,
} from './routes/products.js'

const app = express()

const PORT =
  Number(
    process.env.PORT ??
      3000,
  )

const FRONTEND_URL =
  process.env.FRONTEND_URL ??
  'http://localhost:5173'

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
)

app.use(express.json())

app.get(
  '/health',
  (_req, res) => {
    return res.json({
      status: 'ok',
      service:
        'commercelab-api',
    })
  },
)

/*
 * Public storefront
 */
app.use(
  '/products',
  productsRouter,
)

/*
 * Public checkout
 */
app.use(
  '/orders',
  ordersRouter,
)

/*
 * Admin authentication
 */
app.use(
  '/admin/auth',
  adminAuthRouter,
)

/*
 * Protect everything below /admin
 */
app.use(
  '/admin',
  requireAdmin,
)

app.use(
  '/admin',
  adminImagesRouter,
)

app.use(
  '/admin',
  adminProductsRouter,
)

app.use(
  '/admin',
  adminOrdersRouter,
)

app.listen(
  PORT,
  () => {
    console.log(
      `CommerceLab API running on http://localhost:${PORT}`,
    )
  },
)