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
        ).toLowerCase() as OrderStatus

      if (
        !allowedStatuses.includes(
          status,
        )
      ) {
        return res.status(400).json({
          message:
            'Invalid order status.',
        })
      }

      const result =
        await db.transaction(
          async (tx) => {
            const existingOrder =
              await tx.orm.public.Order
                .where({
                  id,
                })
                .first()

            if (!existingOrder) {
              return {
                type: 'not-found' as const,
              }
            }

            const currentStatus =
              existingOrder.status as OrderStatus

            /*
             * No change required.
             */
            if (
              currentStatus === status
            ) {
              return {
                type: 'success' as const,
                order:
                  existingOrder,
              }
            }

            /*
             * Cancellation is terminal.
             *
             * This prevents changing a cancelled
             * order back to processing/shipped,
             * which could otherwise cause stock
             * inconsistencies.
             */
            if (
              currentStatus ===
                'cancelled' &&
              status !==
                'cancelled'
            ) {
              return {
                type: 'conflict' as const,

                message:
                  'A cancelled order cannot be reopened.',
              }
            }

            /*
             * If the order is being cancelled,
             * restore its stock exactly once.
             */
            if (
              status ===
                'cancelled' &&
              currentStatus !==
                'cancelled'
            ) {
              const items =
                await tx.orm.public.OrderItem
                  .where({
                    orderId: id,
                  })
                  .all()

              for (const item of items) {
                /*
                 * productId may be null when the
                 * original product was deleted.
                 */
                if (
                  item.productId ===
                  null
                ) {
                  continue
                }

                const restoreStock =
                  tx.raw.sql`
                    UPDATE "Product"
                    SET
                      "stockQuantity" = "stockQuantity" + ${item.quantity},
                      "updatedAt" = ${new Date().toISOString()}
                    WHERE "id" = ${item.productId}
                  `
                    .affectedCount()
                    .build()

                await tx.execute(
                  restoreStock,
                )
              }
            }

            const updateStatus =
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
                updateStatus,
              )

            if (
              affectedRows !== 1
            ) {
              throw new Error(
                'Order status was not updated.',
              )
            }

            const updatedOrder =
              await tx.orm.public.Order
                .where({
                  id,
                })
                .first()

            if (!updatedOrder) {
              throw new Error(
                'Updated order could not be loaded.',
              )
            }

            return {
              type: 'success' as const,
              order:
                updatedOrder,
            }
          },
        )

      if (
        result.type ===
        'not-found'
      ) {
        return res.status(404).json({
          message:
            'Order not found.',
        })
      }

      if (
        result.type ===
        'conflict'
      ) {
        return res.status(409).json({
          message:
            result.message,
        })
      }

      return res.json({
        id:
          result.order.id,

        status:
          result.order.status,
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