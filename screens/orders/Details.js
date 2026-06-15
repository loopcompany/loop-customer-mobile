import { View, Text, Image, Pressable, SectionList, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, KeyboardAvoidingView, TextInput, FlatList } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import * as Linking from "expo-linking";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { imageUri, uri } from '../../services/URL';
import NewStyles from '../../styles/NewStyles'
import { formatDate, formatDateTime, formatPrice, langIsRTL, showToastOrAlert } from '../../helpers/Common';
import { themeColor0, themeColor1, themeColor10, themeColor3, themeColor4, themeColor5, themeColor6, themeColor7 } from '../../theme/Color';
import Loader from '../../components/Loader';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeaders from '../../components/ScreenHeaders';
import TechnicianDetailsComponent from '../../components/TechnicianDetailsComponent';
import Button from '../../components/Button';
import OrderExtraServices from './OrderExtraServices';
import OrderReviewSection from './OrderReviewSection';
import OrderReviewRatingSection from './OrderReviewRatingSection';
import OrderLoopDispatchSection from './OrderLoopDispatchSection';
import OrderLoopSendSection from './OrderLoopSendSection';
import OrderReturnTimeSection from './OrderReturnTimeSection';
import AccordionHeader from '../../components/AccordionHeader';
import { fetchUser } from '../../slices/userSlice';
import { fetchOrders } from '../../slices/orderSlice';
import { createStyles } from '../../styles/NewStyles';
import ShowMapDetailComponent from '../../components/ShowMapDetailComponent';

