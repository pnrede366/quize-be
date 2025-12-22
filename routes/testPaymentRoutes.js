const express = require('express');
const router = express.Router();

// Payment simulation for testing without PhonePe integration
router.post('/simulate-success', async (req, res) => {
  try {
    const { orderId, plan } = req.body;
    const User = require('../models/User');
    const authMiddleware = require('../middleware/authMiddleware');
    
    // Apply auth middleware manually
    authMiddleware(req, res, async () => {
      const PLANS = {
        monthly: { duration: 30 },
        quarterly: { duration: 90 },
        yearly: { duration: 365 },
      };

      const planDetails = PLANS[plan] || PLANS.monthly;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + planDetails.duration);

      await User.findByIdAndUpdate(req.user._id, {
        isPremium: true,
        premiumExpiresAt: expiresAt,
      });

      res.json({ 
        success: true, 
        code: 'PAYMENT_SUCCESS',
        message: 'Premium activated successfully (TEST MODE)' 
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

