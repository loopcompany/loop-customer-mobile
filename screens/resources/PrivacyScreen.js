import React, { useState } from 'react';
import { Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import NewStyles from '@styles/NewStyles';
import ScreenHeaders from '@components/ScreenHeaders';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { fontSize, getFontFamily } from '@theme/Typography';
import AccordionItem from '@components/AccordionItem';
import FooterSpacer from '@components/FooterSpacer';
import { PRIVACY_POLICY_SECTIONS, PRIVACY_POLICY_TITLE } from './privacyPolicyContent';

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
        ListHeaderComponent={<Text style={styles.documentTitle}>{PRIVACY_POLICY_TITLE}</Text>}
        ListFooterComponent={<FooterSpacer />}
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
    marginBottom: spacing.lg,
  },
});
