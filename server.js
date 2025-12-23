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

app.use(cors());
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

