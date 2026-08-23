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
import AccordionItem from '@components/AccordionItem';

export default function FAQScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const newStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const [expandedId, setExpandedId] = React.useState(null);

  const faqs = [
    {
      id: 1,
      question: 'چگونه می‌توانم سفارش خود را پیگیری کنم؟',
      answer: 'شما می‌توانید از بخش "سفارشات" در برنامه وضعیت سفارش خود را مشاهده کنید.',
    },
    {
      id: 2,
      question: 'هزینه خدمات چقدر است؟',
      answer: 'هزینه خدمات بستگی به نوع سفارش و موقعیت دارد. برای جزئیات بیشتر با پشتیبانی تماس بگیرید.',
    },
    {
      id: 3,
      question: 'آیا می‌توانم سفارش خود را لغو کنم؟',
      answer: 'بله، می‌توانید سفارش را قبل از شروع خدمات لغو کنید.',
    },
    {
      id: 4,
      question: 'چگونه می‌توانم پرداختی خود را انجام دهم؟',
      answer: 'شما می‌توانید از روش‌های مختلف پرداخت شامل کیف پول و کارت بانکی استفاده کنید.',
    },
  ];

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={newStyles.container}>
      <CustomStatusBar />
      <ScreenHeaders
        title={t('FAQ')}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={[newStyles.title10, styles.header]}>سوالات متداول</Text>
          <Text style={[newStyles.text9, styles.subtitle]}>
            پاسخ‌های سریع به پرسش‌های رایج
          </Text>
        </View>

        <View style={styles.faqContainer}>
          {faqs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={[styles.faqItem, newStyles.border10]}
              onPress={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
            >
              <View style={styles.questionRow}>
                <Text style={[newStyles.title10, styles.question]}>{faq.question}</Text>
                <Text style={styles.chevron}>{expandedId === faq.id ? '−' : '+'}</Text>
              </View>
              {expandedId === faq.id && (
                <View style={styles.answerContainer}>
                  <Text style={[newStyles.text10, styles.answer]}>{faq.answer}</Text>
                </View>
              )}
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
  faqContainer: {
    gap: spacing.md,
  },
  faqItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.bgColor(1),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.bgColor(0.5),
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginRight: spacing.md,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
    color: colors.primary.color,
  },
  answerContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.bgColor(0.3),
  },
  answer: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary.color,
  },
});
