import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import BouncyCheckbox from "react-native-bouncy-checkbox";

import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor0, themeColor3, themeColor4, themeColor5 } from '../theme/Color';
import { useTranslation } from 'react-i18next';
import { setAddressId, setGeneralData } from '../slices/stepSlice';
import axios from 'axios';
import { uri } from '../services/URL';
import ConfirmationModal from './ConfirmationModal';
import { fetchAddresses } from '../slices/addressSlice';
import { handleError } from '../helpers/Common';

export default function Address({ step, data, navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(true);
    const [id, setId] = useState(null);
    const addressId = useSelector(state => state.step?.addressId);
    const addresses = useSelector(state => state.address?.data);
    const token = useSelector((state) => state?.auth?.token)
    const [deleteModal, setDeletModal] = useState(false);

    const [loading, setLoading] = useState(false);

    const renderRow = (label, value, textStyle = NewStyles.text10) =>
        <View style={NewStyles.rowWrapper}>
            <Text style={NewStyles.text3}>{t(label)}</Text>
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

    return (
        <View style={NewStyles.seperator1}>
            <Pressable style={[NewStyles.row, { backgroundColor: themeColor0.bgColor(1), paddingVertical:10 }, NewStyles.center, NewStyles.border10]} onPress={() => navigation.navigate('Add New Address')}>
                <Ionicons name="add" size={24} color={themeColor4.bgColor(1)} />
                <Text style={NewStyles.title4}>افزودن آدرس جدید</Text>
            </Pressable>
            <FlatList
                style={{ gap: 15 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                data={addresses}
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item }) => {
                    return (
                        <View style={[styles.itemWrapper, NewStyles.border10, NewStyles.row, NewStyles.shadow]}>
                            <View>
                                <BouncyCheckbox
                                    size={25}
                                    fillColor={themeColor0.bgColor(1)}
                                    unFillColor={themeColor5.bgColor(1)}
                                    iconStyle={{ borderColor: themeColor0.bgColor(1) }}
                                    innerIconStyle={{ borderWidth: 1 }}
                                    isChecked={addressId == item?.id}
                                    onPress={() => {
                                        dispatch(setAddressId(item?.id))
                                        dispatch(setGeneralData({ fieldId: data?.id, value: 1, step }))
                                    }}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                {renderRow(`${item?.title}`, '')}
                                {renderRow(``, `${item?.address}`, [NewStyles.text10, { flex: 1 }])}
                            </View>
                            <Pressable style={styles.searchBarIcons} onPress={() => { setId(item?.id); setDeletModal(true); }}>
                                <Ionicons name="trash" size={20} color={themeColor0.bgColor(1)} />
                            </Pressable>
                        </View>
                    )
                }}
            />
            <ConfirmationModal title={'حذف آدرس'} message={'آیا از حذف این آدرس اطمینان دارید؟'} action={() => deleteAddress()} confirmationModal={deleteModal} setConfirmationModal={setDeletModal} />
        </View>
    )
}
const styles = StyleSheet.create({
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
        width: deviceWidth * 0.9,
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