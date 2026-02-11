import { FlatList, View } from 'react-native';
import React, { useEffect, useState,useMemo } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { uri } from '../../services/URL';
import { showToastOrAlert } from '../../helpers/Common';
import NewStyles from '../../styles/NewStyles';
import { useSelector } from 'react-redux';
import UserDiscountItem from './UserDiscountItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeaders from '../../components/ScreenHeaders';
import BlankScreen from './../../components/BlankScreen';
import { createStyles } from '../../styles/NewStyles';
export default function UserDiscounts({ navigation }) {

const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
    // const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
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
        <SafeAreaView edges={{top:'off', bottom:'off'}} style={NewStyles.container}>
            <ScreenHeaders title={t("Received Prizes")} />
            <FlatList
                contentContainerStyle={[NewStyles.center, { gap: 10 }]}
                showsVerticalScrollIndicator={false}
                data={data}
                ListEmptyComponent={()=>{
                    return(
                        <BlankScreen/>
                    )
                }}
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