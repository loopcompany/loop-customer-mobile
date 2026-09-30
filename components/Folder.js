import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useState } from "react";
import { themeColor0, themeColor10 } from "@theme/Color";
import { imageUri } from "@services/URL";
import { useTranslation } from "react-i18next";
import { createStyles } from "@styles/NewStyles";

// `image` مسیر تصویر روی سرور است و اولویت دارد. `imageSource` تصویر محلی است:
// اگر `image` نباشد یا بارگذاری‌اش خطا بدهد (مثلاً 403 از /storage) همین نمایش
// داده می‌شود تا کاشی خالی نماند. برای دسته‌هایی که اصلاً تصویر ندارند `icon` را بدهید.
//
// تصویر سرور با expo-image بارگذاری می‌شود: تا رسیدنش `imageSource` محلی به‌عنوان
// placeholder دیده می‌شود (کاشی لحظه‌ی اول خالی نیست) و بعد از بارگذاری با یک
// fade جایگزین می‌شود. روی native در حافظه و دیسک cache می‌شود و در ورودهای بعدی
// دوباره دانلود نمی‌شود؛ روی وب cache مرورگر (Cache-Control سرور) همین کار را می‌کند.
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

  const remote = image && !remoteFailed;
  const source = remote ? { uri: `${imageUri}/${image}` } : imageSource;

  return (
    <TouchableOpacity disabled={loading} style={[styles.button, NewStyles.center, style, {justifyContent:'flex-start'}]} onPress={onPress}>
      {source ? (
        <Image
          source={source}
          placeholder={remote ? imageSource : undefined}
          placeholderContentFit="contain"
          contentFit="contain"
          cachePolicy="memory-disk"
          priority="high"
          transition={150}
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
    borderRadius:20
  },
});