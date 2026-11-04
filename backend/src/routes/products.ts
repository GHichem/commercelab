import { Router } from 'express'

import {
  PRODUCT_IMAGES_BUCKET,
  supabaseAdmin,
} from '../config/supabase.js'
import { db } from '../prisma/db.js'

export const productsRouter = Router()

productsRouter.get('/', async (_req, res) => {
  try {
    const products = await db.orm.public.Product
      .where({
        isActive: true,
      })
      .include('images', (images) =>
        images.orderBy(
          (image) => image.position.asc(),
        ),
      )
      .all()

    const sortedProducts = [...products].sort(
      (a, b) =>
        a.displayOrder - b.displayOrder ||
        a.id - b.id,
    )

    const result = sortedProducts.map((product) => ({
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

    return res.json(result)
  } catch (error) {
    console.error(
      'Failed to fetch products:',
      error,
    )

    return res.status(500).json({
      message: 'Failed to fetch products.',
    })
  }
})