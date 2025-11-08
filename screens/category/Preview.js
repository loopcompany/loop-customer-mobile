import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, ActivityIndicator, I18nManager, Image, SectionList, FlatList } from 'react-native';
import React, { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor5, themeColor6, themeColor7 } from '../../theme/Color';
import { formatDate, formatPrice, showToastOrAlert } from '../../helpers/Common';
import { useDispatch, useSelector } from 'react-redux';
import { emptySteps, selectTotalPrice } from '../../slices/stepSlice';
import Button from '../../components/Button';
import { imageUri, uri } from '../../services/URL';
import { fetchOrders } from '../../slices/orderSlice';
import { emptyCategory } from '../../slices/categorySlice';
import ProgressBar from '../../components/ProgressBar';
import { emptyAddress } from '../../slices/addressSlice';
import Loader from '../../components/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Preview({ navigation }) {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [pending, setPending] = useState(false);

    const token = useSelector((state) => state?.auth?.token);

    const totalPrice = useSelector(selectTotalPrice);
    const category = useSelector(state => state.category?.data);
    const steps = useSelector(state => state.step);
    // console.log(JSON.stringify(steps?.data?.[4], null, 2));

    const isUrgent = steps?.isUrgent;
    const date = steps?.date;
    const time = steps?.time;
    const des = steps?.des;
    const imagePath = steps?.imagePath;
    const addressId = steps?.addressId;

    const femaleCount = steps?.femaleCount;
    const maleCount = steps?.maleCount;
    const unspecifiedCount = steps?.unspecifiedCount;

    const [discountCode, setDiscountCode] = useState(null);
    const [discountPercent, setDiscountPercent] = useState(null);

    const address = useSelector(state => state.address?.data)?.find(item => item?.id == addressId);

    const isFixed = (Number(category?.is_fixed) > 0 && totalPrice > 0) ? 1 : 0;

    const submitOrder = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/orders`, { category_id: category?.id, is_fixed: isFixed, discount_code: discountCode, total_price: totalPrice, address_id: addressId, is_urgent: isUrgent, date: date, time: time, description: des, female: femaleCount, male: maleCount, unspecified: unspecifiedCount, image_path: imagePath, steps: steps?.data }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            if (response.status == 201) {
                showToastOrAlert(response?.data?.message);
                dispatch(fetchOrders(token));
                dispatch(emptySteps());
                dispatch(emptyCategory());
                dispatch(emptyAddress());
                navigation.replace('MainApp', {
                    screen: 'OrdersScreen'
                });
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading(false);
        }
    };

    const checkDiscount = async () => {
        setPending(true);
        try {
            const response = await axios.post(`${uri}/discounts/check`, { categoryId: category?.id, discountCode }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            if (response?.status == 200) {
                setDiscountPercent(response?.data?.discount_code_percent)
                showToastOrAlert(response?.data?.message)
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setPending(false);
        }
    };

    const renderRow = (text1, text2, textStyle1, textStyle2) => (
        <View style={NewStyles.rowWrapper}>
            <Text style={[NewStyles.text, textStyle1]}>{text1}</Text>
            <Text style={[NewStyles.text10, textStyle2]}>{text2}</Text>
        </View>
    );
    console.log(address);

    if (loading) { return (<Loader />) };

    return (
        <SafeAreaView edges={{ top: 'additive' }} style={NewStyles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20, backgroundColor: themeColor4.bgColor(1), width: '95%', alignSelf: 'center', borderRadius: 20 }}>
                <View style={[NewStyles.seperator, { gap: 10, paddingTop: '5%' }]}>
                    <View style={NewStyles.rowWrapper}>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Ionicons name="cash-outline" size={26} color={themeColor0.bgColor(1)} />
                            <Text style={NewStyles.title}>{isFixed ? 'مبلغ قطعی لوپ' : 'مبلغ پایه لوپ'}</Text>
                        </View>
                        <Pressable style={[NewStyles.shadow, NewStyles.border100, NewStyles.whiteButton, NewStyles.row, { gap: 5 }]} >
                            <Ionicons name="cash-outline" size={24} color={themeColor0.bgColor(1)} />
                            <Text style={NewStyles.text}>{totalPrice > 0 ? `${formatPrice(totalPrice)}` + ' تومان' : 'نیاز به بررسی'}</Text>
                        </Pressable>
                    </View>
                    <View style={{ backgroundColor: themeColor1.bgColor(1), padding: 10, ...NewStyles.border10 }}>
                        <Text style={[NewStyles.text10, { textAlign: 'center' }]}>کاربر گرامی، اطلاعات سفارش شما پس از بررسی توسط تکسنین لوپ، و بررسی های تخصصی قیمت گذاری نهایی خواهد شد.</Text>
                    </View>
                </View>
                <View style={[NewStyles.seperator, { gap: 10, paddingTop: '5%' }]}>
                    <View style={[NewStyles.row, { gap: 5 }]}>
                        <Ionicons name="gift-outline" size={26} color={themeColor0.bgColor(1)} />
                        <Text style={NewStyles.title}>کد تشویق</Text>
                    </View>
                    <View style={{ backgroundColor: themeColor1.bgColor(1), padding: 10, ...NewStyles.border10 }}>
                        <Text style={[NewStyles.text10, { textAlign: 'center' }]}>کاربر گرامی، جهت دریافت کد تشویق، می توانید به بخش طرح های تشویقی مراجعه کرده و هر هفته در گردونه شانس لوپ شرکت کنید!</Text>
                    </View>
                    <View style={[{ backgroundColor: themeColor3.bgColor(0.2), }, NewStyles.row, NewStyles.border10]}>
                        <View
                            style={[
                                {
                                    gap: 5, flex: 2, minHeight: 50,
                                    paddingHorizontal: '5%',
                                },
                                NewStyles.row
                            ]}
                        >
                            <Ionicons name={'ticket-outline'} size={20} color={themeColor0.bgColor(1)} />
                            <TextInput style={[styles.textInput, NewStyles.text10]} keyboardType='default' placeholder='کد تخفیف خود را وارد کنید.' placeholderTextColor={themeColor3.bgColor(1)} value={discountCode} onChangeText={(text) => { setDiscountCode(text) }} />
                        </View>
                        <Pressable
                            style={[
                                { gap: 5, flex: 1, backgroundColor: themeColor0.bgColor(1), height: 50 },
                                NewStyles.border10,
                                NewStyles.center
                            ]}
                            onPress={() => checkDiscount()}>
                            {!pending && <Text style={[NewStyles.text4, { fontSize: 12 }]}>بررسی کد</Text>}
                            {pending && <ActivityIndicator color={themeColor4.bgColor(1)} size='small' />}
                        </Pressable>
                    </View>
                </View>
                <View style={[NewStyles.seperator, { gap: 10, padding: '5%' }]}>
                    <View style={[{ width: '100%', padding: '5%', backgroundColor: themeColor3.bgColor(0.2) }, NewStyles.border10, NewStyles.center]}>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Text style={NewStyles.title}>پیش نمایش سفارش</Text>
                            <Ionicons name="newspaper-outline" size={24} color={themeColor0.bgColor(1)} />
                        </View>
                        <Text style={NewStyles.text3}>{category?.title}</Text>
                    </View>
                    {renderRow('زمان مراجعه تکنسین', isUrgent > 0 ? 'درخواست فوری' : formatDate(date) + ' ساعت ' + time, NewStyles.text, isUrgent > 0 && NewStyles.title6)}
                    {maleCount + femaleCount + unspecifiedCount > 0 &&
                        renderRow(
                            'جنسیت تکنسین',
                            (() => {
                                const total = maleCount + femaleCount + unspecifiedCount;
                                if (total === 0) return 'مشخص نشده';
                                let details = [];
                                if (maleCount > 0) details.push(`تکنسین آقا`);
                                if (femaleCount > 0) details.push(`تکنسین خانم`);

                                return (details.length > 0 ? ` ${details.join(' ')}` : '');
                            })()
                        )
                    }

                    {renderRow('آدرس', '')}
                    {renderRow(address?.full_name + ' - ' + address?.city + ' - ' + address?.region + ' - ' + address?.address, '', NewStyles.text10)}
                    {discountPercent && renderRow('درصد تخفیف نهایی شما', discountPercent + ' درصد', NewStyles.text10)}
                </View>

                {steps?.data?.map((previewItem, index) => (
                    <View key={`section_${index}`}>
                        <FlatList
                            style={{ paddingTop: 5 }}
                            showsVerticalScrollIndicator={false} scrollEnabled={false}
                            data={previewItem?.filter(x => (x?.type == 'checkbox' || x?.type == 'radioButton' || x?.type == 'counter' || x?.type == 'input'))}
                            keyExtractor={(item) => item?.id?.toString()}
                            renderItem={({ item }) => {
                                return (
                                    <View>
                                        <View style={[NewStyles.row, { gap: 5, paddingHorizontal: '5%' }]}>
                                            <Ionicons name={item?.icon_name} size={24} color={themeColor0.bgColor(1)} />
                                            <Text style={NewStyles.title}>{item?.title}</Text>
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
                                                            <View style={[styles.itemWrapper, NewStyles.border10]}>
                                                                <View style={NewStyles.rowWrapper}>
                                                                    <View style={[NewStyles.rowWrapper, { justifyContent: 'flex-end', flex: 2, gap: 5 }]}>
                                                                        <Ionicons name={'ellipse'} size={10} color={themeColor0.bgColor(0.5)} />
                                                                        {item?.type == 'input' ? <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.second_title}</Text> : <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.title}</Text>}
                                                                    </View>
                                                                    {(item?.has_counter >= 1 && item?.type != 'input') && <Text style={[NewStyles.text10, { flex: 1, textAlign: 'auto' }]}>{item?.value}</Text>}
                                                                </View>
                                                                {(item?.has_counter >= 1 && item?.type == 'input') && <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.value}</Text>}
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
                    </View>
                ))}

                {des && <View style={{ paddingHorizontal: '5%', gap: 10 }}>
                    <View style={[NewStyles.row, { gap: 5 }]}>
                        <Ionicons name={'create-outline'} size={24} color={themeColor0.bgColor(1)} />
                        <Text style={NewStyles.title}>توضیحات کاربر</Text>
                    </View>
                    <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                        <Ionicons name={'ellipse'} size={10} color={themeColor0.bgColor(0.5)} />
                        <Text style={[NewStyles.text10, { flex: 1 }]}>{des}</Text>
                    </View>
                </View>}
                {imagePath && <Image style={[{ height: 250, margin: '5%' }, NewStyles.border10]} source={{ uri: `${imageUri}/${imagePath}` }} />}
            </ScrollView>
            <View style={[NewStyles.row, NewStyles.nav, { backgroundColor: 'transparent' }]}>
                <View style={{ flex: 1 }}>
                    <Button title={'ثبت نهایی سفارش'} textStyle={NewStyles.text4} style={{ backgroundColor: themeColor7.bgColor(1) }} loading={loading} onPress={() => submitOrder()} />
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
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
})