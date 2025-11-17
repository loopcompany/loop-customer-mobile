import { View, Modal, StyleSheet, TouchableWithoutFeedback, Text, TouchableOpacity } from 'react-native';
import React, { useMemo } from 'react';
import DatePicker, { getFormatedDate } from 'react-native-modern-datepicker';

import NewStyles from '../styles/NewStyles';
import { themeColor1, themeColor10, themeColor4 } from '../theme/Color';
import Button from './Button';

// Pre-calculate colors outside component to prevent re-renders
const WRAPPER_BG_COLOR = themeColor10.bgColor(0.4);
const MODAL_BG_COLOR = themeColor4.bgColor(1);
const BUTTON_BG_COLOR = themeColor1.bgColor(1);
const BUTTON_TEXT_COLOR = themeColor4.bgColor(1);
const MAIN_COLOR = themeColor1.bgColor(1);

// Pre-calculate DatePicker options outside component to prevent re-renders
const DATE_PICKER_OPTIONS = {
    defaultFont: 'VazirLight',
    headerFont: 'VazirLight',
    mainColor: MAIN_COLOR
};

export default function DatePickerModal({
    datePickerModal,
    setDatePickerModal,
    birthDate,
    setBirthDate,
    isCurrentDate,
    minimumDate = null, // تاریخ حداقل (اختیاری)
    maximumDate = null  // تاریخ حداکثر (اختیاری)
}) {

    const date = useMemo(() => new Date(), []);

    // محاسبه تاریخ جاری به صورت شمسی
    const currentDate = useMemo(() =>
        getFormatedDate(new Date(date.getTime()), 'jYYYY/jMM/jDD'),
        [date]);

    // اگر maximumDate پاس نشده، از تاریخ امروز استفاده کن
    const maxDate = useMemo(() => {
        return maximumDate || currentDate;
    }, [maximumDate, currentDate]);

    // اگر minimumDate پاس نشده، از undefined استفاده کن (بدون محدودیت)
    const minDate = useMemo(() => {
        return minimumDate || undefined;
    }, [minimumDate]);

    return (
        <Modal animationType='fade' transparent={true} visible={datePickerModal} onRequestClose={() => { setDatePickerModal(!datePickerModal) }}>
            {/* <TouchableWithoutFeedback onPress={() => { setDatePickerModal(false) }}> */}
                <View style={[styles.wrapper, NewStyles.center]}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View style={styles.modalView}>
                            <View style={styles.calendarContainer}>
                                <DatePicker
                                    mode='calendar'
                                    
                                    isGregorian={false}
                                    options={DATE_PICKER_OPTIONS}
                                    style={styles.calendar}
                                    selected={birthDate}
                                    onDateChange={() => {

                                    }}
                                    onMonthYearChange={() => {

                                    }}
                                    current={isCurrentDate ? isCurrentDate : currentDate}
                                    minimumDate={minDate}
                                    maximumDate={maxDate}
                                    onSelectedChange={(p) => {
                                        setBirthDate(p.slice(0, 10));
                                    }}
                                />
                            </View>

                            {/* دکمه بستن */}

                            <Button title="تأیید" onPress={() => {
                                setDatePickerModal(false);
                            }} />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            {/* </TouchableWithoutFeedback> */}
        </Modal>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: WRAPPER_BG_COLOR,
    },
    modalView: {
        width: '90%',
        backgroundColor: MODAL_BG_COLOR,
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        maxWidth:400
    },
    calendarContainer: {
        width: '100%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    calendar: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    closeButton: {
        width: '100%',
        backgroundColor: BUTTON_BG_COLOR,
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    closeButtonText: {
        color: BUTTON_TEXT_COLOR,
        fontSize: 16,
        fontWeight: 'bold',
    }
});