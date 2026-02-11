import { FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useState, useEffect,useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import AsyncStorage from '@react-native-async-storage/async-storage';

import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor5, themeColor6 } from '../theme/Color';
import { useTranslation } from 'react-i18next';
import { setAddressId, setGeneralData } from '../slices/stepSlice';
import axios from 'axios';
import { uri } from '../services/URL';
import ConfirmationModal from './ConfirmationModal';
import { fetchAddresses } from '../slices/addressSlice';
import { handleError } from '../helpers/Common';
import { createStyles } from '../styles/NewStyles';
export default function Address({ step, data, navigation }) {

      const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
   const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);
    const [id, setId] = useState(null);
    const addressId = useSelector(state => state.step?.addressId);
    const addresses = useSelector(state => state.address?.data);
    const [deleteModal, setDeletModal] = useState(false);
    const token = useSelector(state => state.auth?.token);
    const [loading, setLoading] = useState(false);

    // Fetch addresses when component mounts
    useEffect(() => {
        const loadAddresses = async () => {
            if (token) {
                dispatch(fetchAddresses(token));
            }
        };
        loadAddresses();
    }, [dispatch, token]);

    const renderRow = (label, value, textStyle = NewStyles.text10) =>
        <View style={NewStyles.row}>
            <Text style={NewStyles.text3}>{label}</Text>
            <Text style={textStyle}>{value}</Text>
        </View>;

    const deleteAddress = async () => {
        setLoading(true);
        try {
            const response = await axios.delete(`${uri}/addresses/${id}`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            if (response.status == 200) {
                dispatch(fetchAddresses(token));
                dispatch(setAddressId(null))
                dispatch(setGeneralData({ fieldId: data?.id, value: 0, step }))
            }
        } catch (error) {
            handleError(error)
        } finally {
            setLoading(false);
        }
    }

    const handleRefresh = async () => {
        if (token) {
            dispatch(fetchAddresses(token));
        }
        setRefreshing(false);
    };

    return (
        <View style={NewStyles.seperator1}>
            <Pressable style={[NewStyles.row, { backgroundColor: themeColor0.bgColor(1), paddingVertical:10 }, NewStyles.center, NewStyles.border10]} onPress={() => navigation.navigate('AddNewAddress')}>
                <Ionicons name="add" size={24} color={themeColor4.bgColor(1)} />
                <Text style={NewStyles.title4}>{t("Add New Address")}</Text>
            </Pressable>
            <FlatList
                style={{ gap: 15 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={handleRefresh} />}
                data={addresses}
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item }) => {
                    return (
                        <Pressable onPress={() => {
                                        dispatch(setAddressId(item?.id))
                                        dispatch(setGeneralData({ fieldId: data?.id, value: 1, step }))
                                    }} style={[styles.itemWrapper, NewStyles.border10, NewStyles.row, NewStyles.shadow, addressId == item?.id && {backgroundColor:themeColor1.bgColor(1)}]}>
                           
                            <View style={{ flex: 1 }}>
                                {renderRow(`${item?.title}`, '')}
                                {renderRow(``, `${item?.address}`, [NewStyles.text10, { flex: 1 }])}
                            </View>
                            <Pressable style={styles.searchBarIcons} onPress={() => { setId(item?.id); setDeletModal(true); }}>
                                <Ionicons name="trash" size={20} color={themeColor6.bgColor(1)} />
                            </Pressable>
                        </Pressable>
                    )
                }}
            />
            <ConfirmationModal title={t('Delete Address')} message={t('Are you sure you want to delete this address?')} action={() => deleteAddress()} confirmationModal={deleteModal} setConfirmationModal={setDeletModal} />
        </View>
    )
}
const createLocalStyles = (NewStyles) => StyleSheet.create({
    contentContainerStyle: {
        // backgroundColor: 'red'
        // gap: 15,
        // paddingVertical: '5%'
    },
    nav: {
        gap: 50,
        paddingHorizontal: '5%',
        backgroundColor: themeColor4.bgColor(1)
    },
    itemWrapper: {
        width:Platform.OS === 'web' ? '100%' : deviceWidth * 0.9,
        backgroundColor: themeColor4.bgColor(1),
        paddingHorizontal: '5%',
        paddingVertical: 15,
        gap: 10
    },
    map: {
        flex: 1
    },
    searchBarIcons: {
        backgroundColor: themeColor3.bgColor(0.2),
        borderRadius: 100,
        padding: 10,
        marginRight: 3
    },
})