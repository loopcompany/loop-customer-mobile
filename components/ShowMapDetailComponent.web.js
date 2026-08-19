import { StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import MapView, { Circle, Marker } from './MapView';
import { useTranslation } from 'react-i18next';
import { createStyles } from '@styles/NewStyles';
const ShowMapDetailComponent = ({ latitude, longitude, address = '' }) => {
    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
    return (

        <MapView
            style={styles.map}
            initialRegion={{
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }}
            zoomControl={false}
            neshanApiKey={'web.1152adf3d8884734af16cc9e8f83e649'}

        >
            <Marker
                coordinate={{
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                }}
                title={t("Order location")}
                description={address}
            />
        </MapView>
    )
}

export default ShowMapDetailComponent

const createLocalStyles = (NewStyles) => StyleSheet.create({
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
})