const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');

dotenv.config();

// CORS configuration - support multiple origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://quize-fe.vercel.app",
  "https://www.quize-fe.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Normalize origin (remove trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Check if origin is in allowed list (exact match or includes check)
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.replace(/\/$/, '');
      return normalizedOrigin === normalizedAllowed || 
             normalizedOrigin.includes(normalizedAllowed) ||
             normalizedAllowed.includes(normalizedOrigin);
    });
    
    if (isAllowed || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // Log for debugging
      console.log('CORS blocked origin:', normalizedOrigin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/test-payment', require('./routes/testPaymentRoutes'));

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO is ready for real-time updates`);
});

