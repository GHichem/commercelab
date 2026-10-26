import { Router } from 'express'
import { db } from '../prisma/db.js'

export const productsRouter = Router()

productsRouter.get('/', async (_req, res) => {
  try {
    const products = await db.orm.public.Product.all()

    res.json(products)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch products',
    })
  }
})