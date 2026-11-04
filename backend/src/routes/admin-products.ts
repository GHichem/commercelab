import { Router } from 'express'

import {
  PRODUCT_IMAGES_BUCKET,
  supabaseAdmin,
} from '../config/supabase.js'
import { db } from '../prisma/db.js'

export const adminProductsRouter = Router()

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

// GET all products
adminProductsRouter.get('/products', async (_req, res) => {
  try {
    const products = await db.orm.public.Product
      .include('images', (images) =>
        images.orderBy((image) => image.position.asc()),
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
    console.error('Failed to fetch admin products:', error)

    return res.status(500).json({
      message: 'Failed to fetch admin products.',
    })
  }
})

// IMPORTANT:
// This route must stay ABOVE /products/:id
adminProductsRouter.put('/products/order', async (req, res) => {
  try {
    const { productIds } = req.body

    if (
      !Array.isArray(productIds) ||
      !productIds.every(
        (id) => Number.isInteger(id) && id > 0,
      )
    ) {
      return res.status(400).json({
        message: 'productIds must be an array of product ids.',
      })
    }

    const products = await db.orm.public.Product.all()

    const existingIds = products
      .map((product) => product.id)
      .sort((a, b) => a - b)

    const requestedIds = [...productIds].sort(
      (a, b) => a - b,
    )

    const containsSameProducts =
      existingIds.length === requestedIds.length &&
      existingIds.every(
        (id, index) => id === requestedIds[index],
      )

    if (!containsSameProducts) {
      return res.status(400).json({
        message:
          'Product order must contain every product exactly once.',
      })
    }

    for (
      let displayOrder = 0;
      displayOrder < productIds.length;
      displayOrder += 1
    ) {
      const productId = productIds[displayOrder]

      await db.orm.public.Product
        .where({ id: productId })
        .update({
          displayOrder,
        })
    }

    return res.json({
      message: 'Product order updated.',
    })
  } catch (error) {
    console.error('Failed to reorder products:', error)

    return res.status(500).json({
      message: 'Failed to reorder products.',
    })
  }
})

// GET one product
adminProductsRouter.get('/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'Invalid product id.',
      })
    }

    const product = await db.orm.public.Product
      .where({ id })
      .include('images', (images) =>
        images.orderBy((image) => image.position.asc()),
      )
      .first()

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.',
      })
    }

    return res.json(withImageUrls(product))
  } catch (error) {
    console.error('Failed to fetch product:', error)

    return res.status(500).json({
      message: 'Failed to fetch product.',
    })
  }
})

// CREATE product
adminProductsRouter.post('/products', async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      priceCents,
      stockQuantity,
      isActive,
    } = req.body

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        message: 'Name is required.',
      })
    }

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({
        message: 'Slug is required.',
      })
    }

    if (!Number.isInteger(priceCents) || priceCents < 0) {
      return res.status(400).json({
        message: 'Price must be valid.',
      })
    }

    if (
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      return res.status(400).json({
        message: 'Stock must be valid.',
      })
    }

    const normalizedSlug = slug.trim().toLowerCase()

    const existingProduct = await db.orm.public.Product
      .where({
        slug: normalizedSlug,
      })
      .first()

    if (existingProduct) {
      return res.status(409).json({
        message: 'A product with this slug already exists.',
      })
    }

    const existingProducts =
      await db.orm.public.Product.all()

    const nextDisplayOrder =
      existingProducts.length === 0
        ? 0
        : Math.max(
            ...existingProducts.map(
              (product) => product.displayOrder,
            ),
          ) + 1

    const product = await db.orm.public.Product.create({
      name: name.trim(),
      slug: normalizedSlug,

      description:
        typeof description === 'string' &&
        description.trim()
          ? description.trim()
          : null,

      priceCents,
      stockQuantity,
      isActive: Boolean(isActive),
      displayOrder: nextDisplayOrder,
    })

    return res.status(201).json(product)
  } catch (error) {
    console.error('Failed to create product:', error)

    return res.status(500).json({
      message: 'Failed to create product.',
    })
  }
})

// UPDATE product
adminProductsRouter.put('/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'Invalid product id.',
      })
    }

    const {
      name,
      slug,
      description,
      priceCents,
      stockQuantity,
      isActive,
    } = req.body

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        message: 'Name is required.',
      })
    }

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({
        message: 'Slug is required.',
      })
    }

    if (!Number.isInteger(priceCents) || priceCents < 0) {
      return res.status(400).json({
        message: 'Price must be valid.',
      })
    }

    if (
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      return res.status(400).json({
        message: 'Stock must be valid.',
      })
    }

    const product = await db.orm.public.Product
      .where({ id })
      .update({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),

        description:
          typeof description === 'string' &&
          description.trim()
            ? description.trim()
            : null,

        priceCents,
        stockQuantity,
        isActive: Boolean(isActive),
      })

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.',
      })
    }

    return res.json(product)
  } catch (error) {
    console.error('Failed to update product:', error)

    return res.status(500).json({
      message: 'Failed to update product.',
    })
  }
})

// REMOVE old legacy image URL
adminProductsRouter.delete(
  '/products/:id/legacy-image',
  async (req, res) => {
    try {
      const id = Number(req.params.id)

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: 'Invalid product id.',
        })
      }

      const product = await db.orm.public.Product
        .where({ id })
        .first()

      if (!product) {
        return res.status(404).json({
          message: 'Product not found.',
        })
      }

      await db.orm.public.Product
        .where({ id })
        .update({
          imageUrl: null,
        })

      return res.status(204).send()
    } catch (error) {
      console.error(
        'Failed to remove legacy product image:',
        error,
      )

      return res.status(500).json({
        message: 'Failed to remove legacy product image.',
      })
    }
  },
)

// DELETE product
adminProductsRouter.delete(
  '/products/:id',
  async (req, res) => {
    try {
      const id = Number(req.params.id)

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: 'Invalid product id.',
        })
      }

      const product = await db.orm.public.Product
        .where({ id })
        .include('images')
        .first()

      if (!product) {
        return res.status(404).json({
          message: 'Product not found.',
        })
      }

      const storagePaths = product.images.map(
        (image) => image.storagePath,
      )

      if (storagePaths.length > 0) {
        const { error: storageError } =
          await supabaseAdmin
            .storage
            .from(PRODUCT_IMAGES_BUCKET)
            .remove(storagePaths)

        if (storageError) {
          return res.status(500).json({
            message: 'Failed to delete product images.',
          })
        }
      }

      await db.orm.public.ProductImage
        .where({
          productId: id,
        })
        .deleteAll()

      await db.orm.public.Product
        .where({ id })
        .delete()

      const remainingProducts =
        await db.orm.public.Product.all()

      const sortedRemaining = [...remainingProducts].sort(
        (a, b) =>
          a.displayOrder - b.displayOrder ||
          a.id - b.id,
      )

      for (
        let displayOrder = 0;
        displayOrder < sortedRemaining.length;
        displayOrder += 1
      ) {
        await db.orm.public.Product
          .where({
            id: sortedRemaining[displayOrder].id,
          })
          .update({
            displayOrder,
          })
      }

      return res.status(204).send()
    } catch (error) {
      console.error('Failed to delete product:', error)

      return res.status(500).json({
        message: 'Failed to delete product.',
      })
    }
  },
)