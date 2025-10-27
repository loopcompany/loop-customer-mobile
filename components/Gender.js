import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor4, themeColor6 } from '../theme/Color';
import { decrementfemaleCount, decrementGenderData, decrementMaleCount, decrementUnspecifiedCount, incrementfemaleCount, incrementGenderData, incrementMaleCount, incrementUnspecifiedCount } from '../slices/stepSlice';

export default function Gender({ step, data }) {

    const dispatch = useDispatch();
    const femaleCount = useSelector(state => state.step?.femaleCount);
    const maleCount = useSelector(state => state.step?.maleCount);
    const unspecifiedCount = useSelector(state => state.step?.unspecifiedCount);

    return (
        <View style={NewStyles.seperator1}>
            <View style={[NewStyles.row, { gap: 5 }]}>
                <Ionicons name={data?.icon_name} size={24} color={themeColor0.bgColor(1)} />
                <Text style={NewStyles.title}>{data?.title} {data?.is_required == 1 && <View style={[{backgroundColor: themeColor6.bgColor(1), paddingHorizontal: 5 }, NewStyles.border5]}><Text style={NewStyles.text4}>الزامی</Text></View>}</Text>
            </View>
            {data?.des && <Text style={NewStyles.text3}>{data?.des}</Text>}
            <View style={NewStyles.rowWrapper}>
                <Text style={NewStyles.text3}>متخصص آقا</Text>
                <View style={[NewStyles.rowWrapper, { width: 100 }]}>
                    <Pressable onPress={() => { dispatch(incrementMaleCount()); dispatch(incrementGenderData({ fieldId: data?.id, step })); }}
                        style={NewStyles.add}>
                        <Ionicons name='add' size={24} color={themeColor4.bgColor(1)} />
                    </Pressable>
                    <Text style={[NewStyles.text3, { textAlign: 'center' }]}>{maleCount}</Text>
                    <Pressable onPress={() => { if (maleCount > 0) { dispatch(decrementMaleCount()); dispatch(decrementGenderData({ fieldId: data?.id, step })); } }} style={NewStyles.remove}>
                        <Ionicons name='remove' size={24} color={themeColor0.bgColor(1)} />
                    </Pressable>
                </View>
            </View>
            <View style={NewStyles.rowWrapper}>
                <Text style={NewStyles.text3}>متخصص خانم</Text>
                <View style={[NewStyles.rowWrapper, { width: 100 }]}>
                    <Pressable onPress={() => { dispatch(incrementfemaleCount()); dispatch(incrementGenderData({ fieldId: data?.id, step })); }}
                        style={NewStyles.add}>
                        <Ionicons name='add' size={24} color={themeColor4.bgColor(1)} />
                    </Pressable>
                    <Text style={[NewStyles.text3, { textAlign: 'center' }]}>{femaleCount}</Text>
                    <Pressable onPress={() => { if (femaleCount > 0) { dispatch(decrementfemaleCount()); dispatch(decrementGenderData({ fieldId: data?.id, step })); } }} style={NewStyles.remove}>
                        <Ionicons name='remove' size={24} color={themeColor0.bgColor(1)} />
                    </Pressable>
                </View>
            </View>
            <View style={NewStyles.rowWrapper}>
                <Text style={NewStyles.text3}>فرقی نمیکند</Text>
                <View style={[NewStyles.rowWrapper, { width: 100 }]}>
                    <Pressable onPress={() => { dispatch(incrementUnspecifiedCount()); dispatch(incrementGenderData({ fieldId: data?.id, step })); }}
                        style={NewStyles.add}>
                        <Ionicons name='add' size={24} color={themeColor4.bgColor(1)} />
                    </Pressable>
                    <Text style={[NewStyles.text3, { textAlign: 'center' }]}>{unspecifiedCount}</Text>
                    <Pressable onPress={() => { if (unspecifiedCount > 0) { dispatch(decrementUnspecifiedCount()); dispatch(decrementGenderData({ fieldId: data?.id, step })); } }} style={NewStyles.remove}>
                        <Ionicons name='remove' size={24} color={themeColor0.bgColor(1)} />
                    </Pressable>
                </View>
            </View>
        </View>
    )
}