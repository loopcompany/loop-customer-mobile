import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor5 } from '../../theme/Color';
import Button from '../../components/Button';
import AddressItem from '../../components/AddressItem';
import { fetchAddresses } from '../../slices/addressSlice';
import { showToastOrAlert } from '../../helpers/Common';
import BlankScreen from '../../components/BlankScreen';

export default function Addresses({ navigation }) {

    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const addresses = useSelector(state => state.address?.data);
    const addressLoading = useSelector(state => state.address?.loading);
    const token = useSelector((state) => state?.auth?.token)
    const user = useSelector(state => state.user?.data);


    useEffect(() => {
        console.log('Addresses useEffect - Token:', token);
        if (token) {
            console.log('Dispatching fetchAddresses...');
            dispatch(fetchAddresses(token));
        } else {
            console.log('No token available');
        }
    }, [token]);

    return (
        <View style={NewStyles.container}>
            <FlatList
                contentContainerStyle={[styles.contentContainerStyle, NewStyles.center, addresses?.length == 0 && { flexGrow: 1 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => { dispatch(fetchAddresses(token)) }} />}
                ListEmptyComponent={() => <BlankScreen />}
                data={addresses}
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item }) => {
                    return (
                        <AddressItem item={item} />
                    )
                }}
            />
            <View style={[NewStyles.row, NewStyles.nav, NewStyles.shadow]}>
                <Button title={'افزودن آدرس'} loading={loading} onPress={() => {
                    navigation.navigate('Add New Address')
                }} />
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    contentContainerStyle: {
        gap: 10,
        paddingVertical: '5%'
    },
})