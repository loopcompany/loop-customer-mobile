import { View, Text, FlatList, Pressable } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useDispatch } from 'react-redux';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor4, themeColor5, themeColor6 } from '../theme/Color';
import { decrement, increment, updateCheckbox } from '../slices/stepSlice';
import { formatPrice } from '../helpers/Common';

export default function CheckBox({ step, data }) {

    const dispatch = useDispatch();

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
                        <BouncyCheckbox
                            size={25}
                            fillColor={themeColor0.bgColor(1)}
                            unFillColor={themeColor5.bgColor(1)}
                            iconStyle={{ borderColor: themeColor0.bgColor(1) }}
                            innerIconStyle={{ borderWidth: 1 }}
                            textStyle={[NewStyles.text3, { textDecorationLine: 'none' }]}
                            text={item.title}
                            isChecked={() => item?.value > 0}
                            onPress={() => {
                                dispatch(updateCheckbox({ fieldId: data?.id, fieldDetailId: item.id, step }))
                            }}
                        />
                        {item?.value &&
                            item.has_counter == 1 ? renderCounter(item) : renderPrice(item)}
                        {item?.des ? <Text style={NewStyles.text}>{item?.des}</Text> : null}
                    </View>
                }
            />
        </View>
    )
}