import { View, FlatList, BackHandler, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';

import { imageUri } from '@services/URL';
import NewStyles from '@styles/NewStyles';
import { emptySteps, removeTime, fetchSteps } from '@slices/stepSlice';
import { emptyCategory } from '@slices/categorySlice';
import { isMoreThan4HoursFromNow, showToastOrAlert } from '@helpers/Common';
import { themeColor0, themeColor3 } from '@theme/Color';
import Button from '@components/Button';
import Description from '@components/Description';
import CheckBox from '@components/CheckBox';
import RadioButton from '@components/RadioButton';
import Counter from '@components/Counter';
import Note from '@components/Note';
import Address from '@components/Address';
import Time from '@components/Time';
import Date from '@components/Date';
import Urgent from '@components/Urgent';
import Input from '@components/Input';
import ProgressBar from '@components/ProgressBar';
import Gender from '@components/Gender';
import ServiceSchedule from '@components/ServiceSchedule';
import { emptyAddress } from '@slices/addressSlice';
import StepsHeader from '@components/StepsHeader';
import FileStep from '@components/File';
function Steps({ navigation, route }) {

    const dispatch = useDispatch();
    const [step, setStep] = useState(0);
    const steps = useSelector(state => state.step);
    const length = steps?.data?.length;
    const [loading, setLoading] = useState(false);
    const selectedDate = useSelector(state => state?.step?.date)
    const selectedTime = useSelector(state => state?.step?.time)
    const [timeValidationError, setTimeValidationError] = useState(false);
    // دریافت categoryId از route params
    const categoryId = route?.params?.categoryId;
    const categoryTitle = route?.params?.categoryTitle;
    const token = useSelector(state => state?.auth?.token);
    const userType = useSelector(state => state?.auth?.userType);

    // کاربر سازمانی برای دسته‌هایی که مسیر مستندشده‌ی «انتخاب سیستماتیک» دارند باید
    // همان stepper مستند (org/SystematicDeviceScreen) را ببیند، نه مراحل API که برای
    // کاربر فردی تعریف شده‌اند. این گارد ورودهای قدیمی به این صفحه را هم پوشش می‌دهد:
    // کاشی FolderScreen، SubCategories و باز کردن مستقیم /steps در وب.
    // کاربر فردی دست‌نخورده باقی می‌ماند و همان مراحل API را می‌بیند.
    const systematicRedirect = useMemo(() => {
        if (userType !== 'organization' || !categoryId) return null;
        // lazy require تا کاربر فردی هزینه‌ی بارگذاری کاتالوگ آیکون‌های سازمانی را ندهد
        const { resolveSystematicCategoryId, getFlow } = require('@org/systematicFlows');
        const systematicId = resolveSystematicCategoryId({ id: categoryId, title: categoryTitle });
        return systematicId && getFlow(systematicId).length ? systematicId : null;
    }, [userType, categoryId, categoryTitle]);

    useEffect(() => {
        if (!systematicRedirect) return;
        const go = navigation.replace || navigation.navigate;
        go.call(navigation, 'SystematicDeviceScreen', {
            categoryId: systematicRedirect,
            categoryTitle,
        });
    }, [systematicRedirect, categoryTitle, navigation]);

    // بازیابی داده‌ها در صورت ریلود صفحه در وب
    useEffect(() => {
        if (systematicRedirect) return;

        // اگر در وب هستیم و داده‌ها خالی است (بعد از ریلود)، دوباره fetchSteps را صدا بزنیم
        if (Platform.OS === 'web' && (!steps?.data || steps.data.length === 0) && categoryId) {
            dispatch(fetchSteps({categoryId, token}));
        }

        if (steps?.data && steps.data.length > 0) {
            // console.log('📝 [Steps] مرحله اول:', JSON.stringify(steps.data[0], null, 2));
        }
    }, [categoryId]);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                dispatch(emptySteps());
                dispatch(emptyCategory());
                dispatch(emptyAddress());
                if (Platform.OS == 'web') {
                    window.history.back()
                } else {
                    navigation.goBack()
                }
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove(); // ✅ درست
        }, [])
    );



    function required(step) {

        const result = steps.data?.[step].every(item => {

            if (["date", "time", "address", "gender"].includes(item.type) && item.is_required == 1) {
                const isValid = !!item.value;
                return isValid;
            }
            if (["checkbox", "radioButton", "counter"].includes(item.type) && item.is_required == 1) {
                const hasValue = item.field_details.some(dataItem => dataItem.value > 0);
                return hasValue;
            }
            if (item.type == "input") {
                const hasEmptyRequired = item.field_details.some(dataItem => dataItem.is_required == 1 && dataItem.value == "");
                return !hasEmptyRequired;
            }
            // Validation برای service_schedule (فقط برای کاربران سازمانی)
            if (item.type == "service_schedule" && item.is_required == 1) {

                // پیدا کردن فیلد اصلی
                const mainField = item.field_details?.find(f => f.id === 'main_selection');
                const selectedOption = mainField?.options?.find(opt => opt.value > 0);

                if (!selectedOption) {
                    return false; // اگر انتخابی نشده
                }

                // بررسی فیلدهای شرطی
                const conditionalFields = item.field_details?.filter(
                    f => f.conditional_on === selectedOption.id
                );

                // بررسی که همه فیلدهای شرطی اجباری پر شده باشند
                const isValid = conditionalFields?.every(field => {
                    if (field.type === 'radioButton') {
                        return field.options?.some(opt => opt.value > 0);
                    }
                    if (field.type === 'date' || field.type === 'time') {
                        return !!field.value;
                    }
                    if (field.type === 'file') {
                        return true;
                    }
                    return true;
                });

                // اگر فیلدها کامل پر نشده‌اند، نیازی به بررسی 4 ساعت نیست
                if (!isValid) return false;

                // --- اضافه شدن بررسی 4 ساعت ---
                const dateField = conditionalFields?.find(f => f.type === 'date');
                const timeField = conditionalFields?.find(f =>
                    f.type === 'radioButton' &&
                    f.options?.some(opt => opt.hasOwnProperty('start_time'))
                );
                if (dateField && timeField) {
                    const selectedDate = dateField.value;
                    const selectedTimeOption = timeField.options?.find(opt => opt.value > 0);

                    if (selectedDate && selectedTimeOption && selectedTimeOption.start_time) {
                        const selectedTime = selectedTimeOption.start_time;


                        // بررسی شرط 4 ساعت
                        const isTimeValid = isMoreThan4HoursFromNow(selectedDate, selectedTime);
                        if (!isTimeValid) {
                            showToastOrAlert('ساعت انتخابی به تاریخ امروز باید برای حداقل 4 ساعت آینده باشد.');
                            setTimeValidationError(true);
                            return false;
                        } else {
                            setTimeValidationError(false)
                        }
                    }
                }
                // --------------------------------

                return true;
            }

            return true;
        });

        return result;
    }

    const handleNextStep = () => {
        // بررسی خطای validation زمان
        if (timeValidationError) {
            showToastOrAlert('ساعت انتخابی به تاریخ امروز باید برای حداقل 4 ساعت آینده باشد.');
            return;
        }


        if (!required(step)) {
            const message = 'لطفا فیلدهای الزامی را تکمیل نمایید.';
            if (timeValidationError) {

                showToastOrAlert(message);
            }
            return;
        }
        if (step < length - 1) {
            setStep(currStep => currStep + 1)
        } else if (step == length - 1) {
            navigation.navigate('Preview')
        }
    }



    useEffect(() => {
        if (selectedDate && selectedTime) {

            const result = isMoreThan4HoursFromNow(selectedDate, selectedTime);
            if (!result) {
                dispatch(removeTime());
                setTimeValidationError(true);
                showToastOrAlert('ساعت انتخابی به تاریخ امروز باید برای حداقل 4 ساعت آینده باشد.');
            } else {
                setTimeValidationError(false);
            }
        } else if (selectedDate && !selectedTime) {
            // اگر تاریخ انتخاب شده ولی زمان نه، خطا را پاک کن
            setTimeValidationError(false);
        }
    }, [selectedDate, selectedTime]);

    // در حال انتقال به stepper سیستماتیک - مراحل API لحظه‌ای نمایش داده نشوند
    if (systematicRedirect) {
        return <View style={NewStyles.container} />;
    }

    return (
        <View style={NewStyles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" >
                <StepsHeader handleNextStep={() => { handleNextStep() }} handlePreStep={() => {
                    if (step != 0) {

                        setStep((currStep) => currStep - 1);
                    } else {
                        if (Platform.OS == 'web') {
                            window.history.back()
                        } else {
                            navigation.goBack()
                        }
                    }
                }} showPre={true} />
                {/* <ProgressBar step={step} /> */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10, paddingBottom: 120 }}>
                    {
                        Platform.OS != 'web' ?
                            <FlatList
                                contentContainerStyle={styles.flatListContainer}
                                showsVerticalScrollIndicator={false} scrollEnabled={false}
                                data={steps?.data?.[step]}
                                keyExtractor={(item) => item?.id?.toString()}
                                renderItem={({ item }) => {
                                    const isUrgentActive = steps?.isUrgent === 1;
                                    if (isUrgentActive && (item.type === 'date' || item.type === 'time')) {
                                        return null;
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
                                            {(item?.type == 'file') && <FileStep step={step} data={item} />}
                                        </View>
                                    )
                                }}
                            />
                            :
                            <View style={[styles.flatListContainer, { flex: 1 }]}>
                                {
                                    steps?.data?.[step]?.map((item, index) => {
                                        return (
                                            <View key={index}>
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
                                                {(item?.type == 'file') && <FileStep step={step} data={item} />}
                                            </View>
                                        )
                                    })
                                }
                            </View>
                    }
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    flatListContainer: {
        gap: 20,
        paddingHorizontal: 0
    },

    separator: {
        borderBottomWidth: 5,
        borderBottomColor: themeColor0.bgColor(0.1),
    },
})

// محافظت از صفحه مراحل ثبت سفارش - قلب فرآیند سفارش‌دهی
export default Steps;