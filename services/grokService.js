const axios = require('axios');

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

const generateQuizPrompt = (topic, difficulty, numQuestions = 10) => {
  const difficultyDescriptions = {
    '0-2': 'very easy, suitable for complete beginners',
    '3-5': 'medium difficulty, suitable for intermediate learners',
    '6-8': 'hard difficulty, suitable for advanced learners',
    '9-10': 'expert level, extremely challenging questions',
  };

  return `User searched: "${topic}"

Your task:
1. Extract the actual subject/topic from the search query (e.g., "i want quiz for css" → "CSS")
2. Create a professional quiz title (e.g., "CSS Fundamentals Quiz")
3. Determine the best category name (e.g., "CSS", "Web Development", "Programming")
4. Generate ${numQuestions} multiple-choice questions

Difficulty level: ${difficulty} (${difficultyDescriptions[difficulty]})

IMPORTANT: Return ONLY valid JSON, no additional text or explanation.

Format:
{
  "quiz": {
    "title": "Professional quiz title here",
    "topic": "Clean topic name (e.g., CSS, JavaScript, Python)",
    "category": "Category name (e.g., Web Development, Programming, Science)",
    "difficulty": "${difficulty}",
    "questions": [
      {
        "question": "Question text here?",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": 0,
        "explanation": "Brief explanation of the answer"
      }
    ]
  }
}

Rules:
- Extract meaningful topic from user query
- Create professional, concise title
- Choose appropriate category (use existing if similar topic exists)
- Exactly ${numQuestions} questions
- Each question must have 4 options
- correctAnswer is the index (0-3) of the correct option
- IMPORTANT: Randomize correct answer positions - don't always put correct answer at index 0
- Distribute correct answers across all positions (0, 1, 2, 3) randomly
- Questions should match the specified difficulty level
- Include brief explanations
- Return valid JSON only`;
};

const callGrokAPI = async (prompt) => {
  try {
    const response = await axios.post(
      GROK_API_URL,
      {
        messages: [
          {
            role: 'system',
            content: 'You are a quiz generation expert. Generate high-quality, accurate quiz questions. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'grok-4-latest',
        stream: false,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Grok API Error:', error.response?.data || error.message);
    throw new Error('Failed to generate quiz from Grok API');
  }
};

const shuffleOptions = (questions) => {
  return questions.map((question) => {
    const correctOption = question.options[question.correctAnswer];
    
    // Shuffle the options array
    const shuffled = [...question.options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Find new index of correct answer
    const newCorrectIndex = shuffled.indexOf(correctOption);
    
    return {
      ...question,
      options: shuffled,
      correctAnswer: newCorrectIndex,
    };
  });
};

const parseGrokResponse = (response) => {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.quiz || parsed;
  } catch (error) {
    console.error('Failed to parse Grok response:', error);
    throw new Error('Invalid response format from Grok API');
  }
};

const generateQuizWithGrok = async (topic, difficulty, numQuestions = 10) => {
  if (!GROK_API_KEY) {
    throw new Error('GROK_API_KEY is not configured');
  }

  const prompt = generateQuizPrompt(topic, difficulty, numQuestions);
  const response = await callGrokAPI(prompt);
  const quiz = parseGrokResponse(response);

  if (!quiz.questions || quiz.questions.length === 0) {
    throw new Error('No questions generated');
  }

  // Shuffle options to randomize correct answer positions
  const shuffledQuestions = shuffleOptions(quiz.questions);

  return {
    title: quiz.title || `${topic} Quiz`,
    topic: quiz.topic || topic,
    category: quiz.category || topic,
    difficulty: quiz.difficulty || difficulty,
    questions: shuffledQuestions,
  };
};

module.exports = {
  generateQuizWithGrok,
};

