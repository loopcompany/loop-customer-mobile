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

export default function Folder({
  onPress,
  title,
  style,
  loading,
}) {
  return (
    <TouchableOpacity
      disabled={loading}
      style={[styles.button, NewStyles.center, style]}
      onPress={onPress}
    >
  
      {/* {(!loading && image) && <Text style={NewStyles.title4}>{image}</Text>} */}

  
            <Image
                    source={require("../assets/folder.png")}
                    style={styles.folderIcon}
                  />
       <Text style={NewStyles.title4}>{title}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: themeColor10.bgColor(0.2),
    // borderColor: themeColor0.bgColor(1),
    // borderWidth: 2,
    // borderRadius: 10,
    // paddingVertical: 12,
    paddingHorizontal: 40,
    marginVertical: 10,
    // shadowColor: "#00f",
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0.9,
    // shadowRadius: 10,
    // elevation: 5,
    width: "40%",
    height: 70,
    alignItems: "flex-end",
  },
  folderIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
});