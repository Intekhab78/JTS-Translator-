const express = require('express');
const router = express.Router();
const { simulatePurchase } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/simulate-purchase', protect, simulatePurchase);

module.exports = router;
