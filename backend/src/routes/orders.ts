import crypto from 'node:crypto'
import { Router } from 'express'

import {
  sendOrderConfirmation,
} from '../email/order-confirmation.js'

import { db } from '../prisma/db.js'

export const ordersRouter = Router()

type CheckoutItem = {
  productId: number
  quantity: number
}

ordersRouter.post(
  '/',
  async (req, res) => {
    try {
      const {
        email,
        firstName,
        lastName,
        address,
        city,
        postalCode,
        country,
        items,
      } = req.body

      if (
        !email ||
        !firstName ||
        !lastName ||
        !address ||
        !city ||
        !postalCode ||
        !country
      ) {
        return res.status(400).json({
          message:
            'Shipping information is incomplete.',
        })
      }

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          message:
            'Order must contain at least one item.',
        })
      }

      const checkoutItems =
        items as CheckoutItem[]

      const invalidItem =
        checkoutItems.some(
          (item) =>
            !Number.isInteger(
              item.productId,
            ) ||
            item.productId <= 0 ||
            !Number.isInteger(
              item.quantity,
            ) ||
            item.quantity <= 0,
        )

      if (invalidItem) {
        return res.status(400).json({
          message:
            'Order contains invalid items.',
        })
      }

      const orderNumber =
        createOrderNumber()

      const order =
        await db.transaction(
          async (tx) => {
            const orderItems: Array<{
              productId: number
              productName: string
              productSlug: string
              unitPriceCents: number
              quantity: number
              lineTotalCents: number
            }> = []

            let subtotalCents = 0

            for (
              const item of checkoutItems
            ) {
              const product =
                await tx.orm.public.Product
                  .where({
                    id:
                      item.productId,
                    isActive:
                      true,
                  })
                  .first()

              if (!product) {
                throw new Error(
                  `Product ${item.productId} is no longer available.`,
                )
              }

              /*
               * Reduce stock atomically.
               *
               * The WHERE condition makes sure
               * stock can never become negative.
               */
              const stockUpdate =
                tx.raw.sql`
                  UPDATE "Product"
                  SET
                    "stockQuantity" = "stockQuantity" - ${item.quantity},
                    "updatedAt" = ${new Date().toISOString()}
                  WHERE
                    "id" = ${product.id}
                    AND "stockQuantity" >= ${item.quantity}
                `
                  .affectedCount()
                  .build()

              const {
                affectedRows,
              } =
                await tx.execute(
                  stockUpdate,
                )

              if (
                affectedRows !== 1
              ) {
                throw new Error(
                  `Not enough stock for ${product.name}.`,
                )
              }

              const lineTotalCents =
                product.priceCents *
                item.quantity

              subtotalCents +=
                lineTotalCents

              orderItems.push({
                productId:
                  product.id,

                productName:
                  product.name,

                productSlug:
                  product.slug,

                unitPriceCents:
                  product.priceCents,

                quantity:
                  item.quantity,

                lineTotalCents,
              })
            }

            const createdOrder =
              await tx.orm.public.Order.create({
                orderNumber,

                email:
                  String(email)
                    .trim()
                    .toLowerCase(),

                firstName:
                  String(firstName)
                    .trim(),

                lastName:
                  String(lastName)
                    .trim(),

                address:
                  String(address)
                    .trim(),

                city:
                  String(city)
                    .trim(),

                postalCode:
                  String(postalCode)
                    .trim(),

                country:
                  String(country)
                    .trim(),

                status:
                  'confirmed',

                subtotalCents,

                totalCents:
                  subtotalCents,
              })

            for (
              const item of orderItems
            ) {
              await tx.orm.public.OrderItem.create({
                orderId:
                  createdOrder.id,

                productId:
                  item.productId,

                productName:
                  item.productName,

                productSlug:
                  item.productSlug,

                unitPriceCents:
                  item.unitPriceCents,

                quantity:
                  item.quantity,

                lineTotalCents:
                  item.lineTotalCents,
              })
            }

            return createdOrder
          },
        )

      /*
       * Email happens AFTER the database
       * transaction.
       *
       * Important:
       * if email sending fails, we do NOT
       * delete or roll back the order.
       */
      try {
        const emailItems =
          await db.orm.public.OrderItem
            .where({
              orderId:
                order.id,
            })
            .all()

        await sendOrderConfirmation({
          email:
            order.email,

          firstName:
            order.firstName,

          orderNumber:
            order.orderNumber,

          totalCents:
            order.totalCents,

          items:
            emailItems.map(
              (item) => ({
                productName:
                  item.productName,

                unitPriceCents:
                  item.unitPriceCents,

                quantity:
                  item.quantity,

                lineTotalCents:
                  item.lineTotalCents,
              }),
            ),
        })
      } catch (emailError) {
        console.error(
          'Order created, but confirmation email failed:',
          emailError,
        )
      }

      return res.status(201).json({
        orderNumber:
          order.orderNumber,

        orderId:
          order.id,

        totalCents:
          order.totalCents,
      })
    } catch (error) {
      console.error(
        'Failed to create order:',
        error,
      )

      const message =
        error instanceof Error
          ? error.message
          : 'Could not place order.'

      if (
        message.startsWith(
          'Not enough stock',
        ) ||
        message.includes(
          'no longer available',
        )
      ) {
        return res.status(409).json({
          message,
        })
      }

      return res.status(500).json({
        message:
          'Could not place order.',
      })
    }
  },
)

function createOrderNumber() {
  const random =
    crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase()

  return `CL-${Date.now()}-${random}`
}