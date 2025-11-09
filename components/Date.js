import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor6 } from '../theme/Color';
import { getNext20DaysJalaali } from '../helpers/Common';
import { selectDate, setGeneralData, updateServiceScheduleField } from '../slices/stepSlice';
import { useState } from 'react';

export default function Date({ step, data, isServiceSchedule }) {

    console.log('🎨 [Date] کامپوننت رندر شد:', {
        step,
        fieldId: data?.id,
        title: data?.title,
        isServiceSchedule,
        currentValue: data?.value
    });

    const dispatch = useDispatch();
    const days = getNext20DaysJalaali();
    const date = useSelector(state => state.step?.date);
    const [show, setShow] = useState(false);
    
    // اگر در service_schedule هستیم، از value فیلد استفاده کنیم
    const selectedValue = isServiceSchedule ? data?.value : date;
    
    console.log('📊 [Date] selectedValue:', selectedValue, 'از', isServiceSchedule ? 'data.value' : 'redux.date');
    
    const handleDateSelect = (dateValue) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📅 [Date] کلیک روی تاریخ:', dateValue);
        console.log('📋 [Date] اطلاعات:', {
            step,
            fieldId: data?.id,
            isServiceSchedule,
            title: data?.title
        });
        
        // همیشه تاریخ کلی رو set کن
        console.log('🔄 [Date] dispatch selectDate...');
        dispatch(selectDate(dateValue));
        
        if (isServiceSchedule) {
            // برای service_schedule از action جدید استفاده کن
            console.log('🔄 [Date] در service_schedule - استفاده از updateServiceScheduleField');
            console.log('📤 [Date] payload:', { step, fieldId: data?.id, value: dateValue });
            dispatch(updateServiceScheduleField({ 
                step, 
                fieldId: data?.id, 
                value: dateValue 
            }));
            console.log('✅ [Date] updateServiceScheduleField dispatch شد');
        } else {
            // برای فیلدهای عادی از setGeneralData استفاده کن
            console.log('🔄 [Date] فیلد عادی - استفاده از setGeneralData');
            dispatch(setGeneralData({ fieldId: data?.id, value: 1, step }));
        }
        
        console.log('✅ [Date] تاریخ ذخیره شد');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    };
    
    // اگر در service_schedule هستیم، فقط لیست تاریخ‌ها رو نمایش بده (بدون header)
    if (isServiceSchedule) {
        console.log('🎨 [Date] رندر حالت service_schedule (بدون header)');
        return (
            <View style={{ gap: 10 }}>
                <Text style={[NewStyles.text, { fontFamily: 'VazirBold', marginHorizontal: 10 }]}>
                    {data?.title}
                </Text>
                <FlatList
                    contentContainerStyle={{ gap: 10, paddingHorizontal: 5 }}
                    horizontal inverted showsHorizontalScrollIndicator={false}
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