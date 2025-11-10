import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor3, themeColor6, themeColor4 } from '../../theme/Color';
import Button from '../../components/Button';
import { uri } from '../../services/URL';
import { setAddress, setCity, setRegion, setTitle, setFname, setLname, setTelephone, setMobile } from '../../slices/addressSlice';
import { showToastOrAlert } from '../../helpers/Common';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeaders from '../../components/ScreenHeaders';

export default function AddNewAddress({ navigation }) {

    const dispatch = useDispatch()
    const { t } = useTranslation();
    const token = useSelector((state) => state?.auth?.token)
    const address = useSelector(state => state?.address);

    return (
        <SafeAreaView edges={{top:'off', bottom:'off'}} mode='padding' style={NewStyles.container}>
            <ScreenHeaders title={'ثبت آدرس'}/>
            <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>

                <ScrollView contentContainerStyle={styles.contentContainerStyle} showsVerticalScrollIndicator={false}>
                    
                    <Text style={NewStyles.text}>
                        نام آدرس منتخب
                        <Text style={styles.required}>* </Text>
                    </Text>
                    <TextInput 
                        style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} 
                        keyboardType='default' 
                        placeholder='مانند: منزل، شرکت، فروشگاه و ...' 
                        placeholderTextColor={themeColor3.bgColor(1)} 
                        maxLength={30} 
                        value={address?.title} 
                        onChangeText={(text) => { dispatch(setTitle(text)) }} 
                    />

                    <Text style={NewStyles.text}>
                        نام
                        <Text style={styles.required}>* </Text>
                    </Text>
                    <TextInput 
                        style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} 
                        keyboardType='default' 
                        placeholder='نام' 
                        placeholderTextColor={themeColor3.bgColor(1)} 
                        value={address?.fname || ''} 
                        onChangeText={(text) => { dispatch(setFname(text)) }} 
                    />

                    <Text style={NewStyles.text}>
                        نام خانوادگی
                        <Text style={styles.required}>* </Text>
                    </Text>
                    <TextInput 
                        style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} 
                        keyboardType='default' 
                        placeholder='نام خانوادگی' 
                        placeholderTextColor={themeColor3.bgColor(1)} 
                        value={address?.lname || ''} 
                        onChangeText={(text) => { dispatch(setLname(text)) }} 
                    />

                    <Text style={NewStyles.text}>تلفن ثابت</Text>
                    <View style={styles.row}>
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { flex: 1 }]}
                            placeholder="شماره تماس ثابت"
                            keyboardType="phone-pad"
                            placeholderTextColor={themeColor3.bgColor(1)}
                            value={address?.telephone ? address.telephone.replace(/^021/, '') : ''}
                            onChangeText={(text) => { dispatch(setTelephone('021' + text)) }}
                        />
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.prefixInput]}
                            value="021"
                            editable={false}
                        />
                    </View>

                    <Text style={NewStyles.text}>
                        شماره موبایل
                        <Text style={styles.required}>* </Text>
                    </Text>
                    <View style={styles.row}>
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { flex: 1 }]}
                            placeholder="شماره موبایل"
                            keyboardType="phone-pad"
                            placeholderTextColor={themeColor3.bgColor(1)}
                            value={address?.mobile ? address.mobile.replace(/^09/, '') : ''}
                            onChangeText={(text) => { dispatch(setMobile('09' + text)) }}
                            maxLength={9}
                        />
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.prefixInput]}
                            value="09"
                            editable={false}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={NewStyles.text}>
                                منطقه
                                <Text style={styles.required}>* </Text>
                            </Text>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                                placeholder="منطقه"
                                keyboardType="phone-pad"
                                placeholderTextColor={themeColor3.bgColor(1)}
                                value={address?.region}
                                onChangeText={(text) => { dispatch(setRegion(text)) }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={NewStyles.text}>
                                شهر
                                <Text style={styles.required}>* </Text>
                            </Text>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                                placeholder="شهر"
                                keyboardType='default'
                                placeholderTextColor={themeColor3.bgColor(1)}
                                value={address?.city}
                                onChangeText={(text) => { dispatch(setCity(text)) }}
                            />
                        </View>
                    </View>

                    <Text style={NewStyles.text}>
                        آدرس با جزئیات کامل
                        <Text style={styles.required}>* </Text>
                    </Text>
                    <TextInput 
                        style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.multiLine]} 
                        keyboardType='default' 
                        placeholder='آدرس با جزئیات کامل' 
                        placeholderTextColor={themeColor3.bgColor(1)} 
                        value={address?.address} 
                        onChangeText={(text) => { dispatch(setAddress(text)) }} 
                        multiline
                    />
                </ScrollView>
            <View style={[NewStyles.row, NewStyles.nav, {alignItems:'center', justifyContent:'center'}]}>
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
        maxWidth:800,
        alignSelf:'center',
        width:'90%',
        gap: 10,
    },
    row: {
        flexDirection: 'row-reverse',
        gap: 10,
    },
    prefixInput: {
        width: 70,
        backgroundColor: themeColor4.bgColor(0.5),
    },
    multiLine: {
        height: 100,
        textAlignVertical: 'top',
    },
    required: {
        color: '#d32f2f',
        fontSize: 16,
    },
});