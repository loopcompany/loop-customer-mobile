// screens/TrainingRegistrationScreen.js
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePicker from "react-native-modern-datepicker";
import moment from "moment-jalaali";

import ScreenHeaders from "@components/ScreenHeaders";
import { themeColor0, themeColor1, themeColor4 } from "@theme/Color";
import { educationRegistrationAPI } from "@services/Api";
import { showToastOrAlert } from "@helpers/Common";
import Button from "@components/Button";
import { createStyles } from "@styles/NewStyles";
import { Ionicons } from "@expo/vector-icons";

const COURSE_OPTIONS = [
  { labelKey: "Computer Software Installation Training", value: "آموزش نصب نرم افزار رایانه" },
  { labelKey: "Computer Hardware Training", value: "آموزش سخت افزار رایانه" },
];

const REGISTER_AS_OPTIONS = [
  { labelKey: "Computer Software Technician", value: "تکنسین نرم افزار رایانه" },
  { labelKey: "Computer Hardware Technician", value: "تکنسین سخت افزار رایانه" },
  { labelKey: "I do not intend to register right now", value: "فعلا قصد ندارم" },
  { labelKey: "None of them", value: "هیچ کدام" },
];

const LEVEL_OPTIONS = [
  { labelKey: "Excellent", value: "عالی" },
  { labelKey: "Good", value: "خوب" },
  { labelKey: "Average", value: "متوسط" },
  { labelKey: "Weak", value: "ضعیف" },
  { labelKey: "I have no knowledge of computers", value: "هیچ اطلاعاتی از رایانه ندارم" },
];

const GOAL_OPTIONS = [
  { labelKey: "Yes, as a software technician", value: "بله، تکنسین نرم افزار" },
  { labelKey: "Yes, as a hardware technician", value: "بله، تکنسین سخت افزار" },
  { labelKey: "Yes, both", value: "بله، هردو مورد" },
  { labelKey: "No, only training classes", value: "خیر، فقط کلاس های آموزشی" },
];

const MARRIAGE_OPTIONS = [
  { labelKey: "Single", value: "مجرد" },
  { labelKey: "Married", value: "متأهل" },
];

const GENDER_OPTIONS = [
  { labelKey: "Female", value: "خانم" },
  { labelKey: "Male", value: "آقا" },
];

const NATIONALITY_OPTIONS = [
  { labelKey: "Iranian", value: "ایرانی" },
  { labelKey: "Foreign", value: "خارجی" },
];

const VEHICLE_OPTIONS = [
  { labelKey: "Motorcycle", value: "موتور سیکلت" },
  { labelKey: "Car", value: "خودرو" },
  { labelKey: "None", value: "ندارم" },
];

const CERTIFICATE_OPTIONS = [
  { labelKey: "Motorcycle", value: "موتور سیکلت" },
  { labelKey: "Car", value: "ماشین" },
  { labelKey: "None", value: "ندارم" },
];

const convertJalaliToGregorian = (jalaliDate) => {
  try {
    return moment(jalaliDate, "jYYYY/jMM/jDD").format("YYYY-MM-DD");
  } catch (e) {
    return "";
  }
};

