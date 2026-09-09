import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenHeaders from '@components/ScreenHeaders';
import CustomStatusBar from '@components/CustomStatusBar';
import NewStyles from '@styles/NewStyles';
import { colors, themeColor0, themeColor4 } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { createStyles } from '@styles/NewStyles';

export default function LOOPMenuScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const newStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );

  const menuItems = [
    {
      id: 'faq',
      title: 'سوالات متداول',
      subtitle: 'FAQs',
      icon: '❓',
      onPress: () => navigation.navigate('FAQScreen'),
    },
    {
      id: 'articles',
      title: 'مقالات و آموزش',
      subtitle: 'Articles & Tutorials',
      icon: '📚',
      onPress: () => navigation.navigate('ArticlesScreen'),
    },
    {
      id: 'privacy',
      title: 'حریم خصوصی',
      subtitle: 'Privacy Policy',
      icon: '🔒',
      onPress: () => navigation.navigate('PrivacyScreen'),
    },
    {
      id: 'terms',
      title: 'شرایط و قوانین',
      subtitle: 'Terms & Conditions',
      icon: '📋',
      onPress: () => navigation.navigate('OrganizationTermsScreen'),
    },
  ];

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={newStyles.container}>
      <CustomStatusBar />
      <ScreenHeaders
        title={t('LOOP Menu')}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={[newStyles.title, styles.title]}>لوپ</Text>
          <Text style={[newStyles.text10, styles.subtitle]}>Loop Services</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuCard, newStyles.border10]}
              onPress={item.onPress}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={[newStyles.title10, styles.menuTitle]}>{item.title}</Text>
                <Text style={[newStyles.text9, styles.menuSubtitle]}>{item.subtitle}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary.color,
    fontSize: 14,
  },
  menuContainer: {
    gap: spacing.md,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.bgColor(1),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.bgColor(0.5),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: themeColor0.bgColor(0.1),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuSubtitle: {
    color: colors.textSecondary.color,
  },
  arrow: {
    fontSize: 20,
    color: colors.textMuted.color,
    fontWeight: '300',
  },
});
