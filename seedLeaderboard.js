const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizgenerator';

const dummyStudents = [
  { username: 'CodeMaster_Pro', email: 'codemaster@test.com', points: 8500, level: 9, totalQuizzesPlayed: 45, totalScore: 420 },
  { username: 'QuizGenius', email: 'quizgenius@test.com', points: 7200, level: 8, totalQuizzesPlayed: 38, totalScore: 380 },
  { username: 'BrainStorm_X', email: 'brainstorm@test.com', points: 6800, level: 7, totalQuizzesPlayed: 35, totalScore: 350 },
  { username: 'TechWizard', email: 'techwizard@test.com', points: 5500, level: 6, totalQuizzesPlayed: 30, totalScore: 310 },
  { username: 'DataNinja', email: 'dataninja@test.com', points: 4900, level: 5, totalQuizzesPlayed: 28, totalScore: 290 },
  { username: 'AlgoExpert', email: 'algoexpert@test.com', points: 4200, level: 5, totalQuizzesPlayed: 25, totalScore: 265 },
  { username: 'CodeCrusher', email: 'codecrusher@test.com', points: 3800, level: 4, totalQuizzesPlayed: 22, totalScore: 240 },
  { username: 'ByteHunter', email: 'bytehunter@test.com', points: 3400, level: 4, totalQuizzesPlayed: 20, totalScore: 220 },
  { username: 'LogicLord', email: 'logiclord@test.com', points: 2900, level: 3, totalQuizzesPlayed: 18, totalScore: 195 },
  { username: 'DebugDiva', email: 'debugdiva@test.com', points: 2500, level: 3, totalQuizzesPlayed: 16, totalScore: 175 },
  { username: 'SyntaxSage', email: 'syntaxsage@test.com', points: 2100, level: 3, totalQuizzesPlayed: 14, totalScore: 155 },
  { username: 'FunctionFan', email: 'functionfan@test.com', points: 1700, level: 2, totalQuizzesPlayed: 12, totalScore: 130 },
  { username: 'LoopLearner', email: 'looplearner@test.com', points: 1300, level: 2, totalQuizzesPlayed: 10, totalScore: 105 },
  { username: 'ArrayAce', email: 'arrayace@test.com', points: 900, level: 1, totalQuizzesPlayed: 8, totalScore: 80 },
  { username: 'StringStar', email: 'stringstar@test.com', points: 500, level: 1, totalQuizzesPlayed: 5, totalScore: 50 },
];

const seedLeaderboard = async () => {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing dummy users...');
    await User.deleteMany({ email: { $regex: '@test.com$' } });
    console.log('✅ Cleared dummy users');

    console.log('👥 Creating 15 dummy students...');
    const createdUsers = [];
    
    for (const student of dummyStudents) {
      const user = new User({
        username: student.username,
        email: student.email,
        mobile: '9999999999',
        pincode: '123456',
        isVerified: true,
        totalQuizzesPlayed: student.totalQuizzesPlayed,
        totalScore: student.totalScore,
        level: student.level,
        points: student.points,
        aiQuizzesGenerated: 0,
        isPremium: false,
      });
      
      await user.save();
      createdUsers.push(user);
      console.log(`  ✓ Created: ${student.username} - ${student.points} points`);
    }

    console.log(`\n✅ Successfully created ${createdUsers.length} dummy students!`);
    console.log('\n📊 Leaderboard Preview:');
    console.log('┌────┬──────────────────┬─────────┬───────┬─────────┐');
    console.log('│ #  │ Username         │ Points  │ Level │ Quizzes │');
    console.log('├────┼──────────────────┼─────────┼───────┼─────────┤');
    
    createdUsers.forEach((user, index) => {
      const rank = (index + 1).toString().padStart(2, ' ');
      const username = user.username.padEnd(16, ' ');
      const points = user.points.toString().padStart(7, ' ');
      const level = user.level.toString().padStart(5, ' ');
      const quizzes = user.totalQuizzesPlayed.toString().padStart(7, ' ');
      console.log(`│ ${rank} │ ${username} │${points} │${level} │${quizzes} │`);
    });
    
    console.log('└────┴──────────────────┴─────────┴───────┴─────────┘');
    console.log('\n🎉 Done! Visit http://localhost:3000/leaderboard to see them!');
    
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding leaderboard:', error);
    process.exit(1);
  }
};

seedLeaderboard();

