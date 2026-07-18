import multer from 'multer'

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

export const upload = multer({ 
    storage, 
})

// ─── Scanner uploads ─────────────────────────────────────────────────
// Scan images are transient — we forward the buffer straight to
// PlantNet/Gemini and never need to persist them to disk or Cloudinary,
// so this uses memoryStorage instead of the disk storage above.
const scanStorage = multer.memoryStorage()

export const scanUpload = multer({
    storage: scanStorage,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed'), false)
        }
    },
})

