import { FlatList, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { uri } from '../../services/URL';
import { showToastOrAlert } from '../../helpers/Common';
import NewStyles from '../../styles/NewStyles';
import { useSelector } from 'react-redux';
import UserDiscountItem from './UserDiscountItem';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserDiscounts({ navigation }) {

    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(true);
    const token = useSelector((state) => state?.auth?.token)

    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/user/discounts`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            setData(response?.data);
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [refreshing]);

    return (
        <SafeAreaView style={NewStyles.container}>
            <FlatList
                contentContainerStyle={[NewStyles.center, { gap: 10 }]}
                showsVerticalScrollIndicator={false}
                data={data}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={({ item }) => {
                    return (
                        <UserDiscountItem item={item} navigation={navigation} />
                    )
                }}
            />
        </SafeAreaView>
    )
}