// انتخابگر «بازه زمانی / رزرو».
//
// نسخه‌ی قبلی این بخش یک کادرِ شبیه‌به‌ورودی‌متن برای تاریخ (که معلوم نبود
// قابل لمس است) به‌علاوه یک RadioList عمودی از بازه‌های ساعتی بود؛ کاربر برای
// انتخاب «فردا» هم مجبور بود تقویم را باز کند و هیچ بازخوردی از انتخاب نهایی
// نمی‌گرفت. این کامپوننت همان داده را با سه بهبود نشان می‌دهد:
//
//   ۱. نوار انتخاب سریع روز (امروز / فردا / ...) کنار دکمه‌ی تقویم برای تاریخ‌های دورتر.
//   ۲. بازه‌های ساعتی به‌صورت چیپ‌های شبکه‌ای با آیکون صبح/عصر/شب - بازه‌های
//      سپری‌شده‌ی امروز غیرفعال می‌شوند تا رزرو در گذشته ممکن نباشد.
//   ۳. نوار خلاصه‌ی بالای بخش که انتخاب نهایی و مرحله‌ی باقی‌مانده را می‌گوید.
//
// هر دو مسیر سازمانی («انتخاب جامع» و «انتخاب سیستماتیک») از همین کامپوننت
// استفاده می‌کنند تا از هم دور نیفتند.
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import DatePickerModal from './DatePickerModal';
import {
  describePickerDate,
  formatDateForPicker,
  getBookingDays,
  langIsRTL,
  parsePickerDate,
} from '@helpers/Common';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { shadow } from '@theme/Shadows';

const MAX_MONTHS_AHEAD = 6;

const isSameDay = (a, b) =>
  Boolean(a && b) &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// آیکون بازه بر اساس ساعت شروع - صبح / بعدازظهر / شب.
const slotIcon = (start) => {
  if (typeof start !== 'number') return 'time-outline';
  if (start < 12) return 'sunny-outline';
  if (start < 17) return 'partly-sunny-outline';
  return 'moon-outline';
};

