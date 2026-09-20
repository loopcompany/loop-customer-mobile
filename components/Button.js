import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { themeColor0, themeColor3, themeColor4 } from "@theme/Color";
import NewStyles from "@styles/NewStyles";

/**
 * `disabled` قبلاً در props گرفته نمی‌شد.
 *
 * چند صفحه (انتخابگرِ نقشه، نظرسنجی، یادداشت‌ها) آن را پاس می‌دادند و انتظار
 * داشتند دکمه خاموش شود، ولی prop نادیده گرفته می‌شد: دکمه هم ظاهرِ فعال داشت
 * هم واقعاً کار می‌کرد. حالا هم غیرفعال می‌شود هم کم‌رنگ.
 */
export default function Button({ onPress, title, style, loading, disabled, textStyle }) {
  const inactive = Boolean(loading || disabled);

  return (
    <TouchableOpacity
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: Boolean(loading) }}
      style={[
        styles.button,
        NewStyles.shadow,
        NewStyles.border10,
        NewStyles.center,
        disabled && !loading && styles.disabled,
        style,
      ]}
      onPress={onPress}
    >
      {loading && (
        <ActivityIndicator size={"small"} color={themeColor4.bgColor(1)} />
      )}
      {!loading && <Text style={[NewStyles.title1,{width:'100%', textAlign:'center'},textStyle]}>{title}</Text>}
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor:themeColor0.bgColor(1),
    
    paddingHorizontal: 40,
    marginVertical: 10,
    width: "100%",
    height:50,
    alignItems: "center",
    maxWidth:400
  },
  disabled: {
    backgroundColor: themeColor3.bgColor(1),
    opacity: 0.8,
  },
});
