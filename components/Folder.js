import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import React from "react";
import { themeColor0, themeColor10 } from "../theme/Color";
import NewStyles from "../styles/NewStyles";
import { imageUri } from "../services/URL";

export default function Folder({ onPress, title, style, loading, image }) {

  return (
    <TouchableOpacity disabled={loading} style={[styles.button, NewStyles.center, style]} onPress={onPress}>
      <Image
        source={{ uri: `${imageUri}/${image}` }}
        style={styles.folderIcon}
      />
      <Text style={NewStyles.title4}>{title}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: themeColor10.bgColor(0.2),
    paddingHorizontal: 40,
    marginVertical: 10,
    width: 150,
    // height: 150,
    paddingVertical: 20,
    alignItems: "flex-end",
    aspectRatio:1
  },
  folderIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
});