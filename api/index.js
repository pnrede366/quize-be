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
  "https://purushottamrede.site",
  "https://www.purushottamrede.site",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

