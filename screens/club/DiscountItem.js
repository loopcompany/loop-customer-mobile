import { View, Text, Pressable, Image, StyleSheet, Platform } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles, { deviceWidth } from '../../styles/NewStyles';
import { imageUri } from '../../services/URL';
import { themeColor0, themeColor10, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';

export default function DiscountItem({ item, navigation }) {
    return (
        <Pressable style={[styles.discountItem, NewStyles.shadow]} onPress={() => navigation.navigate('Discount Detail', { discountId: item.id })}>
            <View style={[styles.discountWrapper, NewStyles.rowWrapper]}>
                <Image style={[styles.discountImage, NewStyles.border100]} source={{ uri: `${imageUri}/${item?.image_path}` }} blurRadius={1} />
                <View style={styles.discountTextWrapper}> 
                    <Text style={NewStyles.text10}>{item?.title}</Text>
                    <Text style={NewStyles.text}>{item?.gems} پا مورد نیاز</Text>
                </View>
            </View> 
            <View style={NewStyles.rowWrapper}>
                {/* <View style={[styles.punch, NewStyles.border100]} /> */}
                <View style={styles.perforage} ellipsizeMode="clip" numberOfLines={1} />
                {/* <View style={[styles.punch, NewStyles.border100]} /> */}
            </View>
            <View style={[NewStyles.rowWrapper, { width: '100%', paddingHorizontal: '5%' }]}>
                <Text style={NewStyles.text3}>{item?.discount_percent} درصد تخفیف</Text>
                <View style={NewStyles.row}>
                    <Text style={NewStyles.text}>اطلاعات بیشتر</Text>
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
        alignSelf: 'center',
        width: '95%',
        borderBottomWidth: 1,
        borderBottomColor: Platform.OS == 'android' ? themeColor3.bgColor(1) : themeColor3.bgColor(0.5),
        borderStyle: Platform.OS == 'android' ? 'dashed' : 'solid',
    },
})