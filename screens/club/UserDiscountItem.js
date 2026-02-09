import { View, Text, Pressable, Image, StyleSheet, Platform } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';

import NewStyles, { deviceWidth } from '../../styles/NewStyles';
import { imageUri } from '../../services/URL';
import { themeColor0, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';
import { formatDate, showToastOrAlert } from '../../helpers/Common';

export default function UserDiscountItem({ item, navigation }) {

    const { t } = useTranslation();

    const copyToClipboard = () => {
        Clipboard.setStringAsync(item?.code);
        showToastOrAlert(t('The code was successfully copied.'))
    };

    return (
        <Pressable style={[styles.discountItem, NewStyles.border10, NewStyles.shadow]} onPress={() => navigation.navigate('DiscountDetail', { discountId: item?.club?.id })}>
            <View style={[styles.discountWrapper, NewStyles.row]}>
                <Image style={[styles.discountImage, NewStyles.border100]} source={{ uri: `${imageUri}/${item?.club?.image_path}` }} blurRadius={1} />
                <View style={styles.discountTextWrapper}>
                    <Text style={NewStyles.text10}>{item?.club?.title}</Text>
                    {item?.count > 0 ? <Text style={NewStyles.text}>{item?.count} {t('more uses remaining')}</Text> : <Text style={NewStyles.text}>{t('Allowed uses ended')}</Text>}
                </View>
            </View>
            <Pressable style={[NewStyles.textInput, NewStyles.border10, NewStyles.row, { gap: 5 }]} onPress={copyToClipboard}>
                <Ionicons name={'copy-outline'} size={20} color={themeColor0.bgColor(1)} />
                <Text style={NewStyles.text10}>{item?.code}</Text>
            </Pressable>
            
            <View style={[NewStyles.rowWrapper, { width: '100%', paddingHorizontal: '5%' }]}>
                <Text style={NewStyles.text3}>{item?.discount_percent} {t('percent discount')}</Text>
                <View style={NewStyles.row}>
                    <Text style={NewStyles.text}>{t('Usable until')} {formatDate(item?.expiry_date)}</Text>
                    <Ionicons name="chevron-back" size={15} color={themeColor0.bgColor(1)} />
                </View>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    discountItem: {
        backgroundColor: themeColor4.bgColor(1),
        width: deviceWidth * 0.9,
        alignItems: 'center',
        margin: 10,
        paddingBottom: 10,
    },
    discountImage: {
        height: 65,
        width: 65,
    },
    discountWrapper: {
        width: '100%',
        paddingHorizontal: 15,
        paddingTop: 10,
        gap: 5
    },
    discountTextWrapper: {
        // flex: 1,
        paddingRight: 20,
    },
    punch: {
        height: 25,
        width: 25,
        backgroundColor: themeColor5.bgColor(1),
    },
    perforage: {
        alignSelf: 'center',
        width: '95%',
        borderBottomWidth: 1,
        borderBottomColor: Platform.OS == 'android' ? themeColor3.bgColor(1) : themeColor3.bgColor(0.5),
        borderStyle: Platform.OS == 'android' ? 'dashed' : 'solid',
    },
})