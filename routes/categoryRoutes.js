const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Quiz = require('../models/Quiz');

router.get('/', async (req, res) => {
  try {
    console.log('Categories API called');
    const categories = await Category.find({ quizCount: { $gt: 0 } })
      .sort({ quizCount: -1 });
    console.log(`Found ${categories.length} categories`);
    res.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ categoryId: req.params.id })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

