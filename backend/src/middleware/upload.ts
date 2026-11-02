import multer from 'multer'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

export const uploadProductImages = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 6,
  },

  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new Error('Only JPEG, PNG and WebP images are allowed.'))
      return
    }

    callback(null, true)
  },
})