import { Router } from 'express'
import crypto from 'node:crypto'

import { db } from '../prisma/db.js'
import {
  PRODUCT_IMAGES_BUCKET,
  supabaseAdmin,
} from '../config/supabase.js'
import { uploadProductImages } from '../middleware/upload.js'

export const adminImagesRouter = Router()

adminImagesRouter.post(
  '/products/:productId/images',
  uploadProductImages.array('images', 6),

  async (req, res) => {
    const productId = Number(req.params.productId)

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: 'Invalid product id.',
      })
    }

    const files = req.files as Express.Multer.File[] | undefined

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: 'Please upload at least one image.',
      })
    }

    const product = await db.orm.public.Product
      .whereUnique({ id: productId })
      .first()

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.',
      })
    }

    const uploadedPaths: string[] = []

    try {
      const existingImages = await db.orm.public.ProductImage
        .where({ productId })
        .all()

      let nextPosition = existingImages.length

      const createdImages = []

      for (const file of files) {
        const extension = getExtensionFromMimeType(file.mimetype)

        const fileName = `${crypto.randomUUID()}.${extension}`

        const storagePath = `${productId}/${fileName}`

        const { error: uploadError } = await supabaseAdmin
          .storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(
            storagePath,
            file.buffer,
            {
              contentType: file.mimetype,
              upsert: false,
            },
          )

        if (uploadError) {
          throw uploadError
        }

        uploadedPaths.push(storagePath)

        const createdImage = await db.orm.public.ProductImage.create({
          productId,
          storagePath,
          altText: product.name,
          position: nextPosition,
        })

        createdImages.push(createdImage)

        nextPosition += 1
      }

      const responseImages = createdImages.map((image) => {
        const { data } = supabaseAdmin
          .storage
          .from(PRODUCT_IMAGES_BUCKET)
          .getPublicUrl(image.storagePath)

        return {
          ...image,
          url: data.publicUrl,
        }
      })

      return res.status(201).json({
        message: 'Images uploaded successfully.',
        images: responseImages,
      })
    } catch (error) {
      console.error(error)

      if (uploadedPaths.length > 0) {
        await supabaseAdmin
          .storage
          .from(PRODUCT_IMAGES_BUCKET)
          .remove(uploadedPaths)
      }

      return res.status(500).json({
        message: 'Failed to upload images.',
      })
    }
  },
)

function getExtensionFromMimeType(mimeType: string) {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg'

    case 'image/png':
      return 'png'

    case 'image/webp':
      return 'webp'

    default:
      throw new Error('Unsupported image type.')
  }
}