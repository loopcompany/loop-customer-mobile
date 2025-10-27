import { View, Text, StyleSheet, Pressable, ToastAndroid, Platform } from 'react-native';
import React, { useState } from 'react';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';

import { useDispatch, useSelector } from "react-redux";

import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '../../styles/NewStyles';
import MarkerIcon from '../../assets/svg/MarkerIcon';
import { themeColor0, themeColor4 } from '../../theme/Color';
import Button from '../../components/Button';
import { fetchAddresses, setLatitude, setLongitude } from '../../slices/addressSlice';
import { uri } from '../../services/URL';
import axios from 'axios';
import { showToastOrAlert } from '../../helpers/Common';
import { useTranslation } from 'react-i18next';

export default function Map({ route, navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const token = useSelector(state => state.auth?.token);
    const user = useSelector(state => state.user?.data);
    const address = useSelector(state => state?.address);

    const [region, setRegion] = useState(null);

    const getLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Platform.OS === 'android' ? ToastAndroid.show('شما دسترسی پاکار به لوکیشن خود را بسته‌اید!', ToastAndroid.SHORT) : alert('شما دسترسی پاکار به لوکیشن خود را بسته‌اید!')
        } else {
            try {
                const location = await Location.getCurrentPositionAsync();
                if (location) {
                    setRegion({
                        "latitude": location.coords.latitude,
                        "latitudeDelta": 0.001,
                        "longitude": location.coords.longitude,
                        "longitudeDelta": 0.001
                    })
                }
            } catch (e) {
                Platform.OS === 'android' ? ToastAndroid.show('برای دسترسی به موقعیت فعلی، باید لوکیشن خود را روشن کنید.', ToastAndroid.SHORT) : alert('برای دسترسی به موقعیت فعلی، باید لوکیشن خود را روشن کنید.')
                console.log('Error while trying to get location: ', e);
            }
        }
    };

    const submitAddress = async () => {
        setLoading(true);
        try {
            console.log('Token:', token);
            console.log('Address data:', address);
            
            if (!token) {
                showToastOrAlert('لطفا ابتدا وارد شوید');
                return;
            }
            
            const response = await axios.post(`${uri}/addresses`, address, { 
                headers: { 
                    'Accept': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                } 
            })
            if (response.status === 201) {
                showToastOrAlert(response?.data?.message || 'آدرس با موفقیت ثبت شد')
                dispatch(fetchAddresses(token));
            }
        } catch (error) {
            console.error('Submit address error:', error.response?.data);
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading(false);
            navigation.goBack();
        }
    }

    return (
        <View style={NewStyles.container}>
            
            <MapView
                style={{ flex: 1 }}
                initialRegion={{ 
                    "latitude": 35.6892, // تهران
                    "longitude": 51.3890, // تهران
                    "latitudeDelta": 0.01, 
                    "longitudeDelta": 0.01 
                }}
                region={region}
                onRegionChangeComplete={(coordinates) => {
                    setRegion(null);
                    dispatch(setLatitude(coordinates?.latitude))
                    dispatch(setLongitude(coordinates?.longitude))
                }}
                mapType='standard'
            >
            </MapView>
            <View
                style={{
                    left: "50%",
                    marginLeft: -30,
                    marginTop: -60,
                    position: "absolute",
                    top: "50%",
                }}
            >
                <MarkerIcon />
            </View>
            <View style={{ position: 'absolute', backgroundColor: 'transparent', width: '100%', bottom: 0, paddingHorizontal: '5%', alignItems: 'flex-end' }}>
                <Pressable style={[styles.locateBtn, NewStyles.center, NewStyles.shadow, NewStyles.border100]} onPress={() => { getLocation() }}>
                    <Ionicons name="locate" size={24} color={themeColor0.bgColor(1)} />
                </Pressable>
                <Button title={'تأیید'} loading={loading} onPress={() => {
                    if (!address?.latitude || !address?.longitude) {
                        showToastOrAlert('لطفا مکان مورد نظر خود را به درستی روی نقشه پیدا کنید.')
                        return;
                    };
                    submitAddress()
                }} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    locateBtn: {
        height: 45,
        width: 45,
        backgroundColor: themeColor4.bgColor(1),
    },
})