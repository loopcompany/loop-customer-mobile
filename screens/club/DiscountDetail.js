import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
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

export default function DiscountDetail({ route, navigation }) {
    const { t } = useTranslation();
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
            const response = await axios.post(`${uri}/discounts/detail`, { discountId }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
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
            const response = await axios.post(`${uri}/discounts/claim`, { discountId }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            if (response.status == 200) {
                dispatch(fetchUser(token))
                setCode(response?.data?.data?.code);
                setDiscountModal(true);
            }
        } catch (error) {
            handleError(error, t)
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView edges={{top:'off'}} style={NewStyles.container}>
            <ScrollView contentContainerStyle={styles.contentContainerStyle} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}>
                <Image style={{ width: '100%', height: 250 }} source={{ uri: `${imageUri}/${data?.image_path}` }} />
                <View style={[NewStyles.spacing, { gap: 10 }]}>
                    <View style={[NewStyles.row, { gap: 5 }]}>
                        <Ionicons name='ticket-outline' size={24} color={themeColor0.bgColor(1)} />
                        <Text style={NewStyles.title}>{data?.title}</Text>
                    </View>
                    <Text style={NewStyles.text}>{data?.discount_percent} درصد تخفیف تا سقف {formatPrice(data?.max_price)} تومان</Text>
                    <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(1) }} />
                    <Text style={NewStyles.text10}>{cleanText(data?.des)}</Text>
                    <Text style={NewStyles.text10}>{cleanText(data?.long_des)}</Text>
                    <Text style={NewStyles.text10}>📅  اعتبار کد: تا {data?.expire} روز</Text>
                    <Text style={NewStyles.text10}>🟡  برای {data?.count} بار استفاده</Text>
                    <Text style={NewStyles.text3}>کدهای تشویقی خود را در بخش کدهای دریافتی ببینید.</Text>
                </View>
            </ScrollView>

            <View style={[NewStyles.row, NewStyles.nav]}>
                <View style={[NewStyles.row, { gap: 5 }]}>
                    <Text style={NewStyles.title}>{data?.gems} <Text style={NewStyles.title}>امتیاز مورد نیاز</Text></Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Button title={'دریافت تخفیف'} loading={loading} onPress={() => getDiscount()} textStyle={[NewStyles.title1, { fontSize: 14 }]}/>
                </View>
            </View>

            <DiscountModal discountModal={discountModal} setDiscountModal={setDiscountModal} code={code} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        gap: 10,
        // paddingVertical: '5%'
    },
    gemImage: {
        height: 30,
        width: 35,
    },
})