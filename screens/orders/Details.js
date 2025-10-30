import { View, Text, Image, Pressable, SectionList, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

import { imageUri, uri } from '../../services/URL';
import NewStyles from '../../styles/NewStyles'
import { formatDate, formatDateTime, formatPrice, showToastOrAlert } from '../../helpers/Common';
import { themeColor0, themeColor1, themeColor10, themeColor3, themeColor4, themeColor5, themeColor6, themeColor7 } from '../../theme/Color';
import Loader from '../../components/Loader';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeaders from '../../components/ScreenHeaders';
import TechnicianDetailsComponent from '../../components/TechnicianDetailsComponent';
import Button from '../../components/Button';
import OrderExtraServices from './OrderExtraServices';
import OrderReviewSection from './OrderReviewSection';
import OrderLoopDispatchSection from './OrderLoopDispatchSection';
import OrderLoopSendSection from './OrderLoopSendSection';
import OrderReturnTimeSection from './OrderReturnTimeSection';
import AccordionHeader from '../../components/AccordionHeader';


const OrderDetail = ({ data, renderRow, totalDiscountedPrice, totalPrice }) => {
    return (
        <View style={[{ backgroundColor: themeColor4.bgColor(1), width: '90%', alignSelf: 'center', paddingBottom: 10, marginBottom: 10 }, NewStyles.border10]}>

            <View style={[NewStyles.seperator, { gap: 10, padding: '5%' }]}>
                <View style={[{ width: '100%', padding: '5%', backgroundColor: themeColor3.bgColor(0.2) }, NewStyles.border10, NewStyles.center]}>
                    <View style={[NewStyles.row, { gap: 5 }]}>
                        <Ionicons name="newspaper-outline" size={24} color={themeColor0.bgColor(1)} />
                        <Text style={NewStyles.title}>جزئیات سفارش - شناسه: {data?.id}</Text>
                    </View>
                    <Text style={NewStyles.text3}>{data?.category?.title}</Text>
                </View>
                {renderRow('زمان مراجعه تکنسین', data?.is_urgent > 0 ? 'درخواست فوری' : formatDate(data?.date) + ' ساعت ' + data?.time?.split(':')?.slice(0, 2)?.join(':'), NewStyles.text, data?.is_urgent > 0 && NewStyles.title6)}
                {renderRow('زمان ثبت سفارش', formatDateTime(data?.created_at))}
                {Number(data?.category?.has_gender) > 0 && (
                    renderRow(
                        'جنسیت و تعداد تکنسینین',
                        (() => {
                            const male = Number(data.male_count) || 0;
                            const female = Number(data.female_count) || 0;
                            const unspecified = Number(data.unspecified_count) || 0;
                            const total = male + female + unspecified;

                            if (total === 0) return 'مشخص نشده';

                            let details = [];
                            if (male > 0) details.push(`${male} آقا`);
                            if (female > 0) details.push(`${female} خانم`);

                            return `${total} تکنسین` + (details.length > 0 ? ` (${details.join(' ')} الزامی)` : '');
                        })()
                    )
                )}

                {data?.status == 1 && renderRow('وضعیت سفارش', data?.started_at ? 'در حال انجام' : data?.arrived_at ? 'تکنسین به محل سفارش رسید' : data?.set_off_at ? 'تکنسین در راه است' : 'جاری', NewStyles.text, NewStyles.text7)}
                {renderRow((Number(data?.is_fixed) == 1) ? 'مبلغ قطعی لوپ' : 'مبلغ پایه لوپ', data?.pakar_price > 0 ? `${formatPrice(data?.pakar_price)}` + ' تومان' : 'توافقی')}
                {(data?.technician_price > 0 && Number(data?.is_fixed) == 0) && renderRow('مبلغ توافقی با تکنسین', data?.technician_price ? `${formatPrice(data?.technician_price)}` + ' تومان' : '0 تومان')}
                {data?.extra_price > 0 && renderRow('مبلغ خدمات مازاد', data?.extra_price ? `${formatPrice(data?.extra_price)}` + ' تومان' : '0 تومان')}
                {data?.discount_price > 0 && renderRow('مبلغ تخفیف شما', data?.discount_price ? `${formatPrice(data?.discount_price)}` + ' تومان' : '0 تومان')}
                {totalPrice > totalDiscountedPrice > 0 && renderRow('مبلغ نهایی بدون تخفیف', `${formatPrice(totalPrice)}` + ' تومان', NewStyles.text, [NewStyles.text10, { textDecorationLine: 'line-through' }])}
                {data?.status > 0 && renderRow('مبلغ قابل پرداخت', formatPrice(totalDiscountedPrice) + ' تومان')}

                <View style={NewStyles.rowWrapper}>
                    <Text style={[NewStyles.text]}>وضعیت پرداخت</Text>
                    <View style={[{ backgroundColor: data?.payment_status > 0 ? themeColor7.bgColor(1) : themeColor6.bgColor(1), paddingHorizontal: 5, paddingVertical: 1 }, NewStyles.border10]}>
                        <Text style={NewStyles.text4}>{data?.payment_status > 0 ? 'پرداخت شده' : 'پرداخت نشده'}</Text>
                    </View>
                </View>


            </View>

            <View style={{ paddingHorizontal: '5%', padding: 20, gap: 10 }}>
                <View style={[NewStyles.row, { gap: 5 }]}>
                    <Ionicons name={'locate'} size={24} color={themeColor0.bgColor(1)} />
                    <Text style={NewStyles.title}>محل سفارش</Text>
                </View>
                <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                    <Ionicons name={'ellipse'} size={10} color={themeColor0.bgColor(0.5)} />
                    <View>
                        <Text style={[NewStyles.text10, { flex: 1 }]}>{data?.user_address?.city + ' - منطقه ' + data?.user_address?.region + ' - ' + data?.user_address?.address}</Text>
                        <Text style={[NewStyles.text10, { flex: 1 }]}>{data?.user_address?.fname + ' - ' + data?.user_address?.lname + ' - ' + data?.user_address?.telephone}</Text>
                    </View>
                </View>
            </View>

            <SectionList
                style={{ paddingHorizontal: '5%', padding: 20 }}
                contentContainerStyle={{ gap: 1 }}
                scrollEnabled={false}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
                sections={data?.order_details || []}
                keyExtractor={(item, index) => item?.id + index}
                renderSectionHeader={({ section }) => (
                    <View style={[NewStyles.row, { gap: 5 }]}>
                        <Ionicons name={section?.icon_name} size={24} color={themeColor0.bgColor(1)} />
                        <Text style={NewStyles.title}>{section?.title}</Text>
                    </View>
                )}
                SectionSeparatorComponent={() => <View style={{ paddingVertical: 5 }} />}
                renderItem={({ item }) => (
                    <View style={[styles.itemWrapper, NewStyles.border10]}>
                        <View style={NewStyles.rowWrapper}>
                            <View style={[NewStyles.rowWrapper, { justifyContent: 'flex-end', flex: 2, gap: 5 }]}>
                                <Ionicons name={'ellipse'} size={10} color={themeColor0.bgColor(0.5)} />
                                {item?.type == 'input' ? <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.field_detail?.second_title}</Text> : <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.field_detail?.title}</Text>}
                            </View>
                            {(item?.field_detail?.has_counter >= 1 && item?.type != 'input') && <Text style={[NewStyles.text10, { flex: 1, textAlign: 'auto' }]}>{item?.value}</Text>}
                        </View>
                        {(item?.field_detail?.has_counter >= 1 && item?.type == 'input') && <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.value}</Text>}
                    </View>
                )}
            />

            {data?.des && <View style={{ paddingHorizontal: '5%', gap: 10 }}>
                <View style={[NewStyles.row, { gap: 5 }]}>
                    <Ionicons name={'create-outline'} size={24} color={themeColor0.bgColor(1)} />
                    <Text style={NewStyles.title}>توضیحات کاربر</Text>
                </View>
                <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                    <Ionicons name={'ellipse'} size={10} color={themeColor0.bgColor(0.5)} />
                    <Text style={[NewStyles.text10, { flex: 1 }]}>{data?.des}</Text>
                </View>
            </View>}
            {data?.technician_des && <View style={{ paddingHorizontal: '5%', gap: 10 }}>
                <View style={[NewStyles.row, { gap: 5 }]}>
                    <Ionicons name={'create-outline'} size={24} color={themeColor0.bgColor(1)} />
                    <Text style={NewStyles.title}>توضیحات تکنسین</Text>
                </View>
                <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                    <Ionicons name={'ellipse'} size={10} color={themeColor0.bgColor(0.5)} />
                    <Text style={[NewStyles.text10, { flex: 1 }]}>{data?.technician_des}</Text>
                </View>
            </View>}

            {data?.image_path &&
                <Image style={[{ height: 250, margin: '5%' }, NewStyles.border10]} source={{ uri: `${imageUri}/${data?.image_path}` }} />
            }
        </View>
    )
}


