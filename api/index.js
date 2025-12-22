const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../config/database');

dotenv.config();

const app = express();

// Connect to database
connectDB();

// CORS configuration - support multiple origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://quize-fe.vercel.app",
  "https://www.quize-fe.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // In production, allow any origin if FRONTEND_URL is not set (for flexibility)
      if (!process.env.FRONTEND_URL || allowedOrigins.some(allowed => origin.includes(allowed))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/quizzes', require('../routes/quizRoutes'));
app.use('/api/user', require('../routes/userRoutes'));
app.use('/api/categories', require('../routes/categoryRoutes'));
app.use('/api/payment', require('../routes/paymentRoutes'));
app.use('/api/test-payment', require('../routes/testPaymentRoutes'));

// Note: Socket.IO is disabled for Vercel deployment
// Real-time features won't work on Vercel serverless functions
// For Socket.IO, use Railway, Render, or similar platforms

module.exports = app;

