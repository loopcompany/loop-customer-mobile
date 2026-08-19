// screens/IdeaBoxScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from 'react-i18next';
import NewStyles from "@styles/NewStyles";
import Button from "@components/Button";
import ScreenHeaders from "@components/ScreenHeaders";
import Footer from "./Footer";

export default function IdeaBoxScreen({ navigation }) {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.container} edges={{ top: 'off', bottom: 'additive' }}>
      <ScreenHeaders 
        title={t("Think and Play")}   
      />
      {/* <Text style={styles.title}>فکر و بکر</Text> */}
      <Text
        style={[
          NewStyles.border10,
          NewStyles.text10,
          NewStyles.center,
          { textAlign: "center" },
        ]}
      >
        {t("Hello Loop Friend")} {"\n"} {t("Think and Play is for learning about computer fields in a fun and game-like way.")} {"\n"} {t("Age group: 1 to 5 years")}
      </Text>

      <View style={styles.buttonsContainer}>

        <View style={{ flex: 1 }}>
          <Button title={t("Words")} />
        </View>

        <View style={{ flex: 1 }}>
          <Button title={t("Images")} />
        </View>
      </View>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  
  
  
  container: {
    flex: 1,
    backgroundColor: "#d1e9ff",

    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 15,
    marginBottom: 30,
    color: "#333",
  },
  buttonsContainer: {
    gap: 30,
    paddingHorizontal: 15,
    flexDirection: "row-reverse",

  },
  button: {
    backgroundColor: "#005b9f",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  footerText: {
    fontWeight: "bold",
    color: "#003366",
  },
});
