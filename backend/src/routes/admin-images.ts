import { Router } from 'express'
import crypto from 'node:crypto'

import { db } from '../prisma/db.js'
import {
  PRODUCT_IMAGES_BUCKET,
  supabaseAdmin,
} from '../config/supabase.js'
import { uploadProductImages } from '../middleware/upload.js'

export const adminImagesRouter = Router()

// Upload product images
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
      .where({ id: productId })
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
          .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          })

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
      console.error('Failed to upload images:', error)

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

// Reorder product images
adminImagesRouter.put(
  '/products/:productId/images/order',
  async (req, res) => {
    try {
      const productId = Number(req.params.productId)
      const { imageIds } = req.body

      if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
          message: 'Invalid product id.',
        })
      }

      if (
        !Array.isArray(imageIds) ||
        !imageIds.every(
          (id) => Number.isInteger(id) && id > 0,
        )
      ) {
        return res.status(400).json({
          message: 'imageIds must be an array of image ids.',
        })
      }

      const existingImages = await db.orm.public.ProductImage
        .where({ productId })
        .all()

      const existingIds = existingImages
        .map((image) => image.id)
        .sort((a, b) => a - b)

      const requestedIds = [...imageIds]
        .sort((a, b) => a - b)

      const containsSameImages =
        existingIds.length === requestedIds.length &&
        existingIds.every(
          (id, index) => id === requestedIds[index],
        )

      if (!containsSameImages) {
        return res.status(400).json({
          message:
            'Image order must contain every saved image exactly once.',
        })
      }

      for (let position = 0; position < imageIds.length; position += 1) {
        const imageId = imageIds[position]

        await db.orm.public.ProductImage
          .where({
            id: imageId,
            productId,
          })
          .update({
            position,
          })
      }

      return res.json({
        message: 'Image order updated.',
      })
    } catch (error) {
      console.error('Failed to reorder images:', error)

      return res.status(500).json({
        message: 'Failed to reorder images.',
      })
    }
  },
)

// Delete one saved image
adminImagesRouter.delete(
  '/products/:productId/images/:imageId',
  async (req, res) => {
    try {
      const productId = Number(req.params.productId)
      const imageId = Number(req.params.imageId)

      if (
        !Number.isInteger(productId) ||
        !Number.isInteger(imageId)
      ) {
        return res.status(400).json({
          message: 'Invalid product or image id.',
        })
      }

      const image = await db.orm.public.ProductImage
        .where({
          id: imageId,
          productId,
        })
        .first()

      if (!image) {
        return res.status(404).json({
          message: 'Image not found.',
        })
      }

      const { error: storageError } = await supabaseAdmin
        .storage
        .from(PRODUCT_IMAGES_BUCKET)
        .remove([image.storagePath])

      if (storageError) {
        console.error(storageError)

        return res.status(500).json({
          message: 'Failed to delete image from storage.',
        })
      }

      await db.orm.public.ProductImage
        .where({ id: imageId })
        .delete()

      // Close the position gap after deleting an image.
      const remainingImages = await db.orm.public.ProductImage
        .where({ productId })
        .orderBy((image) => image.position.asc())
        .all()

      for (
        let position = 0;
        position < remainingImages.length;
        position += 1
      ) {
        await db.orm.public.ProductImage
          .where({
            id: remainingImages[position].id,
          })
          .update({
            position,
          })
      }

      return res.status(204).send()
    } catch (error) {
      console.error('Failed to delete image:', error)

      return res.status(500).json({
        message: 'Failed to delete image.',
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