import { View, Text, ScrollView, StyleSheet, RefreshControl, Platform } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { cleanText, formatPrice, handleError, showToastOrAlert } from '../../helpers/Common';
import { imageUri, uri } from '../../services/URL';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor3, themeColor5 } from '../../theme/Color';
import Button from '../../components/Button';
import { useTranslation } from 'react-i18next';
import DiscountModal from './DiscountModal';
import { fetchUser } from '../../slices/userSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeaders from '../../components/ScreenHeaders';
import { createStyles } from '../../styles/NewStyles';
export default function DiscountDetail({ route, navigation }) {
    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
    const discountId = route?.params?.discountId;
    const dispatch = useDispatch();

    const token = useSelector((state) => state?.auth?.token);
    const [refreshing, setRefreshing] = useState(true);
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState(null);
    const [discountModal, setDiscountModal] = useState(false);

    const [data, setData] = useState({});
    const fetchData = async () => {
        try {
            const response = await axios.post(`${uri}/discounts/detail`, { discountId }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept-Language': lang } })
            if (response.status == 200) {
                setData(response?.data?.data);
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setRefreshing(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [refreshing]);

    const getDiscount = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${uri}/discounts/claim`,
                { discountId },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status == 200) {
                dispatch(fetchUser(token));
                setCode(response?.data?.data?.code);
                setDiscountModal(true);
            }
        } catch (error) {
            // ✅ بهبود یافته: استخراج دقیق پیام خطا از سرور
            let errorMessage = t('An unexpected error occurred!');

            if (error?.response) {
                // سرور پاسخ داده (4xx یا 5xx)
                const status = error.response.status;
                const serverMessage = error.response.data?.message;

                // اگر سرور پیام خاصی فرستاده، از آن استفاده کن
                if (serverMessage) {
                    errorMessage = serverMessage;
                } else {
                    // پیام‌های پیش‌فرض برای status code های مختلف
                    switch (status) {
                        case 400:
                            // کاربر امتیاز کافی ندارد
                            errorMessage = t('You don\'t have enough points to claim this discount');
                            break;
                        case 403:
                            // کاربر مجوز دریافت ندارد (قبلاً دریافت کرده یا VIP نیست)
                            errorMessage = t('You are not authorized to claim this discount');
                            break;
                        case 404:
                            // تخفیف یافت نشد
                            errorMessage = t('Discount not found');
                            break;
                        case 422:
                            // داده‌های ارسالی نامعتبر
                            errorMessage = t('Invalid data submitted');
                            break;
                        default:
                            if (status >= 500) {
                                // خطای سرور
                                errorMessage = t('Server error. Please try again later');
                            }
                            break;
                    }
                }

                console.log('❌ [DiscountDetail.getDiscount] خطا در دریافت تخفیف:', {
                    status,
                    serverMessage,
                    displayMessage: errorMessage,
                    fullError: error.response.data
                });
            } else if (error?.request) {
                // درخواست ارسال شده اما پاسخی دریافت نشد (مشکل شبکه)
                errorMessage = t('Network error!');
                console.log('❌ [DiscountDetail.getDiscount] خطای شبکه - پاسخی از سرور دریافت نشد');
            } else {
                // خطای دیگر (مثلاً خطای ساخت request)
                console.log('❌ [DiscountDetail.getDiscount] خطای نامشخص:', error.message);
            }

            showToastOrAlert(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
            <ScreenHeaders title={t("Discount Details")} />
            <ScrollView contentContainerStyle={styles.contentContainerStyle} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}>
                <View style={Platform.OS === 'web' ? styles.imageContainer : {}}>
                    <Image style={{ maxWidth: 600, height: 250, width: '100%', resizeMode: "contain" }} source={{ uri: `${imageUri}/${data?.image_path}` }} />
                </View>
                <View style={[NewStyles.spacing, { gap: 10 }]}>
                    <View style={[NewStyles.row, { gap: 5 }]}>
                        <Ionicons name='ticket-outline' size={24} color={themeColor0.bgColor(1)} />
                        <Text style={NewStyles.title}>{data?.title}</Text>
                    </View>
                    <Text style={NewStyles.text}>{data?.discount_percent} {t("percent discount up to")} {formatPrice(data?.max_price)} {t("Tomans")}</Text>
                    <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(1) }} />
                    <Text style={NewStyles.text10}>{cleanText(data?.des)}</Text>
                    <Text style={NewStyles.text10}>{cleanText(data?.long_des)}</Text>
                    <Text style={NewStyles.text10}>📅  {t("Code validity: up to")} {data?.expire} {t("days")}</Text>
                    <Text style={NewStyles.text10}>🟡  {t("For")} {data?.count} {t("uses")}</Text>
                    <Text style={NewStyles.text3}>{t("View your promotional codes in the received codes section.")}</Text>
                </View>
            </ScrollView>

            <View style={[NewStyles.row, NewStyles.nav]}>
                <View style={[NewStyles.row, { gap: 5 }]}>
                    <Text style={NewStyles.title}>{data?.gems} <Text style={NewStyles.title}>{t("Required Points")}</Text></Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Button title={t('Claim Discount')} loading={loading} onPress={() => getDiscount()} textStyle={[NewStyles.title1, { fontSize: 14 }]} />
                </View>
            </View>

            <DiscountModal discountModal={discountModal} setDiscountModal={setDiscountModal} code={code} />
        </SafeAreaView>
    )
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
    contentContainerStyle: {
        gap: 10,
        paddingTop: 10,
        // paddingVertical: '5%'
    },
    imageContainer: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '100%',
        marginTop: 20,
    },
    gemImage: {
        height: 30,
        width: 35,
    },
})