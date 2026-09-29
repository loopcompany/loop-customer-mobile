import { View, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import NewStyles from '@styles/NewStyles';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import Button from './Button';
import CalendarPicker from './calendar/CalendarPicker';

// تقویم حالا components/calendar/CalendarPicker است (انتخاب سال به‌صورت شبکه‌ی
// ردیفی). API این مودال و قالب خروجی تغییری نکرده است:
//   فارسی  → 'jYYYY/jMM/jDD'    انگلیسی → 'YYYY/MM/DD'
const DatePickerModal = React.memo(function DatePickerModal({
    datePickerModal,
    setDatePickerModal,
    birthDate,
    setBirthDate,
    isCurrentDate,
    minimumDate = null, // تاریخ حداقل (اختیاری)
    maximumDate = null, // تاریخ حداکثر (اختیاری) - پیش‌فرض امروز
    onDateChange,
}) {
    const { t } = useTranslation();

    // اگر maximumDate پاس نشده، امروز سقف است (رفتار قبلی).
    const maxDate = useMemo(() => maximumDate || new Date(), [maximumDate]);

    const handleRequestClose = useCallback(() => {
        setDatePickerModal(false);
    }, [setDatePickerModal]);

    const handleSelect = useCallback((selectedDate) => {
        if (onDateChange) {
            onDateChange(selectedDate);
        }
        setBirthDate(selectedDate.slice(0, 10));
    }, [onDateChange, setBirthDate]);

    return (
        <Modal animationType='fade' transparent={true} visible={datePickerModal} onRequestClose={handleRequestClose}>
            <View style={[styles.wrapper, NewStyles.center]}>
                <View style={styles.modalView}>
                    <TouchableOpacity
                        accessibilityRole="button"
                        style={[styles.closeButton, NewStyles.border10, NewStyles.center]}
                        onPress={handleRequestClose}
                    >
                        <Ionicons name={'close'} size={20} color={colors.error.color} />
                    </TouchableOpacity>

                    {/* تا وقتی مودال بسته است تقویم ساخته نمی‌شود، پس هر بار باز شدن
                        از روی مقدار فعلی (یا isCurrentDate) شروع می‌کند. */}
                    {datePickerModal ? (
                        <CalendarPicker
                            value={birthDate}
                            onSelect={handleSelect}
                            initialDate={isCurrentDate}
                            minimumDate={minimumDate}
                            maximumDate={maxDate}
                            style={styles.calendar}
                        />
                    ) : null}

                    <Button title={t('Confirm')} onPress={handleRequestClose} />
                </View>
            </View>
        </Modal>
    );
});

// Custom comparison function for React.memo
// Only re-render if these specific props change
function arePropsEqual(prevProps, nextProps) {
    return (
        prevProps.datePickerModal === nextProps.datePickerModal &&
        prevProps.birthDate === nextProps.birthDate &&
        prevProps.isCurrentDate === nextProps.isCurrentDate &&
        prevProps.minimumDate === nextProps.minimumDate &&
        prevProps.maximumDate === nextProps.maximumDate
        // Intentionally exclude setDatePickerModal and setBirthDate from comparison
        // as they cause unnecessary re-renders when parent re-renders
    );
}

export default React.memo(DatePickerModal, arePropsEqual);

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: colors.overlay.bgColor(0.4),
    },
    modalView: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: colors.surface.bgColor(1),
        borderRadius: radius.md,
        padding: spacing.lg,
        alignItems: 'center',
    },
    closeButton: {
        height: 40,
        width: 40,
        backgroundColor: colors.error.bgColor(0.2),
        marginBottom: spacing.md,
        alignSelf: 'flex-end',
    },
    calendar: {
        marginBottom: spacing.lg,
    },
});
