import { View, Text, ScrollView, StyleSheet, RefreshControl, Platform } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { cleanText, formatPrice, showToastOrAlert } from '@helpers/Common';
import { imageUri } from '@services/URL';
import { getPlanDetail, claimPlan, describeDiscountError } from '@services/DiscountApi';
import NewStyles from '@styles/NewStyles';
import { themeColor0, themeColor3, themeColor5 } from '@theme/Color';
import Button from '@components/Button';
import { useTranslation } from 'react-i18next';
import DiscountModal from './DiscountModal';
import { fetchUser } from '@slices/userSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeaders from '@components/ScreenHeaders';
import { createStyles } from '@styles/NewStyles';
import { useMenu } from '@contexts/MenuContext';
export default function DiscountDetail({ route, navigation }) {
    const { t, i18n } = useTranslation();
    // فضای رزرو شده زیر محتوا تا دکمه زیر داک شناور پنهان نشود
    const { footerSpace } = useMenu();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
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
        const result = await getPlanDetail(token, discountId);

        if (result.ok) {
            setData(result.data || {});
        } else {
            showToastOrAlert(result.message || t('An unexpected error occurred!'));
        }

        setRefreshing(false);
    };
    useEffect(() => {
        fetchData();
    }, [refreshing]);

    const getDiscount = async () => {
        setLoading(true);
        const result = await claimPlan(token, discountId);
        setLoading(false);

        if (!result.ok) {
            // خطاها با error_code می‌آیند: INVALID_DISCOUNT_ID (404)،
            // ALREADY_CLAIMED (409)، INSUFFICIENT_GEMS (403).
            //
            // نگاشت قبلی بر اساس وضعیت HTTP بود و ۴۰۳ را «مجوز ندارید» معنا
            // می‌کرد، در حالی که ۴۰۳ همان «جم کافی نداری» است — یعنی کاربری که
            // امتیاز کم داشت، پیام کاملاً بی‌ربطی می‌دید.
            showToastOrAlert(describeDiscountError(result, t));
            return;
        }

        // موجودی جم کاربر با خرج شدن تغییر کرده است.
        dispatch(fetchUser(token));
        setCode(result.data?.code);
        setDiscountModal(true);
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

            <View style={[NewStyles.row, NewStyles.nav, { marginBottom: footerSpace }]}>
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
        paddingBottom:120
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