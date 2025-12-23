const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Result = require('../models/Result');
const Quiz = require('../models/Quiz');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no auth required)
router.get('/leaderboard', async (req, res) => {
  try {
    console.log('Leaderboard API called');
    const users = await User.find({ totalQuizzesPlayed: { $gt: 0 } })
      .select('username level points totalQuizzesPlayed profilePicture')
      .sort({ points: -1 })
      .limit(100);

    console.log(`Found ${users.length} users for leaderboard`);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      score: user.points,
      level: user.level,
      quizzesTaken: user.totalQuizzesPlayed,
      profilePicture: user.profilePicture || null,
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Protected routes (auth required)
router.use(authMiddleware);

router.get('/profile', async (req, res) => {
  try {
    const user = req.user;
    const isExpired = user.premiumExpiresAt && new Date() > user.premiumExpiresAt;

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      pincode: user.pincode,
      createdAt: user.createdAt,
      totalQuizzesPlayed: user.totalQuizzesPlayed,
      points: user.points,
      level: user.level,
      aiQuizzesGenerated: user.aiQuizzesGenerated,
      isPremium: user.isPremium && !isExpired,
      premiumExpiresAt: user.premiumExpiresAt,
      quizzesRemaining: user.isPremium && !isExpired ? 'unlimited' : Math.max(0, 3 - user.aiQuizzesGenerated),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const user = req.user;
    const results = await Result.find({ userId: user._id });
    
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const totalQuestions = results.reduce((sum, result) => sum + result.totalQuestions, 0);
    const averageScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    const allUsers = await User.find().sort({ points: -1 });
    const rank = allUsers.findIndex(u => u._id.toString() === user._id.toString()) + 1;

    const stats = {
      quizzesTaken: user.totalQuizzesPlayed,
      averageScore,
      rank,
      level: user.level,
      points: user.points,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/quiz-history', async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user._id })
      .populate({
        path: 'quizId',
        select: 'title topic difficulty questions',
      })
      .sort({ createdAt: -1 })
      .limit(10);

    const quizHistory = results.map(result => ({
      id: result.quizId._id,
      title: result.quizId.title,
      topic: result.quizId.topic,
      difficulty: result.quizId.difficulty,
      questionsCount: result.totalQuestions,
      completedAt: result.createdAt,
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
    }));

    res.json(quizHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/quiz-result/:quizId', async (req, res) => {
  try {
    const result = await Result.findOne({ 
      userId: req.user._id, 
      quizId: req.params.quizId 
    }).sort({ createdAt: -1 });

    if (!result) {
      return res.status(404).json({ error: 'Result not found', message: 'You have not completed this quiz yet.' });
    }

    res.json({
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      answers: result.answers,
      completedAt: result.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/generated-quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user._id })
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    const generatedQuizzes = quizzes.map(quiz => ({
      id: quiz._id,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      questionsCount: quiz.questions.length,
      timesPlayed: quiz.timesPlayed || 0,
      createdAt: quiz.createdAt,
      category: quiz.categoryId?.name || 'Uncategorized',
    }));

    res.json(generatedQuizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

