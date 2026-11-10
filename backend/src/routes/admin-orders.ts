import { Router } from 'express'

import { db } from '../prisma/db.js'

export const adminOrdersRouter = Router()

const allowedStatuses = [
  'confirmed',
  'processing',
  'shipped',
  'cancelled',
] as const

type OrderStatus =
  (typeof allowedStatuses)[number]

adminOrdersRouter.get(
  '/orders',
  async (_req, res) => {
    try {
      const orders =
        await db.orm.public.Order.all()

      const sortedOrders =
        [...orders].sort(
          (a, b) =>
            new Date(
              b.createdAt,
            ).getTime() -
            new Date(
              a.createdAt,
            ).getTime(),
        )

      const result = []

      for (const order of sortedOrders) {
        const items =
          await db.orm.public.OrderItem
            .where({
              orderId: order.id,
            })
            .all()

        result.push({
          ...order,

          itemCount:
            items.reduce(
              (total, item) =>
                total +
                item.quantity,
              0,
            ),
        })
      }

      return res.json(result)
    } catch (error) {
      console.error(
        'Failed to load orders:',
        error,
      )

      return res.status(500).json({
        message:
          'Could not load orders.',
      })
    }
  },
)

adminOrdersRouter.get(
  '/orders/:id',
  async (req, res) => {
    try {
      const id =
        Number(req.params.id)

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return res.status(400).json({
          message:
            'Invalid order ID.',
        })
      }

      const order =
        await db.orm.public.Order
          .where({
            id,
          })
          .first()

      if (!order) {
        return res.status(404).json({
          message:
            'Order not found.',
        })
      }

      const items =
        await db.orm.public.OrderItem
          .where({
            orderId: id,
          })
          .all()

      const sortedItems =
        [...items].sort(
          (a, b) =>
            a.id - b.id,
        )

      return res.json({
        ...order,
        items: sortedItems,
      })
    } catch (error) {
      console.error(
        'Failed to load order:',
        error,
      )

      return res.status(500).json({
        message:
          'Could not load order.',
      })
    }
  },
)

adminOrdersRouter.patch(
  '/orders/:id/status',
  async (req, res) => {
    try {
      const id =
        Number(req.params.id)

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return res.status(400).json({
          message:
            'Invalid order ID.',
        })
      }

      const status =
        String(
          req.body.status ?? '',
        ).toLowerCase()

      if (
        !allowedStatuses.includes(
          status as OrderStatus,
        )
      ) {
        return res.status(400).json({
          message:
            'Invalid order status.',
        })
      }

      const updatedOrder =
        await db.transaction(
          async (tx) => {
            const existingOrder =
              await tx.orm.public.Order
                .where({
                  id,
                })
                .first()

            if (!existingOrder) {
              return null
            }

            const update =
              tx.raw.sql`
                UPDATE "Order"
                SET "status" = ${status}
                WHERE "id" = ${id}
              `
                .affectedCount()
                .build()

            const {
              affectedRows,
            } =
              await tx.execute(
                update,
              )

            if (
              affectedRows !== 1
            ) {
              throw new Error(
                'Order status was not updated.',
              )
            }

            return tx.orm.public.Order
              .where({
                id,
              })
              .first()
          },
        )

      if (!updatedOrder) {
        return res.status(404).json({
          message:
            'Order not found.',
        })
      }

      return res.json({
        id:
          updatedOrder.id,

        status:
          updatedOrder.status,
      })
    } catch (error) {
      console.error(
        'Failed to update order status:',
        error,
      )

      return res.status(500).json({
        message:
          'Could not update order status.',
      })
    }
  },
)