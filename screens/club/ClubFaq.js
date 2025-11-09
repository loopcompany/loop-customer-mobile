import { FlatList, Linking, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialIcons } from '@expo/vector-icons';

import { uri } from '../../services/URL';
import { showToastOrAlert } from '../../helpers/Common';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Loader from '../../components/Loader';
import AccordionItem from '../../components/AccordionItem';

export default function FAQ() {

    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const support = useSelector(state => state?.contact?.data)?.find(item => item?.type == 'phone');

    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/user/club/faqs`)
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

    const [active, setActive] = useState();

    if (loading) return <Loader />;

    return (
        <View style={NewStyles.container}>
            <CustomStatusBar />
            <FlatList
                contentContainerStyle={[styles.contentContainerStyle, NewStyles.center]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor1.bgColor(1)} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                ListHeaderComponent={() =>
                    <View style={[NewStyles.seperator, { gap: 10, paddingTop: '5%' }]}>
                        <View style={NewStyles.rowWrapper}>
                            <View style={[NewStyles.row, { gap: 5 }]}>
                                <Ionicons name='help-circle-outline' size={24} color={themeColor0.bgColor(1)} />
                                <Text style={NewStyles.title}>درباره کلاب پاکار</Text>
                            </View>
                            <Pressable style={[NewStyles.shadow, NewStyles.border100, NewStyles.whiteButton, NewStyles.row, { gap: 5 }]} onPress={() => Linking.openURL(support?.link)} >
                                <MaterialIcons name='support-agent' size={24} color={themeColor0.bgColor(1)} />
                                <Text style={NewStyles.text}>تماس با پشتیبانی</Text>
                            </Pressable>
                        </View>
                        <Text style={NewStyles.text3}>مشتری عزیز، شما می‌توانید در صورت بروز هر گونه سوال در رابطه با پاکار با پشتیبانی تماس برقرار کنیدهمچنین می‌توانید بخشی از سوالات متداول کاربران را در این بخش مطالعه بفرمایید.</Text>
                    </View>}
                data={data}
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item, index }) => (
                    <AccordionItem item={item} index={index} active={active} setActive={setActive} />
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingVertical: '5%',
        gap: 5,
    },
})