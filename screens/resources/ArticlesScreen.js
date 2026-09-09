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
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { createStyles } from '@styles/NewStyles';

export default function ArticlesScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const newStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );

  const articles = [
    {
      id: 1,
      title: 'نحوه استفاده از برنامه',
      category: 'آموزش',
      excerpt: 'راهنمای کامل برای استفاده بهتر از برنامه لوپ...',
      date: '۱۴۰۳/۰۸/۲۰',
    },
    {
      id: 2,
      title: 'نکات ایمنی در سفارش خدمات',
      category: 'ایمنی',
      excerpt: 'نکاتی برای امن و محفوظ ماندن هنگام سفارش...',
      date: '۱۴۰۳/۰۸/۱۵',
    },
    {
      id: 3,
      title: 'راهنمای پرداخت و کیف پول',
      category: 'مالی',
      excerpt: 'آموزش استفاده از سیستم پرداخت و کیف پول...',
      date: '۱۴۰۳/۰۸/۱۰',
    },
    {
      id: 4,
      title: 'بهترین روش‌های سفارش دهی',
      category: 'نکات مفید',
      excerpt: 'راهکارهایی برای بهتر و سریع‌تر سفارش کردن...',
      date: '۱۴۰۳/۰۸/۰۵',
    },
  ];

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={newStyles.container}>
      <CustomStatusBar />
      <ScreenHeaders
        title={t('Articles')}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={[newStyles.title10, styles.header]}>مقالات و آموزش</Text>
          <Text style={[newStyles.text9, styles.subtitle]}>
            اطلاعات مفید و نکات آموزشی
          </Text>
        </View>

        <View style={styles.articlesContainer}>
          {articles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={[styles.articleCard, newStyles.border10]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{article.category}</Text>
                </View>
                <Text style={styles.date}>{article.date}</Text>
              </View>

              <Text style={[newStyles.title10, styles.articleTitle]}>
                {article.title}
              </Text>

              <Text style={[newStyles.text10, styles.excerpt]}>
                {article.excerpt}
              </Text>

              <View style={styles.footer}>
                <Text style={styles.readMore}>ادامه مطلب ›</Text>
              </View>
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
    marginBottom: spacing.lg,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary.color,
  },
  articlesContainer: {
    gap: spacing.md,
  },
  articleCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.bgColor(1),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.bgColor(0.5),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.primary.bgColor(0.1),
    borderRadius: radius.sm,
  },
  categoryText: {
    fontSize: 12,
    color: colors.primary.color,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: colors.textMuted.color,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.textPrimary.color,
  },
  excerpt: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary.color,
    marginBottom: spacing.md,
  },
  footer: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.bgColor(0.2),
  },
  readMore: {
    fontSize: 12,
    color: colors.primary.color,
    fontWeight: '600',
  },
});
