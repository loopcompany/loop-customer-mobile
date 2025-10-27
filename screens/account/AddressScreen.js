// AddressScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  I18nManager,
  SafeAreaView,
} from "react-native";
import { useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import ScreenHeaders from "../../components/ScreenHeaders";
import NewStyles from "../../styles/NewStyles";
import Footer from "../Footer";


export default function AddressScreen({ route, navigation }) {
  const [data, setData] = useState({
    addressName: "",
    fullName: "",
    phonePrefix: "021",
    phoneNumber: "",
    mobilePrefix: "09",
    mobile: "",
    province: "",
    district: "",
    fullAddress: "",
  });
  const [addressText, setAddressText] = useState("");

  useEffect(() => {
    if (route.params?.selectedLocation) {
      const { latitude, longitude } = route.params.selectedLocation;
      // مثلاً داخل یک فیلد آدرس نشون بده
      setAddressText(`موقعیت انتخاب شده: ${latitude}, ${longitude}`);
    }
  }, [route.params?.selectedLocation]);
  return (
    <SafeAreaView style={NewStyles.container}>
      <ScreenHeaders 
        title="ثبت ادرس جدید" 
        onPressLeft={() => navigation.goBack()} 
        onPressRight={() => navigation.navigate('NextScreen')} 
      />
      <View style={{flex:1}}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ padding: 20 }}
        >
          {/* <View style={{ gap: 10 }}> */}
          <TouchableOpacity
            onPress={() => navigation.navigate("MapPickerScreen")}
            style={styles.mapButton}
          >
            <Text style={styles.mapButtonText}>📍 انتخاب از روی نقشه</Text>
          </TouchableOpacity>

          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
            placeholder="نام آدرس منتخب *"
          />
          <TextInput
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.input]}
            placeholder="نام و نام خانوادگی *"
          />

          <View style={styles.row}>
            <TextInput
              style={[
                [NewStyles.textInput, NewStyles.border10, NewStyles.text10],
                { flex: 1 },
              ]}
              placeholder="شماره تماس ثابت"
              keyboardType="number-pad"
            />
            <TextInput
              style={[
                [NewStyles.textInput, NewStyles.border10, NewStyles.text10],
                styles.prefixInput,
              ]}
              value="021"
              editable={false}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[
                [NewStyles.textInput, NewStyles.border10, NewStyles.text10],
                { flex: 1 },
              ]}
              placeholder="شماره موبایل"
              keyboardType="phone-pad"
            />
            <TextInput
              style={[
                [NewStyles.textInput, NewStyles.border10, NewStyles.text10],
                styles.prefixInput,
              ]}
              value="09"
              editable={false}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[
                [NewStyles.textInput, NewStyles.border10, NewStyles.text10],
                { flex: 1 },
              ]}
              placeholder="منطقه"
            />
            <TextInput
              style={[
                [NewStyles.textInput, NewStyles.border10, NewStyles.text10],
                { flex: 1 },
              ]}
              placeholder="شهر"
            />
          </View>

          <TextInput
            style={[
              [NewStyles.textInput, NewStyles.border10, NewStyles.text10],
              styles.multiLine,
            ]}
            placeholder="آدرس با جزئیات کامل"
            multiline
          />

          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>ثبت</Text>
          </TouchableOpacity>
          {addressText ? (
            <View style={styles.selectedLocationBox}>
              <Text
                style={[
                  NewStyles.textInput,
                  NewStyles.border10,
                  NewStyles.text10,
                ]}
              >
                موقعیت انتخاب‌شده:
              </Text>
              <Text style={styles.addressText}>{addressText}</Text>
              <MapView
                style={styles.miniMap}
                region={{
                  latitude: route.params?.selectedLocation?.latitude || 35.6892,
                  longitude:
                    route.params?.selectedLocation?.longitude || 51.389,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker coordinate={route.params?.selectedLocation} />
              </MapView>
            </View>
          ) : null}

          <View style={[styles.addressPreview]}>
            <Text
              style={[
                NewStyles.textInput,
                NewStyles.border10,
                NewStyles.text10,
              ]}
            >
              آدرس‌های منتخب
            </Text>
            <View style={[styles.addressCard]}>
              <Text
                style={[
                  NewStyles.textInput,
                  NewStyles.border10,
                  NewStyles.text10,
                ]}
              >
                خانه
              </Text>
              <Text style={styles.addressText}>تهران - منطقه ۵</Text>
              <Text
                style={[
                  NewStyles.textInput,
                  NewStyles.border10,
                  NewStyles.text10,
                ]}
              >
                09121234567
              </Text>
              <Text
                style={[
                  NewStyles.textInput,
                  NewStyles.border10,
                  NewStyles.text10,
                ]}
              >
                خیابان مثال، پلاک ۱۰
              </Text>
            </View>
          </View>
          {/* </View> */}
        </ScrollView>
      </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: 20,
    backgroundColor: "#e0f0ff",
    // marginTop: 50
    // gap: 10
    // alignItems: "stretch",
  },
  header: {
    backgroundColor: "#005b9f",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  mapButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  mapButtonText: {
    textAlign: "center",
    color: "#005b9f",
  },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    textAlign: "right",
  },
  selectedLocationBox: {
    backgroundColor: "#fff",
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
  },

  row: {
    flexDirection: "row-reverse",
    gap: 10,
    marginBottom: 10,
  },
  prefixInput: {
    width: 70,
    backgroundColor: "#e1e1e1",
  },
  miniMap: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginTop: 10,
  },

  multiLine: {
    height: 80,
    textAlignVertical: "top",
  },
  saveBtn: {
    backgroundColor: "#007aff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  saveBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  addressPreview: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 10,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "right",
    writingDirection: "rtl",
  },
  addressCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    margin:5
  },
  addressText: {
    color: "#333",
    marginBottom: 4,
    textAlign: "right",
    writingDirection: "rtl",
  },
});
