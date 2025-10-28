import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor3, themeColor6 } from '../../theme/Color';
import Button from '../../components/Button';
import { uri } from '../../services/URL';
import { setAddress, setCity, setRegion, setTitle, setFname, setLname, setTelephone, setMobile } from '../../slices/addressSlice';
import { showToastOrAlert } from '../../helpers/Common';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddNewAddress({ navigation }) {

    const dispatch = useDispatch()
    const { t } = useTranslation();
    const token = useSelector((state) => state?.auth?.token)
    const address = useSelector(state => state?.address);

    return (
        <SafeAreaView edges={{top:'off', bottom:'off'}} mode='padding' style={NewStyles.container}>
            <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>

                <ScrollView contentContainerStyle={styles.contentContainerStyle} showsVerticalScrollIndicator={false}>
                    <Text style={NewStyles.text}>عنوان آدرس خود را وارد کنید. <View style={[{ backgroundColor: themeColor6.bgColor(1), paddingHorizontal: 5 }, NewStyles.border5]}><Text style={NewStyles.text4}>الزامی</Text></View></Text>
                    <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { textAlign: 'auto' }]} keyboardType='default' placeholder='مانند: منزل، شرکت، فروشگاه و ...' placeholderTextColor={themeColor3.bgColor(1)} maxLength={30} value={address?.title} onChangeText={(text) => { dispatch(setTitle(text)) }} />

                    <Text style={NewStyles.text}>نام <View style={[{ backgroundColor: themeColor6.bgColor(1), paddingHorizontal: 5 }, NewStyles.border5]}><Text style={NewStyles.text4}>الزامی</Text></View></Text>
                    <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { textAlign: 'auto' }]} keyboardType='default' placeholder='نام' placeholderTextColor={themeColor3.bgColor(1)} value={address?.fname} onChangeText={(text) => { dispatch(setFname(text)) }} />

                    <Text style={NewStyles.text}>نام خانوادگی <View style={[{ backgroundColor: themeColor6.bgColor(1), paddingHorizontal: 5 }, NewStyles.border5]}><Text style={NewStyles.text4}>الزامی</Text></View></Text>
                    <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { textAlign: 'auto' }]} keyboardType='default' placeholder='نام خانوادگی' placeholderTextColor={themeColor3.bgColor(1)} value={address?.lname} onChangeText={(text) => { dispatch(setLname(text)) }} />

                    <Text style={NewStyles.text}>تلفن ثابت</Text>
                    <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { textAlign: 'auto' }]} keyboardType='phone-pad' placeholder='02112345678' placeholderTextColor={themeColor3.bgColor(1)} value={address?.telephone} onChangeText={(text) => { dispatch(setTelephone(text)) }} />

                    <Text style={NewStyles.text}>شماره موبایل <View style={[{ backgroundColor: themeColor6.bgColor(1), paddingHorizontal: 5 }, NewStyles.border5]}><Text style={NewStyles.text4}>الزامی</Text></View></Text>
                    <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { textAlign: 'auto' }]} keyboardType='phone-pad' placeholder='09123456789' placeholderTextColor={themeColor3.bgColor(1)} value={address?.mobile} onChangeText={(text) => { dispatch(setMobile(text)) }} />

                    <Text style={NewStyles.text}>شهر <View style={[{ backgroundColor: themeColor6.bgColor(1), paddingHorizontal: 5 }, NewStyles.border5]}><Text style={NewStyles.text4}>الزامی</Text></View></Text>
                    <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { textAlign: 'auto' }]} keyboardType='default' placeholder='تهران' placeholderTextColor={themeColor3.bgColor(1)} value={address?.city} onChangeText={(text) => { dispatch(setCity(text)) }} />

                    <Text style={NewStyles.text}>منطقه <View style={[{ backgroundColor: themeColor6.bgColor(1), paddingHorizontal: 5 }, NewStyles.border5]}><Text style={NewStyles.text4}>الزامی</Text></View></Text>
                    <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { textAlign: 'auto' }]} keyboardType='default' placeholder='منطقه 1' placeholderTextColor={themeColor3.bgColor(1)} value={address?.region} onChangeText={(text) => { dispatch(setRegion(text)) }} />

                    <Text style={NewStyles.text}>آدرس پستی خود را وارد کنید. <View style={[{ backgroundColor: themeColor6.bgColor(1), paddingHorizontal: 5 }, NewStyles.border5]}><Text style={NewStyles.text4}>الزامی</Text></View></Text>
                    <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { textAlign: 'auto' }]} keyboardType='default' placeholder='آدرس پستی' placeholderTextColor={themeColor3.bgColor(1)} value={address?.address} onChangeText={(text) => { dispatch(setAddress(text)) }} />
                </ScrollView>
            <View style={[NewStyles.row, NewStyles.nav, NewStyles.shadow]}>
                <Button title={'مرحله بعد'} onPress={() => {
                    if (!address?.fname || !address?.lname || !address?.mobile || !address?.city || !address?.region || !address?.title || !address?.address) {
                        showToastOrAlert('لطفا فیلدهای الزامی را پر کنید.')
                        return;
                    };
                    navigation.replace('Map')
                }
                } />
            </View>
            </KeyboardAvoidingView>


        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        gap: 10,
    },
    inputSearchStyle: {
        borderWidth: 0,
    }
});