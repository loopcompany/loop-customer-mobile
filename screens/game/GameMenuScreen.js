import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ScreenHeaders from '../../components/ScreenHeaders';
import NewStyles from '../../styles/NewStyles';
import { themeColor1, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';
import { GAME_LEVELS } from './GameData';
import Button from '../../components/Button';

export default function GameMenuScreen({ navigation }) {
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState('easy');
  const scaleAnim = new Animated.Value(1);

  const handleLevelSelect = (levelId) => {
    setSelectedLevel(levelId);
    // انیمیشن کوچک برای بازخورد
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleStartGame = () => {
    navigation.navigate('GamePlay', { level: selectedLevel });
  };

  return (
    <View style={styles.container}>
      <ScreenHeaders title={t("Think and Play")} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header بازی */}
        <View style={styles.header}>
          <Text style={styles.gameEmoji}>🎮</Text>
          <Text style={[NewStyles.title10, styles.title]}>
            {t("Hello Loop Friend")}
          </Text>
          <Text style={[NewStyles.text10, styles.subtitle]}>
            {t("Think and Play is for learning about computer fields in a fun and game-like way.")}
          </Text>
          <Text style={[NewStyles.text10, styles.subtitle]}>
            {t("Age group: 1 to 5 years")}
          </Text>
        </View>

        {/* راهنمای بازی */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>👀</Text>
            <Text style={[NewStyles.text10, styles.infoText]}>
              {t("See the computer device image")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>👆</Text>
            <Text style={[NewStyles.text10, styles.infoText]}>
              {t("Click on the correct device")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>⭐</Text>
            <Text style={[NewStyles.text10, styles.infoText]}>
              {t("Collect stars and become a champion!")}
            </Text>
          </View>
        </View>

        {/* انتخاب سطح */}
        <View style={styles.levelsSection}>
          <Text style={[NewStyles.title10, styles.sectionTitle]}>
            {t("Choose the game level:")}
          </Text>

          {Object.entries(GAME_LEVELS).map(([key, level]) => {
            const isSelected = selectedLevel === level.id;
            return (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelCard,
                  isSelected && styles.levelCardSelected,
                ]}
                onPress={() => handleLevelSelect(level.id)}
                activeOpacity={0.7}
              >
                <View style={styles.levelHeader}>
                  <Text style={styles.levelEmoji}>{level.emoji}</Text>
                  <Text
                    style={[
                      NewStyles.title10,
                      styles.levelName,
                      isSelected && styles.levelNameSelected,
                    ]}
                  >
                    {t(level.name)}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={themeColor1.bgColor(1)}
                    />
                  )}
                </View>

                <View style={styles.levelDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="apps" size={16} color={themeColor3.bgColor(1)} />
                    <Text style={[NewStyles.text10, styles.detailText]}>
                      {level.options} {t("options")}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="help-circle" size={16} color={themeColor3.bgColor(1)} />
                    <Text style={[NewStyles.text10, styles.detailText]}>
                      {level.questions} {t("questions")}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* دکمه شروع بازی */}
        <View style={styles.buttonContainer}>
          <Button
            title={t("Start Game! 🚀")}
            onPress={handleStartGame}

          />
        </View>

        {/* یادآوری برای والدین */}
        <View style={styles.parentNote}>
          <Ionicons name="information-circle" size={20} color={themeColor1.bgColor(1)} />
          <Text style={[NewStyles.text10, styles.parentNoteText]}>
            {t("This game is designed for children aged 1 to 5 years and helps them become familiar with computer devices and technology.")}
          </Text>
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  gameEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: themeColor3.bgColor(1),
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  infoEmoji: {
    fontSize: 24,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  levelsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'right',
  },
  levelCard: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelCardSelected: {
    borderColor: themeColor1.bgColor(1),
    backgroundColor: themeColor1.bgColor(0.1),
  },
  levelHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  levelEmoji: {
    fontSize: 32,
  },
  levelName: {
    fontSize: 18,
    flex: 1,
  },
  levelNameSelected: {
    color: themeColor1.bgColor(1),
  },
  levelDetails: {
    flexDirection: 'row-reverse',
    gap: 20,
    paddingRight: 44,
  },
  detailItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  parentNote: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 10,
    padding: 14,
    gap: 10,
    borderRightWidth: 3,
    borderRightColor: themeColor1.bgColor(1),
  },
  parentNoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 20,
  },
});
