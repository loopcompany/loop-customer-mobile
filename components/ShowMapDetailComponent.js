import { StyleSheet, View, ActivityIndicator } from 'react-native';
import React, { useMemo, useState } from 'react';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { createStyles } from '@styles/NewStyles';
import { themeColor4 } from '@theme/Color';

const NESHAN_API_KEY = 'web.1152adf3d8884734af16cc9e8f83e649';

const ShowMapDetailComponent = ({ latitude, longitude, address = '' }) => {
    const { t, i18n } = useTranslation();

    const [loading, setLoading] = useState(true);

    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );

    const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);

    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);

    const hasValidLocation =
        !Number.isNaN(latitude) &&
        !Number.isNaN(longitude);

    const orderLocationTitle = t('Order location');

    const mapHtml = useMemo(() => {
        if (!hasValidLocation) {
            return `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            font-family: sans-serif;
                            color: #555;
                            background: #f5f5f5;
                        }
                    </style>
                </head>
                <body>
                    Location not found
                </body>
                </html>
            `;
        }

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <meta 
                    name="viewport" 
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
                />

                <link 
                    href="https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.css" 
                    rel="stylesheet" 
                    type="text/css"
                >

                <script 
                    src="https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js" 
                    type="text/javascript">
                </script>

                <style>
                    html, body {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                    }

                    #map {
                        width: 100vw;
                        height: 100vh;
                    }

                    .leaflet-control-attribution {
                        display: none !important;
                    }

                    .leaflet-control-zoom {
                        display: none !important;
                    }
                </style>
            </head>

            <body>
                <div id="map"></div>

                <script>
                    var lat = ${parsedLatitude};
                    var lng = ${parsedLongitude};

                    var myMap = new L.Map('map', {
                        key: '${NESHAN_API_KEY}',
                        maptype: 'dreamy',
                        poi: true,
                        traffic: false,
                        center: [lat, lng],
                        zoom: 16,
                        zoomControl: false
                    });

                    var marker = L.marker([lat, lng]).addTo(myMap);

                    

                    setTimeout(function() {
                        marker.openPopup();
                    }, 500);

                    // برای اینکه نقشه بعد از لود شدن سایزش درست شود
                    setTimeout(function() {
                        myMap.invalidateSize();
                    }, 300);
                </script>
            </body>
            </html>
        `;
    }, [latitude, longitude, hasValidLocation, orderLocationTitle, address]);

    return (
        <View style={styles.container}>
            <WebView
                originWhitelist={['*']}
                source={{ html: mapHtml }}
                style={styles.map}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onLoadEnd={() => setLoading(false)}
            />

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={themeColor4.bgColor(1)} />
                </View>
            )}
        </View>
    );
};

export default ShowMapDetailComponent;

const createLocalStyles = (NewStyles) => StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f2f2f2',
    },

    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },

    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f2f2f2',
    },
});

const escapeHtml = (text = '') => {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};
