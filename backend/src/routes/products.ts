import { Router } from 'express'

import { db } from '../prisma/db.js'
import {
  PRODUCT_IMAGES_BUCKET,
  supabaseAdmin,
} from '../config/supabase.js'

export const productsRouter = Router()

productsRouter.get('/', async (_req, res) => {
  try {
    const products = await db.orm.public.Product
      .where({
        isActive: true,
      })
      .include('images', (image) =>
        image.orderBy((image) => image.position.asc()),
      )
      .all()

    const productsWithImageUrls = products.map((product) => ({
      ...product,
      images: product.images.map((image) => {
        const { data } = supabaseAdmin
          .storage
          .from(PRODUCT_IMAGES_BUCKET)
          .getPublicUrl(image.storagePath)

        return {
          ...image,
          url: data.publicUrl,
        }
      }),
    }))

    res.json(productsWithImageUrls)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch products',
    })
  }
})