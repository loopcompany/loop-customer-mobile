import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor1, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';
import { getResultMessage } from './GameData';
import Button from '../../components/Button';

export default function GameResultScreen({ route, navigation }) {
  const {
    score = 0,
    correctAnswers = 0,
    totalQuestions = 5,
    level = 'easy',
  } = route.params || {};

  const resultMessage = getResultMessage(score);

  // انیمیشن‌ها
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const starAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // انیمیشن ورود
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // انیمیشن ستاره‌ها
      Animated.stagger(
        200,
        starAnims.slice(0, resultMessage.stars).map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();
  }, []);

  const handlePlayAgain = () => {
    navigation.replace('GameMenu');
  };

  const handleBackToMenu = () => {
    navigation.navigate('FolderScreen');
  };

  return (
    <View style={styles.container}>
      <ScreenHeaders
        title="نتیجه بازی"
        onBackPress={handleBackToMenu}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* نتیجه اصلی */}
        <Animated.View
          style={[
            styles.resultCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.resultEmoji}>{resultMessage.emoji}</Text>
          <Text
            style={[
              NewStyles.title10,
              styles.resultTitle,
              { color: resultMessage.color },
            ]}
          >
            {resultMessage.title}
          </Text>
          <Text style={[NewStyles.text10, styles.resultMessage]}>
            {resultMessage.message}
          </Text>

          {/* ستاره‌ها */}
          <View style={styles.starsContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={{
                  transform: [
                    {
                      scale: index < resultMessage.stars ? starAnims[index] : 0.5,
                    },
                  ],
                  opacity: index < resultMessage.stars ? 1 : 0.3,
                }}
              >
                <Ionicons
                  name={index < resultMessage.stars ? 'star' : 'star-outline'}
                  size={48}
                  color="#FFD700"
                />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* آمار بازی */}
        <View style={styles.statsCard}>
          <Text style={[NewStyles.title10, styles.statsTitle]}>
            آمار بازی
          </Text>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={[NewStyles.text10, styles.statLabel]}>
                پاسخ درست
              </Text>
              <Text style={[NewStyles.title10, styles.statValue]}>
                {correctAnswers}
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons name="close-circle" size={24} color="#F44336" />
              <Text style={[NewStyles.text10, styles.statLabel]}>
                پاسخ غلط
              </Text>
              <Text style={[NewStyles.title10, styles.statValue]}>
                {totalQuestions - correctAnswers}
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons name="trophy" size={24} color="#FF9800" />
              <Text style={[NewStyles.text10, styles.statLabel]}>
                امتیاز
              </Text>
              <Text style={[NewStyles.title10, styles.statValue]}>
                {score}%
              </Text>
            </View>
          </View>
        </View>

        {/* پیام انگیزشی */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>💪</Text>
          <Text style={[NewStyles.text10, styles.motivationText]}>
            {score >= 80
              ? 'تو خیلی باهوشی! ادامه بده!'
              : score >= 50
              ? 'دفعه بعد بهتر می‌شی! تمرین کن!'
              : 'عیبی نداره! بازی کردن خیلی خوبه!'}
          </Text>
        </View>

        {/* دکمه‌های عملیاتی */}
        <View style={styles.buttonsContainer}>
          <Button
            title="بازی دوباره! 🎮"
            onPress={handlePlayAgain}
          />
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBackToMenu}
          >
            <Text style={[NewStyles.title10, styles.secondaryButtonText]}>
              بازگشت به منو
            </Text>
          </TouchableOpacity>
        </View>

        {/* تشویق به تکرار */}
        {score < 100 && (
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={20} color="#FFC107" />
            <Text style={[NewStyles.text10, styles.tipText]}>
              می‌تونی دوباره بازی کنی و امتیاز بهتری بگیری!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
    paddingBottom: 30,
  },
  resultCard: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  resultEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 32,
    marginBottom: 12,
  },
  resultMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  statsCard: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 13,
    color: themeColor3.bgColor(1),
  },
  statValue: {
    fontSize: 24,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: themeColor3.bgColor(0.3),
  },
  motivationCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  motivationEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: themeColor1.bgColor(1),
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: themeColor1.bgColor(1),
  },
  tipCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
});
