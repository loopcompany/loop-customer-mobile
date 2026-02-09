import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor1, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';
import {
  GAME_LEVELS,
  generateQuestion,
  getRandomEncouragement,
} from './GameData';

export default function GamePlayScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { level = 'easy' } = route.params || {};
  const levelConfig = GAME_LEVELS[level.toUpperCase()];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [encouragement, setEncouragement] = useState(null);

  // انیمیشن‌ها
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // تولید سوالات در شروع بازی
    const generatedQuestions = [];
    for (let i = 0; i < levelConfig.questions; i++) {
      generatedQuestions.push(generateQuestion(level));
    }
    setQuestions(generatedQuestions);
  }, [level]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (selectedDevice) => {
    const correct = selectedDevice.id === currentQuestion.correctAnswer.id;
    setIsCorrect(correct);
    setShowFeedback(true);

    // محاسبه امتیاز جدید
    const newScore = correct ? score + 1 : score;

    if (correct) {
      // پاسخ درست
      setScore(newScore);
      const encouragementMsg = getRandomEncouragement();
      setEncouragement(encouragementMsg);
      Vibration.vibrate(100); // ویبره کوتاه برای بازخورد

      // انیمیشن موفقیت
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.2,
            useNativeDriver: true,
            friction: 3,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            delay: 800,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setShowFeedback(false);
        moveToNextQuestion(newScore);
      });
    } else {
      // پاسخ غلط - انیمیشن تکان خوردن
      Vibration.vibrate([0, 100, 100, 100]); // ویبره برای خطا

      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          setShowFeedback(false);
          moveToNextQuestion(newScore);
        }, 800);
      });
    }
  };

  const moveToNextQuestion = (currentScore = score) => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // بازی تمام شد - استفاده از currentScore به جای score
      const finalScore = Math.round((currentScore / questions.length) * 100);
      navigation.replace('GameResult', {
        score: finalScore,
        correctAnswers: currentScore,
        totalQuestions: questions.length,
        level,
      });
    }
  };

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <ScreenHeaders title={t("Computer Game")} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>⏳</Text>
          <Text style={[NewStyles.title10, { fontSize: 18 }]}>
            {t("Preparing the game...")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeaders
        title={t("Question {{current}} of {{total}}", { current: currentQuestionIndex + 1, total: questions.length })}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* نوار امتیاز */}
        <View style={styles.scoreBar}>
          <View style={styles.scoreItem}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={[NewStyles.title10, styles.scoreText]}>
              {score}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* سوال */}
        <View style={styles.questionContainer}>
          <Text style={[NewStyles.title10, styles.questionText]}>
            {t(currentQuestion.questionKey, { name: t(currentQuestion.correctAnswer.name) })}
          </Text>
          <Text style={styles.questionEmoji}>
            {currentQuestion.correctAnswer.emoji}
          </Text>
        </View>

        {/* گزینه‌های پاسخ */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((device) => (
            <Animated.View
              key={device.id}
              style={{
                transform: [{ translateX: shakeAnim }],
              }}
            >
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  { borderColor: device.color },
                ]}
                onPress={() => !showFeedback && handleAnswer(device)}
                disabled={showFeedback}
                activeOpacity={0.7}
              >
                <Text style={styles.optionEmoji}>{device.emoji}</Text>
                <Text style={[NewStyles.title10, styles.optionName]}>
                  {t(device.name)}
                </Text>
                <Text style={[NewStyles.text10, styles.optionSound]}>
                  {t(device.sound)}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {showFeedback && !isCorrect && (
          <View style={styles.feedbackOverlay}>
            <Text style={styles.feedbackEmoji}>😊</Text>
            <Text
              style={[
                NewStyles.title10,
                styles.feedbackText,
                { color: '#FF9800' },
              ]}
            >
              {t("Try again!")}
            </Text>
          </View>
        )}

        {/* بازخورد‌ها به صورت overlay و خارج از scroll هستند */}
        {showFeedback && isCorrect && encouragement && (
          <Animated.View
            style={[
              styles.feedbackOverlay,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.feedbackEmoji}>{encouragement.emoji}</Text>
            <Text
              style={[
                NewStyles.title10,
                styles.feedbackText,
                { color: encouragement.color },
              ]}
            >
              {t(encouragement.text)}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColor5.bgColor(1),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  loadingEmoji: {
    fontSize: 64,
  },
  scoreBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  scoreItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: themeColor4.bgColor(1),
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  scoreText: {
    fontSize: 18,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: themeColor1.bgColor(1),
    borderRadius: 5,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 20,
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 16,
  },
  questionText: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  questionEmoji: {
    fontSize: 80,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'flex-start',
    gap: 12,
    marginBottom: 60,
  },
  optionCard: {
    width: 150,
    height: 160,
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    gap: 8,
  },
  optionEmoji: {
    fontSize: 48,
  },
  optionName: {
    fontSize: 16,
    textAlign: 'center',
  },
  optionSound: {
    fontSize: 12,
    color: themeColor3.bgColor(1),
    textAlign: 'center',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 32,
    fontFamily: 'VazirBold',
  },
});
