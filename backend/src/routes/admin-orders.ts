import { Router } from 'express'

import { db } from '../prisma/db.js'

export const adminOrdersRouter = Router()

adminOrdersRouter.get(
  '/orders',
  async (_req, res) => {
    try {
      const orders =
        await db.orm.public.Order
          .orderBy({
            createdAt: 'desc',
          })
          .all()

      const result = []

      for (const order of orders) {
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
              (
                total,
                item,
              ) =>
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
          .orderBy({
            id: 'asc',
          })
          .all()

      return res.json({
        ...order,
        items,
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