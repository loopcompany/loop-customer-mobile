import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor3, themeColor4, themeColor6 } from '../theme/Color';
import { getNext20DaysJalaali } from '../helpers/Common';
import { selectDate, setGeneralData } from '../slices/stepSlice';

export default function Date({ step, data }) {

    const dispatch = useDispatch();
    const days = getNext20DaysJalaali();
    const date = useSelector(state => state.step?.date);

    return (
        <View style={NewStyles.seperator1}>
            <View style={[NewStyles.row, { gap: 5 }]}>
                <Ionicons name={data?.icon_name} size={24} color={themeColor0.bgColor(1)} />
                <Text style={NewStyles.title}>{data?.title} {data?.is_required == 1 && <View style={[{backgroundColor: themeColor6.bgColor(1), paddingHorizontal: 5 }, NewStyles.border5]}><Text style={NewStyles.text4}>الزامی</Text></View>}</Text>
            </View>
            {data?.des && <Text style={NewStyles.text3}>{data?.des}</Text>}
            <FlatList
                contentContainerStyle={{ gap: 10 }}
                horizontal inverted showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id?.toString()}
                data={days}
                renderItem={({ item }) => {
                    const activeItem = item?.value == date;
                    return (
                        <Pressable style={[NewStyles.center, styles.dateItem, NewStyles.border10, activeItem && { backgroundColor: themeColor0.bgColor(1) }]} onPress={() => { dispatch(selectDate(item.value)); dispatch(setGeneralData({ fieldId: data?.id, value: 1, step })) }}>
                            <Text style={[NewStyles.text3, activeItem && { color: themeColor4.bgColor(1) }]}>{item.weekday}</Text>
                            <Text style={[NewStyles.text3, activeItem && { color: themeColor4.bgColor(1) }]}>{item.date}</Text>
                        </Pressable>
                    )
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    dateItem: {
        padding: 10,
        backgroundColor: themeColor3.bgColor(0.1),
    },
})