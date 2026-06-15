import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor5 } from '../theme/Color';
import { updateRadioButton } from '../slices/stepSlice';
import Date from './Date';
import Time from './Time';
import File from './File';

export default function ServiceSchedule({ step, data }) {
    const dispatch = useDispatch();
    const [show, setShow] = useState(false);

    // لاگ کردن Redux state برای این step
    const stepsState = useSelector(state => state.step);
     

    // پیدا کردن فیلد اصلی (main_selection)
    const mainField = data?.field_details?.find(f => f.id === 'main_selection');
     
    if (mainField) {
        console.log('📋 [ServiceSchedule] mainField options:');
        mainField.options?.forEach(opt => {
            console.log(`   ${opt.value > 0 ? '✅' : '⭕'} ${opt.id}: value=${opt.value}, title=${opt.title}`);
        });
    }
    
    // پیدا کردن گزینه انتخاب شده
    const selectedOption = mainField?.options?.find(opt => opt.value > 0);
    const selectedMain = selectedOption?.id;

    console.log('✅ [ServiceSchedule] گزینه انتخاب شده:', selectedMain || '❌ هیچی');

    // پیدا کردن فیلدهای شرطی بر اساس انتخاب
    const conditionalFields = data?.field_details?.filter(
        f => f.conditional_on === selectedMain
    ) || [];

    console.log('📱 [ServiceSchedule] تعداد فیلدهای شرطی:', conditionalFields.length);
    if (conditionalFields.length > 0) {
        console.log('📋 [ServiceSchedule] لیست فیلدهای شرطی:');
        conditionalFields.forEach(f => {
            const valueInfo = f.value ? `value="${f.value}"` : 'value=خالی';
            const optionsInfo = f.options ? `options=${f.options.length}` : '';
            console.log(`   - ${f.id} (type: ${f.type}, ${valueInfo}, ${optionsInfo})`);
        });
    } else if (selectedMain) {
        console.log('⚠️ [ServiceSchedule] هیچ فیلد شرطی برای', selectedMain, 'یافت نشد!');
        console.log('⚠️ [ServiceSchedule] همه field_details:');
        data?.field_details?.forEach(f => {
            console.log(`   - ${f.id}: conditional_on="${f.conditional_on}"`);
        });
    } 

    if (!data) {
        console.log('❌ [ServiceSchedule] data وجود ندارد');
        return null;
    }

    if (!mainField) {
        console.log('❌ [ServiceSchedule] mainField یافت نشد');
        console.log('📋 [ServiceSchedule] field_details موجود:', data.field_details?.map(f => f.id));
        return (
            <View style={NewStyles.seperator1}>
                <Text style={NewStyles.text}>ساختار داده service_schedule نادرست است</Text>
            </View>
        );
    }

    return (
        <View style={NewStyles.seperator1}>
            {/* Header با آیکون و عنوان */}
            <Pressable 
                style={[NewStyles.center, { 
                    backgroundColor: themeColor0.bgColor(1), 
                    paddingVertical: 10, 
                    ...NewStyles.border10 
                }]} 
                onPress={() => {
                    console.log('🔽 [ServiceSchedule] toggle show:', !show);
                    setShow(pre => !pre);
                }}
            >
                <View style={[NewStyles.row, { gap: 10 }]}>
                    {data?.icon_name && <Ionicons name={data?.icon_name} size={24} color={themeColor4.bgColor(1)} />}
                    <Text style={NewStyles.title4}>{data?.title}</Text>
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
                        console.log('🔘 [ServiceSchedule] Rendering main option:', option.id, 'value:', option.value);
                        return (
                            <TouchableOpacity
                                key={option.id}
                                onPress={() => {
                                    console.log('👆 [ServiceSchedule] کلیک روی main option:', option.id);
                                    console.log('📤 [ServiceSchedule] dispatch با:', { 
                                        fieldId: mainField.id, 
                                        fieldDetailId: option.id, 
                                        step 
                                    });
                                    dispatch(updateRadioButton({ 
                                        fieldId: mainField.id, 
                                        fieldDetailId: option.id, 
                                        step 
                                    }));
                                    console.log('✅ [ServiceSchedule] dispatch انجام شد');
                                }}
                                style={[
                                    { 
                                        backgroundColor: themeColor4.bgColor(1), 
                                        padding: 10, 
                                        ...NewStyles.border5 
                                    }, 
                                    option.value > 0 && { backgroundColor: themeColor0.bgColor(0.2) }
                                ]}
                            >
                                <Text style={NewStyles.text10}>{option.title}</Text>
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
                    <Text style={[NewStyles.text, { 
                        fontFamily: 'VazirBold', 
                        color: themeColor1.bgColor(1),
                        paddingBottom: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: themeColor3.bgColor(0.2)
                    }]}>
                        {selectedMain === 'short_term' ? 'تنظیمات کوتاه مدت' : 'تنظیمات بلند مدت'}
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
                                                console.log('👆 [ServiceSchedule] کلیک روی conditional option:', field.id, '→', option.id);
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
                                                option.value > 0 && { backgroundColor: themeColor0.bgColor(0.2) }
                                            ]}
                                        >
                                            <Text style={NewStyles.text10}>{option.title}</Text>
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
                        
                        console.log('⚠️ [ServiceSchedule] نوع فیلد ناشناخته:', field.type);
                        return null;
                    })}
                </View>
            )}
        </View>
    );
}
