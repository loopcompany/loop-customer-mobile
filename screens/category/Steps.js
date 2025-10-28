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
import { emptyAddress } from '../../slices/addressSlice';
import StepsHeader from '../../components/StepsHeader';

export default function Steps({ navigation }) {

    const dispatch = useDispatch();
    const [step, setStep] = useState(0);
    const steps = useSelector(state => state.step);
    const length = steps?.data?.length;
    const [loading, setLoading] = useState(false);

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
        return steps.data?.[step].every(item => {
            if (["date", "time", "address", "gender"].includes(item.type) && item.is_required == 1) {
                return item.value;
            }
            if (["checkbox", "radioButton", "counter"].includes(item.type) && item.is_required == 1) {
                return item.field_details.some(dataItem => dataItem.value > 0);
            }
            if (item.type == "input") {
                return !item.field_details.some(dataItem => dataItem.is_required == 1 && dataItem.value == "");
            }
            return true;
        });
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
                            const isUrgentActive = steps?.isUrgent === 1;
                            if (isUrgentActive && (item.type === 'date' || item.type === 'time')) {
                                return null;
                            }
                            return (
                                <View >
                                    {(item?.type == 'image') && <Image style={{ width: '100%', height: 250 }} source={{ uri: `${imageUri}/${item?.image_path}` }} />}
                                    {(item?.type == 'description') && <Description data={item} />}
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