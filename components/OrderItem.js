import { View, Text, Pressable, StyleSheet, Image, Linking } from 'react-native';
import { useMemo, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import NewStyles from '../styles/NewStyles';
import { imageUri, uri } from '../services/URL';
import { fetchOrders } from '../slices/ordersSlice';
import { themeColor0, themeColor1, themeColor10, themeColor3, themeColor5, themeColor6, themeColor7 } from '../theme/Color';
import { calculateDaysDifference, formatDate, formatPrice, showToastOrAlert } from '../helpers/Common';
import PairButton from '../components/PairButton';
import ConfirmationModal from './ConfirmationModal';
import { fetchSteps } from '../slices/stepSlice';
import { setCategory } from '../slices/categorySlice';
import RateModal from './RateModal';

export default function OrderItem({ item, navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const token = useSelector((state) => state?.auth?.token);
    const user = useSelector((state) => state?.user?.data);
    const [loading, setLoading] = useState(false);
    const [cancelModal, setCancelModal] = useState(false);
    const [startModal, setStartModal] = useState(false);
    const [endModal, setEndModal] = useState(false);
    const [rateModal, setRateModal] = useState(false);

    const cancel = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/orders/cancel`, { orderId: item?.id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            if (response.status == 200) {
                dispatch(fetchOrders(token));
                navigation.navigate('Orders', { screen: 'Canceled' });
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading(false);
        }
    };

    const start = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/orders/start`, { orderId: item?.id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            
            if (response.status == 200) {
                dispatch(fetchOrders(token))
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading(false);
        }
    };

    const end = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/orders/end`, { orderId: item?.id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            if (response.status == 200) {
                dispatch(fetchOrders(token));
                navigation.navigate('Orders', { screen: 'Completed' });
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading(false);
        }
    };

    const totalDiscountedPrice = useMemo(() => {
        const basePrice = Number(item?.technician_price ?? item?.pakar_price);
        return Number(basePrice) + Number(item?.extra_price) - Number(item?.discount_price);
    }, [item]);

    const totalPrice = useMemo(() => {
        const basePrice = Number(item?.technician_price ?? item?.pakar_price);
        return Number(basePrice) + Number(item?.extra_price);
    }, [item]);

    const renderRow = (text1, text2, textStyle1, textStyle2) => (
        <View style={NewStyles.rowWrapper}>
            <Text style={[NewStyles.text10, textStyle1]}>{text1}</Text>
            <Text style={[NewStyles.text10, textStyle2]}>{text2}</Text>
        </View>
    );

    const buttonConfig = useMemo(() => {
        const status = item?.status;
        if (status == 0) {
            return {
                text1: `در انتظار بررسی`,
                text2: 'لغو سفارش',
                onPress1: () => { },
                onPress2: () => setCancelModal(true),
                loading1: loading,
                loading2: loading,
            };
        }
        if (status == 1) {
            return {
                text1: item?.started_at ? 'پایان خدمت' : 'شروع خدمت',
                text2: 'لغو سفارش',
                onPress1: () => item?.started_at ? setEndModal(true) : setStartModal(true),
                onPress2: () => setCancelModal(true),
                loading1: loading,
                loading2: loading,
            };
        }
        if (status == 2) {
            return {
                text1: 'صورتحساب',
                text2: !item?.user_rate ? 'امتیاز دهی' : `امتیاز ⭐ ${Number(item?.user_rate?.rate)?.toFixed(1)}`,
                onPress1: () => navigation.navigate('Invoice', { orderId: item?.id }),
                onPress2: () => setRateModal(true),
                loading1: loading,
                loading2: loading,
                style: { fontSize: 13 }
            };
        }
        if (status >= 3) {
            return {
                text1: 'تکرار سفارش',
                text2: item?.status == 3 ? 'لغو شده توسط شما' : item?.status == 4 ? 'لغو شده توسط متخصص' : item?.status == 5 ? 'لغو توسط لوپ' : item?.status == 6 ? 'لغو به علت پایان زمان سفارش' : 'لغو شده',
                onPress1: () => {
                    // if (!user?.city_id) {
                    //     showToastOrAlert('لطفا شهر خود را انتخاب نمایید.');
                    //     return;
                    // }
                    
                    dispatch(fetchSteps(item?.category_id))
                    dispatch(setCategory(item?.category))
                    navigation.navigate('MainApp', {
                        screen: 'Steps', params: {
                            categoryId: item?.category_id,
                            categoryTitle: item?.category?.title
                        }
                    });
                },
                onPress2: () => { },
                loading1: loading,
                loading2: loading,
            };
        }
        return null;
    }, [item]);

    return (
        <Pressable style={[styles.itemWrapper, NewStyles.shadow, NewStyles.border10]} onPress={() => { navigation.navigate('Details', { orderId: item?.id }); }}>
            {item?.technician_id &&
                <Pressable style={[{ width: '100%', padding: '5%', backgroundColor: themeColor3.bgColor(0.2) }, NewStyles.border10, NewStyles.center]} >
                    <View>
                        {item?.technician?.profile_photo_path ? (<Image style={[styles.profileImage, NewStyles.center, NewStyles.border100]} source={{ uri: `${imageUri}/${item?.technician?.profile_photo_path}` }} contentFit="cover" />) : (<View style={[styles.profileImage, NewStyles.border100, NewStyles.center]}><Text style={styles.profileImageThumbnail}>{item?.technician?.fname?.[0]}{item?.technician?.lname?.[0]}</Text></View>)}
                        <View style={[styles.userStatus, NewStyles.border100]} />
                    </View>
                    <Text style={[NewStyles.text10, { textTransform: 'capitalize' }]}>{item?.technician?.fname} {item?.technician?.lname}</Text>
                    <Text style={NewStyles.text3}>{calculateDaysDifference(item?.technician?.created_at)} روز تجربه - ({item?.technician?.finished_orders_count} خدمت موفق) - ⭐ {Number(item?.technician?.average_rating)?.toFixed(1)} </Text>
                </Pressable>
            }
            {renderRow(item?.category?.title, `شناسه سفارش: ${item?.id}`, [NewStyles.text, { fontSize: 14 }], NewStyles.text)}

            {Number(item?.is_fixed) == 0 ?
                renderRow(item?.status == 0 ? 'مبلغ پایه لوپ' : 'مبلغ نهایی', totalDiscountedPrice > 0 ? `${formatPrice(totalDiscountedPrice)}` + ' تومان' : 'نیاز به بررسی', [NewStyles.text7, { fontSize: 14 }], [NewStyles.text7, { fontSize: 14 }])
                :
                renderRow(item?.status == 0 ? 'مبلغ قطعی لوپ' : 'مبلغ نهایی', totalDiscountedPrice > 0 ? `${formatPrice(totalDiscountedPrice)}` + ' تومان' : 'نیاز به بررسی', [NewStyles.text7, { fontSize: 14 }], [NewStyles.text7, { fontSize: 14 }])
            }

            {item?.status != 2 && renderRow(`زمان مراجعه متخصص`, item?.is_urgent > 0 ? 'درخواست فوری ' : formatDate(item?.date) + ' ساعت ' + item?.time?.split(':')?.slice(0, 2)?.join(':'), NewStyles.text10, item?.is_urgent > 0 && NewStyles.title6)}

            {item?.discount_price && renderRow('تخفیف نهایی شما از سفارش', formatPrice(item?.discount_price) + ' تومان', NewStyles.text, NewStyles.text10)}
            {totalPrice > totalDiscountedPrice && renderRow('قیمت بدون تخفیف', formatPrice(totalPrice) + ' تومان', NewStyles.text, [NewStyles.text10, { textDecorationLine: 'line-through' }])}
            {/* {item?.status == 2 && renderRow('وضعیت پرداخت', item?.payment_status > 0 ? 'پرداخت شده' : 'پرداخت نشده', NewStyles.text, item?.payment_status > 0 ? NewStyles.text7 : NewStyles.text6)} */}
            {item?.status == 2 && <View style={NewStyles.rowWrapper}>
                <Text style={[NewStyles.text10]}>وضعیت پرداخت</Text>
                <View style={[{ backgroundColor: item?.payment_status > 0 ? themeColor7.bgColor(1) : themeColor6.bgColor(1), paddingHorizontal: 5, paddingVertical: 1 }, NewStyles.border10]}>
                    <Text style={NewStyles.text4}>{item?.payment_status > 0 ? 'پرداخت شده' : 'پرداخت نشده'}</Text>
                </View>
            </View>}

            {item?.status == 1 && renderRow('وضعیت سفارش', item?.started_at ? 'در حال انجام' : item?.arrived_at ? 'متخصص به محل خدمت رسید' : item?.set_off_at ? 'متخصص در راه است' : 'جاری', NewStyles.text10, (!item?.started_at && !item?.arrived_at && !item?.set_off_at) ? NewStyles.text1 : NewStyles.text7)}
            <View style={[NewStyles.row, { gap: 5, justifyContent: 'flex-end' }]}>
                <Text style={NewStyles.text3}>مشاهده جزئیات</Text>
                <Ionicons name="chevron-back" size={16} color={themeColor3.bgColor(1)} />
            </View>
            {buttonConfig && <PairButton {...buttonConfig} />}
            <RateModal rateModal={rateModal} setRateModal={setRateModal} orderId={item?.id} data={item?.user_rate} />
            <ConfirmationModal title={'لغو سفارش'} message={'آیا از لغو سفارش خود اطمینان دارید؟'} action={() => cancel()} confirmationModal={cancelModal} setConfirmationModal={setCancelModal} />
            <ConfirmationModal title={'شروع خدمت'} message={'آیا تأیید می کنید که متخصص خدمت خود را شروع کرده است؟'} action={() => start()} confirmationModal={startModal} setConfirmationModal={setStartModal} />
            <ConfirmationModal title={'پایان خدمت'} message={'آیا تأیید می کنید که کار متخصص پایان یافته است؟'} action={() => end()} confirmationModal={endModal} setConfirmationModal={setEndModal} />
        </Pressable>

    )
}

const styles = StyleSheet.create({
    itemWrapper: {
        marginHorizontal: '5%',
        backgroundColor: themeColor5.bgColor(1),
        paddingHorizontal: '5%',
        paddingVertical: 15,
        gap: 10
    },
    profileImage: {
        height: 60,
        aspectRatio: 1,
        backgroundColor: themeColor5.bgColor(1),
    },
    profileImageThumbnail: {
        fontSize: 20,
        textTransform: 'uppercase',
        fontFamily: 'iransans',
        color: themeColor0.bgColor(1),
    },
    userStatus: {
        position: 'absolute',
        height: 10,
        width: 10,
        bottom: 5,
        left: 5,
        backgroundColor: themeColor7.bgColor(1),
        borderColor: themeColor5.bgColor(1),
        borderWidth: 1,
    },
    chatItemBadge: {
        width: 20,
        height: 20,
        backgroundColor: themeColor0.bgColor(0.5),
        borderRadius: 100,
        textAlign: 'center'
    },
})