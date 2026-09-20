import { View, Text, Pressable, StyleSheet, ScrollView, I18nManager, Image, SectionList, FlatList, Platform } from 'react-native';
import React, { useState, useMemo } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStyles } from '@styles/NewStyles';
import { colors, themeColor0, themeColor1, themeColor10, themeColor3, themeColor4, themeColor5, themeColor6, themeColor7, themeColor8 } from '@theme/Color';
import { formatDate, formatPrice, showToastOrAlert } from '@helpers/Common';
import { describeApiError } from '@utils/apiErrorHandler';
import { emptySteps, selectTotalPrice } from '@slices/stepSlice';
import Button from '@components/Button';
import { imageUri, uri } from '@services/URL';
import { API_ENDPOINTS } from '@services/ApiEndpoints';
import { fetchOrders } from '@slices/ordersSlice';
import { useDispatch, useSelector } from 'react-redux';
import { emptyCategory } from '@slices/categorySlice';
import ProgressBar from '@components/ProgressBar';
import { emptyAddress } from '@slices/addressSlice';
import Loader from '@components/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeaders from '@components/ScreenHeaders';
import HintBadge from '@components/HintBadge';
import OrderCodesSection from '@components/OrderCodesSection';
import useDiscountCode from '@hooks/useDiscountCode';
import useReferralCode from '@hooks/useReferralCode';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { useMenu } from '@contexts/MenuContext';
function Preview({ navigation }) {
    const dispatch = useDispatch();
    // فضای رزرو شده زیر محتوا تا دکمه ثبت نهایی زیر داک شناور پنهان نشود
    const { footerSpace } = useMenu();
    // const token = useSelector((state) => state?.auth?.token)
    const user = useSelector((state) => state?.user?.data)
    // apple_check == 1 یعنی حسابِ بازبینیِ اپل؛ فقط همان حالت نباید کد بگیرد.
    // شرطِ قبلی `== 0` بود و چون پاسخ validate-token این فیلد را همیشه ندارد،
    // `undefined == 0` غلط می‌شد و بخشِ کدها برای کاربرِ عادی هم پنهان می‌ماند.
    // بقیه‌ی اپ (OrdersScreen، OrderItem، MenuContext) از همین `!= 1` استفاده می‌کند.
    // TEMP: بررسیِ apple_check برای بخش کدها موقتاً غیرفعال است تا فیلدها همیشه دیده شوند.
    // const codesAvailable = user?.apple_check != 1
    const codesAvailable = true
    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const styles = useMemo(() => createLocalStyles(NewStyles, i18n.language), [NewStyles, i18n.language]);
    const [loading, setLoading] = useState(false);
    const userType = useSelector(state => state.auth?.userType)
    const token = useSelector((state) => state?.auth?.token);

    const calculatedPrice = useSelector(selectTotalPrice);
    const totalPrice = calculatedPrice?.total
    const showPrice = calculatedPrice?.showPrice
    const category = useSelector(state => state.category?.data);
    const steps = useSelector(state => state.step);

    const isUrgent = steps?.isUrgent;
    const date = steps?.date;
    const time = steps?.time;
    const des = steps?.des;
    const imagePath = steps?.imagePath;
    const files = steps?.files;
    const addressId = steps?.addressId;

    const femaleCount = steps?.femaleCount;
    const maleCount = steps?.maleCount;
    const unspecifiedCount = steps?.unspecifiedCount;

    // کد تخفیف و کد معرف دو سیستم مستقل‌اند: اولی رایگان اعتبارسنجی می‌شود و
    // دومی با ثبت، مصرف می‌شود. بک‌اند هر دو را جدا حساب می‌کند و می‌توان هر دو
    // را همزمان روی یک سفارش فرستاد.
    //
    // Two independent systems. The discount check is free; registering a
    // referral code consumes it. The backend calculates them separately and an
    // order may carry both.
    const discount = useDiscountCode({ token, categoryId: category?.id });
    const referral = useReferralCode({ token });

    const addresses = useSelector(state => state.address?.data);
    const address = addresses?.find(item => item?.id == addressId);

    // آیا این دسته اصلاً مرحله‌ی آدرس دارد؟ اگر دارد، سفارش بدون آدرسِ معتبر
    // نباید ثبت شود - قبلاً وقتی addressId خالی (یا آدرسِ انتخاب‌شده پاک‌شده)
    // بود، سفارش با address_id خالی به سرور می‌رفت.
    const hasAddressStep = steps?.data?.some(stepArray =>
        stepArray?.some(item => item?.type === 'address')
    );
    const isAddressSelected = Boolean(addressId) && Boolean(address);
    
    const isFixed = (Number(category?.is_fixed) > 0 && totalPrice > 0) ? 1 : 0;
    console.log(showPrice);

    // state.step.time نمایشیِ بازه‌ای است (مثلاً "9 - 10" یا "9:30 - 10:30")،
    // اما ORGANIZATION_ORDER_API.md یک مقدار ساعت تکی به‌شکل "HH:MM" (مثل "09:00")
    // می‌خواهد. تبدیل فقط همین‌جا، برای payload خروجی، انجام می‌شود؛ مقدار داخل
    // Redux/UI (که در Time.js و Steps.js برای نمایش و مقایسه استفاده می‌شود) دست‌نخورده می‌ماند.
    const formatTimeForApi = (timeRange) => {
        if (!timeRange) return timeRange;
        const start = String(timeRange).split('-')[0]?.trim();
        if (!start) return timeRange;
        const [hourStr, minuteStr] = start.split(':');
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10) || 0;
        if (isNaN(hour)) return timeRange;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };

    /**
     * تبدیل ساختار service_schedule از Redux به فرمت API
     * فقط برای کاربران سازمانی که مرحله service_schedule دارند
     */
    const buildServiceSchedulePayload = () => {

        // پیدا کردن مرحله service_schedule
        const serviceScheduleStep = steps?.data?.find(stepArray =>
            stepArray?.some(item => item?.type === 'service_schedule')
        );
        if (!serviceScheduleStep) {
            return null;
        }

        const serviceScheduleItem = serviceScheduleStep.find(item => item?.type === 'service_schedule');

        if (!serviceScheduleItem?.field_details) {
            return null;
        }


        // پیدا کردن فیلد main_selection
        const mainField = serviceScheduleItem.field_details.find(f => f.id === 'main_selection');
        const selectedOption = mainField?.options?.find(opt => opt.value > 0);

        if (!selectedOption) {
            return null;
        }

        const type = selectedOption.id; // 'long_term' or 'short_term' 

        // پیدا کردن فیلدهای مربوط به نوع انتخاب شده
        const conditionalFields = serviceScheduleItem.field_details.filter(
            f => f.conditional_on === type
        );


        const payload = { type };
        const branchData = {};
        const missingFields = [];

        conditionalFields.forEach(field => {

            if (field.type === 'radioButton' && field.options) {

                const selectedOpt = field.options.find(opt => opt.value > 0);

                if (selectedOpt) {

                    // duration
                    if (field.id.includes('duration')) {
                        branchData.duration = selectedOpt.id;
                    }

                    // time
                    else if (field.id.includes('time')) {
                        branchData.time = selectedOpt.title;
                    }

                } else {
                    missingFields.push(field.title || field.id);
                }
            }

            else if (field.type === 'date') {

                if (field.value) {
                    branchData.date = field.value;
                } else {
                    missingFields.push('تاریخ');
                }

            }

            else if (field.type === 'file') {

                if (field.value) {
                    branchData.file = field.value;
                }

            }

        });

        if (type === 'long_term') {
            payload.long_term = branchData;
        } else if (type === 'short_term') {
            payload.short_term = branchData;
        }

        return payload;
    };

    const submitOrder = async () => {
        // گاردِ آدرس، پیش از هر کار دیگری: کاربر باید آدرسی را انتخاب کرده باشد
        // و آن آدرس هنوز در فهرست آدرس‌هایش موجود باشد.
        if (hasAddressStep && !isAddressSelected) {
            showToastOrAlert(
                addressId
                    ? t('The selected address is no longer available. Please choose an address again.')
                    : t('Please select your address before submitting the order.')
            );
            navigation.goBack();
            return;
        }

        // کدی که تایپ شده ولی تأیید نشده، نه باید بی‌صدا حذف شود (کاربر تخفیفش
        // را از دست می‌دهد بدون اینکه بفهمد) و نه بی‌صدا ارسال شود (سرور ممکن
        // است کل سفارش را رد کند). پس ثبت را متوقف می‌کنیم و می‌گوییم چرا.
        //
        // A typed-but-unverified code is neither dropped silently (the user
        // would lose the discount without being told) nor sent blind (the
        // server may reject the whole order over it).
        if (discount.needsCheck) {
            showToastOrAlert(t('Please verify your discount code or clear it before submitting.'));
            return;
        }

        if (referral.needsCheck) {
            showToastOrAlert(t('Please register your referral code or clear it before submitting.'));
            return;
        }

        setLoading(true);
        try {

            // دریافت account_type کاربر

            const accountType = userType;
            // بررسی وجود مرحله service_schedule در steps
            const hasServiceScheduleStep = steps?.data?.some(stepArray =>
                stepArray?.some(item => item?.type === 'service_schedule')
            );

            // ساخت payload اصلی
            const payload = {
                address_id: addressId,
                category_id: category?.id,
                total_price: totalPrice,
                date: date,
                time: formatTimeForApi(time),
                is_urgent: isUrgent,
                is_fixed: isFixed,
                female_count: femaleCount,
                male_count: maleCount,
                unspecified_count: unspecifiedCount,
                steps: steps?.data,
                file_paths: files,
                platform: Platform.OS
            };

            // اضافه کردن فیلدهای اختیاری
            if (des) payload.description = des;
            if (imagePath) payload.image_path = imagePath;
            if (files?.length > 0) payload.file_paths = files;
            // فقط کدهای تأییدشده ارسال می‌شوند — دقیقاً همان رشته‌ای که سرور
            // به رسمیت شناخته، نه متن خام ورودی.
            if (discount.appliedCode) payload.discount_code = discount.appliedCode;
            if (referral.appliedCode) payload.referral_code = referral.appliedCode;
            // اضافه کردن service_schedule فقط اگر:
            // 1. کاربر سازمانی باشد
            // 2. مرحله service_schedule در steps موجود باشد
            if ((accountType === 'organization' || accountType === 'company' || accountType === 'g_organization' || accountType === 's_g_organization') && hasServiceScheduleStep) {
                const serviceSchedule = buildServiceSchedulePayload();

                if (serviceSchedule) {
                    payload.service_schedule = serviceSchedule;
                } else {
                    showToastOrAlert(t('Please complete the maintenance and service schedule fields.'));
                    setLoading(false);
                    return;
                }
            } else if (accountType === 'individual') {

            } else {
            }

            // Route صحیح: POST /api/orders/submit — services/ApiEndpoints.js
            const response = await axios.post(`${uri}${API_ENDPOINTS.ORDERS.CREATE}`, payload, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // 📥 لاگ کردن پاسخ کامل از API (در بیلد production حذف می‌شود)
            console.log('[Preview] POST', API_ENDPOINTS.ORDERS.CREATE, '→', response.status, JSON.stringify(response.data));

            // این API پاکتِ `{ success, message, order }` برمی‌گرداند (همان قراردادی که
            // slices/ordersSlice.js هم روی GET /orders چک می‌کند). یک 2xx به‌تنهایی
            // «موفقیت» نیست: سرور می‌تواند 200 با success:false برگرداند و قبلاً همین
            // حالت، سفارشِ ثبت‌نشده را «موفق» نشان می‌داد، سبد را خالی می‌کرد و کاربر را
            // به لیست سفارش‌ها می‌فرستاد — جایی که هیچ سفارشی وجود نداشت.
            const body = response?.data;
            const isSuccess =
                (response.status === 200 || response.status === 201) &&
                body?.success !== false &&
                body?.error_code == null;

            if (!isSuccess) {
                // اگر سرور کد معرف را رد کرد، فیلد باید همان را نشان بدهد؛
                // وگرنه کاربر «ثبت شد» را می‌بیند و دلیل شکست را نمی‌فهمد.
                if (body?.error_code === 'INVALID_REFERRAL_CODE') {
                    referral.reject(body?.message);
                }
                // سبد را نگه می‌داریم و روی همین صفحه می‌مانیم تا کاربر بتواند دوباره تلاش کند.
                showToastOrAlert(
                    (typeof body?.message === 'string' && body.message.trim())
                        ? body.message
                        : `${t('An unexpected error occurred!')} (${response.status})`
                );
                return;
            }

            showToastOrAlert(
                (typeof body?.message === 'string' && body.message.trim())
                    ? body.message
                    : t('Your order has been submitted successfully.')
            );

            // لیست را *قبل از* ناوبری تازه می‌کنیم تا کاربر با فهرستِ به‌روز وارد شود.
            // نکته: این باید fetchOrders سازگار با state.orders باشد (ordersSlice)،
            // نه orderSlice که روی state.order می‌نویسد و OrdersScreen آن را نمی‌خواند.
            await dispatch(fetchOrders({}));
            dispatch(emptySteps());
            dispatch(emptyCategory());
            dispatch(emptyAddress());

            // پس از ثبت، کاربر باید رسید همان سفارش را ببیند. شناسه‌ی سفارش طبق
            // ORGANIZATION_ORDER_API.md داخل `data.order_id` است، نه در سطح بالای پاکت؛
            // اگر سرور آن را برنگرداند به فهرست سفارش‌ها برمی‌گردیم تا کاربر بدون بازخورد نماند.
            const createdOrderId = body?.data?.order_id ?? body?.data?.order?.id ?? body?.order?.id ?? body?.order_id ?? body?.id ?? null;
            if (createdOrderId != null) {
                navigation.replace('OrderReceipt', { orderId: createdOrderId });
            } else {
                navigation.replace('OrdersScreen');
            }
        } catch (error) {
            // کد معرف نامعتبر با 409 برمی‌گردد، یعنی در catch می‌افتد نه در
            // شاخه‌ی بالا. هر دو مسیر باید فیلد را به حالت خطا ببرند.
            if (error?.response?.data?.error_code === 'INVALID_REFERRAL_CODE') {
                referral.reject(error?.response?.data?.message);
            }
            const message = describeApiError(error, t);
            showToastOrAlert(message);
        } finally {
            setLoading(false);
        }
    };

    const organTime = buildServiceSchedulePayload();
    const renderRow = (text1, text2, textStyle1, textStyle2) => (
        <View style={NewStyles.rowWrapper}>
            <Text style={[NewStyles.text, textStyle1]}>{text1}</Text>
            <Text style={[NewStyles.text10, textStyle2]}>{text2}</Text>
        </View>
    );
    const serviceDate =
        organTime?.short_term?.date ||
        organTime?.long_term?.date;

    const serviceTime =
        organTime?.short_term?.time ||
        organTime?.long_term?.time;
    const minPrice = useSelector(state => state.minPrice?.data)
    if (loading) { return (<Loader />) };

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <ScreenHeaders
                title={t("Preview")}
            />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20, backgroundColor: themeColor4.bgColor(1), width: '95%', alignSelf: 'center', borderRadius: 20, maxWidth: 800, marginTop: 20 }}>
                <View style={[NewStyles.seperator, { gap: 10, paddingTop: '5%' }]}>
                    <View style={[]}>
                        {/* apple_check == 1 یعنی حسابِ بازبینیِ اپل؛ فقط آن حالت باید
                            بخش‌های مالی را پنهان کند. شرطِ قبلی `== 0` بود و چون
                            پاسخ validate-token این فیلد را همیشه ندارد،
                            `undefined == 0` غلط می‌شد و بخش برای کاربرِ عادی هم
                            پنهان می‌ماند. بقیه‌ی اپ (OrdersScreen، OrderItem،
                            MenuContext) از همین `!= 1` استفاده می‌کند. */}
                        {user?.apple_check != 1 &&
                            <View
                                style={[NewStyles.center, {
                                    backgroundColor: themeColor0.bgColor(1),
                                    paddingVertical: 10,
                                    ...NewStyles.border10
                                }]}

                            >
                                <View style={[NewStyles.row, { gap: 10 }]}>
                                    <Image
                                        source={require('@assets/images/price.png')}
                                        style={{ height: 60, width: 60, resizeMode: 'contain' }}
                                    />
                                    <Text style={NewStyles.title4}> {isFixed == 1 ? t('Loop Fixed Amount') : t('Loop Base Amount')} </Text>
                                </View>
                            </View>
                        }
                        <Pressable style={[NewStyles.shadow, NewStyles.border100, NewStyles.whiteButton, NewStyles.row, { gap: 5 , alignSelf:'center'}]} >
                            <Ionicons name="cash-outline" size={24} color={themeColor0.bgColor(1)} />
                            <Text style={NewStyles.text}>{(totalPrice > 0 && showPrice) ? `${formatPrice(totalPrice)}${t(' Toman')}` : t('Needs Review')}</Text>
                        </Pressable>
                    </View>

                    <LinearGradient colors={[themeColor4.bgColor(1), themeColor3.bgColor(1)]} style={[{ alignSelf: 'center', backgroundColor: themeColor3.bgColor(1), paddingHorizontal: 40, paddingVertical: 10, borderWidth: 1, borderColor: themeColor4.bgColor(1), gap: 5, maxWidth: '100%' }, NewStyles.border10, NewStyles.row]}>
                        <Ionicons
                            name={'help-circle-outline'}
                            size={20}
                            color={themeColor10.bgColor(1)}
                        />
                        <Text style={[NewStyles.text10, { textAlign: 'center', fontSize: 11 }]}>{t('Dear user, your order information will be finalized after review by Loop technicians and specialized evaluations.')}</Text>
                    </LinearGradient>
                </View>
                <View style={[NewStyles.seperator, { gap: 10, padding: '5%' }]}>
                    <View style={[{ width: '100%', padding: '5%', backgroundColor: themeColor3.bgColor(0.2) }, NewStyles.border10, NewStyles.center]}>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Text style={NewStyles.title}>{t('Order Preview')}</Text>
                            <Ionicons name="newspaper-outline" size={24} color={themeColor0.bgColor(1)} />
                        </View>
                        <Text style={NewStyles.text3}>{category?.title}</Text>
                    </View>
                    {renderRow(t('Technician Visit Time'), isUrgent > 0
                        ? t('Urgent Request')
                        : formatDate(serviceDate || date) +
                        t(' at ') +
                        (serviceTime || time), NewStyles.text, isUrgent > 0 && NewStyles.title6)}
                    {maleCount + femaleCount + unspecifiedCount > 0 &&
                        renderRow(
                            t('Technician Gender'),
                            (() => {
                                const total = maleCount + femaleCount + unspecifiedCount;
                                if (total === 0) return t('Not Specified');
                                let details = [];
                                if (maleCount > 0) details.push(t('Male Technician'));
                                if (femaleCount > 0) details.push(t('Female Technician'));

                                return (details.length > 0 ? ` ${details.join(' ')}` : '');
                            })()
                        )
                    }

                    {renderRow(t('Address'), '')}
                    {isAddressSelected
                        ? renderRow(address?.full_name + ' - ' + address?.city + ' - ' + t("Region") + ' ' + address?.region + ' - ' + t("Number") + ' ' + address?.number + ' - ' + t("Unit") + ' ' + address?.unit + ' - ' + t("Floor") + ' ' + address?.floor + ' - ' + address?.address, '', NewStyles.text10)
                        : renderRow(t('No address selected'), '', [NewStyles.text10, { color: themeColor6.bgColor(1) }])}
                </View>

                {steps?.data?.map((previewItem, index) => (
                    <View key={`section_${index}`}>
                        {
                            Platform.OS != 'web' ?

                                <FlatList
                                    style={{ paddingTop: 5 }}
                                    showsVerticalScrollIndicator={false} scrollEnabled={false}
                                    data={previewItem?.filter(x => (x?.type == 'checkbox' || x?.type == 'radioButton' || x?.type == 'counter' || x?.type == 'input'))}
                                    keyExtractor={(item) => item?.id?.toString()}
                                    renderItem={({ item }) => {
                                        const is_package = item?.is_package
                                        return (
                                            <View>
                                                <View style={[NewStyles.row, { gap: 5, paddingHorizontal: '5%' }]}>
                                                    <Text style={[NewStyles.title, { flex: 1 }]}>{item?.title}</Text>
                                                </View>
                                                <FlatList
                                                    style={{ paddingHorizontal: '5%', padding: 20 }}
                                                    scrollEnabled={false}
                                                    showsVerticalScrollIndicator={false}
                                                    data={item?.field_details}
                                                    keyExtractor={(item) => item?.id?.toString()}
                                                    renderItem={({ item }) => {
                                                        if (!item?.value || item?.value <= 0) return null;
                                                        else
                                                            return (
                                                                (item?.value || item?.value > 0) ?
                                                                    <View style={[styles.itemWrapper, NewStyles.border10, is_package == 1 && styles.package]}>
                                                                        <View style={[is_package != 1 && NewStyles.rowWrapper]}>
                                                                            <View style={[NewStyles.rowWrapper, { justifyContent: 'flex-end', flex: 2, gap: 5 }, is_package == 1 && { alignItems: 'flex-start' }]}>
                                                                                {is_package != 1 && <Ionicons name={'ellipse'} size={10} color={themeColor0.bgColor(0.5)} />}
                                                                                {item?.type == 'input' ? <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.second_title}</Text> : <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.title}</Text>}
                                                                            </View>
                                                                            {(item?.has_counter >= 1 && item?.type != 'input') && <Text style={[NewStyles.text10, { flex: 1, textAlign: 'auto' }]}>{item?.value}</Text>}
                                                                        </View>
                                                                        {(item?.has_counter >= 1 && item?.type == 'input') && <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.value}</Text>}
                                                                        {
                                                                            item?.user_descriptions &&
                                                                            <View style={{}}>
                                                                                <View style={[NewStyles.row]}>
                                                                                    <Text style={[NewStyles.text, { flex: 1 }]}>توضیحات </Text>
                                                                                </View>
                                                                                <View style={[NewStyles.textInput, NewStyles.row, NewStyles.border10, { gap: 5, paddingVertical: 0, backgroundColor: themeColor4.bgColor(1), borderWidth: 2, borderColor: themeColor8.bgColor(1), borderStyle: 'dotted', minHeight: 45 }]}>

                                                                                    <Text style={NewStyles.text10}>{item?.user_descriptions}</Text>
                                                                                </View>
                                                                            </View>
                                                                        }
                                                                    </View>
                                                                    :
                                                                    null
                                                            )
                                                    }}
                                                />
                                            </View>
                                        );
                                    }}
                                />

                                :

                                <View style={{ paddingTop: 5 }}>

                                    {
                                        previewItem?.filter(x => (x?.type == 'checkbox' || x?.type == 'radioButton' || x?.type == 'counter' || x?.type == 'input'))?.map((item, index) => {
                                            const is_package = item?.is_package
                                            return (
                                                <View key={index}>
                                                    <View style={[NewStyles.row, { gap: 5, paddingHorizontal: '5%' }]}>
                                                        <Text style={[NewStyles.title, { flex: 1 }]}>{item?.title}</Text>
                                                    </View>

                                                    <View style={{ paddingHorizontal: '5%', padding: 20 }}>

                                                        {
                                                            item?.field_details?.map((item, index) => {
                                                                if (!item?.value || item?.value <= 0) return null;
                                                                else
                                                                    return (
                                                                        (item?.value || item?.value > 0) ?
                                                                            <View style={[styles.itemWrapper, NewStyles.border10, is_package == 1 && styles.package]} key={index}>
                                                                                <View style={[is_package != 1 && NewStyles.rowWrapper]}>
                                                                                    <View style={[NewStyles.rowWrapper, { justifyContent: 'flex-end', flex: 2, gap: 5 }, is_package == 1 && { alignItems: 'flex-start' }]}>
                                                                                        {is_package != 1 && <Ionicons name={'ellipse'} size={10} color={themeColor0.bgColor(0.5)} />}
                                                                                        {item?.type == 'input' ? <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.second_title}</Text> : <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.title}</Text>}
                                                                                    </View>
                                                                                    {(item?.has_counter >= 1 && item?.type != 'input') && <Text style={[NewStyles.text10, { flex: 1, textAlign: 'auto' }]}>{item?.value}</Text>}
                                                                                </View>
                                                                                {(item?.has_counter >= 1 && item?.type == 'input') && <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.value}</Text>}
                                                                            </View>
                                                                            :
                                                                            null
                                                                    )
                                                            })
                                                        }
                                                    </View>
                                                </View>
                                            );
                                        })
                                    }

                                </View>
                        }

                    </View>
                ))}

                {des && <View style={{ paddingHorizontal: '5%', gap: 10 }}>
                    <View style={[NewStyles.row, { gap: 5 }]}>
                        <Ionicons name={'create-outline'} size={24} color={themeColor0.bgColor(1)} />
                        <Text style={NewStyles.title}>{t('User Description')}</Text>
                    </View>
                    <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                        <Ionicons name={'ellipse'} size={10} color={themeColor0.bgColor(0.5)} />
                        <Text style={[NewStyles.text10, { flex: 1 }]}>{des}</Text>
                    </View>
                </View>}
                {imagePath && <Image style={[{ height: 250, margin: '5%', resizeMode: 'contain' }, NewStyles.border10]} source={{ uri: `${imageUri}/${imagePath}` }} />}
                <View style={{ width: '90%', alignSelf: 'center', marginVertical: 10, alignItems: 'flex-end' }}>
                    <HintBadge
                        hint={t("Dear Loop, the total receipt is more than {{price}} tomans, you are a guest of Loop (travel and examination expenses are covered)", { price: formatPrice(minPrice?.price) })}
                        title={t('Preview')}
                    />
                </View>
                {/* بخش کدها همیشه رندر می‌شود. قبلاً وقتی حساب نمی‌توانست کد وارد
                    کند کلِ بخش ناپدید می‌شد و کاربر دنبال چیزی می‌گشت که اصلاً روی
                    صفحه نبود - بدون هیچ سرنخی از دلیلش.
                    عنوانِ تصویریِ قبلی حذف شد: خودِ ردیف همان عنوان را دارد و
                    تصویرش حالا در هدرِ کشو است. */}
                <View style={[NewStyles.seperator, { paddingHorizontal: spacing.lg, paddingTop: '5%' }]}>
                    <OrderCodesSection discount={discount} referral={referral} available={codesAvailable} />
                </View>
            </ScrollView>
            <View style={[NewStyles.row, NewStyles.nav, { backgroundColor: 'transparent', marginBottom: footerSpace }]}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Button title={t('Final Order Submission')} textStyle={{ color: themeColor4.bgColor(1) }} style={{ backgroundColor: themeColor7.bgColor(1) }} loading={loading} onPress={() => submitOrder()} />
                </View>
            </View>
        </SafeAreaView>
    )
}

const createLocalStyles = (NewStyles, lang) => StyleSheet.create({
    textInput: {
        width: '100%',
        height: 50,
        backgroundColor: 'transparent',
    },
    urgentLabel: {
        backgroundColor: themeColor6.bgColor(1),
        padding: 5
    },
    itemWrapper: {
        paddingVertical: '5%',
        paddingHorizontal: '5%',
        minHeight: 50,
        gap: 10,
        marginBottom: 1
    },
    package: {
        backgroundColor: themeColor1.bgColor(1),
        padding: 15,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: themeColor10.bgColor(1)
    },
    valueContainer: {
        borderWidth: 1,
        borderColor: themeColor0.bgColor(1),
        height: 40,
        width: 40,
        ...NewStyles.border5,
        ...NewStyles.center
    },
})

// محافظت از صفحه ثبت سفارش - نیاز به تایید کامل برای کاربران سازمانی
export default Preview