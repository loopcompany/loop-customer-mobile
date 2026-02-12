import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState,useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor3, themeColor6, themeColor4 } from '../../theme/Color';
import Button from '../../components/Button';
import { uri } from '../../services/URL';
import { setAddress, setCity, setRegion, setTitle, setFname, setLname, setTelephone, setMobile } from '../../slices/addressSlice';
import { showToastOrAlert } from '../../helpers/Common';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeaders from '../../components/ScreenHeaders';
import { createStyles } from '../../styles/NewStyles';
export default function AddNewAddress({ navigation }) {

    const dispatch = useDispatch()
     const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
   const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
    const token = useSelector((state) => state?.auth?.token)
    const address = useSelector(state => state?.address);

    // پاک کردن فرم هر بار که صفحه focus می‌شود
    useFocusEffect(
        React.useCallback(() => {
            dispatch(setTitle(''));
            dispatch(setFname(''));
            dispatch(setLname(''));
            dispatch(setTelephone(''));
            dispatch(setMobile(''));
            dispatch(setCity('Los angeles'));
            dispatch(setRegion(''));
            dispatch(setAddress(''));
        }, [dispatch])
    );

    return (
        <SafeAreaView edges={{top:'off', bottom:'off'}} mode='padding' style={NewStyles.container}>
            <ScreenHeaders title={t('Register Address')}/>
            <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>

                <ScrollView contentContainerStyle={styles.contentContainerStyle} showsVerticalScrollIndicator={false}>
                    
                    <Text style={NewStyles.text}>
                        {t('Address Title')}
                        <Text style={styles.required}>* </Text>
                    </Text>
                    <TextInput 
                        style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} 
                        keyboardType='default' 
                        placeholder={t('Such as: home, office, store, etc.')} 
                        placeholderTextColor={themeColor3.bgColor(1)} 
                        maxLength={30} 
                        value={address?.title} 
                        onChangeText={(text) => { dispatch(setTitle(text)) }} 
                    />

                    <Text style={NewStyles.text}>
                        {t('First Name')}
                        <Text style={styles.required}>* </Text>
                    </Text>
                    <TextInput 
                        style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} 
                        keyboardType='default' 
                        placeholder={t('First Name')} 
                        placeholderTextColor={themeColor3.bgColor(1)} 
                        value={address?.fname || ''} 
                        onChangeText={(text) => { dispatch(setFname(text)) }} 
                    />

                    <Text style={NewStyles.text}>
                        {t('Last Name')}
                        <Text style={styles.required}>* </Text>
                    </Text>
                    <TextInput 
                        style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} 
                        keyboardType='default' 
                        placeholder={t('Last Name')} 
                        placeholderTextColor={themeColor3.bgColor(1)} 
                        value={address?.lname || ''} 
                        onChangeText={(text) => { dispatch(setLname(text)) }} 
                    />

                    <Text style={NewStyles.text}>{t('Landline')}</Text>
                    <View style={styles.row}>
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { flex: 1 }]}
                            placeholder={t('Landline number')}
                            keyboardType="phone-pad"
                            placeholderTextColor={themeColor3.bgColor(1)}
                            value={address?.telephone ? address.telephone.replace(/^021/, '') : ''}
                            maxLength={8}
                            onChangeText={(text) => { dispatch(setTelephone('021' + text)) }}
                        />
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.prefixInput]}
                            value="021"
                            
                            editable={false}
                        />
                    </View>

                    <Text style={NewStyles.text}>
                        {t('Mobile Number')}
                        <Text style={styles.required}>* </Text>
                    </Text>
                    <View style={styles.row}>
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { flex: 1 }]}
                            placeholder={t('Mobile Number')}
                            keyboardType="phone-pad"
                            placeholderTextColor={themeColor3.bgColor(1)}
                            value={address?.mobile ? address.mobile.replace(/^0/, '') : ''}
                            onChangeText={(text) => { dispatch(setMobile('0' + text)) }}
                            maxLength={10}
                        />
                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.prefixInput]}
                            value="+98"
                            editable={false}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={NewStyles.text}>
                                {t('Region')}
                                <Text style={styles.required}>* </Text>
                            </Text>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                                placeholder={t('Region')}
                                keyboardType="phone-pad"
                                placeholderTextColor={themeColor3.bgColor(1)}
                                value={address?.region}
                                onChangeText={(text) => { dispatch(setRegion(text)) }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={NewStyles.text}>
                                {t('City')}
                                <Text style={styles.required}>* </Text>
                            </Text>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                                placeholder={t('City')}
                                keyboardType='default'
                                editable={false}
                                placeholderTextColor={themeColor3.bgColor(1)}
                                value={address?.city}
                                onChangeText={(text) => { dispatch(setCity(text)) }}
                            />
                        </View>
                    </View>

                    <Text style={NewStyles.text}>
                        {t('Full detailed address')}
                        <Text style={styles.required}>* </Text>
                    </Text>
                    <TextInput 
                        style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, styles.multiLine]} 
                        keyboardType='default' 
                        placeholder={t('Full detailed address')} 
                        placeholderTextColor={themeColor3.bgColor(1)} 
                        value={address?.address} 
                        onChangeText={(text) => { dispatch(setAddress(text)) }} 
                        multiline
                    />
                </ScrollView>
            <View style={[NewStyles.row, NewStyles.nav, {alignItems:'center', justifyContent:'center',}]}>
                <Button title={t('Next Step')} onPress={() => {
                    if (!address?.fname || !address?.lname || !address?.mobile || !address?.city || !address?.region || !address?.title || !address?.address) {
                        showToastOrAlert(t('Please fill in all the required fields.'))
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

const createLocalStyles = (NewStyles) => StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: 0,
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