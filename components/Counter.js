import { View, Text, FlatList, Pressable, ImageBackground, Platform } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor3, themeColor4, themeColor6 } from '../theme/Color';
import { decrement, increment } from '../slices/stepSlice';
import { formatPrice } from '../helpers/Common';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Counter({ step, data }) {

    const dispatch = useDispatch();
    const is_package = data?.is_package
    const [show, setShow] = useState(true);
    const renderPrice = (item) => {
        if (item.price > 0 && item.show_price == 1 && item?.value) {
            const total = item.price * item.value;
            return (
                <Text style={[NewStyles.text , is_package && NewStyles.title10]}>+ {formatPrice(total)} تومان</Text>
            );
        }
        return null;
    };

    return (
        <View style={NewStyles.seperator1}>
            <Pressable style={[{ backgroundColor: themeColor0.bgColor(1), paddingVertical: 10, ...NewStyles.border10, ...NewStyles.center }]} onPress={() => { setShow(pre => !pre) }}>
                <View style={[NewStyles.row, { gap: 10 }]}>
                    {data?.icon_name && <Ionicons name={data?.icon_name} size={24} color={themeColor4.bgColor(1)} />}
                    <Text style={NewStyles.title4}>{data?.title}</Text>
                </View>
                <Ionicons name={'chevron-down'} color={themeColor1.bgColor(1)} size={20} />
            </Pressable>
            {(data?.des && show) && 
            <LinearGradient colors={[themeColor4.bgColor(1), themeColor3.bgColor(1)]} style={[{alignSelf:'center', backgroundColor: themeColor3.bgColor(1), paddingHorizontal:40, paddingVertical:10, borderWidth:1, borderColor: themeColor4.bgColor(1)}, NewStyles.border10]}>
                <Text style={NewStyles.title10}>{data?.des}</Text>
            </LinearGradient>
            }
            {show && <FlatList
                style={{ gap: 20 }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id?.toString()}
                data={data?.field_details}
                contentContainerStyle={[Platform.OS==='web' &&{gap:20}]}
                renderItem={({ item }) =>
                    <View style={[{ gap: 10 }, is_package == 1 && styles.package]}>
                        {
                            is_package && item?.precentage > 0 &&
                            <ImageBackground style={[{height:65, width: 65,position:'absolute', zIndex:10, top:-15, left:-10}, NewStyles.center]} source={require('../assets/images/star.png')}>
                                <Text style={[NewStyles.title10,{fontSize:14}]}>{item?.precentage}%</Text>
                            </ImageBackground>
                        }
                        <View style={[is_package == 0 && NewStyles.rowWrapper]}>
                            <Text style={[NewStyles.text3, is_package == 1 && NewStyles.title10, { fontSize: 14 }]}>{item.title}</Text>
                            <View style={[NewStyles.rowWrapper, { width: 120 }]}>
                                <Pressable onPress={() => { dispatch(increment({ fieldId: data?.id, fieldDetailId: item.id, step })) }}
                                    style={NewStyles.add}>
                                    <Ionicons name='add' size={24} color={themeColor4.bgColor(1)} />
                                </Pressable>
                                <View style={[is_package == 1 && styles.valueContainer]}>
                                    <Text style={[NewStyles.text3 , is_package == 1 && NewStyles.text10, { textAlign: 'center' }]}>{item.value}</Text>
                                </View>
                                <Pressable onPress={() => { if (item.value > 0) { dispatch(decrement({ fieldId: data?.id, fieldDetailId: item.id, step })) } }} style={NewStyles.remove}>
                                    <Ionicons name='remove' size={24} color={themeColor0.bgColor(1)} />
                                </Pressable>
                            </View>
                        </View>
                        {renderPrice(item)}
                        {item?.des ? <View style={{ backgroundColor: themeColor1.bgColor(1), padding: 10, ...NewStyles.border5 }}><Text style={NewStyles.text10}>{item?.des}</Text></View> : null}
                    </View>
                }
            />}
        </View>
    )
}
const styles = StyleSheet.create({
    package: {
        backgroundColor: themeColor1.bgColor(1),
        padding: 15,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: themeColor10.bgColor(1)
    },
    valueContainer: {
        borderWidth: 1,
        borderColor: themeColor0.bgColor(1),
        height: 40,
        width: 40,
        ...NewStyles.border5,
        ...NewStyles.center
    },
    precentageContainer:{

    }
})