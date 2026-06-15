import { View, Text } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useDispatch, useSelector } from 'react-redux';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor5, themeColor6 } from '../theme/Color';
import { disableDateAndTime, toggleUrgent } from '../slices/stepSlice';

export default function Urgent({ step, data }) {

    const dispatch = useDispatch();
    const isUrgent = useSelector(state => state.step?.isUrgent);

    return (
        <View style={NewStyles.seperator1}>
            <View style={[NewStyles.row, { gap: 5 }]}>
                <Ionicons name={data?.icon_name} size={24} color={themeColor0.bgColor(1)} />
                <Text style={NewStyles.title}>{data?.title} {data?.is_required == 1 && <View style={[{backgroundColor: themeColor6.bgColor(1), paddingHorizontal: 5 }, NewStyles.border5]}><Text style={NewStyles.text4}>الزامی</Text></View>}</Text>
            </View>
            {data?.des && <View style={{ backgroundColor: themeColor1.bgColor(1), padding: 10, ...NewStyles.border5 }}><Text style={NewStyles.text10}>{data?.des}</Text></View>}
            <BouncyCheckbox
                size={25}
                fillColor={themeColor0.bgColor(1)}
                unFillColor={themeColor5.bgColor(1)}
                iconStyle={{ borderColor: themeColor0.bgColor(1) }}
                innerIconStyle={{ borderWidth: 1 }}
                textStyle={[NewStyles.text3, { textDecorationLine: 'none' }]}
                text={'درخواست من را فوراً انجام دهید.'}
                isChecked={isUrgent > 0}
                onPress={() => {
                    dispatch(toggleUrgent());
                    dispatch(disableDateAndTime({ step }));
                }}
            />
        </View>
    )
}