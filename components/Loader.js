import { ActivityIndicator, StyleSheet } from 'react-native';
import React from 'react';

import { themeColor1, themeColor5 } from '../theme/Color';
import { deviceHeight, deviceWidth } from '../styles/Styles';

export default function Loader() {

    return (
        <ActivityIndicator color={themeColor1.bgColor(1)} size='large' style={styles.loaderWrapper} />
    )
}

const styles = StyleSheet.create({
    loaderWrapper: {
        height: deviceHeight,
        width: deviceWidth,
        backgroundColor: themeColor5.bgColor(1),
    },
})