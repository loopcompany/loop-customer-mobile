import { View, Text, Pressable, Image, StyleSheet, Platform } from 'react-native';
import React, { useMemo } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { createStyles } from '../../styles/NewStyles';
import NewStyles, { deviceWidth } from '../../styles/NewStyles';
import { imageUri } from '../../services/URL';
import { themeColor0, themeColor10, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';
import { langIsRTL } from '../../helpers/Common';
export default function DiscountItem({ item, navigation }) {
    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
    const isRtl = langIsRTL(i18n.language)
    return (
        <Pressable style={[styles.discountItem, NewStyles.shadow]} onPress={() => navigation.navigate('DiscountDetail', { discountId: item.id })}>
            <View style={[styles.discountWrapper, NewStyles.rowWrapper]}>
                <Image style={[styles.discountImage, NewStyles.border100]} source={{ uri: `${imageUri}/${item?.image_path}` }} blurRadius={1} />
                <View style={styles.discountTextWrapper}>
                    <Text style={NewStyles.text10}>{item?.title}</Text>
                    <Text style={NewStyles.text}>{t('{{num}} points required', { num: item?.gems })}</Text>
                </View>
            </View>
            <View style={NewStyles.rowWrapper}>
                {/* <View style={[styles.punch, NewStyles.border100]} /> */}
                <View style={styles.perforage} ellipsizeMode="clip" numberOfLines={1} />
                {/* <View style={[styles.punch, NewStyles.border100]} /> */}
            </View>
            <View style={[NewStyles.rowWrapper, { width: '100%', paddingHorizontal: '5%' }]}>
                <Text style={NewStyles.text3}>{item?.discount_percent} {t('percent discount')}</Text>
                <View style={NewStyles.row}>
                    <Text style={NewStyles.text}>{t('More info')}</Text>
                    <Ionicons
                        name={isRtl ? 'chevron-back' : 'chevron-forward'}
                        size={15}
                        color={themeColor0.bgColor(1)}
                    />
                </View>
            </View>
        </Pressable>
    )
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
    discountItem: {
        backgroundColor: themeColor4.bgColor(1),
        width: deviceWidth * 0.9,
        alignItems: 'center',
        margin: 10,
        paddingBottom: 10,
        borderRadius: 10
    },
    discountImage: {
        height: 65,
        width: 65,
    },
    discountWrapper: {
        width: '100%',
        paddingHorizontal: 15,
        paddingTop: 10,
        gap:10
    },
    discountTextWrapper: {
        flex: 1,
        paddingRight: 20,
    },
    punch: {
        height: 25,
        width: 25,
        backgroundColor: themeColor5.bgColor(1),
    },
    perforage: {
        marginTop: 10,
        alignSelf: 'center',
        width: '95%',
        borderBottomWidth: 1,
        borderBottomColor: Platform.OS == 'android' ? themeColor3.bgColor(1) : themeColor3.bgColor(0.5),
        borderStyle: Platform.OS == 'android' ? 'dashed' : 'solid',
    },
})