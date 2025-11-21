import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios';
import * as Linking from "expo-linking";
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor3, themeColor4, themeColor5, themeColor6, themeColor7, } from '../../theme/Color';
import { formatDateTime, formatPrice, showToastOrAlert } from '../../helpers/Common';
import Button from '../../components/Button';
import { uri } from '../../services/URL';
import { fetchUser } from '../../slices/userSlice';
import { fetchOrders } from '../../slices/orderSlice';
import Loader from '../../components/Loader';
import { withOrganizationAccess, ACCESS_PRESETS } from '../../components/withOrganizationAccess';
import { useTranslation } from 'react-i18next';
import ScreenHeaders from '../../components/ScreenHeaders';

function Invoice({ route }) {

    const dispatch = useDispatch()
    const { t } = useTranslation();
    const orderId = route?.params?.orderId;
    const token = useSelector((state) => state?.auth?.token)
    const user = useSelector((state) => state?.user?.data)
    const [refreshing, setRefreshing] = useState(true)
    const [loading1, setLoading1] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [extraServices, setExtraServices] = useState([])
    const [data, setData] = useState([]);

    const fetchData = async () => {
        try {
            const response = await axios.post(`${uri}/orders/detail`, { orderId }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            if (response.status == 200) {
                setData(response?.data)
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setRefreshing(false);
        }
    };

    const fetchExtraServices = async () => {
        try {
            const response = await axios.post(
                `${uri}/orders/extra-services`,
                { order_id: orderId },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (response.status == 200 && response.data?.success) {
                setExtraServices(response.data?.data?.extra_services || [])
            }
        } catch (error) {
            setExtraServices([])
        }
    }

    useEffect(() => {
        fetchData();
        fetchExtraServices();
        dispatch(fetchUser(token))
    }, [refreshing]);

    // محاسبه مبلغ کل بدون تخفیف
    const totalPrice = useMemo(() => {
        const basePrice = Number(data?.technician_price ?? data?.pakar_price);
        return Number(basePrice) + Number(data?.extra_price);
    }, [data]);

    // محاسبه مبلغ تخفیف واقعی
    const actualDiscountAmount = useMemo(() => {
        if (data?.discount_info) {
            // اگر discount_amount در discount_info موجود است
            if (data.discount_info.discount_amount) {
                return Number(data.discount_info.discount_amount);
            }
            // اگر فقط درصد تخفیف موجود است، آن را محاسبه می‌کنیم
            if (data.discount_info.discount_percent && totalPrice > 0) {
                return Math.round((totalPrice * Number(data.discount_info.discount_percent)) / 100);
            }
        }
        // اگر discount_info نبود، از discount_price استفاده می‌کنیم
        return Number(data?.discount_price || 0);
    }, [data, totalPrice]);

    // محاسبه مبلغ نهایی با تخفیف
    const totalDiscountedPrice = useMemo(() => {
        const total = totalPrice - actualDiscountAmount;
        return Math.max(0, total); // حداقل مبلغ صفر باشد
    }, [totalPrice, actualDiscountAmount]);

    const renderRow = (text1, text2, textStyle1, textStyle2) => (
        <View style={NewStyles.rowWrapper}>
            <Text style={[NewStyles.text, textStyle1]}>{text1}</Text>
            <Text style={[NewStyles.text10, textStyle2]}>{text2}</Text>
        </View>
    );

    const walletPayment = async () => {
        setLoading1(true);
        try {
            const response = await axios.post(`${uri}/payment/wallet`, { orderId }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            if (response.status == 201) {
                showToastOrAlert(response?.data?.message);
                dispatch(fetchOrders(token));
                dispatch(fetchUser(token));
                setRefreshing(true);
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading1(false);
        }
    };

    const redirectUrl = Linking.createURL("/?");

    const _addLinkingListener = () => {
        const subscription = Linking.addEventListener("url", ({ url }) => {
            const { queryParams } = Linking.parse(url);
            if (queryParams?.status == 'OK') {
                dispatch(fetchOrders(token));
                dispatch(fetchUser(token));
                setRefreshing(true);
                showToastOrAlert('پرداخت با موفقیت انجام شد.')
            } else if (queryParams?.status == 'NOK') {
                showToastOrAlert('پرداخت با خطا مواجه شد.')
            }
            setLoading2(false);
        });
        return () => subscription.remove();
    };

    const gatewayPayment = async () => {
        setLoading2(true);
        try {
            _addLinkingListener()
            let result = await Linking.openURL(`${uri}/payment/gateway?linkingUri=${redirectUrl}&orderId=${orderId}&userId=${user?.id}`);
            let redirectData;
            if (result.url) {
                redirectData = Linking.parse(result.url);
            }
        } catch (error) {
            showToastOrAlert('خطا در اتصال به درگاه پرداخت')
            setLoading2(false);
        } finally {
            setLoading2(false);
        }
    };

    if (data.length <= 0) { return <Loader /> };

    return (
        <View style={NewStyles.container}>
            <ScreenHeaders title={'پیش رسید سفارش'} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 10 }} refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => setRefreshing(true)} />}>
                <View style={{ backgroundColor: themeColor4.bgColor(1), ...NewStyles.border10, paddingBottom: 10 }}>
                    <View style={[NewStyles.seperator, { gap: 10, padding: '5%', borderBottomWidth: 0 }]}>
                        <View style={[{ width: '100%', padding: '5%', backgroundColor: themeColor3.bgColor(0.2) }, NewStyles.border10, NewStyles.center]}>
                            <View style={[NewStyles.row, { gap: 5 }]}>
                                <Ionicons name="newspaper-outline" size={24} color={themeColor0.bgColor(1)} />
                                <Text style={NewStyles.title}>جزئیات سفارش - شناسه: {data?.id}</Text>
                            </View>
                            <Text style={NewStyles.text3}>{data?.category?.title}</Text>
                        </View>

                        {renderRow('زمان ثبت سفارش', formatDateTime(data?.created_at))}
                        <View style={NewStyles.rowWrapper}>
                            <Text style={[NewStyles.text]}>وضعیت پرداخت</Text>
                            <View style={[{ backgroundColor: data?.payment_status > 0 ? themeColor7.bgColor(1) : themeColor6.bgColor(1), paddingHorizontal: 5, paddingVertical: 1 }, NewStyles.border10]}>
                                <Text style={NewStyles.text4}>{data?.payment_status > 0 ? 'پرداخت شده' : 'پرداخت نشده'}</Text>
                            </View>
                        </View>

                        {renderRow((Number(data?.is_fixed) == 1) ? 'مبلغ قطعی لوپ' : 'مبلغ پایه لوپ', data?.pakar_price > 0 ? `${formatPrice(data?.pakar_price)}` + ' تومان' : 'نیاز به بررسی')}
                        {(data?.technician_price > 0 && Number(data?.is_fixed) == 0) && renderRow('مبلغ نهایی تکنسین', data?.technician_price ? `${formatPrice(data?.technician_price)}` + ' تومان' : '0 تومان')}
                        {(data?.extra_price > 0) && renderRow('مبلغ خدمات مازاد', data?.extra_price ? `${formatPrice(data?.extra_price)}` + ' تومان' : '0 تومان')}
                        
                        {/* نمایش مبلغ کل قبل از تخفیف */}
                        {(actualDiscountAmount > 0 && totalPrice > 0) && (
                            <View style={[NewStyles.rowWrapper, { paddingTop: 10, marginTop: 10, borderTopWidth: 1, borderTopColor: themeColor5.bgColor(1) }]}>
                                <Text style={[NewStyles.text]}>مبلغ کل قبل از تخفیف</Text>
                                <Text style={[NewStyles.text10, { textDecorationLine: 'line-through', color: themeColor0.bgColor(0.5) }]}>
                                    {formatPrice(totalPrice)} تومان
                                </Text>
                            </View>
                        )}
                        
                        {/* نمایش اطلاعات تخفیف - برای سفارشات جدید با discount_info کامل */}
                        {(data?.discount_info) && (
                            <View style={{ 
                                backgroundColor: themeColor6.bgColor(0.1), 
                                padding: 12, 
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: themeColor6.bgColor(0.3),
                                gap: 8
                            }}>
                                <View style={[NewStyles.row, { gap: 5 }]}>
                                    <Ionicons name="pricetag" size={18} color={themeColor6.bgColor(1)} />
                                    <Text style={[NewStyles.title, { color: themeColor6.bgColor(1), fontSize: 14 }]}>
                                        کد تخفیف استفاده شده
                                    </Text>
                                </View>
                                
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={[NewStyles.text10]}>کد تخفیف:</Text>
                                    <View style={{
                                        backgroundColor: themeColor6.bgColor(1),
                                        paddingHorizontal: 10,
                                        paddingVertical: 4,
                                        borderRadius: 6
                                    }}>
                                        <Text style={[NewStyles.text4, { fontFamily: 'VazirBold' }]}>
                                            {data.discount_info.code}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={[NewStyles.text10]}>درصد تخفیف:</Text>
                                    <Text style={[NewStyles.text10, { color: themeColor6.bgColor(1), fontFamily: 'VazirBold' }]}>
                                        {data.discount_info.discount_percent}%
                                    </Text>
                                </View>
                                
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={[NewStyles.text10]}>مبلغ تخفیف:</Text>
                                    <Text style={[NewStyles.text10, { color: themeColor6.bgColor(1), fontFamily: 'VazirBold' }]}>
                                        {formatPrice(actualDiscountAmount)} تومان
                                    </Text>
                                </View>
                            </View>
                        )}
                        
                        {/* نمایش تخفیف برای سفارشات قدیمی - فقط با discount_price */}
                        {(actualDiscountAmount > 0 && !data?.discount_info) && (
                            <View style={{ 
                                backgroundColor: themeColor6.bgColor(0.1), 
                                padding: 12, 
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: themeColor6.bgColor(0.3),
                                gap: 8
                            }}>
                                <View style={[NewStyles.row, { gap: 5 }]}>
                                    <Ionicons name="pricetag" size={18} color={themeColor6.bgColor(1)} />
                                    <Text style={[NewStyles.title, { color: themeColor6.bgColor(1), fontSize: 14 }]}>
                                        تخفیف اعمال شده
                                    </Text>
                                </View>
                                
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={[NewStyles.text10]}>مبلغ تخفیف:</Text>
                                    <Text style={[NewStyles.text10, { color: themeColor6.bgColor(1), fontFamily: 'VazirBold' }]}>
                                        {formatPrice(actualDiscountAmount)} تومان
                                    </Text>
                                </View>
                            </View>
                        )}
                        
                        {/* مبلغ قابل پرداخت - نمایش برای سفارشات با تخفیف یا بدون تخفیف */}
                        {(data?.status > 0) && (
                            <View style={[NewStyles.rowWrapper, { paddingTop: 10, marginTop: 10, borderTopWidth: 2, borderTopColor: themeColor7.bgColor(0.3) }]}>
                                <Text style={[NewStyles.title, { color: themeColor7.bgColor(1), fontSize: 16 }]}>
                                    {actualDiscountAmount > 0 ? 'مبلغ قابل پرداخت (پس از تخفیف)' : 'مبلغ قابل پرداخت'}
                                </Text>
                                <Text style={[NewStyles.title, { color: themeColor7.bgColor(1), fontSize: 16 }]}>
                                    {formatPrice(totalDiscountedPrice)} تومان
                                </Text>
                            </View>
                        )}
                        
                        {renderRow('موجودی کیف پول شما: ', formatPrice(user?.wallet ?? 0) + ' تومان')}

                        {/* نمایش هزینه‌های اضافی */}
                        {extraServices.length > 0 && (
                            <>
                                <View style={{ borderTopWidth: 1, borderTopColor: themeColor5.bgColor(1), marginVertical: 15, paddingTop: 15 }}>
                                    <View style={[NewStyles.row, { gap: 5, marginBottom: 10 }]}>
                                        <Ionicons name="cash-outline" size={20} color={themeColor0.bgColor(1)} />
                                        <Text style={NewStyles.title}>هزینه‌های اضافی</Text>
                                    </View>
                                    {extraServices.map((item, index) => (
                                        <View key={index} style={{ marginBottom: 8 }}>
                                            <View style={NewStyles.rowWrapper}>
                                                <View style={[NewStyles.row, { gap: 5, flex: 1 }]}>
                                                    <Ionicons name="ellipse" size={8} color={themeColor0.bgColor(0.5)} />
                                                    <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.title ?? item?.extra_service?.title}</Text>
                                                </View>
                                                <Text style={[NewStyles.text10]}>
                                                    {formatPrice(item?.price)} تومان
                                                </Text>
                                            </View>
                                            {item?.extra_service?.des && (
                                                <Text style={[NewStyles.text10, { color: themeColor0.bgColor(0.5), fontSize: 12, paddingRight: 15 }]}>
                                                    {item?.extra_service?.des}
                                                </Text>
                                            )}
                                        </View>
                                    ))}
                                    <View style={{ borderTopWidth: 1, borderTopColor: themeColor5.bgColor(1), marginTop: 10, paddingTop: 10 }}>
                                        {renderRow('جمع هزینه‌های اضافی', `${formatPrice(extraServices.reduce((sum, item) => sum + Number(item?.price || 0), 0))} تومان`, NewStyles.title, NewStyles.title)}
                                    </View>
                                </View>
                            </>
                        )}

                    </View>
                    <Text style={NewStyles.title7}>ضمن تشکر از اعتماد شما:</Text>
                    <Text style={NewStyles.title7}>با لوپ تا بی نهایت در کنار شما هستیم.</Text>
                </View>
            </ScrollView>

            {data?.started_at && <View style={[NewStyles.row, NewStyles.nav, { backgroundColor: themeColor4.bgColor(0), gap: 10 }]}>
                {data?.payment_status > 0 ?
                    <View style={{ flex: 1 }}>
                        <Button title={'پرداخت شده'} backgroundColor={themeColor7.bgColor(1)} />
                    </View>
                    :
                    <>
                        <View style={{ flex: 1 }}>
                            <Button title={'پرداخت از کیف پول'} textStyle={[{ fontSize: 14 }, NewStyles.text4]} style={{ paddingHorizontal: 0, backgroundColor: themeColor7.bgColor(1) }} loading={loading1} onPress={() => walletPayment()} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Button title={'پرداخت از درگاه'} textStyle={[{ fontSize: 14 }, NewStyles.text4]} style={{ paddingHorizontal: 0 }} loading={loading2} onPress={() => gatewayPayment()} />
                        </View>
                    </>
                }
            </View>}

        </View>
    )
}

// محافظت از صفحه فاکتور سفارش - نیاز به تایید کامل
export default withOrganizationAccess(Invoice, {
    ...ACCESS_PRESETS.ORDER_RELATED,
    screenName: 'Invoice'
});