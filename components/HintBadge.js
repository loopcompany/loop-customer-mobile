import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/Color';
import { spacing } from '../theme/Spacing';
import { radius } from '../theme/Radius';
import { fontSize, getFontFamily } from '../theme/Typography';
import { shadow } from '../theme/Shadows';

// دکمه‌ی دایره‌ای «؟» که با لمس، یک درُر (bottom sheet) از پایین صفحه باز می‌کند
// و متن راهنما را نشان می‌دهد. جایگزین باکس‌های زرد راهنما در سراسر اپ.
const HintBadge = ({ hint, title, size = 24, style, iconColor }) => {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(false);

  if (!hint) return null;

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={title || t('Guide')}
        hitSlop={{ top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm }}
        style={[
          styles.badge,
          { width: size, height: size, borderRadius: size / 2 },
          style,
        ]}
      >
        <Ionicons
          name="help-outline"
          size={size * 0.62}
          color={iconColor || colors.textInverse.bgColor(1)}
        />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.dragHandle} />
            {title ? (
              <Text style={[styles.title, { fontFamily: getFontFamily('bold', i18n.language) }]}>
                {title}
              </Text>
            ) : null}
            <ScrollView
              style={styles.textScroll}
              contentContainerStyle={styles.textScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.text, { fontFamily: getFontFamily('light', i18n.language) }]}>
                {hint}
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>
              <Text style={[styles.closeButtonText, { fontFamily: getFontFamily('bold', i18n.language) }]}>
                {t('Got it')}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.primary.bgColor(0.85),
    borderWidth: 1.5,
    borderColor: colors.textInverse.bgColor(0.85),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay.bgColor(0.45),
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface.bgColor(1),
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
    ...shadow.lg,
  },
  dragHandle: {
    width: spacing.huge,
    height: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.border.bgColor(1),
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    color: colors.primary.color,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  textScroll: {
    alignSelf: 'stretch',
    maxHeight: 320,
  },
  textScrollContent: {
    paddingBottom: spacing.xs,
  },
  text: {
    fontSize: fontSize.sm,
    lineHeight: 22,
    color: colors.textPrimary.color,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  closeButton: {
    backgroundColor: colors.primary.bgColor(1),
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxxl,
  },
  closeButtonText: {
    fontSize: fontSize.sm,
    color: colors.textInverse.color,
  },
});

export default HintBadge;