const SchedulePicker = ({
  date,
  onChangeDate,
  slot,
  onChangeSlot,
  slots = [],
  dayCount = 14,
  dateTitle = 'تاریخ مراجعه',
  slotTitle = 'بازه ساعتی',
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'fa';
  const isRTL = langIsRTL(lang);
  const bold = getFontFamily('bold', lang);
  const light = getFontFamily('light', lang);

  const [showCalendar, setShowCalendar] = useState(false);

  const today = useMemo(() => new Date(), []);
  const minimumDate = useMemo(() => formatDateForPicker(today), [today]);
  const maximumDate = useMemo(() => {
    const max = new Date(today);
    max.setMonth(max.getMonth() + MAX_MONTHS_AHEAD);
    return formatDateForPicker(max);
  }, [today]);

  // روزهای نوار سریع؛ اگر کاربر از تقویم تاریخی بیرون از این بازه انتخاب کرده
  // باشد، همان تاریخ به‌عنوان اولین کارت اضافه می‌شود تا انتخابش گم نشود.
  const days = useMemo(() => {
    const base = getBookingDays(dayCount);
    if (date && !base.some((day) => day.value === date)) {
      const described = describePickerDate(date);
      if (described) {
        return [
          {
            id: 'day_custom',
            value: date,
            weekday: described.weekday,
            dayLabel: described.dayLabel,
            isCustom: true,
          },
          ...base,
        ];
      }
    }
    return base;
  }, [date, dayCount]);

  const selectedDate = useMemo(() => parsePickerDate(date), [date]);
  const selectedIsToday = isSameDay(selectedDate, today);

  const isSlotPast = (option) =>
    selectedIsToday && typeof option.start === 'number' && today.getHours() >= option.start;

  const allSlotsPast = slots.length > 0 && slots.every(isSlotPast);

  const handleSelectDate = (value) => {
    onChangeDate(value);
    // اگر با تغییر تاریخ، بازه‌ی انتخاب‌شده دیگر در دسترس نباشد پاک می‌شود تا
    // خلاصه‌ی سفارش یک زمان سپری‌شده را نشان ندهد.
    const nextDate = parsePickerDate(value);
    if (isSameDay(nextDate, today) && slot) {
      const current = slots.find((option) => option.id === slot);
      if (current && typeof current.start === 'number' && today.getHours() >= current.start) {
        onChangeSlot(null);
      }
    }
  };

  const selectedSlot = slots.find((option) => option.id === slot);
  const described = describePickerDate(date);
  const complete = Boolean(date && slot);

  const summaryText = (() => {
    if (complete) return `${described?.weekday} ${described?.dayLabel} · ساعت ${selectedSlot?.title}`;
    if (date) return `${described?.weekday} ${described?.dayLabel} - بازه ساعتی را انتخاب کنید`;
    return 'ابتدا روز مراجعه، سپس بازه ساعتی را انتخاب کنید';
  })();

  const renderDay = ({ item }) => {
    const active = item.value === date;
    return (
      <TouchableOpacity
        onPress={() => handleSelectDate(item.value)}
        activeOpacity={0.8}
        style={[styles.dayTile, active && styles.dayTileActive]}
      >
        <Text
          numberOfLines={1}
          style={[styles.dayWeekday, { fontFamily: bold }, active && styles.dayTextActive]}
        >
          {item.isToday ? 'امروز' : item.isTomorrow ? 'فردا' : item.weekday}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.dayLabel, { fontFamily: light }, active && styles.dayTextActive]}
        >
          {item.dayLabel}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      {/* نوار خلاصه - همیشه می‌گوید چه چیزی انتخاب شده و چه چیزی مانده */}
      <View style={[styles.summaryBar, complete && styles.summaryBarDone]}>
        <Ionicons
          name={complete ? 'checkmark-circle' : 'information-circle-outline'}
          size={18}
          color={complete ? colors.success.color : colors.textSecondary.color}
        />
        <Text
          style={[
            styles.summaryText,
            { fontFamily: complete ? bold : light },
            complete && { color: colors.success.color },
          ]}
        >
          {summaryText}
        </Text>
      </View>

      {/* مرحله ۱ - روز مراجعه */}
      <StepLabel index="۱" title={dateTitle} fontFamily={bold} />
      <View style={styles.dayRow}>
        <TouchableOpacity
          onPress={() => setShowCalendar(true)}
          activeOpacity={0.8}
          style={[styles.calendarTile, Boolean(date) && styles.calendarTileFilled]}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.primary.color} />
          <Text style={[styles.calendarLabel, { fontFamily: light }]}>تقویم</Text>
        </TouchableOpacity>
        <FlatList
          data={days}
          horizontal
          inverted={isRTL}
          keyExtractor={(item) => item.id}
          renderItem={renderDay}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayListContent}
          style={styles.dayList}
        />
      </View>

      {/* مرحله ۲ - بازه ساعتی */}
      <StepLabel index="۲" title={slotTitle} fontFamily={bold} />
      <View style={styles.slotGrid}>
        {slots.map((option) => {
          const active = option.id === slot;
          const disabled = isSlotPast(option);
          return (
            <TouchableOpacity
              key={option.id}
              disabled={disabled}
              activeOpacity={0.8}
              onPress={() => onChangeSlot(active ? null : option.id)}
              style={[styles.slotChip, active && styles.slotChipActive, disabled && styles.slotChipDisabled]}
            >
              <Ionicons
                name={slotIcon(option.start)}
                size={16}
                color={
                  disabled
                    ? colors.disabled.color
                    : active
                      ? colors.textInverse.color
                      : colors.primary.color
                }
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.slotText,
                  { fontFamily: bold },
                  active && styles.slotTextActive,
                  disabled && styles.slotTextDisabled,
                ]}
              >
                {option.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {allSlotsPast && (
        <Text style={[styles.warning, { fontFamily: light }]}>
          بازه‌های امروز به پایان رسیده است؛ لطفاً روز دیگری را انتخاب کنید.
        </Text>
      )}

      <DatePickerModal
        datePickerModal={showCalendar}
        setDatePickerModal={setShowCalendar}
        birthDate={date || ''}
        setBirthDate={handleSelectDate}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    </View>
  );
};

const StepLabel = ({ index, title, fontFamily }) => (
  <View style={styles.stepLabelRow}>
    <View style={styles.stepIndex}>
      <Text style={[styles.stepIndexText, { fontFamily }]}>{index}</Text>
    </View>
    <Text style={[styles.stepTitle, { fontFamily }]}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  summaryBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.bgColor(1),
    backgroundColor: colors.surface.bgColor(0.9),
    marginBottom: spacing.md,
  },
  summaryBarDone: {
    borderColor: colors.success.bgColor(0.5),
    backgroundColor: colors.success.bgColor(0.08),
  },
  summaryText: {
    flex: 1,
    fontSize: fontSize.xs,
    textAlign: 'right',
    color: colors.textSecondary.color,
  },

  stepLabelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepIndex: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.bgColor(1),
  },
  stepIndexText: {
    fontSize: 11,
    color: colors.textInverse.color,
  },
  stepTitle: {
    fontSize: fontSize.sm,
    color: colors.textPrimary.color,
  },

  dayRow: {
    flexDirection: 'row-reverse',
    alignItems: 'stretch',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dayList: {
    flex: 1,
  },
  dayListContent: {
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  dayTile: {
    minWidth: 66,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border.bgColor(1),
    backgroundColor: colors.surface.bgColor(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTileActive: {
    borderColor: colors.primary.color,
    backgroundColor: colors.primary.bgColor(1),
    ...shadow.sm,
  },
  dayWeekday: {
    fontSize: fontSize.xs,
    color: colors.textPrimary.color,
  },
  dayLabel: {
    fontSize: 11,
    marginTop: 2,
    color: colors.textSecondary.color,
  },
  dayTextActive: {
    color: colors.textInverse.color,
  },
  calendarTile: {
    width: 58,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary.bgColor(0.5),
    backgroundColor: colors.primary.bgColor(0.06),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  calendarTileFilled: {
    borderStyle: 'solid',
  },
  calendarLabel: {
    fontSize: 11,
    marginTop: 2,
    color: colors.primary.color,
  },

  slotGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minWidth: 104,
    flexGrow: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border.bgColor(1),
    backgroundColor: colors.surface.bgColor(1),
  },
  slotChipActive: {
    borderColor: colors.primary.color,
    backgroundColor: colors.primary.bgColor(1),
    ...shadow.sm,
  },
  slotChipDisabled: {
    borderColor: colors.border.bgColor(0.6),
    backgroundColor: colors.disabled.bgColor(0.12),
  },
  slotText: {
    fontSize: 13,
    color: colors.textPrimary.color,
  },
  slotTextActive: {
    color: colors.textInverse.color,
  },
  slotTextDisabled: {
    color: colors.disabled.color,
    textDecorationLine: 'line-through',
  },

  warning: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    textAlign: 'right',
    color: colors.warning.color,
  },
});

export default React.memo(SchedulePicker);
