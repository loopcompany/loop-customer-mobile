import { View, Text, FlatList, Pressable } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor4, themeColor6 } from '../theme/Color';
import { decrement, increment } from '../slices/stepSlice';
import { formatPrice } from '../helpers/Common';

export default function Counter({ step, data }) {

    const dispatch = useDispatch();

    const renderPrice = (item) => {
        if (item.price > 0 && item.show_price == 1 && item?.value) {
            const total = item.price * item.value;
            return (
                <Text style={NewStyles.text}>+ {formatPrice(total)} تومان</Text>
            );
        }
        return null;
    };

    return (
        <View style={NewStyles.seperator1}>
            <View style={[NewStyles.row, { gap: 5 }]}>
                <Ionicons name={data?.icon_name} size={24} color={themeColor0.bgColor(1)} />
                <Text style={NewStyles.title}>{data?.title} {data?.is_required == 1 && <View style={[{backgroundColor: themeColor6.bgColor(1), paddingHorizontal: 5 }, NewStyles.border5]}><Text style={NewStyles.text4}>الزامی</Text></View>}</Text>
            </View>
            {data?.des && <Text style={NewStyles.text3}>{data?.des}</Text>}
            <FlatList
                style={{ gap: 20 }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id?.toString()}
                data={data?.field_details}
                renderItem={({ item }) =>
                    <View style={{ gap: 10 }}>
                        <View style={NewStyles.rowWrapper}>
                            <Text style={NewStyles.text3}>{item.title}</Text>
                            <View style={[NewStyles.rowWrapper, { width: 100 }]}>
                                <Pressable onPress={() => { dispatch(increment({ fieldId: data?.id, fieldDetailId: item.id, step })) }}
                                    style={NewStyles.add}>
                                    <Ionicons name='add' size={24} color={themeColor4.bgColor(1)} />
                                </Pressable>
                                <Text style={[NewStyles.text3, { textAlign: 'center' }]}>{item.value}</Text>
                                <Pressable onPress={() => { if (item.value > 0) { dispatch(decrement({ fieldId: data?.id, fieldDetailId: item.id, step })) } }} style={NewStyles.remove}>
                                    <Ionicons name='remove' size={24} color={themeColor0.bgColor(1)} />
                                </Pressable>
                            </View>
                        </View>
                        {renderPrice(item)}
                        {item?.des ? <Text style={NewStyles.text}>{item?.des}</Text> : null}
                    </View>
                }
            />
        </View>
    )
}