import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { createStyles } from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor6 } from '../theme/Color';
import { getNext20DaysJalaali, langIsRTL } from '../helpers/Common';
import { selectDate, setGeneralData, updateServiceScheduleField } from '../slices/stepSlice';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Date({ step, data, isServiceSchedule }) {



    const dispatch = useDispatch();
    const days = getNext20DaysJalaali();
    const date = useSelector(state => state.step?.date);
    const [show, setShow] = useState(false);

    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const selectedValue = isServiceSchedule ? data?.value : date;
 

    const handleDateSelect = (dateValue) => {

        dispatch(selectDate(dateValue));

        if (isServiceSchedule) {
            dispatch(updateServiceScheduleField({
                step,
                fieldId: data?.id,
                value: dateValue
            }));
        } else {
            dispatch(setGeneralData({ fieldId: data?.id, value: 1, step }));
        }
    };

    // اگر در service_schedule هستیم، فقط لیست تاریخ‌ها رو نمایش بده (بدون header)
    if (isServiceSchedule) {
        return (
            <View style={{ gap: 10 }}>
                <Text style={[NewStyles.text, { fontFamily: 'VazirBold', marginHorizontal: 10 }]}>
                    {data?.title}
                </Text>
                <FlatList
                    contentContainerStyle={{ gap: 10, paddingHorizontal: 5 }}
                    horizontal inverted={langIsRTL(lang)} showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id?.toString()}
                    data={days}
                    renderItem={({ item }) => {
                        const activeItem = item?.value == selectedValue;
                        return (
                            <Pressable
                                style={[
                                    NewStyles.center,
                                    styles.dateItem,
                                    NewStyles.border10,
                                    activeItem && { backgroundColor: themeColor0.bgColor(1) }
                                ]}
                                onPress={() => handleDateSelect(item.value)}
                            >
                                <Text style={[NewStyles.text, activeItem && { color: themeColor4.bgColor(1) }]}>
                                    {item.weekday}
                                </Text>
                                <Text style={[NewStyles.text, activeItem && { color: themeColor4.bgColor(1) }]}>
                                    {item.date}
                                </Text>
                            </Pressable>
                        );
                    }}
                />
            </View>
        );
    }

    // حالت عادی با header
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
                    const activeItem = item?.value == selectedValue;
                    return (
                        <Pressable style={[NewStyles.center, styles.dateItem, NewStyles.border10, activeItem && { backgroundColor: themeColor0.bgColor(1) }]} onPress={() => handleDateSelect(item.value)}>
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