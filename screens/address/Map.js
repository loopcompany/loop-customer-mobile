import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import React, { useState } from 'react';
import MapView, { Circle } from '@components/MapView';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useDispatch, useSelector } from "react-redux";
import { showAlert } from '@helpers/Common';

import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '@styles/NewStyles';
import { themeColor0, themeColor4 } from '@theme/Color';
import Button from '@components/Button';
import { fetchAddresses, setLatitude, setLongitude } from '@slices/addressSlice';
import { fetchRadii } from '@slices/radiusSlice';
import { uri } from '@services/URL';
import axios from 'axios';
import { showToastOrAlert } from '@helpers/Common';
import { useTranslation } from 'react-i18next';
import NeshanMap from './NeshanMap';

// محاسبه فاصله بین دو نقطه با استفاده از Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // شعاع زمین بر حسب متر
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // فاصله بر حسب متر
};

export default function Map({ route, navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const user = useSelector(state => state.user?.data);
    const address = useSelector(state => state?.address);
    const token = useSelector(state => state.auth?.token);
    const radiusData = useSelector(state => state.radius?.data);
    const [region, setRegion] = useState(null);

    // Fetch radii data when token is available
    React.useEffect(() => {
        if (token) {
            console.log('🔍 Fetching radii with token:', token.substring(0, 20) + '...');
            dispatch(fetchRadii(token));
        } else {
            console.log('⚠️ No token available for fetchRadii');
        }
    }, [token, dispatch]);

    // استخراج اولین radius از آرایه یا استفاده از داده یکتایی
    const radii = Array.isArray(radiusData) && radiusData.length > 0 ? radiusData[0] : radiusData;



    // بررسی اینکه آیا مکان انتخاب شده داخل دایره است
    const isLocationValid = () => {
        if (!address?.latitude || !address?.longitude) {
            return false;
        }

        if (radii && radii.latitude && radii.longitude && radii.radius) {
            const distance = calculateDistance(
                parseFloat(radii.latitude),
                parseFloat(radii.longitude),
                address?.latitude,
                address?.longitude
            );

            return distance <= parseFloat(radii.radius);
        }

        return true;
    };

    const getLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            showAlert(t('Error'), t('You have denied Loop access to your location!'));
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
                showAlert(t('Error'), t('To access your current location, you must turn on your location.'));
                console.log('Error while trying to get location: ', e);
            }
        }
    };

    const submitAddress = async () => {
        setLoading(true);
        try {

            if (!token) {
                showToastOrAlert(t('Please log in first.'));
                setLoading(false);
                return;
            }

            // Validation: بررسی اینکه آیا مکان داخل دایره است
            if (radii && radii.latitude && radii.longitude && radii.radius) {
                const distance = calculateDistance(
                    parseFloat(radii.latitude),
                    parseFloat(radii.longitude),
                    address?.latitude,
                    address?.longitude
                );

                if (distance > parseFloat(radii.radius)) {
                    showToastOrAlert(t('Please select a location within the specified area!'));
                    setLoading(false);
                    return;
                }
            }

            const response = await axios.post(`${uri}/addresses`, address, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.status === 201) {
                showToastOrAlert(response?.data?.message || t('Address successfully registered'))
                dispatch(fetchAddresses(token));
                if (Platform.OS == 'web') {
                    window.history.back()
                } else {
                    navigation.goBack()
                }
            }

        } catch (error) {
            console.error('Submit address error:', error.response?.data);
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading(false);

        }
    }

    return (
        <View style={NewStyles.container}>
            <NeshanMap
                submitAddress={submitAddress}
            />
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