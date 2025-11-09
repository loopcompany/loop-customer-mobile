import { View, FlatList, BackHandler, StyleSheet, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';

import { imageUri } from '../../services/URL';
import NewStyles from '../../styles/NewStyles';
import { emptySteps, removeTime } from '../../slices/stepSlice';
import { emptyCategory } from '../../slices/categorySlice';
import { isMoreThan4HoursFromNow, showToastOrAlert } from '../../helpers/Common';
import { themeColor0, themeColor3 } from '../../theme/Color';
import Button from '../../components/Button';
import Description from '../../components/Description';
import CheckBox from '../../components/CheckBox';
import RadioButton from '../../components/RadioButton';
import Counter from '../../components/Counter';
import Note from '../../components/Note';
import File from '../../components/File';
import Address from '../../components/Address';
import Time from '../../components/Time';
import Date from '../../components/Date';
import Urgent from '../../components/Urgent';
import Input from '../../components/Input';
import ProgressBar from '../../components/ProgressBar';
import Gender from '../../components/Gender';
import ServiceSchedule from '../../components/ServiceSchedule';
import { emptyAddress } from '../../slices/addressSlice';
import StepsHeader from '../../components/StepsHeader';

export default function Steps({ navigation }) {

    const dispatch = useDispatch();
    const [step, setStep] = useState(0);
    const steps = useSelector(state => state.step);
    const length = steps?.data?.length;
    const [loading, setLoading] = useState(false);

    // لاگ کردن مراحل بعد از دریافت
    useEffect(() => {
        console.log('🎯 [Steps] کامپوننت Steps لود شد');
        console.log('📋 [Steps] تعداد کل مراحل:', length);
        console.log('📋 [Steps] مرحله فعلی:', step);
        console.log('📦 [Steps] داده‌های کامل مراحل:', JSON.stringify(steps, null, 2));
        
        if (steps?.data && steps.data.length > 0) {
            console.log('📝 [Steps] مرحله اول:', JSON.stringify(steps.data[0], null, 2));
        }
    }, [steps, step, length]);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                dispatch(emptySteps());
                dispatch(emptyCategory());
                dispatch(emptyAddress());
                navigation.goBack();
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove(); // ✅ درست
        }, [])
    );



    function required(step) {
        console.log('━━━━━━━━━ VALIDATION START ━━━━━━━━━');
        console.log('🔍 [Steps.required] بررسی validation برای step:', step);
        console.log('📦 [Steps.required] داده این step:', JSON.stringify(steps.data?.[step], null, 2));
        
        const result = steps.data?.[step].every(item => {
            console.log(`\n🔍 [Steps.required] بررسی item: ${item.type} (id: ${item.id})`);
            console.log(`   is_required: ${item.is_required}`);
            
            if (["date", "time", "address", "gender"].includes(item.type) && item.is_required == 1) {
                const isValid = !!item.value;
                console.log(`   ✓ type: ${item.type}, value: "${item.value}", valid: ${isValid ? '✅' : '❌'}`);
                return isValid;
            }
            if (["checkbox", "radioButton", "counter"].includes(item.type) && item.is_required == 1) {
                const hasValue = item.field_details.some(dataItem => dataItem.value > 0);
                console.log(`   ✓ type: ${item.type}, has value: ${hasValue ? '✅' : '❌'}`);
                if (!hasValue) {
                    console.log(`   ⚠️ field_details:`, item.field_details.map(f => `${f.id}:${f.value}`).join(', '));
                }
                return hasValue;
            }
            if (item.type == "input") {
                const hasEmptyRequired = item.field_details.some(dataItem => dataItem.is_required == 1 && dataItem.value == "");
                console.log(`   ✓ type: input, valid: ${!hasEmptyRequired ? '✅' : '❌'}`);
                return !hasEmptyRequired;
            }
            // Validation برای service_schedule (فقط برای کاربران سازمانی)
            if (item.type == "service_schedule" && item.is_required == 1) {
                console.log('🔍 [Steps.validation] بررسی service_schedule...');
                
                // پیدا کردن فیلد اصلی
                const mainField = item.field_details?.find(f => f.id === 'main_selection');
                const selectedOption = mainField?.options?.find(opt => opt.value > 0);
                
                if (!selectedOption) {
                    console.log('❌ [Steps.validation] service_schedule: انتخاب اصلی (long_term/short_term) نشده');
                    return false; // اگر انتخابی نشده
                }
                
                console.log('✅ [Steps.validation] service_schedule: نوع انتخاب شده:', selectedOption.id);
                
                // بررسی فیلدهای شرطی
                const conditionalFields = item.field_details?.filter(
                    f => f.conditional_on === selectedOption.id
                );
                
                console.log('📋 [Steps.validation] تعداد فیلدهای شرطی:', conditionalFields?.length);
                
                // بررسی که همه فیلدهای شرطی اجباری پر شده باشند
                const isValid = conditionalFields?.every(field => {
                    if (field.type === 'radioButton') {
                        const hasSelection = field.options?.some(opt => opt.value > 0);
                        if (!hasSelection) {
                            console.log(`❌ [Steps.validation] ${field.id} (radioButton): انتخاب نشده`);
                        } else {
                            console.log(`✅ [Steps.validation] ${field.id} (radioButton): انتخاب شده`);
                        }
                        return hasSelection;
                    }
                    if (field.type === 'date') {
                        const hasValue = !!field.value;
                        if (!hasValue) {
                            console.log(`❌ [Steps.validation] ${field.id} (date): خالی است`);
                        } else {
                            console.log(`✅ [Steps.validation] ${field.id} (date): ${field.value}`);
                        }
                        return hasValue; // تاریخ باید انتخاب شده باشد
                    }
                    if (field.type === 'time') {
                        const hasValue = !!field.value;
                        if (!hasValue) {
                            console.log(`❌ [Steps.validation] ${field.id} (time): خالی است`);
                        } else {
                            console.log(`✅ [Steps.validation] ${field.id} (time): ${field.value}`);
                        }
                        return hasValue; // زمان باید انتخاب شده باشد
                    }
                    // file اختیاری است - نیازی به چک نیست
                    if (field.type === 'file') {
                        console.log(`ℹ️ [Steps.validation] ${field.id} (file): اختیاری`);
                        return true;
                    }
                    return true;
                });
                
                if (!isValid) {
                    console.log('❌ [Steps.validation] service_schedule ناقص است');
                } else {
                    console.log('✅ [Steps.validation] service_schedule کامل است');
                }
                
                return isValid;
            }
            
            console.log(`   ✓ type: ${item.type}, no validation needed or not required`);
            return true;
        });
        
        console.log('━━━━━━━━━ VALIDATION RESULT:', result ? '✅ VALID' : '❌ INVALID', '━━━━━━━━━');
        return result;
    }

    const handleNextStep = () => {
        if (!required(step)) {
            const message = 'لطفا فیلدهای الزامی را تکمیل نمایید.';
            showToastOrAlert(message);
            return;
        }
        if (step < length - 1) {
            setStep(currStep => currStep + 1)
        } else if (step == length - 1) {
            navigation.navigate('Preview')
        }
    }

    const selectedDate = useSelector(state => state?.step?.date)
    const selectedTime = useSelector(state => state?.step?.time)
    useEffect(() => {
        if (selectedDate && selectedTime) {
            const result = isMoreThan4HoursFromNow(selectedDate, selectedTime);
            if (!result) {
                dispatch(removeTime());
                showToastOrAlert('ساعت انتخابی به تاریخ امروز باید برای حداقل 4 ساعت آینده باشد.');
            }
        }
    }, [selectedDate, selectedTime]);

    return (
        <View style={NewStyles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" >
                <StepsHeader handleNextStep={() => { handleNextStep() }} handlePreStep={() => { setStep((currStep) => currStep - 1); }} showPre={step != 0} />
                {/* <ProgressBar step={step} /> */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
                    <FlatList
                        contentContainerStyle={styles.flatListContainer}
                        showsVerticalScrollIndicator={false} scrollEnabled={false}
                        data={steps?.data?.[step]}
                        keyExtractor={(item) => item?.id?.toString()}
                        renderItem={({ item }) => {
                            console.log('🎯 [Steps.renderItem] رندر item:', item?.id, 'type:', item?.type);
                            
                            const isUrgentActive = steps?.isUrgent === 1;
                            if (isUrgentActive && (item.type === 'date' || item.type === 'time')) {
                                return null;
                            }
                            
                            if (item?.type === 'service_schedule') {
                                console.log('✅ [Steps.renderItem] service_schedule یافت شد! رندر ServiceSchedule...');
                            }
                            
                            return (
                                <View >
                                    {(item?.type == 'image') && <Image style={{ width: '100%', height: 250 }} source={{ uri: `${imageUri}/${item?.image_path}` }} />}
                                    {(item?.type == 'description') && <Description data={item} />}
                                    {(item?.type == 'service_schedule') && <ServiceSchedule step={step} data={item} />}
                                    {(item?.type == 'checkbox') && <CheckBox step={step} data={item} />}
                                    {(item?.type == 'radioButton') && <RadioButton step={step} data={item} setLoading={setLoading} />}
                                    {(item?.type == 'counter') && <Counter step={step} data={item} />}
                                    {(item?.type == 'input') && <Input step={step} data={item} />}
                                    {(item?.type == 'urgent') && <Urgent step={step} data={item} />}
                                    {(item?.type == 'date') && <Date step={step} data={item} />}
                                    {(item?.type == 'gender') && <Gender step={step} data={item} />}
                                    {(item?.type == 'time') && <Time step={step} data={item} />}
                                    {(item?.type == 'address') && <Address step={step} data={item} navigation={navigation} />}
                                    {(item?.type == 'note') && <Note step={step} data={item} />}
                                    {(item?.type == 'file') && <File step={step} data={item} />}
                                </View>
                            )
                        }}
                    />
                </ScrollView>

                {/* <View style={[NewStyles.row, NewStyles.nav, NewStyles.shadow]}>
                    <View style={{ flex: 1 }}>
                        <Button title={'مرحله بعد'} loading={step == steps?.data?.length || loading} onPress={() => handleNextStep()} />
                    </View>
                    {step != 0 && <View style={{ flex: 1 }}>
                        <Button title={'مرحله قبل'} loading={step == steps?.data?.length} onPress={() => { setStep((currStep) => currStep - 1); }} />
                    </View>}
                </View> */}
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    flatListContainer: {
        gap: 20,
    },

    separator: {
        borderBottomWidth: 5,
        borderBottomColor: themeColor0.bgColor(0.1),
    },
})