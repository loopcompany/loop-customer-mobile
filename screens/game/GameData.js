// GameData.js - داده‌های بازی کامپیوتر و تکنولوژی برای کودکان

export const GAME_DEVICES = [
  {
    id: 1,
    name: 'لپ‌تاپ',
    emoji: '💻',
    color: '#4A90E2',
    sound: 'کلیک کلیک',
  },
  {
    id: 2,
    name: 'کامپیوتر',
    emoji: '🖥',
    color: '#2C3E50',
    sound: 'بوت بوت',
  },
  {
    id: 3,
    name: 'موس',
    emoji: '🖱',
    color: '#E74C3C',
    sound: 'کلیک',
  },
  {
    id: 4,
    name: 'کیبورد',
    emoji: '⌨',
    color: '#34495E',
    sound: 'تاپ تاپ',
  },
  {
    id: 5,
    name: 'تلفن همراه',
    emoji: '📱',
    color: '#50C878',
    sound: 'زنگ زنگ',
  },
  {
    id: 6,
    name: 'تبلت',
    emoji: '📱',
    color: '#1ABC9C',
    sound: 'سوییش',
  },
  {
    id: 7,
    name: 'پرینتر',
    emoji: '🖨',
    color: '#95A5A6',
    sound: 'ویز ویز',
  },
  {
    id: 8,
    name: 'هدفون',
    emoji: '🎧',
    color: '#9B59B6',
    sound: 'موزیک',
  },
  {
    id: 9,
    name: 'دوربین',
    emoji: '📷',
    color: '#E67E22',
    sound: 'کلیک کچ',
  },
  {
    id: 10,
    name: 'اسپیکر',
    emoji: '🔊',
    color: '#F39C12',
    sound: 'بوق بوق',
  },
  {
    id: 11,
    name: 'فلش مموری',
    emoji: '💾',
    color: '#16A085',
    sound: 'کلیک',
  },
  {
    id: 12,
    name: 'آنتن وای‌فای',
    emoji: '📡',
    color: '#3498DB',
    sound: 'وای فای',
  },
];

// سطوح بازی
export const GAME_LEVELS = {
  EASY: {
    id: 'easy',
    name: 'آسان',
    emoji: '😊',
    options: 2,
    questions: 5,
    timePerQuestion: 0,
  },
  MEDIUM: {
    id: 'medium',
    name: 'متوسط',
    emoji: '🤔',
    options: 3,
    questions: 8,
    timePerQuestion: 0,
  },
  HARD: {
    id: 'hard',
    name: 'سخت',
    emoji: '🧠',
    options: 4,
    questions: 10,
    timePerQuestion: 0,
  },
};

// پیام‌های تشویقی
export const ENCOURAGEMENT_MESSAGES = [
  { emoji: '🎉', text: 'آفرین!', color: '#4CAF50' },
  { emoji: '⭐', text: 'عالی!', color: '#FFC107' },
  { emoji: '🌟', text: 'دمت گرم!', color: '#FF9800' },
  { emoji: '👏', text: 'حرف نداری!', color: '#2196F3' },
  { emoji: '💪', text: 'قوی هستی!', color: '#9C27B0' },
  { emoji: '🏆', text: 'قهرمان!', color: '#FFD700' },
  { emoji: '✨', text: 'فوق‌العاده!', color: '#E91E63' },
  { emoji: '🎯', text: 'درست!', color: '#00BCD4' },
];

// پیام‌های نتیجه نهایی
export const RESULT_MESSAGES = [
  {
    minScore: 90,
    emoji: '🏆',
    title: 'قهرمان!',
    message: 'تو خیلی باهوشی! همه جواب‌ها را درست دادی!',
    color: '#FFD700',
    stars: 3,
  },
  {
    minScore: 70,
    emoji: '⭐',
    title: 'عالی!',
    message: 'خیلی خوب بود! تقریباً همه را درست گفتی!',
    color: '#4CAF50',
    stars: 3,
  },
  {
    minScore: 50,
    emoji: '👍',
    title: 'خوب بود!',
    message: 'خیلی خوب پیش رفتی! بیشتر تمرین کن!',
    color: '#2196F3',
    stars: 2,
  },
  {
    minScore: 0,
    emoji: '💪',
    title: 'تلاش کردی!',
    message: 'خوب بود! دفعه بعد بهتر می‌شی!',
    color: '#FF9800',
    stars: 1,
  },
];

// تابع انتخاب تصادفی دستگاه‌ها
export const getRandomDevices = (count) => {
  const shuffled = [...GAME_DEVICES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// تابع ایجاد سوال
export const generateQuestion = (level) => {
  const { options } = GAME_LEVELS[level.toUpperCase()];
  const allDevices = getRandomDevices(options);
  const correctAnswer = allDevices[Math.floor(Math.random() * allDevices.length)];
  
  return {
    question: `${correctAnswer.name} کجاست؟`,
    correctAnswer,
    options: allDevices,
  };
};

// تابع دریافت پیام تشویقی تصادفی
export const getRandomEncouragement = () => {
  return ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
};

// تابع دریافت پیام نتیجه بر اساس امتیاز
export const getResultMessage = (score) => {
  const sortedResults = [...RESULT_MESSAGES].sort((a, b) => b.minScore - a.minScore);
  return sortedResults.find(result => score >= result.minScore) || RESULT_MESSAGES[RESULT_MESSAGES.length - 1];
};