const RadioGroup = ({ label, options, value, onChange, NewStyles, t, styles }) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[NewStyles.text, styles.fieldLabel]}>{label}</Text>

      {options.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.radioRow}
          onPress={() => onChange(item.value)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.radioOuter,
              value === item.value && styles.radioOuterActive,
            ]}
          >
            {value === item.value && <View style={styles.radioInner} />}
          </View>
          <Text style={[NewStyles.text10, { marginRight: 10 }]}>
            {t(item.labelKey)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const CustomSelect = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  NewStyles,
  isOpen,
  onToggle,
  t,
  styles
}) => {
  const selectedItem =
    options.find((item) => item.value === value) || null;

  const selectedLabel = selectedItem ? t(selectedItem.labelKey) : "";

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[NewStyles.text, styles.fieldLabel]}>{label}</Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggle}
        style={styles.selectTrigger}
      >
        <Text
          style={[
            NewStyles.text10,
            { color: selectedLabel ? "#333" : "#999", flex: 1 },
          ]}
        >
          {selectedLabel || placeholder}
        </Text>

        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={themeColor0.bgColor(1)}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.selectOptionsContainer}>
          {options.map((item, index) => {
            const isSelected = value === item.value;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.selectOptionItem,
                  isSelected && styles.selectOptionItemActive,
                ]}
                onPress={() => {
                  onChange(item.value);
                  onToggle();
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    NewStyles.text10,
                    { color: isSelected ? themeColor1.bgColor(1) : "#333" },
                  ]}
                >
                  {t(item.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default function TrainingRegistrationScreen() {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);

  const [form, setForm] = useState({
    selected_class: "",
    register_as: "",
    mastery_soft_level: "",
    mastery_hard_level: "",
    goal: "",
    name: "",
    lname: "",
    birth_date: "",
    marriage: "",
    gender: "",
    nationality: "ایرانی",
    education: "",
    phone: "",
    telephone: "",
    address: "",
    vehicle: "",
    certificate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [openSelect, setOpenSelect] = useState(null);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSelect = (name) => {
    setOpenSelect((prev) => (prev === name ? null : name));
  };

  const validatePhone = (phone) => /^09[0-9]{9}$/.test(phone);
  const validateTelephone = (telephone) => /^[0-9]{8}$/.test(telephone);

  const jalaliBirthDate = form.birth_date
    ? moment(form.birth_date, "YYYY-MM-DD").format("jYYYY/jMM/jDD")
    : "";

  const handleSubmit = async () => {
    if (!form.selected_class) return showToastOrAlert(t("Please select a class"));
    if (!form.register_as) return showToastOrAlert(t("Please select registration type"));
    if (!form.mastery_soft_level) return showToastOrAlert(t("Please select software skill level"));
    if (!form.mastery_hard_level) return showToastOrAlert(t("Please select hardware skill level"));
    if (!form.goal) return showToastOrAlert(t("Please select your goal"));
    if (!form.name.trim()) return showToastOrAlert(t("Please enter your first name"));
    if (!form.lname.trim()) return showToastOrAlert(t("Please enter your last name"));
    if (!form.birth_date.trim()) return showToastOrAlert(t("Please select your birth date"));
    if (!form.marriage) return showToastOrAlert(t("Please select marital status"));
    if (!form.gender) return showToastOrAlert(t("Please select gender"));
    if (!form.nationality) return showToastOrAlert(t("Please select nationality"));
    if (!form.education.trim()) return showToastOrAlert(t("Please enter education"));
    if (!form.phone.trim()) return showToastOrAlert(t("Please enter mobile number"));
    if (!form.vehicle.trim()) return showToastOrAlert(t("Please specify the condition of your vehicle."));
    if (!form.certificate.trim()) return showToastOrAlert(t("Please specify your certification status."));
    if (!validatePhone(form.phone.trim())) return showToastOrAlert(t("Invalid mobile number format"));
    if (form.telephone.trim() && !validateTelephone(form.telephone.trim())) {
      return showToastOrAlert(t("Invalid telephone number format"));
    }
    if (!form.address.trim()) return showToastOrAlert(t("Please enter address"));

    try {
      setIsSubmitting(true);

      const payload = {
        class: form.selected_class,
        register_as: form.register_as,
        mastery_soft_level: form.mastery_soft_level,
        mastery_hard_level: form.mastery_hard_level,
        goal: form.goal,
        name: form.name.trim(),
        lname: form.lname.trim(),
        birth_date: form.birth_date.trim(),
        marriage: form.marriage,
        gender: form.gender,
        nationality: form.nationality,
        education: form.education.trim(),
        phone: form.phone.trim(),
        telephone: form.telephone.trim() || undefined,
        address: form.address.trim(),
        vehicle: form.vehicle || undefined,
        certificate: form.certificate || undefined,
      };

      const response = await educationRegistrationAPI.create(payload);

      if (response.success) {
        showToastOrAlert(response.message || t("Information submitted successfully"));

        setForm({
          selected_class: "",
          register_as: "",
          mastery_soft_level: "",
          mastery_hard_level: "",
          goal: "",
          name: "",
          lname: "",
          birth_date: "",
          marriage: "",
          gender: "",
          nationality: "ایرانی",
          education: "",
          phone: "",
          telephone: "",
          address: "",
          vehicle: "",
          certificate: "",
        });

        setShowBirthDatePicker(false);
        setOpenSelect(null);
      }
    } catch (error) {
      const resp = error.response?.data;
      let errorMessage = t("Error submitting request");

      if (resp) {
        if (resp.message) {
          errorMessage = resp.message;
        } else if (resp.error_code) {
          errorMessage = resp.error_code;
        } else if (resp.errors && typeof resp.errors === "object") {
          const firstKey = Object.keys(resp.errors)[0];
          const errs = resp.errors[firstKey];
          errorMessage = Array.isArray(errs) ? errs.join("\n") : String(errs);
        }
      } else {
        errorMessage = error.message || errorMessage;
      }

      showToastOrAlert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: "off", bottom: "additive" }}>
      <ScreenHeaders title={t("Registration for Training Courses")} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[NewStyles.wrapper, { paddingBottom: 100 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{t("Course Information")}</Text>
          </View>

          <CustomSelect
            label={t("Register in Classes *")}
            placeholder={t("Select...")}
            options={COURSE_OPTIONS}
            value={form.selected_class}
            onChange={(value) => handleChange("selected_class", value)}
            NewStyles={NewStyles}
            isOpen={openSelect === "selected_class"}
            onToggle={() => toggleSelect("selected_class")}
            t={t}
            styles={styles}

          />

          <CustomSelect
            label={t("Register As *")}
            placeholder={t("Select...")}
            options={REGISTER_AS_OPTIONS}
            value={form.register_as}
            onChange={(value) => handleChange("register_as", value)}
            NewStyles={NewStyles}
            isOpen={openSelect === "register_as"}
            onToggle={() => toggleSelect("register_as")}
            t={t}
            styles={styles}
          />

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{t("Computer Skills")}</Text>
          </View>

          <RadioGroup
            label={t("Software (Windows and software installation):")}
            options={LEVEL_OPTIONS}
            value={form.mastery_soft_level}
            onChange={(value) => handleChange("mastery_soft_level", value)}
            NewStyles={NewStyles}
            t={t}
            styles={styles}
          />

          <RadioGroup
            label={t("Hardware (Troubleshooting and fixing):")}
            options={LEVEL_OPTIONS}
            value={form.mastery_hard_level}
            onChange={(value) => handleChange("mastery_hard_level", value)}
            NewStyles={NewStyles}
            t={t}
            styles={styles}
          />

          <RadioGroup
            label={t("After completing the training and becoming fully skilled, are you willing to be employed as a field technician?")}
            options={GOAL_OPTIONS}
            value={form.goal}
            onChange={(value) => handleChange("goal", value)}
            NewStyles={NewStyles}
            t={t}
            styles={styles}
          />

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{t("Personal Information")}</Text>
          </View>

          <TextInput
            placeholder={t("First Name")}
            value={form.name}
            onChangeText={(text) => handleChange("name", text)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
            placeholderTextColor="#999"
          />

          <TextInput
            placeholder={t("Last Name")}
            value={form.lname}
            onChangeText={(text) => handleChange("lname", text)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
            placeholderTextColor="#999"
          />

          <Text style={[NewStyles.text, styles.fieldLabel]}>
            {t("Birth Date *")}
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setShowBirthDatePicker((prev) => !prev);
              setOpenSelect(null);
            }}
            style={styles.selectTrigger}
          >
            <Text
              style={[
                NewStyles.text10,
                { color: form.birth_date ? "#333" : "#999", flex: 1 },
              ]}
            >
              {form.birth_date || t("Select birth date")}
            </Text>
            <Ionicons
              name={showBirthDatePicker ? "chevron-up" : "chevron-down"}
              size={20}
              color={themeColor0.bgColor(1)}
            />
          </TouchableOpacity>

          {showBirthDatePicker && (
            <View style={styles.datePickerWrapper}>
              <DatePicker
                mode="calendar"
                isGregorian={false}
                options={{
                  backgroundColor: "#fff",
                  textHeaderColor: themeColor1.bgColor(1),
                  textDefaultColor: "#333",
                  selectedTextColor: "#fff",
                  mainColor: themeColor1.bgColor(1),
                  textSecondaryColor: "#999",
                  defaultFont: "VazirLight",
                  headerFont: "VazirLight",
                }}
                selected={form.birth_date}
                onDateChange={() => { }}
                onMonthYearChange={() => { }}
                onSelectedChange={(date) => {
                  // const gregorian = convertJalaliToGregorian(date);
                  handleChange("birth_date", date);
                  console.log(date);
                  
                  // setShowBirthDatePicker(false);
                }}
                style={{ borderRadius: 10 }}
              />
            </View>
          )}

          <CustomSelect
            label={t("Marital Status *")}
            placeholder={t("Select...")}
            options={MARRIAGE_OPTIONS}
            value={form.marriage}
            onChange={(value) => handleChange("marriage", value)}
            NewStyles={NewStyles}
            isOpen={openSelect === "marriage"}
            onToggle={() => {
              toggleSelect("marriage");
              setShowBirthDatePicker(false);
            }}
            t={t}
            styles={styles}
          />

          <CustomSelect
            label={t("Gender *")}
            placeholder={t("Select...")}
            options={GENDER_OPTIONS}
            value={form.gender}
            onChange={(value) => handleChange("gender", value)}
            NewStyles={NewStyles}
            isOpen={openSelect === "gender"}
            onToggle={() => {
              toggleSelect("gender");
              setShowBirthDatePicker(false);
            }}
            t={t}
            styles={styles}
          />

          <CustomSelect
            label={t("Nationality *")}
            placeholder={t("Select...")}
            options={NATIONALITY_OPTIONS}
            value={form.nationality}
            onChange={(value) => handleChange("nationality", value)}
            NewStyles={NewStyles}
            isOpen={openSelect === "nationality"}
            onToggle={() => {
              toggleSelect("nationality");
              setShowBirthDatePicker(false);
            }}
            t={t}
            styles={styles}
          />

          <TextInput
            placeholder={t("Education")}
            value={form.education}
            onChangeText={(text) => handleChange("education", text)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
            placeholderTextColor="#999"
          />

          <TextInput
            placeholder={t("Mobile Number")}
            value={form.phone}
            onChangeText={(text) => handleChange("phone", text)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={11}
          />

          <View style={[NewStyles.row, { gap: 10 }]}>

            <View style={{ flex: 1 }}>
              <TextInput
                placeholder={t("Telephone Number")}
                value={form.telephone}
                onChangeText={(text) => handleChange("telephone", text)}
                style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={8}
              />
            </View>
            <View style={[{ padding: 10, backgroundColor: themeColor4.bgColor(1) }, NewStyles.border10]}>
              <Text style={NewStyles.title}>021</Text>
            </View>
          </View>

          <TextInput
            placeholder={t("Residential Address")}
            value={form.address}
            onChangeText={(text) => handleChange("address", text)}
            style={[
              NewStyles.textInput,
              NewStyles.border10,
              NewStyles.text10,
              { height: 100, textAlignVertical: "top" },
            ]}
            placeholderTextColor="#999"
            multiline
          />

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{t("Facilities")}</Text>
          </View>

          <RadioGroup
            label={t("Do you have a vehicle?")}
            options={VEHICLE_OPTIONS}
            value={form.vehicle}
            onChange={(value) => handleChange("vehicle", value)}
            NewStyles={NewStyles}
            t={t}
            styles={styles}
          />

          <RadioGroup
            label={t("Do you have a driving license?")}
            options={CERTIFICATE_OPTIONS}
            value={form.certificate}
            onChange={(value) => handleChange("certificate", value)}
            NewStyles={NewStyles}
            t={t}
            styles={styles}
          />

          <View style={{ height: 20 }} />

          <Button
            title={t("Submit")}
            onPress={handleSubmit}
            loading={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) =>
  StyleSheet.create({
    sectionHeader: {
      marginBottom: 15,
      marginTop: 10,
      borderRightWidth: 4,
      borderRightColor: "#0c5adb",
      paddingRight: 15,
    },
    sectionHeaderText: {
      ...NewStyles.title,
    },
    divider: {
      height: 1,
      backgroundColor: "#ddd",
      marginVertical: 25,
    },
    datePickerWrapper: {
      backgroundColor: "#fff",
      borderRadius: 10,
      padding: 10,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: "#e5e5e5",
    },
    fieldLabel: {
      ...NewStyles.title,
      marginBottom: 8,
    },
    selectTrigger: {
      minHeight: 50,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 10,
      paddingHorizontal: 14,
      backgroundColor: "#fff",
      ...NewStyles.rowWrapper,
      marginBottom: 6,
    },
    selectOptionsContainer: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 10,
      backgroundColor: "#fff",
      overflow: "hidden",
      marginBottom: 8,
    },
    selectOptionItem: {
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#f0f0f0",
    },
    selectOptionItemActive: {
      backgroundColor: "#f5f9ff",
    },
    radioRow: {
      ...NewStyles.row,
      marginBottom: 12,
      gap: 5
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: themeColor1.bgColor(1),
      justifyContent: "center",
      alignItems: "center",
    },
    radioOuterActive: {
      borderColor: themeColor1.bgColor(1),
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: themeColor1.bgColor(1),
    },
  });

