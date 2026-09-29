import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { themeColor0, themeColor10 } from "@theme/Color";
import { imageUri } from "@services/URL";
import { useTranslation } from "react-i18next";
import { createStyles } from "@styles/NewStyles";

// `image` مسیر تصویر روی سرور است و اولویت دارد. `imageSource` تصویر محلی است:
// اگر `image` نباشد یا بارگذاری‌اش خطا بدهد (مثلاً 403 از /storage) همین نمایش
// داده می‌شود تا کاشی خالی نماند. برای دسته‌هایی که اصلاً تصویر ندارند `icon` را بدهید.
export default function Folder({ onPress, title, style, loading, image, imageSource, icon }) {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const [remoteFailed, setRemoteFailed] = useState(false);

  useEffect(() => {
    setRemoteFailed(false);
  }, [image]);

  const source = image && !remoteFailed ? { uri: `${imageUri}/${image}` } : imageSource;

  return (
    <TouchableOpacity disabled={loading} style={[styles.button, NewStyles.center, style, {justifyContent:'flex-start'}]} onPress={onPress}>
      {source ? (
        <Image
          source={source}
          onError={() => image && setRemoteFailed(true)}
          style={[styles.folderIcon]}
        />
      ) : (
        <View style={[styles.folderIcon, NewStyles.center]}>{icon}</View>
      )}
      <Text style={NewStyles.title4}>{t(title)}</Text>
    </TouchableOpacity>
  );
}
const createLocalStyles = (NewStyles) => StyleSheet.create({
  button: { 
    marginTop: 10,
    width: 100,
    height: 120, 
    alignItems: "flex-end", 
  },
  folderIcon: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    borderRadius:20
  },
});