export default function Details({ route, navigation }) {

    const orderId = route?.params?.orderId;
    const token = useSelector((state) => state?.auth?.token)
    const [refreshing, setRefreshing] = useState(true)
    const [showDetails, setShowDetails] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [showTechnician, setShowTechnician] = useState(false);
    const [showProcess, setShowProcess] = useState(false);
    const [showLoopDispatch, setShowLoopDispatch] = useState(false);
    const [hasReport, setHasReport] = useState(false);
    const [showLoopSend, setShowLoopSend] = useState(false);
    const [showReturnTime, setShowReturnTime] = useState(false);
    const [showMorePrices, setShowMorePrices] = useState(false);
    // Payment & receive stages
    const [showPayment, setShowPayment] = useState(false);
    const [showReceive, setShowReceive] = useState(false);
    const [selectedReceiveOption, setSelectedReceiveOption] = useState(null);
    const [showCustomReceive, setShowCustomReceive] = useState(false);
    const [customReceiveText, setCustomReceiveText] = useState('');
    const [isTechnicianVerified, setIsTechnicianVerified] = useState(0);
    const [verifying, setVerifying] = useState(false);
    const [data, setData] = useState([]);

    // چک کردن وضعیت گزارش بعد از لود شدن داده‌ها
    useEffect(() => {
        if (orderId && token) {
            checkReportStatus();
        }
    }, [orderId, token, refreshing]);

    const checkReportStatus = async () => {
        try {
            const response = await axios.get(
                `${uri}/order-reports/by-order/${orderId}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status == 200 && response.data?.success && response.data?.data?.report) {
                setHasReport(true);
            } else {
                setHasReport(false);
            }
        } catch (error) {
            setHasReport(false);
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.post(`${uri}/orders/detail`, { orderId }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            if (response.status == 200) {
                setData(response?.data)
                setIsTechnicianVerified(response?.data?.is_technician_verified);
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : 'خطای غیرمنتظره رخ داده است!') : 'خطای شبکه!';
            showToastOrAlert(message);
        } finally {
            setRefreshing(false);
        }
    };

    const handleVerifyTechnician = async () => {
        if (!isTechnicianVerified || (isTechnicianVerified != '1' && isTechnicianVerified != '2')) {
            showToastOrAlert('لطفاً یکی از گزینه‌ها را انتخاب کنید');
            return;
        }

        setVerifying(true);
        try {
            const response = await axios.post(
                `${uri}/orders/verify-technician`,
                {
                    orderId: orderId,
                    verification_status: parseInt(isTechnicianVerified)
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status == 200) {
                showToastOrAlert(response?.data?.message || 'تأیید هویت با موفقیت انجام شد');
                // بروزرسانی داده‌ها
                setRefreshing(true);
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : 'خطای غیرمنتظره رخ داده است!') : 'خطای شبکه!';
            showToastOrAlert(message);
        } finally {
            setVerifying(false);
        }
    };
    useFocusEffect(useCallback(
        () => {
            fetchData();
        }, [refreshing]
    ));

    const totalDiscountedPrice = useMemo(() => {
        const basePrice = Number(data?.technician_price ?? data?.pakar_price);
        return Number(basePrice) + Number(data?.extra_price) - Number(data?.discount_price);
    }, [data]);

    const totalPrice = useMemo(() => {
        const basePrice = Number(data?.technician_price ?? data?.pakar_price);
        return Number(basePrice) + Number(data?.extra_price);
    }, [data]);

    // استفاده از useCallback برای جلوگیری از re-render غیرضروری
    const renderRow = useCallback((text1, text2, textStyle1, textStyle2) => (
        <View style={NewStyles.rowWrapper}>
            <Text style={[NewStyles.text, textStyle1]}>{text1}</Text>
            <Text style={[NewStyles.text10, textStyle2]}>{text2}</Text>
        </View>
    ), []);

    if (data.length <= 0) { return <Loader /> }

    if ((data?.status == '3' || data?.status == '4' || data?.status == '5' || data?.status == '6') && !data?.user_cancellation_date) {
        return (
            <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={[NewStyles.container,]}>
                <ScreenHeaders title={'سفارش لغو شده'} />
                <ScrollView contentContainerStyle={[{ paddingVertical: 10 }, (data?.technician && data?.status == 1) && { paddingBottom: 80 },]} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => setRefreshing(true)} />}>
                    <OrderDetail data={data} renderRow={renderRow} totalDiscountedPrice={totalDiscountedPrice} totalPrice={totalPrice} />
                </ScrollView>
            </SafeAreaView >
        )
    }
    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={[NewStyles.container,]}>
            <ScreenHeaders title={'سفارش جاری'} />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>

                <ScrollView contentContainerStyle={[{ paddingVertical: 10 }, (data?.technician && data?.status == 1) && { paddingBottom: 80 },]} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => setRefreshing(true)} />}>

                    <AccordionHeader
                        title="جزئیات سفارش"
                        isActive={true}
                        isOpen={showDetails}
                        onPress={() => setShowDetails(!showDetails)}
                    />
                    {showDetails && <OrderDetail data={data} renderRow={renderRow} totalDiscountedPrice={totalDiscountedPrice} totalPrice={totalPrice} />}

                    {/* مرحله بررسی / جایگزین / */}
                    <AccordionHeader
                        title="بررسی / جایگزین"
                        isActive={(data?.technician && data?.status != 3 && data?.status != 4 && data?.status != 5 && data?.status != 6) || data?.user_cancellation_date}
                        isOpen={showReview}
                        onPress={() => {
                            if ((data?.technician && data?.status != 3 && data?.status != 4 && data?.status != 5 && data?.status != 6) || data?.user_cancellation_date) {
                                setShowReview(!showReview)
                            } else {
                                showToastOrAlert('این مرحله هنوز فعال نشده است.')
                            }
                        }}
                    />
                    {showReview && ((data?.technician && data?.status != 3 && data?.status != 4 && data?.status != 5 && data?.status != 6) || data?.user_cancellation_date) && (
                        <OrderReviewSection
                            data={data}
                            orderId={orderId}
                            onUpdate={() => setRefreshing(true)}
                        />
                    )}

                    <AccordionHeader
                        title="اطلاعات تکنسین"
                        isActive={data?.technician}
                        isOpen={showTechnician}
                        onPress={() => {
                            if (data?.technician) {
                                setShowTechnician(!showTechnician)
                            } else {
                                showToastOrAlert('هنوز تکنسینی به سفارش شما اختصاص داده نشده است.')
                            }
                        }}
                    />
                    {showTechnician && data?.technician && (
                        <TechnicianDetailsComponent navigation={navigation} data={data} renderRow={renderRow} />
                    )}

                    <AccordionHeader
                        title="در حال انجام"
                        isActive={data?.status >= 1 && data?.technician}
                        isOpen={showProcess}
                        onPress={() => {
                            if (data?.status >= 1 && data?.technician) {
                                setShowProcess(!showProcess)
                            } else {
                                showToastOrAlert('سفارش شما به مرحله ی انجام نرسیده است.')
                            }
                        }}
                    />
                    {
                        showProcess &&

                        <View style={[{ width: '90%', alignSelf: 'center', paddingBottom: 10 }, NewStyles.center]}>
                            <View style={styles.noticeBox}>
                                {(data?.set_off_at && !data?.arrived_at) && <Text style={[NewStyles.text10, { textAlign: 'center' }]}>
                                    تکنسین لوپ به سمت محل سفارش شما حرکت کرده است. لطفاً در صورت نیاز با تکنسین تماس بگیرید.
                                </Text>
                                }
                                {(!data?.set_off_at) &&
                                    <Text style={[NewStyles.text10, { textAlign: 'center' }]}>کاربر گرامی، سفارش شما در حال بررسی تکنسین لوپ می باشد. از صبر و شکیبایی شما سپاس گزاریم.</Text>
                                }
                                {data?.arrived_at && <Text style={[NewStyles.text10, { textAlign: 'center' }]}>
                                    کاربر گرامی، در صورت عدم تطابق مشخصات کاربر تکنسین با اطلاعات ثبت شده، لطفاً به پشتیبانی لوپ اطلاع دهید.
                                </Text>}
                            </View>

                            {data?.arrived_at && <>
                                <View style={styles.confirmButton} >
                                    <Text style={[NewStyles.text10]}>تأیید حضور تکنسین</Text>
                                </View>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: themeColor10.bgColor(1), width: '100%', marginVertical: 15, borderStyle: 'dashed' }} />
                                <View style={[NewStyles.center, { width: '100%', gap: 10 }]}>
                                    <TouchableOpacity disabled={data?.is_technician_verified != '0'} style={[styles.grayButton, isTechnicianVerified == 1 && { backgroundColor: themeColor0.bgColor(1) }]} onPress={() => { setIsTechnicianVerified('1'); }}>
                                        <Text style={[NewStyles.text10, isTechnicianVerified == '1' && NewStyles.text4]}>مشخصات تکنسین درست است</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity disabled={data?.is_technician_verified != '0'} style={[styles.grayButton, isTechnicianVerified == '2' && { backgroundColor: themeColor0.bgColor(1) }]} onPress={() => { setIsTechnicianVerified('2'); }}>
                                        <Text style={[NewStyles.text10, isTechnicianVerified == '2' && NewStyles.text4]}>مشخصات تکنسین درست نیست</Text>
                                    </TouchableOpacity>
                                    {((isTechnicianVerified == '1' || isTechnicianVerified == '2') && data?.is_technician_verified == '0') && (
                                        <Button
                                            title={'ثبت نهایی'}
                                            onPress={handleVerifyTechnician}
                                            loading={verifying}
                                        />
                                    )}
                                </View>
                            </>}
                        </View>
                    }

                    {/* مشخصات / اطلاعات محصول */}
                    <AccordionHeader
                        title="مشخصات / اطلاعات محصول"
                        isActive={hasReport}
                        isOpen={showLoopDispatch}
                        onPress={() => {
                            if (hasReport) {
                                setShowLoopDispatch(!showLoopDispatch)
                            } else {
                                showToastOrAlert('هنوز اطلاعات محصول توسط تکنسین ثبت نشده است.')
                            }
                        }}
                    />
                    {showLoopDispatch && (
                        <OrderLoopDispatchSection
                            orderId={orderId}
                            onUpdate={() => setRefreshing(true)}
                            onReportStatusChange={(status) => setHasReport(status)}
                        />
                    )}

                    {/* اعزام به لوپ / هزینه ها / مدت زمان */}
                    <AccordionHeader
                        title="اعزام به لوپ / هزینه ها / مدت زمان"
                        isActive={data?.send_to_loop}
                        isOpen={showLoopSend}
                        onPress={() => {
                            if (data?.send_to_loop) {
                                setShowLoopSend(!showLoopSend)
                            } else {
                                showToastOrAlert('درخواست اعزام به لوپ هنوز ثبت نشده است.')
                            }
                        }}
                    />
                    {showLoopSend && data?.send_to_loop && (
                        <OrderLoopSendSection
                            data={data}
                            orderId={orderId}
                            onUpdate={() => setRefreshing(true)}
                        />
                    )}

                    {/* زمان عودت - فقط اگر user_cancellation_date پر باشه */}
                    {data?.user_cancellation_date && (
                        <>
                            <AccordionHeader
                                title="زمان عودت"
                                isActive={true}
                                isOpen={showReturnTime}
                                onPress={() => setShowReturnTime(!showReturnTime)}
                            />
                            {showReturnTime && (
                                <OrderReturnTimeSection
                                    data={data}
                                    orderId={orderId}
                                    onUpdate={() => setRefreshing(true)}
                                />
                            )}
                        </>
                    )}
                    {data?.returned_at &&
                        <View style={{paddingHorizontal:'5%'}}>
                            <Button style={{ backgroundColor: themeColor6.bgColor(1) }} title={'محصول با موفقیت عودت داده شد'} />
                        </View>
                    }
                    <AccordionHeader
                        title="قطعات / هزینه ها"
                        isActive={data?.status >= 1 && data?.technician && data?.extra_price > 0}
                        isOpen={showMorePrices}
                        onPress={() => {
                            if (data?.status >= 1 && data?.technician && data?.extra_price > 0) {
                                setShowMorePrices(!showMorePrices)
                            } else {
                                showToastOrAlert('هیچ هزینه اضافی برای این سفارش ثبت نشده است.')
                            }
                        }}
                    />
                    {
                        showMorePrices &&
                        <OrderExtraServices orderId={orderId} navigation={navigation} />
                    }

                    {/* مرحله پرداخت هزینه */}
                    <AccordionHeader
                        title={"پرداخت هزینه"}
                        isActive={data?.started_at}
                        isOpen={showPayment}
                        onPress={() => {
                            if (data?.started_at) {
                                setShowPayment(!showPayment)
                            } else {
                                showToastOrAlert('سفارش هنوز شروع نشده است.')
                            }
                        }}
                    />
                    {showPayment && data?.started_at && (
                        <View style={{ paddingHorizontal: '5%', gap: 10 }}>
                            <View style={styles.noticeBox}>
                                <Text style={NewStyles.text10}>وضعیت پرداخت: {data?.payment_status == 1 ? 'پرداخت شده' : 'پرداخت نشده'}</Text>
                            </View>

                            {data?.payment_status == 0 && (
                                <>
                                    <View style={[NewStyles.row, { gap: 10 }]}> 
                                        <View style={{ flex: 1 }}>
                                            <Button title={'پرداخت آنلاین'} onPress={() => { }} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Button title={'پرداخت از کیف پول'} onPress={() => { }} />
                                        </View>
                                    </View>
                                    <View style={{ paddingTop: 10 }}>
                                        <Button title={'شارژ کیف پول'} onPress={() => { }} style={{ backgroundColor: themeColor6.bgColor(1) }} />
                                    </View>
                                </>
                            )}
                        </View>
                    )}

                    {/* مرحله دریافت سفارش - فعال بعد از پرداخت */}
                    <AccordionHeader
                        title={"دریافت سفارش"}
                        isActive={data?.payment_status == 1}
                        isOpen={showReceive}
                        onPress={() => {
                            if (data?.payment_status == 1) {
                                setShowReceive(!showReceive)
                            } else {
                                showToastOrAlert('ابتدا پرداخت را انجام دهید.')
                            }
                        }}
                    />
                    {showReceive && data?.payment_status == 1 && (
                        <View style={{ paddingHorizontal: '5%', gap: 12 }}>
                            <Text style={NewStyles.text}>لطفاً یکی از وضعیت‌های دریافت را انتخاب کنید:</Text>
                            <TouchableOpacity style={[styles.optionBox, NewStyles.border10, selectedReceiveOption == 1 && styles.optionBoxSelected]} onPress={() => { setSelectedReceiveOption(1); setShowCustomReceive(false); setCustomReceiveText(''); }}>
                                <Text style={NewStyles.text10}>محصول را با تست سلامت دریافت کردم</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.optionBox, NewStyles.border10, selectedReceiveOption == 2 && styles.optionBoxSelected]} onPress={() => { setSelectedReceiveOption(2); setShowCustomReceive(false); setCustomReceiveText(''); }}>
                                <Text style={NewStyles.text10}>محصول را بدون تست سلامت دریافت کردم</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.optionBox, NewStyles.border10, selectedReceiveOption == 3 && styles.optionBoxSelected]} onPress={() => { setSelectedReceiveOption(3); setShowCustomReceive(false); setCustomReceiveText(''); }}>
                                <Text style={NewStyles.text10}>محصول را تحویل گرفتم اما دارای نقص فنی می باشد</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.optionBox, NewStyles.border10, showCustomReceive && styles.optionBoxSelected]} onPress={() => { setShowCustomReceive(true); setSelectedReceiveOption(null); }}>
                                <Text style={NewStyles.text10}>ثبت توضیح</Text>
                            </TouchableOpacity>

                            {showCustomReceive && (
                                <View>
                                    <Text style={NewStyles.text}>توضیحات:</Text>
                                    <TextInput style={[styles.textInput, NewStyles.border10]} placeholder={'توضیحات خود را وارد کنید...'} value={customReceiveText} onChangeText={setCustomReceiveText} multiline numberOfLines={3} textAlignVertical={'top'} />
                                </View>
                            )}

                            <View>
                                <Button title={'ثبت وضعیت دریافت (محلی)'} onPress={() => showToastOrAlert('وضعیت انتخاب شد')} />
                            </View>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    itemWrapper: {
        backgroundColor: themeColor5.bgColor(1),
        paddingVertical: '5%',
        paddingHorizontal: '5%',
        minHeight: 50,
        gap: 10
    },
    locateBtn: {
        gap: 10,
        backgroundColor: themeColor7.bgColor(1),
        position: 'absolute',
        bottom: 20,
        right: 20,
        padding: 10
    },
    extraBtn: {
        gap: 10,
        backgroundColor: themeColor0.bgColor(1),
        // position: 'absolute',
        // bottom: 70,
        // right: 20,
        padding: 10
    },
    noticeBox: {
        backgroundColor: themeColor1.bgColor(1),
        padding: 10,
        ...NewStyles.border10,
        marginBottom: 12,
    },
    confirmButton: {
        backgroundColor: themeColor4.bgColor(1),
        width: '100%',
        alignSelf: 'center',
        ...NewStyles.center,
        paddingVertical: 10,
        ...NewStyles.border10
    },
    grayButton: {
        backgroundColor: themeColor4.bgColor(1),
        paddingVertical: 10,
        width: '100%',
        ...NewStyles.border10,
        ...NewStyles.center
    }
})