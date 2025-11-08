import { View, Modal, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import DatePicker, { getFormatedDate } from 'react-native-modern-datepicker';
import { Ionicons } from '@expo/vector-icons';

import NewStyles from '../styles/NewStyles';
import { themeColor1, themeColor10, themeColor4 } from '../theme/Color';

export default function DatePickerModal({ datePickerModal, setDatePickerModal, birthDate, setBirthDate }) {

    var date = new Date();

    return (
        <Modal animationType='fade' transparent={true} visible={datePickerModal} onRequestClose={() => { setDatePickerModal(!datePickerModal) }}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={() => { setDatePickerModal(false) }}>
                    <View style={[styles.wrapper, NewStyles.center]}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalView}>
                                {/* آیکن بستن */}
                                <TouchableOpacity 
                                    style={styles.closeIcon}
                                    onPress={() => setDatePickerModal(false)}
                                >
                                    <Ionicons name="close-circle" size={32} color="#ff5252" />
                                </TouchableOpacity>
                                
                                <ScrollView 
                                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 10 }}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                >
                                    <DatePicker
                                        mode='calendar'
                                        isGregorian={false}
                                        options={{
                                            defaultFont: 'VazirLight',
                                            headerFont: 'VazirLight',
                                            mainColor: themeColor1.bgColor(1)
                                        }}
                                        style={styles.calendar}
                                        selected={birthDate}
                                        onDateChange={()=>{
                                            
                                        }}
                                        onMonthYearChange={()=>{
                                            
                                        }}
                                        current={getFormatedDate(new Date(date.getTime()), 'jYYYY/jMM/jDD')}
                                        maximumDate={getFormatedDate(new Date(date.getTime()), 'jYYYY/jMM/jDD')}
                                        onSelectedChange={(p) => {
                                            setBirthDate(p.slice(0, 10));
                                        }}
                                    />
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: themeColor10.bgColor(0.4),
    },
    modalView: {
        height: '55%',
        width: '90%',
        backgroundColor: themeColor4.bgColor(1),
        borderRadius: 10,
        paddingTop: 45,
        paddingBottom: 10,
        overflow: 'hidden',
    },
    calendar: {
        width: '100%',
    },
    closeIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    }
});