const OrderDetail = ({ data, renderRow, totalDiscountedPrice, totalPrice, t, styles, NewStyles, user }) => {
    let is_package = 0
    const { i18n } = useTranslation()
    console.log(data?.user_address);

    return (

        <View style={[{ backgroundColor: themeColor4.bgColor(1), width: '90%', alignSelf: 'center', paddingBottom: 10, marginBottom: 10 }, NewStyles.border10]}>

            <View style={[NewStyles.seperator, { gap: 10, padding: '5%' }]}>
                <View style={[{ width: '100%', padding: '5%', backgroundColor: themeColor3.bgColor(0.2) }, NewStyles.border10, NewStyles.center]}>
                    <View style={[NewStyles.row, { gap: 5 }]}>
                        <Ionicons name="newspaper-outline" size={24} color={themeColor0.bgColor(1)} />
                        <Text style={NewStyles.title}>{t("Order details - ID")}: {data?.id}</Text>
                    </View>
                    <Text style={NewStyles.text3}>{data?.category?.title}</Text>
                </View>
                {renderRow(t("Technician visit time"), data?.is_urgent > 0 ? t("Urgent request") : formatDate(data?.date) + ' ' + t("hour") + ' ' + data?.time?.split(':')?.slice(0, 2)?.join(':'), NewStyles.text, data?.is_urgent > 0 && NewStyles.title6)}
                {renderRow(t("Order registration time"), formatDateTime(data?.created_at))}
                {Number(data?.category?.has_gender) > 0 && (
                    renderRow(
                        t("Technician gender"),
                        (() => {
                            const male = Number(data.male_count) || 0;
                            const female = Number(data.female_count) || 0;
                            const unspecified = Number(data.unspecified_count) || 0;
                            const total = male + female + unspecified;
                            if (total === 0) return t("Not specified");
                            let details = [];
                            if (male > 0) details.push(t("Male"));
                            if (female > 0) details.push(t("Female"));
                            return (details.length > 0 ? `${details.join(' ')}` : '');
                        })()
                    )
                )}

                {user?.apple_check == 1
                    ? null
                    : <View style={NewStyles.rowWrapper}>
                        <Text style={[NewStyles.text]}>{t("Payment status")}</Text>
                        <View style={[{ backgroundColor: data?.payment_status > 0 ? themeColor7.bgColor(1) : themeColor6.bgColor(1), paddingHorizontal: 5, paddingVertical: 1 }, NewStyles.border10]}>
                            <Text style={NewStyles.text4}>{data?.payment_status > 0 ? t("Paid") : t("Not paid")}</Text>
                        </View>
                    </View>}


            </View>

            <View style={[{ paddingHorizontal: '5%', padding: 20, gap: 10 }]}>
                <View style={[NewStyles.row, { gap: 5 }]}>
                    <Ionicons name={'locate'} size={24} color={themeColor0.bgColor(1)} />
                    <Text style={NewStyles.title}>{t("Order location")}</Text>
                </View>
                <View style={[NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                    <Ionicons name={'ellipse'} size={10} color={themeColor0.bgColor(0.5)} />
                    <View>
                        <Text style={[NewStyles.text10, { flex: 1 }]}>{data?.user_address?.city + ' - ' + t("Region") + ' ' + data?.user_address?.region + ' - ' + data?.user_address?.address}</Text>
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
                renderSectionHeader={({ section }) => {
                    is_package = section?.is_package;
                    return (
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Ionicons name={section?.icon_name} size={24} color={themeColor0.bgColor(1)} />
                            <Text style={[NewStyles.title, { flex: 1 }]}>{section?.title}</Text>
                        </View>
                    )
                }}
                SectionSeparatorComponent={() => <View style={{ paddingVertical: 5 }} />}
                renderItem={({ item }) => (
                    <View style={[styles.itemWrapper, NewStyles.border10, is_package == 1 && styles.package]}>
                        <View style={[is_package == 0 && NewStyles.rowWrapper]}>
                            <View style={[NewStyles.rowWrapper, { justifyContent: 'flex-end', flex: 2, gap: 5 }]}>
                                {is_package == 0 && <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />}
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
                    <Text style={NewStyles.title}>{t("User description")}</Text>
                </View>
                <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                    <Ionicons name={'ellipse'} size={10} color={themeColor0.bgColor(0.5)} />
                    <Text style={[NewStyles.text10, { flex: 1 }]}>{data?.des}</Text>
                </View>
            </View>}
            {data?.technician_des && <View style={[{ paddingHorizontal: '5%', gap: 10 }]}>
                <View style={[NewStyles.row, { gap: 5 }]}>
                    <Ionicons name={'create-outline'} size={24} color={themeColor0.bgColor(1)} />
                    <Text style={NewStyles.title}>{t("Technician description")}</Text>
                </View>
                <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                    <Ionicons name={'ellipse'} size={10} color={themeColor0.bgColor(0.5)} />
                    <Text style={[NewStyles.text10, { flex: 1 }]}>{data?.technician_des}</Text>
                </View>
            </View>}

            {data?.image_path &&
                <Image style={[{ height: 250, margin: '5%', maxWidth: 400, resizeMode: 'contain', width: '90%', alignSelf: 'center' }, NewStyles.border10]} source={{ uri: `${imageUri}/${data?.image_path}` }} />
            }
            {data?.order_galleries?.length > 0 && <View>
                <FlatList
                    data={data?.order_galleries}
                    inverted={langIsRTL(i18n?.language)}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: '5%', gap: 10, paddingVertical: 10 }}
                    renderItem={({ item }) => {
                        return (
                            <TouchableOpacity style={{}} onPress={() => {
                                Linking.openURL(`${imageUri}/${item?.image_path}`)
                            }}>
                                <Image source={{ uri: `${imageUri}/${item?.image_path}` }} style={[{ height: 120, width: 120, }, NewStyles.border10]} />
                            </TouchableOpacity>
                        )
                    }}
                />
            </View>}
            <View style={{width:'100%', height:250, paddingHorizontal:'5%'}}>
                <ShowMapDetailComponent
                    latitude={data?.user_address?.latitude}
                    longitude={data?.user_address?.longitude}
                />
            </View>

        </View>
    )
}


function Details({ route, navigation }) {

    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);

    const dispatch = useDispatch();
    const orderId = route?.params?.orderId;
    const token = useSelector((state) => state?.auth?.token)
    const user = useSelector((state) => state?.user?.data)

    const [refreshing, setRefreshing] = useState(true)
    const [showDetails, setShowDetails] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [showTechnician, setShowTechnician] = useState(false);
    const [showProcess, setShowProcess] = useState(false);
    const [showLoopDispatch, setShowLoopDispatch] = useState(false);
    const [showDoneInPlace, setShowDoneInPlace] = useState(false);
    const [hasReport, setHasReport] = useState(false);
    const [showLoopSend, setShowLoopSend] = useState(false);
    const [showReturnTime, setShowReturnTime] = useState(false);
    const [showMorePrices, setShowMorePrices] = useState(false);
    // Payment & receive stages
    const [showPayment, setShowPayment] = useState(false);
    const [loadingWallet, setLoadingWallet] = useState(false);
    const [loadingGateway, setLoadingGateway] = useState(false);
    const [showReceive, setShowReceive] = useState(false);
    const [showShipment, setShowShipment] = useState(false);
    const [selectedReceiveOption, setSelectedReceiveOption] = useState(null);
    const [showCustomReceive, setShowCustomReceive] = useState(false);
    const [customReceiveText, setCustomReceiveText] = useState('');
    const [userInPlaceDescription, setUserInPlaceDescription] = useState('');
    const [submittingReceive, setSubmittingReceive] = useState(false);
    const [submittingInPlace, setSubmittingInPlace] = useState(false);
    const [showReviewRating, setShowReviewRating] = useState(false);
    const [isTechnicianVerified, setIsTechnicianVerified] = useState(0);
    const [verifying, setVerifying] = useState(false);
    const [data, setData] = useState([]);
    const paymentSubscriptionRef = useRef(null);

    // چک کردن وضعیت گزارش بعد از لود شدن داده‌ها
    useEffect(() => {
        if (orderId && token) {
            checkReportStatus();
        }
    }, [orderId, token, refreshing]);

    // Cleanup payment listener on unmount
    useEffect(() => {
        return () => {
            if (paymentSubscriptionRef.current) {
                paymentSubscriptionRef.current.remove();
                paymentSubscriptionRef.current = null;
            }
        };
    }, []);

    const checkReportStatus = async () => {
        try {
            const response = await axios.get(
                `${uri}/order-reports/by-order/${orderId}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Accept-Language': lang
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
            const response = await axios.post(`${uri}/orders/detail`, { orderId }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept-Language': lang } })
            if (response.status == 200) {
                setData(response?.data)
                setIsTechnicianVerified(response?.data?.is_technician_verified);
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t("An unexpected error occurred!")) : t("Network error!");
            showToastOrAlert(message);
        } finally {
            setRefreshing(false);
        }
    };

    const handleVerifyTechnician = async () => {
        if (!isTechnicianVerified || (isTechnicianVerified != '1' && isTechnicianVerified != '2')) {
            showToastOrAlert(t("Please select one of the options"));
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
                        'Authorization': `Bearer ${token}`,
                        'Accept-Language': lang
                    }
                }
            );

            if (response.status == 200) {
                showToastOrAlert(response?.data?.message || t("Identity verification completed successfully"));
                // بروزرسانی داده‌ها
                setRefreshing(true);
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t("An unexpected error occurred!")) : t("Network error!");
            showToastOrAlert(message);
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmitReceive = async () => {
        // بررسی انتخاب گزینه یا ثبت توضیحات
        if (!selectedReceiveOption && !showCustomReceive) {
            showToastOrAlert(t("Please select one of the options"));
            return;
        }

        if (showCustomReceive && !customReceiveText.trim()) {
            showToastOrAlert(t("Please enter the description"));
            return;
        }

        // تعریف متن‌های مربوط به هر گزینه
        const optionTexts = {
            1: t("I received the product with health test"),
            2: t("I received the product without health test"),
            3: t("I received the product but it has technical defects"),
            4: t("The product was returned to Loop after the test"),
            5: t("I received the product as per my request")
        };

        const description = showCustomReceive ? customReceiveText.trim() : optionTexts[selectedReceiveOption];

        setSubmittingReceive(true);
        try {
            const response = await axios.post(
                `${uri}/orders/${orderId}/final-description`,
                { description },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Accept-Language': lang
                    }
                }
            );

            if (response.status == 200) {
                showToastOrAlert(response?.data?.message || t("Final description successfully submitted"));
                // بروزرسانی داده‌ها
                setRefreshing(true);
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t("An unexpected error occurred!")) : t("Network error!");
            showToastOrAlert(message);
        } finally {
            setSubmittingReceive(false);
        }
    };
    const handleSubmitInPlace = async () => {

        setSubmittingInPlace(true);
        try {
            const response = await axios.post(
                `${uri}/orders/${orderId}/in-place-description`,
                { user_in_place_description: userInPlaceDescription },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Accept-Language': lang
                    }
                }
            );

            if (response.status == 200) {
                showToastOrAlert(response?.data?.message || t("Final description successfully submitted"));
                // بروزرسانی داده‌ها
                setRefreshing(true);
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t("An unexpected error occurred!")) : t("Network error!");
            showToastOrAlert(message);
        } finally {
            setSubmittingInPlace(false);
            dispatch(fetchOrders(token));
        }
    };

    const walletPayment = async () => {
        setLoadingWallet(true);
        try {
            const response = await axios.post(
                `${uri}/wallet/pay-order`,
                { orderId: orderId },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Accept-Language': lang
                    }
                }
            );

            if (response.status == 200 || response.status == 201) {
                showToastOrAlert(response?.data?.message || t("Payment completed successfully"));
                dispatch(fetchOrders(token));
                dispatch(fetchUser(token));
                setRefreshing(true);
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t("An unexpected error occurred!")) : t("Network error!");
            showToastOrAlert(message);
        } finally {
            setLoadingWallet(false);
        }
    };

    const redirectUrl = Linking.createURL("/?");

    const _addLinkingListener = () => {
        // Remove existing listener if any
        if (paymentSubscriptionRef.current) {
            paymentSubscriptionRef.current.remove();
        }

        paymentSubscriptionRef.current = Linking.addEventListener("url", ({ url }) => {
            const { queryParams } = Linking.parse(url);
            if (queryParams?.status == 'OK') {
                dispatch(fetchOrders(token));
                dispatch(fetchUser(token));
                setRefreshing(true);
                showToastOrAlert(t("Payment completed successfully"));
                // Cleanup listener after handling
                if (paymentSubscriptionRef.current) {
                    paymentSubscriptionRef.current.remove();
                    paymentSubscriptionRef.current = null;
                }
            } else if (queryParams?.status == 'NOK') {
                showToastOrAlert(t("The payment encountered an error."));
                // Cleanup listener after handling
                if (paymentSubscriptionRef.current) {
                    paymentSubscriptionRef.current.remove();
                    paymentSubscriptionRef.current = null;
                }
            }
            setLoadingGateway(false);
        });
    };

    const gatewayPayment = async () => {
        setLoadingGateway(true);
        try {
            const response = await axios.post(
                `${uri}/orders/gateway-payment`,
                {
                    order_id: orderId,
                    linking_url: redirectUrl
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Accept-Language': lang
                    }
                }
            );

            if (response.status == 200 && response.data?.data?.payment_url) {
                _addLinkingListener();
                await Linking.openURL(response.data.data.payment_url);
            } else {
                showToastOrAlert(t("Error connecting to payment gateway"));
                setLoadingGateway(false);
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.data?.message || t("Error connecting to payment gateway")) : t("Network error!");
            showToastOrAlert(message);
            setLoadingGateway(false);
        } finally {
            setLoadingGateway(false);
        }
    };

    useFocusEffect(useCallback(
        () => {
            fetchData();
            dispatch(fetchUser(token));
        }, [refreshing]
    ));

    const totalDiscountedPrice = useMemo(() => {
        const basePrice = Number(data?.technician_price ?? data?.pakar_price);
        if (data?.prepayment && data?.prepayment_payment_status == 1) {

            const prepaid = Number(data?.loop_cost_estimate) * Number(data?.prepayment) / 100;
            return Number(basePrice) + Number(data?.extra_price) - Number(data?.discount_price) - prepaid;
        } else {

            return Number(basePrice) + Number(data?.extra_price) - Number(data?.discount_price);
        }
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


    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={[NewStyles.container,]}>
            <ScreenHeaders title={t("Current order")} />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>

                <ScrollView contentContainerStyle={[{ paddingVertical: 10 }, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => setRefreshing(true)} />}>

                    <AccordionHeader
                        title={t("Order details")}
                        isActive={true}
                        isOpen={showDetails}
                        onPress={() => setShowDetails(!showDetails)}
                    />
                    {showDetails && <OrderDetail data={data} user={user} renderRow={renderRow} totalDiscountedPrice={totalDiscountedPrice} totalPrice={totalPrice} t={t} styles={styles} NewStyles={NewStyles} />}

                    {/* مرحله بررسی / جایگزین / */}
                    <AccordionHeader
                        title={t("Review / Replacement / Receipt")}
                        isActive={(data?.technician && data?.status != 3 && data?.status != 5 && data?.status != 6) || data?.user_cancellation_date}
                        isOpen={showReview}
                        onPress={() => {
                            if ((data?.technician && data?.status != 3 && data?.status != 5 && data?.status != 6) || data?.user_cancellation_date) {
                                setShowReview(!showReview)
                            } else if (data?.status == 3) {
                                showToastOrAlert(t("You have canceled the order"))
                            }
                            else {
                                showToastOrAlert(t("This stage is not activated yet."))
                            }
                        }}
                    />
                    {showReview && ((data?.technician && data?.status != 3 && data?.status != 5 && data?.status != 6) || data?.user_cancellation_date) && (
                        <OrderReviewSection
                            data={data}
                            navigation={navigation}
                            orderId={orderId}
                            onUpdate={() => setRefreshing(true)}
                        />
                    )}

                    <AccordionHeader
                        title={t("Technician information")}
                        isActive={data?.technician}
                        isOpen={showTechnician}
                        onPress={() => {
                            if (data?.technician) {
                                setShowTechnician(!showTechnician)

                            } else {
                                showToastOrAlert(t("No technician has been assigned to your order yet."))
                            }
                        }}
                    />
                    {(showTechnician) && data?.technician && (
                        <View>
                            <TechnicianDetailsComponent navigation={navigation} data={data} renderRow={renderRow} />

                            {/* علت لغو توسط متخصص */}
                            {data?.technician_cancel_reason && (
                                <View style={[{ backgroundColor: themeColor6.bgColor(0.1), width: '90%', alignSelf: 'center', paddingBottom: 10, marginBottom: 10, marginTop: 10 }, NewStyles.border10]}>
                                    <View style={[NewStyles.seperator, { gap: 10, padding: '5%' }]}>
                                        <View style={[{ width: '100%', padding: '5%', backgroundColor: themeColor6.bgColor(0.2) }, NewStyles.border10, NewStyles.center]}>
                                            <View style={[NewStyles.row, { gap: 5 }]}>
                                                <Ionicons name="close-circle-outline" size={24} color={themeColor6.color} />
                                                <Text style={[NewStyles.title, { color: themeColor6.color }]}>{t("Reason for order cancellation by technician")}</Text>
                                            </View>
                                        </View>
                                        <View style={[{ backgroundColor: themeColor4.bgColor(1), padding: 15 }, NewStyles.border10]}>
                                            <Text style={[NewStyles.text10, { textAlign: 'right', lineHeight: 24 }]}>
                                                {data?.technician_cancel_reason}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    <AccordionHeader
                        title={t("In progress")}
                        isActive={(data?.status == 1 || data?.status == 2 || isTechnicianVerified != '0') && data?.technician}
                        isOpen={showProcess}
                        onPress={() => {
                            if ((data?.status == 1 || data?.status == 2 || isTechnicianVerified != '0') && data?.technician) {
                                setShowProcess(!showProcess)
                            } else if (data?.status == 0) {
                                showToastOrAlert(t("Your order has not reached the execution stage."))
                            } else {
                                showToastOrAlert(t("Your order has been canceled."))
                            }
                        }}
                    />
                    {
                        showProcess &&

                        <View style={[{ width: '90%', alignSelf: 'center', paddingBottom: 10 }, NewStyles.center]}>
                            <View style={styles.noticeBox}>
                                {(data?.set_off_at && !data?.arrived_at) && <Text style={[NewStyles.text10, { textAlign: 'center' }]}>
                                    {t("The Loop technician is heading to your order location. Please contact the technician if needed.")}
                                </Text>
                                }
                                {(!data?.set_off_at) &&
                                    <Text style={[NewStyles.text10, { textAlign: 'center' }]}>{t("Dear user, your order is being reviewed by Loop technician. Thank you for your patience.")}</Text>
                                }
                                {data?.arrived_at && <Text style={[NewStyles.text10, { textAlign: 'center' }]}>
                                    {t("Dear user, if the technician's specifications do not match the registered information, please inform Loop support.")}
                                </Text>}
                            </View>

                            {data?.arrived_at && <>
                                <View style={styles.confirmButton} >
                                    <Text style={[NewStyles.text10]}>{t("Confirm technician presence")}</Text>
                                </View>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: themeColor10.bgColor(1), width: '100%', marginVertical: 15, borderStyle: 'dashed' }} />
                                <View style={[NewStyles.center, { width: '100%', gap: 10 }]}>
                                    <TouchableOpacity disabled={data?.is_technician_verified != '0'} style={[styles.grayButton, isTechnicianVerified == 1 && { backgroundColor: themeColor0.bgColor(1) }]} onPress={() => { setIsTechnicianVerified('1'); }}>
                                        <Text style={[NewStyles.text10, isTechnicianVerified == '1' && NewStyles.text4]}>{t("Technician specifications are correct")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity disabled={data?.is_technician_verified != '0'} style={[styles.grayButton, isTechnicianVerified == '2' && { backgroundColor: themeColor0.bgColor(1) }]} onPress={() => { setIsTechnicianVerified('2'); }}>
                                        <Text style={[NewStyles.text10, isTechnicianVerified == '2' && NewStyles.text4]}>{t("Technician specifications are not correct")}</Text>
                                    </TouchableOpacity>
                                    {((isTechnicianVerified == '1' || isTechnicianVerified == '2') && data?.is_technician_verified == '0') && (
                                        <Button
                                            title={t("Final submit")}
                                            onPress={handleVerifyTechnician}
                                            loading={verifying}
                                        />
                                    )}
                                </View>
                            </>}
                        </View>
                    }

                    {/* مشخصات / اطلاعات محصول */}
                    {data?.done_in_place && data?.admin_in_place_description && <AccordionHeader
                        title={t("Done at your place")}
                        isActive={true}
                        isOpen={showDoneInPlace}
                        onPress={() => {

                            setShowDoneInPlace(!showDoneInPlace)
                        }}
                    />}
                    {
                        (data?.done_in_place && data?.admin_in_place_description && showDoneInPlace) &&
                        <View style={styles.contentSection}>
                            <View style={[styles.infoCard, { backgroundColor: themeColor1.bgColor(1) }]}>
                                <View style={[NewStyles.row, { gap: 10, alignItems: 'center' }]}>
                                    <Ionicons name="checkmark-circle" size={24} color={themeColor0.bgColor(1)} />
                                    <Text style={[NewStyles.text10]}>
                                        {data?.admin_in_place_description}
                                    </Text>
                                </View>
                                <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 5 }]}>
                                    {t("Done at:")} {formatDateTime(data.done_in_place)}
                                </Text>
                            </View>
                            <View>
                                <Text style={NewStyles.text}>{t("Description")}:</Text>
                                <TextInput style={[styles.textInput, NewStyles.border10]} placeholder={t("Enter your description...")} value={userInPlaceDescription} onChangeText={setUserInPlaceDescription} multiline editable={!data?.user_in_place_description} numberOfLines={3} textAlignVertical={'top'} maxLength={191} />
                                {!data?.user_in_place_description && <Button
                                    title={t("Confirm")}
                                    loading={submittingInPlace}
                                    onPress={handleSubmitInPlace}
                                />}
                            </View>
                        </View>
                    }
                    <AccordionHeader
                        title={t("Specifications / Product information")}
                        isActive={hasReport}
                        isOpen={showLoopDispatch}
                        onPress={() => {
                            if (hasReport) {
                                setShowLoopDispatch(!showLoopDispatch)
                            } else {
                                showToastOrAlert(t("Product information has not been registered by technician yet."))
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
                        title={t("Send to Loop / Costs / Duration")}
                        isActive={data?.send_to_loop}
                        isOpen={showLoopSend}
                        onPress={() => {
                            if (data?.send_to_loop) {
                                setShowLoopSend(!showLoopSend)
                            } else {
                                showToastOrAlert(t("The request to send to Loop has not been registered yet."))
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
                                title={t("Return time")}
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
                        <View style={{ paddingHorizontal: '5%' }}>
                            <Button style={{ backgroundColor: themeColor6.bgColor(1) }} title={t("Product successfully returned")} />
                        </View>
                    }
                    {user?.apple_check == 0 && <AccordionHeader
                        title={t("Parts / Costs")}
                        isActive={data?.status >= 1 && data?.technician && data?.extra_price > 0}
                        isOpen={showMorePrices}
                        onPress={() => {
                            if (data?.status >= 1 && data?.technician && data?.extra_price > 0) {
                                setShowMorePrices(!showMorePrices)
                            } else {
                                showToastOrAlert(t("No additional costs have been registered for this order."))
                            }
                        }}
                    />}
                    {
                        showMorePrices &&
                        <OrderExtraServices orderId={orderId} navigation={navigation} />
                    }

                    {/* مرحله پرداخت هزینه */}
                    {user?.apple_check == 0 && <AccordionHeader
                        title={t("Payment")}
                        isActive={(data?.started_at || data?.status == 2)}
                        isOpen={showPayment}
                        onPress={() => {
                            if (data?.started_at || data?.status == 2) {
                                setShowPayment(!showPayment)
                            } else {
                                showToastOrAlert(t("You do not currently have access to this section."))
                            }
                        }}
                    />}
                    {showPayment && (data?.started_at || data?.status == 2) && (
                        <View style={{ paddingHorizontal: '5%', gap: 10 }}>
                            {user?.apple_check == 0 && <View style={styles.noticeBox}>
                                <Text style={NewStyles.text10}>{t("Payment status")}: {data?.payment_status == 1 ? t("Paid") : t("Not paid")}</Text>
                            </View>}

                            {user?.apple_check == 0 && <View style={[NewStyles.rowWrapper, { backgroundColor: themeColor0.bgColor(0.05), padding: 10, borderRadius: 8 }]}>
                                <Text style={[NewStyles.title]}>{t("Payable amount")}</Text>
                                <Text style={[NewStyles.title]}>
                                    {formatPrice(totalDiscountedPrice < 800000 ? totalDiscountedPrice + 200000 : totalDiscountedPrice)} {t("Tomans")}
                                </Text>
                            </View>}
                            {user?.apple_check == 0 && totalDiscountedPrice < 800000 && <View style={[NewStyles.rowWrapper, { backgroundColor: themeColor0.bgColor(0.05), padding: 10, borderRadius: 8 }]}>
                                <Text style={[NewStyles.title]}>{t("Travel and tuition fees")}</Text>
                                <Text style={[NewStyles.title]}>
                                    {formatPrice(200000)} {t("Tomans")}
                                </Text>
                            </View>}

                            {user?.apple_check == 0 && <View style={NewStyles.rowWrapper}>
                                <Text style={NewStyles.text}>{t("Your wallet balance")}</Text>
                                <Text style={NewStyles.text10}>{formatPrice(user?.wallet ?? 0)} {t("Tomans")}</Text>
                            </View>}

                            {data?.payment_status == 0 ? (
                                <>
                                    <View style={[NewStyles.row, { gap: 10 }]}>
                                        <View style={[{ flex: 1 }, NewStyles.center]}>
                                            <Button
                                                title={t("Deduct cost from wallet")}
                                                style={{ paddingHorizontal: 0, backgroundColor: themeColor7.bgColor(1) }}
                                                textStyle={{ fontSize: 12, color: themeColor4.bgColor(1) }}
                                                loading={loadingWallet}
                                                onPress={walletPayment}
                                            />
                                        </View>
                                        <View style={[{ flex: 1 }, NewStyles.center]}>
                                            <Button
                                                title={t("Charge wallet")}
                                                textStyle={{ fontSize: 12, color: themeColor4.bgColor(1) }}
                                                onPress={() => navigation.navigate('Increase')}
                                                style={{ backgroundColor: themeColor7.bgColor(1) }}
                                            />
                                        </View>
                                    </View>
                                    <View style={[{ paddingBottom: 10 }, NewStyles.center]}>


                                        <Button
                                            title={t("Online payment")}
                                            style={{ paddingHorizontal: 0 }}
                                            textStyle={{ fontSize: 12, color: themeColor4.bgColor(1) }}
                                            loading={loadingGateway}
                                            onPress={gatewayPayment}
                                        />
                                    </View>
                                </>
                            ) : (
                                <View style={{ paddingTop: 10, alignItems: 'center', width: '100%' }}>
                                    {user?.apple_check == 0 && <Button
                                        title={t("Paid")}
                                        style={{ backgroundColor: themeColor7.bgColor(1) }}
                                        textStyle={{ color: themeColor4.bgColor(1) }}
                                        disabled={true}
                                    />}
                                </View>
                            )}
                        </View>
                    )}
                    <AccordionHeader
                        title={t("Product dispatch status to the user's location")}
                        isActive={data?.payment_status == 1  && data?.shipment_status}
                        isOpen={showShipment}
                        onPress={() => {
                            if (data?.payment_status == 1 && data?.shipment_status) {

                                setShowShipment(!showShipment)
                            } else {
                                showToastOrAlert(t('The product dispatch status is not specified.'))
                            }
                        }}
                    />
                    {
                        showShipment &&
                        <View style={{ paddingHorizontal: '5%', gap: 12, marginBottom: 12 }}>
                            <View style={[styles.itemContainer]}>
                                <Text style={NewStyles.text10}>{data?.shipment_status}</Text>
                            </View>
                            {data?.shipment_status_descriptions && <View style={[styles.itemContainer]}>
                                <Text style={NewStyles.title10}>{t('Loop description')}:</Text>
                                <Text style={NewStyles.text10}>{data?.shipment_status_descriptions}</Text>
                            </View>}
                        </View>
                    }
                    {/* مرحله دریافت سفارش - فعال بعد از پرداخت */}
                    <AccordionHeader
                        title={t("Receive product / order")}
                        isActive={data?.payment_status == 1}
                        isOpen={showReceive}
                        onPress={() => {
                            if (data?.payment_status == 1) {
                                setShowReceive(!showReceive)
                            } else {
                                showToastOrAlert(t("Please complete the payment first."))
                            }
                        }}
                    />
                    {showReceive && data?.payment_status == 1 && (
                        <View style={{ paddingHorizontal: '5%', gap: 12 }}>
                            {data?.user_final_description ? (
                                <View style={styles.noticeBox}>
                                    <Text style={[NewStyles.title10, { marginBottom: 5 }]}>{t("Submitted description")}:</Text>
                                    <Text style={NewStyles.text10}>{data?.user_final_description}</Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={NewStyles.text}>{t("Please select one of the receiving statuses")}:</Text>
                                    <TouchableOpacity style={[styles.optionBox, NewStyles.border10, selectedReceiveOption == 1 && styles.optionBoxSelected]} onPress={() => { setSelectedReceiveOption(1); setShowCustomReceive(false); setCustomReceiveText(''); }}>
                                        <Text style={NewStyles.text10}>{t("I received the product with health test")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.optionBox, NewStyles.border10, selectedReceiveOption == 2 && styles.optionBoxSelected]} onPress={() => { setSelectedReceiveOption(2); setShowCustomReceive(false); setCustomReceiveText(''); }}>
                                        <Text style={NewStyles.text10}>{t("I received the product without health test")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.optionBox, NewStyles.border10, selectedReceiveOption == 3 && styles.optionBoxSelected]} onPress={() => { setSelectedReceiveOption(3); setShowCustomReceive(false); setCustomReceiveText(''); }}>
                                        <Text style={NewStyles.text10}>{t("I received the product but it has technical defects")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.optionBox, NewStyles.border10, selectedReceiveOption == 4 && styles.optionBoxSelected]} onPress={() => { setSelectedReceiveOption(4); setShowCustomReceive(false); setCustomReceiveText(''); }}>
                                        <Text style={NewStyles.text10}>{t("The product was returned to Loop after the test")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.optionBox, NewStyles.border10, selectedReceiveOption == 5 && styles.optionBoxSelected]} onPress={() => { setSelectedReceiveOption(5); setShowCustomReceive(false); setCustomReceiveText(''); }}>
                                        <Text style={NewStyles.text10}>{t("I received the product as per my request")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.optionBox, NewStyles.border10, showCustomReceive && styles.optionBoxSelected]} onPress={() => { setShowCustomReceive(true); setSelectedReceiveOption(null); }}>
                                        <Text style={NewStyles.text10}>{t("Submit description")}</Text>
                                    </TouchableOpacity>

                                    {showCustomReceive && (
                                        <View>
                                            <Text style={NewStyles.text}>{t("Description")}:</Text>
                                            <TextInput style={[styles.textInput, NewStyles.border10]} placeholder={t("Enter your description...")} value={customReceiveText} onChangeText={setCustomReceiveText} multiline numberOfLines={3} textAlignVertical={'top'} />
                                        </View>
                                    )}

                                    <View style={{ width: '100%', alignItems: 'center', }}>
                                        <Button
                                            title={t("Submit receive status")}
                                            onPress={handleSubmitReceive}
                                            loading={submittingReceive}
                                        />
                                    </View>
                                </>
                            )}
                        </View>
                    )}

                    {/* مرحله ثبت نظر - فعال بعد از تکمیل سفارش (status=2 و finished_at) */}
                    <AccordionHeader
                        title={t("Submit review")}
                        isActive={(data?.status == 2 && data?.finished_at && data?.payment_status == 1) || data?.shipment_status}
                        isOpen={showReviewRating}
                        onPress={() => {
                            if (data?.status == 2 && data?.finished_at) {
                                setShowReviewRating(!showReviewRating)
                            } else {
                                showToastOrAlert(t("This section will be activated after order completion."))
                            }
                        }}
                    />
                    {showReviewRating && ((data?.status == 2 && data?.finished_at && data?.payment_status == 1) || data?.shipment_status) && (
                        <OrderReviewRatingSection
                            orderId={orderId}
                            technicianId={data?.technician?.id}
                            orderStatus={data?.status}
                            finishedAt={data?.finished_at}
                        />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
    itemWrapper: {
        backgroundColor: themeColor5.bgColor(1),
        paddingVertical: '5%',
        paddingHorizontal: '5%',
        minHeight: 50,
        gap: 10
    },
    infoCard: {
        backgroundColor: themeColor5.bgColor(1),
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        paddingHorizontal: 30
    },
    contentSection: {
        // marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 10,
        padding: 15,
        gap: 15,
        width: '100%',
        alignSelf: 'center',
        maxWidth: 800,
    },
    package: {
        backgroundColor: themeColor1.bgColor(1),
        padding: 15,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: themeColor10.bgColor(1)
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
    },
    optionBox: {
        backgroundColor: themeColor4.bgColor(1),
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    optionBoxSelected: {
        backgroundColor: themeColor1.bgColor(1),
    },
    textInput: {
        backgroundColor: themeColor4.bgColor(1),
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginTop: 8,
        minHeight: 80,
        fontSize: 14,
        ...NewStyles.text10
    },
    itemContainer: {
        backgroundColor: themeColor4.bgColor(1),
        padding: 10,
        ...NewStyles.border10
    }
})

// محافظت از صفحه جزئیات سفارش - نیاز به تایید کامل
export default Details;