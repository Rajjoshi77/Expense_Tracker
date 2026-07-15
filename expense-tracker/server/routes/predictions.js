import express from 'express';
import { getSpendForecast } from '../services/predictionService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to protect prediction endpoints
router.use(requireAuth);

/**
 * GET /api/predictions/forecast
 * Returns current month spending forecast, category budget overshoots, and anomalies
 */
router.get('/forecast', async (req, res) => {
  try {
    const forecastData = await getSpendForecast(req.user.id);
    return res.json({
      success: true,
      data: forecastData
    });
  } catch (error) {
    console.error('[Predictions Route] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve spending predictions.'
    });
  }
});

export default router;
