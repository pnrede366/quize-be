# Quiz Generator - Backend API

Express.js backend with MongoDB, Socket.IO, and AI quiz generation.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Create .env file (see ENV_SETUP.md)
cp ENV_SETUP.md .env

# Run development server
npm run dev

# Or production
npm start
```

Server runs on: `http://localhost:5000`

## 📁 Structure

```
quiz-backend/
├── config/           # Database configuration
├── middleware/       # Auth middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── services/        # Grok AI service
├── utils/           # Email service
├── server.js        # Main server file
├── seedLeaderboard.js
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/google` - Google OAuth

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes/generate` - Generate AI quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers

### User
- `GET /api/user/profile` - Get user profile
- `GET /api/user/stats` - Get user stats
- `GET /api/user/leaderboard` - Get leaderboard
- `GET /api/user/quiz-history` - Get quiz history
- `GET /api/user/quiz-result/:quizId` - Get quiz result

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/:id/quizzes` - Get quizzes by category

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

## 🔄 Socket.IO Events

### Server → Client
- `leaderboard-update` - Leaderboard updated

### Client → Server
- `connect` - Client connected
- `disconnect` - Client disconnected

## 🗄️ Database Models

- **User** - User accounts and stats
- **Quiz** - Quiz data and questions
- **Result** - Quiz results and answers
- **Category** - Quiz categories
- **OTP** - Email verification codes

## 🌱 Seed Data

```bash
# Add 15 dummy students to leaderboard
npm run seed
```

## 📦 Deployment

### Railway

1. Connect GitHub repo
2. Add environment variables
3. Deploy automatically

### Render

1. Create new Web Service
2. Connect GitHub repo
3. Add environment variables
4. Deploy

## 🔧 Environment Variables

See `ENV_SETUP.md` for all required environment variables.

### Testing Mode

To enable testing mode restrictions (limits premium users to 1 quiz):

```env
TESTING_MODE=true
```

When enabled:
- Premium users can only generate **1 additional quiz** (beyond their free 3)
- After that, they'll see a regret message about testing mode
- Free users still limited to 3 quizzes

## 🛠️ Tech Stack

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time updates
- **JWT** - Authentication
- **Grok AI** - Quiz generation
- **Nodemailer** - Email service
- **Razorpay** - Payments
- **Google Auth** - OAuth login

