import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { themeColor0, themeColor10, themeColor4 } from "@theme/Color";
import NewStyles from "@styles/NewStyles";

export default function Button({ onPress, title, style, loading , textStyle}) {
  return (
    <TouchableOpacity
      disabled={loading}
      style={[styles.button, NewStyles.shadow, NewStyles.border10,NewStyles.center, style]}
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
  
});
