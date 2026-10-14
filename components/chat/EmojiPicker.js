// انتخابگر ایموجی زیر کادر پیام. با هر انتخاب `onPick(emoji)` صدا زده می‌شود؛
// درج در محل نشانگر کار صفحه است (composerUtils.insertAtSelection).
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { EMOJI_CATEGORIES } from './emojiData';

const EmojiPicker = ({ onPick }) => {
  const [category, setCategory] = useState(EMOJI_CATEGORIES[0].id);
  const current = EMOJI_CATEGORIES.find((item) => item.id === category) || EMOJI_CATEGORIES[0];

  return (
    <View
      style={{
        backgroundColor: colors.surface.bgColor(1),
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border.bgColor(1),
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: colors.divider.bgColor(1),
        }}
      >
        {EMOJI_CATEGORIES.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setCategory(item.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: item.id === category }}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: spacing.sm,
              backgroundColor: item.id === category ? colors.primary.bgColor(0.1) : 'transparent',
            }}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={item.id === category ? colors.primary.color : colors.textMuted.color}
            />
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        style={{ maxHeight: 200 }}
        contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', padding: spacing.xs }}
      >
        {current.emojis.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            onPress={() => onPick(emoji)}
            accessibilityLabel={emoji}
            style={{ width: '12.5%', alignItems: 'center', paddingVertical: spacing.xs }}
          >
            <Text style={{ fontSize: 26 }}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default EmojiPicker;
