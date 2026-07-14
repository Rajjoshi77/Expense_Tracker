import express from 'express';
import multer from 'multer';
import { parseReceiptImage } from '../services/ocrService.js';

const router = express.Router();

// Configure Multer for memory storage (file buffer in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only receipt images (JPEG, PNG, WEBP) are allowed.'));
    }
  }
});

/**
 * POST /api/ocr/receipt
 * Processes uploaded receipt image and returns extracted transaction data
 */
router.post('/receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No receipt image uploaded.' });
    }

    console.log(`[OCR Route] Received file: ${req.file.originalname} (${req.file.mimetype})`);
    
    const parsedData = await parseReceiptImage(req.file.buffer, req.file.mimetype);
    
    return res.json({
      success: true,
      data: parsedData
    });
  } catch (error) {
    console.error('[OCR Route] Processing error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to scan the receipt.'
    });
  }
});

export default router;
