import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor6 } from '../theme/Color';
import { getNext20DaysJalaali } from '../helpers/Common';
import { selectDate, setGeneralData } from '../slices/stepSlice';
import { useState } from 'react';

export default function Date({ step, data }) {

    const dispatch = useDispatch();
    const days = getNext20DaysJalaali();
    const date = useSelector(state => state.step?.date);
    const [show, setShow] = useState(false)
    return (
        <View style={NewStyles.seperator1}>
            <Pressable style={[{ backgroundColor: themeColor0.bgColor(1), paddingVertical: 10, ...NewStyles.border10, ...NewStyles.center }]} onPress={() => { setShow(pre => !pre) }}>
                <View style={[NewStyles.row, { gap: 10 }]}>
                    {data?.icon_name && <Ionicons name={data?.icon_name} size={24} color={themeColor4.bgColor(1)} />}
                    <Text style={NewStyles.title4}>{data?.title}</Text>
                </View>
                <Ionicons name={'chevron-down'} color={themeColor1.bgColor(1)} size={20} />
            </Pressable>
            {show && data?.des && <View style={{ backgroundColor: themeColor1.bgColor(1), padding: 10, ...NewStyles.border5 }}>
                    <Text style={NewStyles.text10}>{data?.des}</Text>
                </View>}
            {show && <FlatList
                contentContainerStyle={{ gap: 10 }}
                horizontal inverted showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id?.toString()}
                data={days}
                renderItem={({ item }) => {
                    const activeItem = item?.value == date;
                    return (
                        <Pressable style={[NewStyles.center, styles.dateItem, NewStyles.border10, activeItem && { backgroundColor: themeColor0.bgColor(1) }]} onPress={() => { dispatch(selectDate(item.value)); dispatch(setGeneralData({ fieldId: data?.id, value: 1, step })) }}>
                            <Text style={[NewStyles.text, activeItem && { color: themeColor4.bgColor(1) }]}>{item.weekday}</Text>
                            <Text style={[NewStyles.text, activeItem && { color: themeColor4.bgColor(1) }]}>{item.date}</Text>
                        </Pressable>
                    )
                }}
            />}
        </View>
    )
}

const styles = StyleSheet.create({
    dateItem: {
        padding: 10,
        backgroundColor: themeColor3.bgColor(0.1),
    },
})