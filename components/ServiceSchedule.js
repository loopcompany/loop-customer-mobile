import { View, Text, Pressable, TouchableOpacity, Image } from 'react-native';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';

import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor5 } from '../theme/Color';
import { updateRadioButton } from '../slices/stepSlice';
import Date from './Date';
import Time from './Time';
import File from './File';
import { useTranslation } from 'react-i18next';
import { createStyles } from '../styles/NewStyles';
import { imageUri } from '../services/URL';

export default function ServiceSchedule({ step, data }) { 
    const dispatch = useDispatch();
    const [show, setShow] = useState(false);
    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    // لاگ کردن Redux state برای این step
    const stepsState = useSelector(state => state.step);


    // پیدا کردن فیلد اصلی (main_selection)
    const mainField = data?.field_details?.find(f => f.id === 'main_selection');

    if (mainField) {
        mainField.options?.forEach(opt => {
            console.log(`   ${opt.value > 0 ? '✅' : '⭕'} ${opt.id}: value=${opt.value}, title=${opt.title}`);
        });
    }

    // پیدا کردن گزینه انتخاب شده
    const selectedOption = mainField?.options?.find(opt => opt.value > 0);
    const selectedMain = selectedOption?.id;


    // پیدا کردن فیلدهای شرطی بر اساس انتخاب
    const conditionalFields = data?.field_details?.filter(
        f => f.conditional_on === selectedMain
    ) || [];

    if (conditionalFields.length > 0) {
        conditionalFields.forEach(f => {
            const valueInfo = f.value ? `value="${f.value}"` : 'value=خالی';
            const optionsInfo = f.options ? `options=${f.options.length}` : '';
        });
    } else if (selectedMain) {

    }

    if (!data) {
        return null;
    }

    if (!mainField) {
        return (
            <View style={NewStyles.seperator1}>
                <Text style={NewStyles.text}>ساختار داده service_schedule نادرست است</Text>
            </View>
        );
    }

    return (
        <View style={NewStyles.seperator1}>
            <Pressable
                style={[NewStyles.center, {
                    backgroundColor: themeColor0.bgColor(1),
                    paddingVertical: 10,
                    ...NewStyles.border10
                }]}
                onPress={() => {
                    setShow(pre => !pre);
                }}
            >
                <View style={[NewStyles.row, { gap: 10 }]}>
                    <Image
                        source={{ uri: `${imageUri}/${data?.icon_name}` }}
                        style={{ height: 50, width: 50, resizeMode: 'contain' }}
                    />
                    <Text style={NewStyles.title4}>{data?.title} <Text style={NewStyles.title6}>*</Text></Text>
                </View>
                <Ionicons name={'chevron-down'} color={themeColor1.bgColor(1)} size={20} />
            </Pressable>

            {/* توضیحات */}
            {show && data?.des && (
                <View style={{ backgroundColor: themeColor1.bgColor(1), padding: 10, ...NewStyles.border5 }}>
                    <Text style={NewStyles.text10}>{data?.des}</Text>
                </View>
            )}

            {/* فیلد اصلی - نوع سرویس */}
            {show && mainField && (
                <View style={{ gap: 10, marginTop: 10 }}>
                    <Text style={[NewStyles.text, { fontFamily: 'VazirBold', marginHorizontal: 10 }]}>
                        {mainField.title}
                    </Text>
                    {mainField.options?.map(option => {
                        return (
                            <TouchableOpacity
                                key={option.id}
                                onPress={() => {

                                    dispatch(updateRadioButton({
                                        fieldId: mainField.id,
                                        fieldDetailId: option.id,
                                        step
                                    }));
                                }}
                                style={[
                                    {
                                        backgroundColor: themeColor4.bgColor(1),
                                        padding: 10,
                                        ...NewStyles.border5
                                    },
                                    option.value > 0 && { backgroundColor: themeColor0.bgColor(1) }
                                ]}
                            >
                                <Text style={[NewStyles.text10, option.value > 0 && NewStyles.text4]}>{option.title}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {/* فیلدهای شرطی */}
            {show && selectedMain && conditionalFields.length > 0 && (
                <View style={{
                    backgroundColor: themeColor5.bgColor(0.5),
                    borderRadius: 8,
                    padding: 12,
                    marginTop: 10,
                    gap: 15
                }}>
                    <Text style={[NewStyles.title, {
                        paddingBottom: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: themeColor3.bgColor(0.2)
                    }]}>
                        {selectedMain === 'short_term' ? t("Short term settings") : t("Long term settings")}
                    </Text>

                    {conditionalFields.map(field => {

                        // RadioButton type
                        if (field.type === 'radioButton' && field.options) {
                            return (
                                <View key={field.id} style={{ gap: 10 }}>
                                    <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>
                                        {field.title}
                                    </Text>
                                    {field.options.map(option => (
                                        <TouchableOpacity
                                            key={option.id}
                                            onPress={() => {
                                                dispatch(updateRadioButton({
                                                    fieldId: field.id,
                                                    fieldDetailId: option.id,
                                                    step
                                                }));
                                            }}
                                            style={[
                                                {
                                                    backgroundColor: themeColor4.bgColor(1),
                                                    padding: 10,
                                                    ...NewStyles.border5
                                                },
                                                option.value > 0 && { backgroundColor: themeColor0.bgColor(1) }
                                            ]}
                                        >
                                            <Text style={[NewStyles.text10, option.value > 0 && NewStyles.text4]}>{option.title}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            );
                        }

                        // Date type
                        if (field.type === 'date') {
                            return (
                                <View key={field.id}>
                                    <Date step={step} data={field} isServiceSchedule={true} />
                                </View>
                            );
                        }

                        // Time type
                        if (field.type === 'time') {
                            return (
                                <View key={field.id}>
                                    <Time step={step} data={field} />
                                </View>
                            );
                        }

                        // File type
                        if (field.type === 'file') {
                            return (
                                <View key={field.id}>
                                    <File step={step} data={field} />
                                </View>
                            );
                        }

                        return null;
                    })}
                </View>
            )}
        </View>
    );
}
