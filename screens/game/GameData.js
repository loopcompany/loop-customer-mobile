// GameData.js - Computer and technology game data for kids

export const GAME_DEVICES = [
  {
    id: 1,
    name: 'Laptop',
    emoji: '💻',
    color: '#4A90E2',
    sound: 'Click click',
  },
  {
    id: 2,
    name: 'Computer',
    emoji: '🖥',
    color: '#2C3E50',
    sound: 'Boot boot',
  },
  {
    id: 3,
    name: 'Mouse',
    emoji: '🖱',
    color: '#E74C3C',
    sound: 'Click',
  },
  {
    id: 4,
    name: 'Keyboard',
    emoji: '⌨',
    color: '#34495E',
    sound: 'Tap tap',
  },
  {
    id: 5,
    name: 'Mobile phone',
    emoji: '📱',
    color: '#50C878',
    sound: 'Ring ring',
  },
  {
    id: 6,
    name: 'Tablet',
    emoji: '📱',
    color: '#1ABC9C',
    sound: 'Swish',
  },
  {
    id: 7,
    name: 'Printer',
    emoji: '🖨',
    color: '#95A5A6',
    sound: 'Whir whir',
  },
  {
    id: 8,
    name: 'Headphones',
    emoji: '🎧',
    color: '#9B59B6',
    sound: 'Music',
  },
  {
    id: 9,
    name: 'Camera',
    emoji: '📷',
    color: '#E67E22',
    sound: 'Click snap',
  },
  {
    id: 10,
    name: 'Speaker',
    emoji: '🔊',
    color: '#F39C12',
    sound: 'Beep beep',
  },
  {
    id: 11,
    name: 'Flash memory',
    emoji: '💾',
    color: '#16A085',
    sound: 'Click',
  },
  {
    id: 12,
    name: 'Wi-Fi antenna',
    emoji: '📡',
    color: '#3498DB',
    sound: 'Wi-Fi',
  },
];

// Game levels
export const GAME_LEVELS = {
  EASY: {
    id: 'easy',
    name: 'Easy',
    emoji: '😊',
    options: 2,
    questions: 5,
    timePerQuestion: 0,
  },
  MEDIUM: {
    id: 'medium',
    name: 'Medium',
    emoji: '🤔',
    options: 3,
    questions: 8,
    timePerQuestion: 0,
  },
  HARD: {
    id: 'hard',
    name: 'Hard',
    emoji: '🧠',
    options: 4,
    questions: 10,
    timePerQuestion: 0,
  },
};

// Encouragement messages
export const ENCOURAGEMENT_MESSAGES = [
  { emoji: '🎉', text: 'Well done!', color: '#4CAF50' },
  { emoji: '⭐', text: 'Excellent!', color: '#FFC107' },
  { emoji: '🌟', text: 'Awesome!', color: '#FF9800' },
  { emoji: '👏', text: 'You are the best!', color: '#2196F3' },
  { emoji: '💪', text: 'You are strong!', color: '#9C27B0' },
  { emoji: '🏆', text: 'Champion!', color: '#FFD700' },
  { emoji: '✨', text: 'Amazing!', color: '#E91E63' },
  { emoji: '🎯', text: 'Correct!', color: '#00BCD4' },
];

// Final result messages
export const RESULT_MESSAGES = [
  {
    minScore: 90,
    emoji: '🏆',
    title: 'Champion!',
    message: 'You are very smart! You got all the answers right!',
    color: '#FFD700',
    stars: 3,
  },
  {
    minScore: 70,
    emoji: '⭐',
    title: 'Excellent!',
    message: 'Very good! You got almost all correct!',
    color: '#4CAF50',
    stars: 3,
  },
  {
    minScore: 50,
    emoji: '👍',
    title: 'Good job!',
    message: 'You did well! Practice more!',
    color: '#2196F3',
    stars: 2,
  },
  {
    minScore: 0,
    emoji: '💪',
    title: 'You tried!',
    message: 'Good! You will do better next time!',
    color: '#FF9800',
    stars: 1,
  },
];

// Function to select random devices
export const getRandomDevices = (count) => {
  const shuffled = [...GAME_DEVICES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Function to generate question
export const generateQuestion = (level) => {
  const { options } = GAME_LEVELS[level.toUpperCase()];
  const allDevices = getRandomDevices(options);
  const correctAnswer = allDevices[Math.floor(Math.random() * allDevices.length)];
  
  return {
    questionKey: 'Where is {{name}}?',
    correctAnswer,
    options: allDevices,
  };
};

// Function to get random encouragement message
export const getRandomEncouragement = () => {
  return ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
};

// Function to get result message based on score
export const getResultMessage = (score) => {
  const sortedResults = [...RESULT_MESSAGES].sort((a, b) => b.minScore - a.minScore);
  return sortedResults.find(result => score >= result.minScore) || RESULT_MESSAGES[RESULT_MESSAGES.length - 1];
};
