import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor5 } from '../theme/Color';
import { formatDateTime } from '../helpers/Common';

export default function GemTransactionItem({ item }) {

    const { t } = useTranslation();

    const renderRow = (label, value, textStyle = NewStyles.text10) =>
        value ? (
            <View style={NewStyles.rowWrapper}>
                <Text style={NewStyles.text3}>{label}</Text>
                <Text style={textStyle}>{value}</Text>
            </View>
        ) : null;

    return (
        <View style={[styles.itemWrapper, NewStyles.shadow, NewStyles.border10]}>
            {renderRow(t('Points amount'), `${item?.gems} ${item?.gem_action?.name}`, NewStyles.text, item?.gem > 0 ? NewStyles.text7 : NewStyles.text6)}
            {renderRow(t('Date'), formatDateTime(item?.created_at))}
        </View>
    )
}

const styles = StyleSheet.create({
    itemWrapper: {
        width: deviceWidth * 0.9,
        backgroundColor: themeColor5.bgColor(1),
        paddingHorizontal: '5%',
        paddingVertical: 15,
        gap: 10
    },
})