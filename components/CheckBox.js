import { View, Text, FlatList, Pressable, TouchableOpacity, Image, Platform, TextInput } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useDispatch } from 'react-redux';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor3, themeColor4, themeColor5, themeColor6, themeColor8 } from '../theme/Color';
import { decrement, increment, setCounterInputValue, updateCheckbox } from '../slices/stepSlice';
import { formatPrice } from '../helpers/Common';
import { imageUri } from '../services/URL';
import { LinearGradient } from 'expo-linear-gradient';
import HintBadge from './HintBadge';

export default function CheckBox({ step, data }) {

    const dispatch = useDispatch();
    const [show, setShow] = useState(false)
    const renderPrice = (item) => {
        if (item.price > 0 && item.show_price == 1 && item?.value) {
            const total = item.has_counter ? item.price * item.value : item.price;
            return (
                <Text style={NewStyles.text}>+ {formatPrice(total)} تومان</Text>
            );
        }
        return null;
    };

    const renderCounter = (item) => (
        <View style={[NewStyles.rowWrapper, { alignSelf: 'flex-start' }]}>
            {renderPrice(item)}
            <View style={[NewStyles.rowWrapper, { width: 120, borderWidth: 1, borderColor: themeColor0.bgColor(1), padding: 5 }, NewStyles.border5]}>
                <Pressable onPress={() => { dispatch(increment({ fieldId: data?.id, fieldDetailId: item.id, step })) }}
                    style={NewStyles.add}>
                    <Ionicons name='add' size={24} color={themeColor4.bgColor(1)} />
                </Pressable>
                <View style={[{ borderWidth: 1, borderColor: themeColor0.bgColor(1), paddingHorizontal: 10 }, NewStyles.border5]}>
                    <Text style={[NewStyles.title10, { textAlign: 'center' }]}>{item.value}</Text>
                </View>
                <Pressable onPress={() => { if (item.value > 0) { dispatch(decrement({ fieldId: data?.id, fieldDetailId: item.id, step })) } }} style={NewStyles.remove}>
                    <Ionicons name='remove' size={24} color={themeColor0.bgColor(1)} />
                </Pressable>
            </View>
        </View>
    );

    return (
        <View style={NewStyles.seperator1}>

            <Pressable style={[{ backgroundColor: themeColor0.bgColor(1), paddingVertical: 10, ...NewStyles.border10, ...NewStyles.center }]} onPress={() => { setShow(pre => !pre) }}>
                <View style={[NewStyles.row, { gap: 10 }]}>
                    {data?.icon_name &&
                        <Image
                            source={{ uri: `${imageUri}/${data?.icon_name}` }}
                            style={{ height: 70, width: 70, resizeMode: 'contain' }}
                        />
                    }
                    <Text style={NewStyles.title4}> {data?.title} {data?.is_required == 1 && <Text style={NewStyles.title6}>*</Text>}</Text>
                </View>
                <Ionicons name={'chevron-down'} color={themeColor1.bgColor(1)} size={20} />
            </Pressable>
            {(data?.des && show) &&
                <LinearGradient colors={[themeColor4.bgColor(1), themeColor3.bgColor(1)]} style={[{ alignSelf: 'center', backgroundColor: themeColor3.bgColor(1), paddingHorizontal: 40, paddingVertical: 10, borderWidth: 1, borderColor: themeColor4.bgColor(1), gap: 5, maxWidth: '100%' }, NewStyles.border10, NewStyles.row]}>
                    <Ionicons
                        name={'help-circle-outline'}
                        size={20}
                        color={themeColor10.bgColor(1)}
                    />
                    <Text style={[NewStyles.title10, { fontSize: 12 }]}>{data?.des}</Text>
                </LinearGradient>
            }
            {show && <FlatList
                style={{ gap: 20 }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id?.toString()}
                data={data?.field_details}
                contentContainerStyle={[Platform.OS === 'web' && { gap: 20 }]}
                renderItem={({ item }) =>
                    <LinearGradient colors={item.has_counter == 1 ? [themeColor4.bgColor(1), themeColor8.bgColor(0.5)] : [themeColor4.bgColor(1), themeColor4.bgColor(1)]} style={[{ gap: 10 }, item.has_counter == 1 && { backgroundColor: themeColor4.bgColor(1), padding: 10, borderRadius: 10, borderColor: themeColor8.bgColor(1), borderWidth: 1 }]}>

                        <TouchableOpacity activeOpacity={item?.has_counter == 1 ? 1 : 0.2} onPress={() => {
                            if (item?.has_counter != 1) {

                                dispatch(updateCheckbox({ fieldId: data?.id, fieldDetailId: item.id, step }))
                            }
                        }} style={[{ backgroundColor: themeColor4.bgColor(item?.has_counter == '1' ? 0 : 1), padding: 10, ...NewStyles.border5, ...NewStyles.row, gap: 10 }, (item?.value > 0 && item?.has_counter != 1) && { backgroundColor: themeColor0.bgColor(1) }]}>
                            {
                                item?.image_path &&

                                <View style={[{ height: 60, width: 60, backgroundColor: themeColor4.bgColor(1), borderWidth: 3, borderColor: themeColor1.bgColor(1) }, NewStyles.border100, NewStyles.center, item?.has_counter == 1 && { height: 100, width: 100, borderWidth: 0, borderRadius: 0 }]}>
                                    <Image
                                        source={{ uri: `${imageUri}/${item?.image_path}` }}
                                        style={[{ height: 50, width: 50, resizeMode: 'contain', backgroundColor: themeColor4.bgColor(1) }, NewStyles.border100, item?.has_counter == 1 && { height: 100, width: 100, borderWidth: 0, borderRadius: 0 }]}
                                    />
                                </View>
                            }
                            <Text style={[NewStyles.text10, (item?.value > 0 && item?.has_counter != 1) && NewStyles.text4]}>{item.title}</Text>
                            <HintBadge hint={item?.des} title={item?.title} size={22} />
                        </TouchableOpacity>
                        {
                            item.has_counter == 1 ? renderCounter(item) : renderPrice(item)}
                        {
                            data?.has_user_descriptions == 1 &&
                            <View style={{}}>
                                <View style={[NewStyles.row]}>
                                    <Text style={[NewStyles.text, { flex: 1 }]}>توضیحات </Text>
                                </View>
                                <View style={[NewStyles.textInput, NewStyles.row, NewStyles.border10, { gap: 5, paddingVertical: 0, backgroundColor: themeColor4.bgColor(1), borderWidth: 2, borderColor: themeColor8.bgColor(1), borderStyle: 'dotted' }]}>
                                    <TextInput style={[NewStyles.text10, { flex: 1, }]} multiline textAlignVertical='top' verticalAlign='top' keyboardType='default' maxLength={191} value={item?.user_descriptions} onChangeText={(text) => { dispatch(setCounterInputValue({ fieldId: data?.id, fieldDetailId: item.id, value: text, step })) }} />
                                </View>
                            </View>
                        }
                    </LinearGradient>
                }
            />}
        </View>
    )
}