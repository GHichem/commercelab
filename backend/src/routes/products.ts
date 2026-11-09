import { Router } from 'express'

import {
  PRODUCT_IMAGES_BUCKET,
  supabaseAdmin,
} from '../config/supabase.js'
import { db } from '../prisma/db.js'

export const productsRouter = Router()

function withImageUrls<
  T extends { images: Array<{ storagePath: string }> },
>(product: T) {
  return {
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
  }
}

// GET all active products
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

    return res.json(
      sortedProducts.map((product) =>
        withImageUrls(product),
      ),
    )
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

// GET one active product by slug
productsRouter.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug

    const product = await db.orm.public.Product
      .where({
        slug,
        isActive: true,
      })
      .include('images', (images) =>
        images.orderBy(
          (image) => image.position.asc(),
        ),
      )
      .first()

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.',
      })
    }

    return res.json(
      withImageUrls(product),
    )
  } catch (error) {
    console.error(
      'Failed to fetch product:',
      error,
    )

    return res.status(500).json({
      message: 'Failed to fetch product.',
    })
  }
})