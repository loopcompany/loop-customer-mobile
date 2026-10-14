// فهرست پیوست‌ها: پیش از ارسال (با دکمه‌ی حذف) و داخل پیام‌های ارسال‌شده
// (تصویر → نمایش تمام‌صفحه، فایل → باز کردن لینک).
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize } from '@theme/Typography';
import { formatFileSize, isImageAttachment } from './composerUtils';

/**
 * @param {{
 *   items: Array<{ key: string, uri: string, name?: string, size?: number, mimeType?: string }>,
 *   onRemove?: (key: string) => void,
 *   onOpen?: (item: object) => void,
 * }} props
 */
const AttachmentChips = ({ items, onRemove, onOpen }) => {
  if (!items?.length) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {items.map((item) => {
        const image = isImageAttachment(item);
        return (
          <TouchableOpacity
            key={item.key}
            disabled={!onOpen}
            onPress={() => onOpen?.(item)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              maxWidth: 220,
              padding: spacing.xs,
              paddingRight: onRemove ? spacing.xs : spacing.sm,
              borderRadius: radius.sm,
              borderWidth: 1,
              borderColor: colors.border.bgColor(1),
              backgroundColor: colors.surface.bgColor(1),
            }}
          >
            {image ? (
              <Image
                source={{ uri: item.uri }}
                style={{ width: 40, height: 40, borderRadius: radius.sm }}
              />
            ) : (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.sm,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.error.bgColor(0.1),
                }}
              >
                <Ionicons name="document-text-outline" size={22} color={colors.error.color} />
              </View>
            )}
            <View style={{ flexShrink: 1 }}>
              <Text
                numberOfLines={1}
                style={{ fontSize: fontSize.xs, color: colors.textPrimary.color }}
              >
                {item.name || (image ? 'image' : 'file')}
              </Text>
              {item.size ? (
                <Text style={{ fontSize: fontSize.xs, color: colors.textMuted.color }}>
                  {formatFileSize(item.size)}
                </Text>
              ) : null}
            </View>
            {onRemove ? (
              <TouchableOpacity
                onPress={() => onRemove(item.key)}
                hitSlop={8}
                accessibilityLabel="remove"
              >
                <Ionicons name="close-circle" size={20} color={colors.textMuted.color} />
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default AttachmentChips;
