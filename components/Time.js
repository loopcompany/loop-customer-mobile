import { View, Text, FlatList, Pressable, StyleSheet, Image } from 'react-native';
import React, { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor6 } from '@theme/Color';
import { selectTime, setGeneralData } from '@slices/stepSlice';
import { generateTimeSlots } from '@helpers/Common';
import { createStyles } from '@styles/NewStyles';
import { useTranslation } from 'react-i18next';
import { imageUri } from '@services/URL';
import HintBadge from './HintBadge';



export default function Time({ step, data }) {

    const dispatch = useDispatch();
    const category = useSelector(state => state.category?.data);
    const time = useSelector(state => state.step?.time);

    // Safe fallback values
    const startAt = category?.start_at || '09:00';
    const endAt = category?.end_at || '17:00';
    const duration = category?.duration || 60;

    const slots = generateTimeSlots(startAt, endAt, duration);
    const [show, setShow] = useState(false)
    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
    return (
        <View style={NewStyles.seperator1}>
            <Pressable style={[{ backgroundColor: themeColor0.bgColor(1), paddingVertical: 10, ...NewStyles.border10, ...NewStyles.center }]} onPress={() => { setShow(pre => !pre) }}>
                <View style={[NewStyles.row, { gap: 10 }]}>
                    {data?.icon_name &&
                        <Image
                            source={{ uri: `${imageUri}/${data?.icon_name}` }}
                            style={{ height: 45, width: 45, resizeMode: 'contain' }}
                        />
                    }
                    <Text style={NewStyles.title4}> {data?.title} {data?.is_required == 1 && <Text style={NewStyles.title6}>*</Text>}</Text>
                    <HintBadge hint={data?.des} title={data?.title} size={22} />
                </View>
                <Ionicons name={'chevron-down'} color={themeColor1.bgColor(1)} size={20} />
            </Pressable>
            {show && <FlatList
                numColumns={3} columnWrapperStyle={styles.categoriesWrapper}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id?.toString()}
                data={slots}
                renderItem={({ item }) => {
                    const activeItem = (item?.value == time && data?.value);
                    return (
                        <Pressable style={[styles.timeItem, NewStyles.center, NewStyles.border10, activeItem && { backgroundColor: themeColor0.bgColor(1) }]} onPress={() => { dispatch(selectTime(item.value)); dispatch(setGeneralData({ fieldId: data?.id, value: 1, step })) }}>
                            <Text style={[NewStyles.text, activeItem && { color: themeColor4.bgColor(1) }, { fontSize: 12, textAlign: 'center' }]}>{item.value}</Text>
                        </Pressable>
                    )
                }}
            />}
        </View>
    )
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
    categoriesWrapper: {
        ...NewStyles.row,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 10,
        gap: 5
    },

    timeItem: {
        flex: 1,
        minHeight: 50,
        backgroundColor: themeColor3.bgColor(0.1),
        margin: 2,
        paddingHorizontal: 5,
        paddingVertical: 8,
    },
})