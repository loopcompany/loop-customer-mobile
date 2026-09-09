import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import NewStyles from '@styles/NewStyles';
import { colors, themeColor0, themeColor3, themeColor6, themeColor4 } from '@theme/Color';
import Button from '@components/Button';
import { uri } from '@services/URL';
import { setAddress, setCity, setRegion, setTitle, setFname, setLname, setTelephone, setMobile, setUnit, setNumber, setFloor } from '@slices/addressSlice';
import { convertToEnglish, showToastOrAlert, langIsRTL } from '@helpers/Common';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeaders from '@components/ScreenHeaders';
import { createStyles } from '@styles/NewStyles';
import { useMenu } from '@contexts/MenuContext';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { shadow } from '@theme/Shadows';
export default function AddNewAddress({ navigation }) {

    const dispatch = useDispatch()
    const { t, i18n } = useTranslation();
    const isRTL = langIsRTL(i18n.language);
    // فضای رزرو شده زیر محتوا تا دکمه زیر داک شناور پنهان نشود
    const { footerSpace } = useMenu();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const styles = useMemo(() => createLocalStyles(NewStyles, isRTL), [NewStyles, isRTL]);
    const token = useSelector((state) => state?.auth?.token)
    const address = useSelector(state => state?.address);
    const hasPickedLocation = Number.isFinite(address?.latitude) && Number.isFinite(address?.longitude);

    // فرم یک بار در زمانِ باز شدنِ صفحه خالی می‌شود — نه در هر focus.
    // با useFocusEffect، برگشتن از نقشه (که این صفحه را unmount نمی‌کند) باعث
    // پاک شدنِ همه‌ی چیزی می‌شد که کاربر تازه پر کرده یا از نقشه گرفته بود.
    useEffect(() => {
        dispatch(setTitle(''));
        dispatch(setFname(''));
        dispatch(setLname(''));
        dispatch(setTelephone(''));
        dispatch(setMobile(''));
        dispatch(setCity('تهران'));
        dispatch(setRegion(''));
        dispatch(setAddress(''));
    }, [dispatch]);

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'off' }} mode='padding' style={NewStyles.container}>
            <ScreenHeaders title={t('Register Address')} />
            <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>

                <ScrollView contentContainerStyle={styles.contentContainerStyle} showsVerticalScrollIndicator={false}>

                    {/* انتخاب آدرس از روی نقشه‌ی نشان — میان‌بُرِ پر کردنِ آدرس،
                        منطقه و شهر بدون تایپ کردن. */}
                    <Pressable
                        style={({ pressed }) => [styles.mapCard, pressed && styles.mapCardPressed]}
                        onPress={() => navigation.navigate('Map', { mode: 'picker' })}
                    >
                        <View style={styles.mapCardIcon}>
                            <Ionicons name="map" size={22} color={colors.white.bgColor(1)} />
                        </View>
                        <View style={styles.mapCardText}>
                            <Text style={styles.mapCardTitle}>انتخاب آدرس از روی نقشه</Text>
                            <Text style={styles.mapCardSubtitle} numberOfLines={2}>
                                {hasPickedLocation
                                    ? (address?.address || 'موقعیت روی نقشه انتخاب شد')
                                    : 'موقعیت را روی نقشه‌ی نشان مشخص کنید تا آدرس خودکار پر شود'}
                            </Text>
                        </View>
                        <Ionicons
                            name={hasPickedLocation ? 'checkmark-circle' : (isRTL ? 'chevron-back' : 'chevron-forward')}
                            size={22}
                            color={hasPickedLocation ? colors.success.bgColor(1) : colors.textMuted.bgColor(1)}
                        />
                    </Pressable>

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
                            maxLength={11}
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
                        {/* <View style={{ flex: 1 }}>
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
                        </View> */}
                    </View>
                    <View style={[NewStyles.row, { gap: 10 }]}>

                        <View style={{ flex: 1 }}>

                            <Text style={NewStyles.text}>
                                {t('Number')}
                                <Text style={styles.required}>* </Text>
                            </Text>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                                keyboardType='number-pad'
                                placeholder={t('Number')}
                                placeholderTextColor={themeColor3.bgColor(1)}
                                value={address?.number || ''}
                                onChangeText={(text) => { dispatch(setNumber(text)) }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>

                            <Text style={NewStyles.text}>
                                {t('Unit')}
                                <Text style={styles.required}>* </Text>
                            </Text>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                                keyboardType='number-pad'
                                placeholder={t('Unit')}
                                placeholderTextColor={themeColor3.bgColor(1)}
                                value={address?.unit || ''}
                                onChangeText={(text) => { dispatch(setUnit(text)) }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>

                            <Text style={NewStyles.text}>
                                {t('Floor')}
                                <Text style={styles.required}>* </Text>
                            </Text>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                                keyboardType='number-pad'
                                placeholder={t('Floor')}
                                placeholderTextColor={themeColor3.bgColor(1)}
                                value={address?.floor || ''}
                                onChangeText={(text) => { dispatch(setFloor(text)) }}
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
                <View style={[NewStyles.row, NewStyles.nav, { alignItems: 'center', justifyContent: 'center', marginBottom: footerSpace }]}>
                    <Button title={t('Next Step')} onPress={() => {
                        if (!address?.fname || !address?.lname || !address?.mobile || !address?.city || !address?.region || !address?.title || !address?.address || !address?.unit || !address?.number || !address?.floor) {
                            showToastOrAlert(t('Please fill in all the required fields.'))
                            return;
                        };
                        if (Number(convertToEnglish(address?.region)) > 22) {
                            showToastOrAlert(t('You can only choose from twenty-two regions.'))
                            return;
                        }
                        navigation.replace('Map')
                    }
                    } />
                </View>
            </KeyboardAvoidingView>


        </SafeAreaView>
    )
}

const createLocalStyles = (NewStyles, isRTL) => StyleSheet.create({
    mapCard: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.surface.bgColor(1),
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border.bgColor(1),
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        marginBottom: spacing.sm,
        ...shadow.sm,
    },
    mapCardPressed: {
        opacity: 0.85,
    },
    mapCardIcon: {
        width: 40,
        height: 40,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary.bgColor(1),
    },
    mapCardText: {
        flex: 1,
    },
    mapCardTitle: {
        fontSize: fontSize.sm,
        fontFamily: getFontFamily('bold', isRTL ? 'fa' : 'en'),
        color: colors.textPrimary.color,
        textAlign: isRTL ? 'right' : 'left',
        writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    mapCardSubtitle: {
        fontSize: fontSize.xs,
        fontFamily: getFontFamily('light', isRTL ? 'fa' : 'en'),
        color: colors.textSecondary.color,
        marginTop: 2,
        textAlign: isRTL ? 'right' : 'left',
        writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    contentContainerStyle: {
        paddingHorizontal: 0,
        paddingVertical: '5%',
        maxWidth: 800,
        alignSelf: 'center',
        width: '90%',
        gap: 10,
    },
    row: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
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