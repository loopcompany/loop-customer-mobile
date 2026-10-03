import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import NewStyles from '@styles/NewStyles';
import ScreenHeaders from '@components/ScreenHeaders';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { fontSize, getFontFamily } from '@theme/Typography';
import AccordionItem from '@components/AccordionItem';
import FooterSpacer from '@components/FooterSpacer';
import { PRIVACY_POLICY_META, PRIVACY_POLICY_SECTIONS, PRIVACY_POLICY_TITLE } from './privacyPolicyContent';

export default function PrivacyScreen() {
  const { t } = useTranslation();
  // Expand first item by default
  const [expandedItems, setExpandedItems] = useState({ [PRIVACY_POLICY_SECTIONS[0].id]: true });

  const renderTermItem = ({ item }) => {
    return (
      <AccordionItem item={item} expandedItems={expandedItems} setExpandedItems={setExpandedItems} />
    );
  };

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={t("Privacy Policy")} />
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.documentTitle}>{PRIVACY_POLICY_TITLE}</Text>
            <Text style={styles.metaText}>تاریخ آخرین به‌روزرسانی: {PRIVACY_POLICY_META.lastUpdated}</Text>
          </View>
        }
        ListFooterComponent={
          <>
            <View style={styles.footer}>
              <Text style={styles.metaText}>{PRIVACY_POLICY_META.preparedBy}</Text>
              <Text style={styles.metaText}>
                نسخه: {PRIVACY_POLICY_META.version} · تاریخ تدوین: {PRIVACY_POLICY_META.lastUpdated} · شماره سند: {PRIVACY_POLICY_META.documentNumber}
              </Text>
              <Text style={styles.metaText}>{PRIVACY_POLICY_META.copyright}</Text>
            </View>
            <FooterSpacer />
          </>
        }
        data={PRIVACY_POLICY_SECTIONS}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.privaciesContainer}
        renderItem={renderTermItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  privaciesContainer: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  documentTitle: {
    fontSize: fontSize.md,
    fontFamily: getFontFamily('bold', 'fa'),
    color: colors.textPrimary.color,
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: spacing.sm,
  },
  header: {
    marginBottom: spacing.lg,
  },
  footer: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.bgColor(1),
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.xs,
    fontFamily: getFontFamily('regular', 'fa'),
    color: colors.textSecondary.color,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
