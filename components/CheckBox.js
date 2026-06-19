import { View, Text, FlatList, Pressable, TouchableOpacity, Image, Platform } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useDispatch } from 'react-redux';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor4, themeColor5, themeColor6 } from '../theme/Color';
import { decrement, increment, updateCheckbox } from '../slices/stepSlice';
import { formatPrice } from '../helpers/Common';
import { imageUri } from '../services/URL';

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
console.log(data?.field_details?.length);

    const renderCounter = (item) => (
        <View style={NewStyles.rowWrapper}>
            {renderPrice(item)}
            <View style={{ flex: 1 }}>
                <View style={[NewStyles.rowWrapper, { width: 100 }]}>
                    <Pressable style={NewStyles.add} onPress={() => { dispatch(increment({ fieldId: data?.id, fieldDetailId: item.id, step })); }}>
                        <Ionicons name='add' size={24} color={themeColor4.bgColor(1)} />
                    </Pressable>
                    <Text style={[NewStyles.text10, { textAlign: 'center' }]}>{item.value}</Text>
                    <Pressable style={NewStyles.remove} onPress={() => { if (item.value > 0) { dispatch(decrement({ fieldId: data?.id, fieldDetailId: item.id, step })); } }} >
                        <Ionicons name='remove' size={24} color={themeColor0.bgColor(1)} />
                    </Pressable>
                </View>
            </View>
        </View>
    );

    return (
        <View style={NewStyles.seperator1}>

            <Pressable style={[{ backgroundColor: themeColor0.bgColor(1), paddingVertical: 10, ...NewStyles.border10, ...NewStyles.center }]} onPress={() => { setShow(pre => !pre) }}>
                <View style={[NewStyles.row, { gap: 10 }]}>
                    {data?.icon_name && <View style={{ flex: 1 }}><Ionicons name={data?.icon_name} size={24} color={themeColor4.bgColor(1)} /></View>}
                    <Text style={[NewStyles.title4, { flex: 1, textAlign: data?.icon_name ? 'right' : 'center' }]}>{data?.title} {data?.is_required == 1 && <Text style={NewStyles.title6}>*</Text>}</Text>
                </View>
                <Ionicons name={'chevron-down'} color={themeColor1.bgColor(1)} size={20} />
            </Pressable>
            {show && data?.des && <View style={{ backgroundColor: themeColor1.bgColor(1), padding: 10, ...NewStyles.border5 }}>
                <Text style={NewStyles.text10}>{data?.des}</Text>
            </View>}
            {show && <FlatList
                style={{ gap: 20 }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id?.toString()}
                data={data?.field_details}
                contentContainerStyle={[Platform.OS==='web' &&{gap:20}]}
                renderItem={({ item }) =>
                    <View style={{ gap: 10 }}>

                        <TouchableOpacity onPress={() => {
                            dispatch(updateCheckbox({ fieldId: data?.id, fieldDetailId: item.id, step }))
                        }} style={[{ backgroundColor: themeColor4.bgColor(1), padding: 10, ...NewStyles.border5, ...NewStyles.row, gap: 10  }, item?.value > 0 && { backgroundColor: themeColor0.bgColor(1) }]}>
                            {
                                item?.image_path &&

                                <View style={[{ height: 60, width: 60, backgroundColor: themeColor4.bgColor(1), borderWidth: 3, borderColor: themeColor1.bgColor(1) }, NewStyles.border100, NewStyles.center]}>
                                    <Image
                                        source={{ uri: `${imageUri}/${item?.image_path}` }}
                                        style={[{ height: 50, width: 50, resizeMode: 'contain', backgroundColor: themeColor4.bgColor(1) }, NewStyles.border100]}
                                    />
                                </View>
                            }
                            <Text style={[NewStyles.text10, item?.value > 0 && NewStyles.text4]}>{item.title}</Text>
                        </TouchableOpacity>
                        {item?.value &&
                            item.has_counter == 1 ? renderCounter(item) : renderPrice(item)}
                        {item?.des ? <View style={{ backgroundColor: themeColor1.bgColor(1), padding: 10, ...NewStyles.border5 }}><Text style={NewStyles.text10}>{item?.des}</Text></View> : null}
                    </View>
                }
            />}
        </View>
    )
}