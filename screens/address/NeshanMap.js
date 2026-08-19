import { View, StyleSheet, Platform, ActivityIndicator, Pressable } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from "react-redux";
import { setLatitude, setLongitude, fetchAddresses } from '@slices/addressSlice';
import { useTranslation } from 'react-i18next';
import Button from '@components/Button';
import NewStyles from '@styles/NewStyles';
import MarkerIcon from '@assets/svg/MarkerIcon';
import axios from 'axios';
import { uri } from '@services/URL';
import { showToastOrAlert } from '@helpers/Common';
import { Ionicons } from '@expo/vector-icons';
import { themeColor0, themeColor4 } from '@theme/Color';

// جایگزین کردن API Key نشان
const NESHAN_API_KEY = 'web.1152adf3d8884734af16cc9e8f83e649';

export default function NeshanMap({ submitAddress }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const webViewRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    const address = useSelector(state => state?.address);
    const token = useSelector(state => state.auth?.token);
    const radiusData = useSelector(state => state.radius?.data);
    const radii = Array.isArray(radiusData) && radiusData.length > 0 ? radiusData[0] : radiusData;

    // کدهای HTML و جاوااسکریپت برای نمایش نقشه نشان
    const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link href="https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.css" rel="stylesheet" type="text/css">
        <script src="https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js" type="text/javascript"></script>
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var myMap = new L.Map('map', {
                key: '${NESHAN_API_KEY}',
                maptype: 'dreamy',
                poi: true,
                traffic: false,
                center: [${radii?.latitude || 35.6892}, ${radii?.longitude || 51.3890}],
                zoom: 14
            });

            // اضافه کردن دایره محدوده
            if (${!!radii?.radius}) {
                var circle = L.circle([${radii?.latitude}, ${radii?.longitude}], {
                    color: '#3498db',
                    fillColor: '#3498db',
                    fillOpacity: 0.2,
                    radius: ${radii?.radius || 0}
                }).addTo(myMap);
            }

            // ارسال مختصات مرکز نقشه به React Native وقتی نقشه حرکت می‌کند
            myMap.on('move', function() {
                var center = myMap.getCenter();
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ON_REGION_CHANGE',
                    lat: center.lat,
                    lng: center.lng
                }));
            });

            // تابعی برای تغییر مرکز نقشه (توسط React Native صدا زده می‌شود)
            window.moveToLocation = function(lat, lng) {
                myMap.setView([lat, lng], 16);
            };
        </script>
    </body>
    </html>
    `;

    const onMessage = (event) => {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'ON_REGION_CHANGE') {
            dispatch(setLatitude(data.lat));
            dispatch(setLongitude(data.lng));
        }
    };

    const getLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const location = await Location.getCurrentPositionAsync();
        const script = `window.moveToLocation(${location.coords.latitude}, ${location.coords.longitude})`;
        webViewRef.current.injectJavaScript(script);
    };



    return (
        <View style={NewStyles.container}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: mapHtml }}
                onMessage={onMessage}
                style={{ flex: 1 }}
                onLoadEnd={() => setMapReady(true)}
            />

            {/* مارکر ثابت در مرکز صفحه */}
            <View style={styles.markerFixed}>
                <MarkerIcon />
            </View>

            <View style={styles.footer}>
                <Pressable style={[styles.locateBtn, NewStyles.center, NewStyles.shadow, NewStyles.border100]} onPress={() => { getLocation() }}>
                    <Ionicons name="locate" size={24} color={themeColor0.bgColor(1)} />
                </Pressable>
                <Button
                    title={t('Confirm')}
                    loading={loading}
                    onPress={submitAddress}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    markerFixed: {
        left: "50%",
        marginLeft: -24, // تنظیم دقیق بر اساس سایز SVG شما
        marginTop: -48,
        position: "absolute",
        top: "50%",
    },
    footer: {
        position: 'absolute',
        bottom: 60,
        width: '100%',
        paddingHorizontal: 20
    },
    locateBtn: {
        height: 45,
        width: 45,
        backgroundColor: themeColor4.bgColor(1),
    },
});
