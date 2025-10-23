import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    ImageBackground,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import Button from "../../components/Button";
import NewStyles from "../../styles/NewStyles";
import { themeColor10, themeColor4, themeColor0 } from "../../theme/Color";
export default function MainSignIn({ navigation }) {
    const [username, setUsername] = useState("");
    const [mobile, setMobile] = useState("");
    const [nationalId, setNationalId] = useState("");
    const [email, setEmail] = useState("");
    const [countryCode, setCountryCode] = useState('+98');
    const [inviteLetter, setInviteLetter] = useState('L');
    const [pin1, setPin1] = useState('');
    const [pin2, setPin2] = useState('');
    const [pin3, setPin3] = useState('');
    const [pin4, setPin4] = useState('');
    const [pin5, setPin5] = useState('');
    const [captcha, setCaptcha] = useState('8699');

    const generateCaptcha = () => {
        const n = Math.floor(1000 + Math.random() * 9000).toString();
        setCaptcha(n);
    };

    return (
        <ImageBackground source={require("../../assets/moon.jpg")} style={styles.background}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={[styles.card, NewStyles.center]}>
                    <Image source={require("../../assets/logo.png")} style={styles.logoSmall} resizeMode="contain" />

                    {/* National ID */}
                    <TextInput
                        style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { width: '100%', textAlign: 'right' }]}
                        placeholder="شماره ملی :"
                        placeholderTextColor={themeColor10.bgColor(0.9)}
                        value={nationalId}
                        onChangeText={setNationalId}
                        keyboardType="number-pad"
                    />

                    {/* Mobile with country code selector (matches image) */}
                    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', gap: 8 }}>
                        <TouchableOpacity style={styles.codeSelector} onPress={() => { /* open country picker */ }}>
                            <Text style={{ fontSize: 12, marginRight: 6 }}>▼</Text>
                            <Text style={{ fontFamily: 'VazirBold', fontSize: 14, marginLeft: 4 }}>+98 irn</Text>
                        </TouchableOpacity>

                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.mobileInput]}
                            placeholder="  موبایل : 10 رقمی"
                            placeholderTextColor={themeColor10.bgColor(0.9)}
                            value={mobile}
                            onChangeText={setMobile}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Invite code boxes */}
                    <View style={[NewStyles.textInput, { width: '100%', borderRadius: 10, marginTop: 6, marginBottom: 6 }]}>
                        <Text style={{ color: themeColor10.bgColor(1), fontFamily: 'VazirLight', marginBottom: 6, textAlign: 'right' }}>کد معرف (اختیاری)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={[NewStyles.codePrefixBox, NewStyles.border5, { backgroundColor: '#ffffff', borderColor: '#ccc', width: 36, height: 40 }]}>
                                <Text style={{ fontFamily: 'VazirBold', color: '#000', fontSize: 25, textAlign: "center" }}>{inviteLetter}-</Text>
                            </View>
                            <TextInput style={[NewStyles.codeBox, NewStyles.border5, { width: 27, height: 40, backgroundColor: '#fff' }]} value={pin1} onChangeText={setPin1} maxLength={1} keyboardType="default" />
                            <TextInput style={[NewStyles.codeBox, NewStyles.border5, { width: 27, height: 40, backgroundColor: '#fff' }]} value={pin2} onChangeText={setPin2} maxLength={1} keyboardType="default" />
                            <TextInput style={[NewStyles.codeBox, NewStyles.border5, { width: 27, height: 40, backgroundColor: '#fff' }]} value={pin3} onChangeText={setPin3} maxLength={1} keyboardType="default" />
                            <TextInput style={[NewStyles.codeBox, NewStyles.border5, { width: 27, height: 40, backgroundColor: '#fff' }]} value={pin4} onChangeText={setPin4} maxLength={1} keyboardType="default" />
                            <TextInput style={[NewStyles.codeBox, NewStyles.border5, { width: 27, height: 40, backgroundColor: '#fff' }]} value={pin5} onChangeText={setPin5} maxLength={1} keyboardType="default" />
                        </View>
                    </View>

                    {/* Email */}
                    <TextInput
                        style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { width: '100%', textAlign: 'right' }]}
                        placeholder="آدرس ایمیل : *"
                        placeholderTextColor={themeColor10.bgColor(0.9)}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />

                    {/* 'Create new email' link centered and underlined */}
                    <TouchableOpacity onPress={() => { /* optional: open email helper */ }} style={{ width: '90%',marginTop: 6 }}>
                        <Text style={[NewStyles.title10,{textAlign:"right",textDecorationLine:"underline"}]}>آدرس ایمیل جدید بسازید</Text>
                    </TouchableOpacity>

                    {/* Captcha + Security Code buttons */}
                    <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'center', alignItems: 'center', marginTop: 10, gap: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <TouchableOpacity onPress={generateCaptcha}>
                                <Text style={{ fontSize: 18, color: '#fff' }}>↺</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.captchaBox} onPress={generateCaptcha}>
                                <Text style={{ fontSize: 16, fontFamily: 'VazirBold' }}>{captcha}</Text>
                            </TouchableOpacity>

                            <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { width: '50%', textAlign: 'right' }]} placeholderTextColor={themeColor10.bgColor(0.9)} placeholder="کد امنیتی" />

                        </View>
                    </View>

                    {/* Action Links */}
                    <TouchableOpacity style={{ marginTop: 18 }} onPress={() => navigation.navigate('PrivacyScreen')}>
                        <Text style={{ color: '#ffd700', fontFamily: 'VazirBold', fontSize: 18 }}>ثبت نام</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginTop: 8 }} onPress={() => navigation.navigate('LoginScreen')}>
                        <Text style={{ color: '#ffd700', fontFamily: 'VazirBold', fontSize: 16 }}>ورود به حساب کاربری</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
    },
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    logo: {
        width: 200,
        height: 100,
    },
    logoSmall: {
        width: 140,
        height: 70,
        marginBottom: 6
    },
    input: {
        backgroundColor: "#000",
        color: "#fff",
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: "#00f",
        marginVertical: 10,
        width: "100%",
        fontSize: 16,
        textAlign: "right",
    },
    submitButton: {
        backgroundColor: "#3366ff",
        borderRadius: 30,
        paddingVertical: 14,
        paddingHorizontal: 50,
        marginTop: 30,
        shadowColor: "#00f",
        shadowOpacity: 0.8,
        shadowRadius: 12,
        elevation: 5,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    card: {
        width: '90%',
        // backgroundColor: 'rgba(0,0,0,0.55)',
        paddingVertical: 24,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)'
    },
    codeBox: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: '#ffffff',
        textAlign: 'center',
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    codePrefixBox: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: '#ffffff22',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd'
    }
    ,
    captchaBox: {
        width: 90,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#bbb'
    }
    ,
    codeSelector: {
        backgroundColor: '#ffffff',
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#333',
        flexDirection: 'row',
        alignItems: 'center'
    },
    mobileInput: {
        flex: 1,
        textAlign: 'right'
    }
});
