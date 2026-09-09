import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { themeColor0, themeColor10, themeColor13 } from "@theme/Color";
import NewStyles from "@styles/NewStyles";

export default function Menuitem({ onPress, title, style, loading, subTitle }) {
  return (
    <View style={[styles.button,NewStyles.border10, NewStyles.shadow, NewStyles.center,{backgroundColor:themeColor13.bgColor(1), alignItems:'flex-start', justifyContent:'flex-start'}, style]}>
      <TouchableOpacity
        disabled={loading}
        style={[NewStyles.center,{backgroundColor:themeColor0.bgColor(1), width:'99%',height:'96%'},NewStyles.border10]}
        onPress={onPress}
      >
        {loading && (
          <ActivityIndicator size={"small"} color={themeColor0.bgColor(1)} />
        )}
        {!loading && <Text style={NewStyles.title1}>{title}</Text>}
        {!loading && subTitle && (
          <Text style={NewStyles.title1}>{subTitle}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: themeColor0.bgColor(1),
    borderColor: themeColor0.bgColor(1),
    width: "100%",
    height: 70,
    alignItems: "center",
    maxWidth:200
  },
});
