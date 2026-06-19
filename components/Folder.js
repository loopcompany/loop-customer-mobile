import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useMemo } from "react";
import { themeColor0, themeColor10 } from "../theme/Color";
import { imageUri } from "../services/URL";
import { useTranslation } from "react-i18next";
import { createStyles } from "../styles/NewStyles";

export default function Folder({ onPress, title, style, loading, image }) {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]); 
  
  return (
    <TouchableOpacity disabled={loading} style={[styles.button, NewStyles.center, style, {justifyContent:'flex-start'}]} onPress={onPress}>
      <Image
        source={{ uri: `${imageUri}/${image}` }}
        style={[styles.folderIcon]}
      />
      <Text style={NewStyles.title4}>{title}</Text>
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