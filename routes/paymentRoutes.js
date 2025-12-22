const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Razorpay test credentials
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_Ru8yQAjS6vdnhv';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'fIVfFiFjQ37a7rVsEiz1UQlL';

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Premium plans (in paise - Razorpay uses smallest currency unit)
const PLANS = {
  monthly: { price: 9900, duration: 30, name: 'Monthly Premium' },
  quarterly: { price: 24900, duration: 90, name: 'Quarterly Premium' },
  yearly: { price: 89900, duration: 365, name: 'Yearly Premium' },
};

router.post('/initiate', async (req, res) => {
  try {
    const { plan } = req.body;
    const user = req.user;

    console.log('Payment initiation request:', { plan, userId: user._id });

    if (!PLANS[plan]) {
      console.error('Invalid plan:', plan);
      return res.status(400).json({ error: 'Invalid plan selected', availablePlans: Object.keys(PLANS) });
    }

    const planDetails = PLANS[plan];
    // Shorten receipt to fit Razorpay's 40 character limit
    const receiptId = `rcpt_${Date.now()}`;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: planDetails.price, // amount in paise
      currency: 'INR',
      receipt: receiptId,
      notes: {
        userId: user._id.toString(),
        plan: plan,
        username: user.username,
        email: user.email,
      },
    });

    console.log('Razorpay order created:', order.id);

    res.json({
      success: true,
      orderId: order.id,
      amount: planDetails.price,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      plan,
      userName: user.username,
      userEmail: user.email,
      userMobile: user.mobile,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data || error.error,
    });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    console.log('Payment verification request:', { razorpay_order_id, razorpay_payment_id });

    // Verify signature
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Invalid signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log('Signature verified successfully');

    // Activate premium
    const userId = req.user._id;
    const planDetails = PLANS[plan] || PLANS.monthly;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + planDetails.duration);

    await User.findByIdAndUpdate(userId, {
      isPremium: true,
      premiumExpiresAt: expiresAt,
    });

    console.log('Premium activated for user:', userId);

    res.json({ 
      success: true, 
      message: 'Premium activated successfully',
      premiumExpiresAt: expiresAt,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/plans', async (req, res) => {
  try {
    res.json({
      plans: [
        { id: 'monthly', price: 99, ...PLANS.monthly },
        { id: 'quarterly', price: 249, ...PLANS.quarterly },
        { id: 'yearly', price: 899, ...PLANS.yearly },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

router.get('/plans', async (req, res) => {
  try {
    res.json({
      plans: [
        { id: 'monthly', price: 99, ...PLANS.monthly },
        { id: 'quarterly', price: 249, ...PLANS.quarterly },
        { id: 'yearly', price: 899, ...PLANS.yearly },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

