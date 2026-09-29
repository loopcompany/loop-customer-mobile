// تقویم درون‌خطی با انتخاب‌گر سال و ماه (لیست ادیت‌های ۱۴۰۵/۰۷/۰۳، بند ۲۲).
//
// جایگزین react-native-modern-datepicker: در آن کتابخانه سال فقط با یک کادر
// عدد و دو فلش کوچک عوض می‌شد و برای تاریخ تولد باید ده‌ها بار فلش زد. اینجا
// با زدن روی سال، همه‌ی سال‌ها در یک شبکه‌ی ردیفی نمایش داده می‌شوند (روی سالِ
// فعلی/انتخاب‌شده اسکرول شده)، بعد ماه و بعد روز انتخاب می‌شود.
//
// خروجی onSelect دقیقاً همان قالب قبلی است (calendarModel.formatDate).
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import i18n from 'i18next';

import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import {
  JALAALI,
  GREGORIAN,
  JALAALI_MONTHS,
  GREGORIAN_MONTHS,
  JALAALI_WEEKDAYS,
  GREGORIAN_WEEKDAYS,
  parseDate,
  formatDate,
  dayKey,
  today as todayIn,
  resolveBounds,
  isDayDisabled,
  isMonthDisabled,
  clampMonth,
  addMonths,
  monthGrid,
  yearRange,
} from './calendarModel';

const YEAR_COLUMNS = 4;
const YEAR_ROW_HEIGHT = 48;

const toPersian = (value) => String(value).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

export default function CalendarPicker({
  value,
  onSelect,
  minimumDate,
  maximumDate,
  initialDate,
  calendar,
  accentColor = colors.primary.color,
  style,
}) {
  const lang = i18n.language;
  const system = calendar || (lang === 'fa' ? JALAALI : GREGORIAN);
  const isJalaali = system === JALAALI;
  const digits = useCallback((n) => (isJalaali ? toPersian(n) : String(n)), [isJalaali]);
  const monthNames = isJalaali ? JALAALI_MONTHS : GREGORIAN_MONTHS;
  const weekdays = isJalaali ? JALAALI_WEEKDAYS : GREGORIAN_WEEKDAYS;
  const bold = getFontFamily('bold', isJalaali ? 'fa' : 'en');
  const light = getFontFamily('light', isJalaali ? 'fa' : 'en');

  const selected = useMemo(() => parseDate(value, system), [value, system]);
  const today = useMemo(() => todayIn(system), [system]);
  const bounds = useMemo(
    () => resolveBounds(system, { minimumDate, maximumDate, selected }),
    [system, minimumDate, maximumDate, selected]
  );

  // ماه نمایش‌داده‌شده فقط در شروع از مقدار/تاریخ اولیه گرفته می‌شود؛ بعد از
  // آن کاربر خودش ماه را جابه‌جا می‌کند.
  const [view, setView] = useState(() => {
    const start = selected || parseDate(initialDate, system) || today;
    return clampMonth(start.y, start.m, bounds);
  });
  const [mode, setMode] = useState('days'); // 'days' | 'months' | 'years'
  const [width, setWidth] = useState(0);

  // اگر مقدار از بیرون به روز دیگری عوض شد (مثلاً نوار روزهای SchedulePicker)،
  // تقویم هم همان ماه را نشان دهد - بدون effect، با الگوی «تنظیم state در رندر».
  const selectedKey = selected ? dayKey(selected) : null;
  const [syncedKey, setSyncedKey] = useState(selectedKey);
  if (selectedKey !== syncedKey) {
    setSyncedKey(selectedKey);
    if (selected) setView(clampMonth(selected.y, selected.m, bounds));
  }

  const prev = addMonths(view, -1);
  const next = addMonths(view, 1);
  const prevDisabled = isMonthDisabled(system, prev.y, prev.m, bounds);
  const nextDisabled = isMonthDisabled(system, next.y, next.m, bounds);

  const cell = width ? Math.floor(width / 7) : 0;
  const bodyHeight = cell ? cell * 6 + 28 : 0;

  const goMonth = (target) => {
    if (!isMonthDisabled(system, target.y, target.m, bounds)) setView(target);
  };

  const pickYear = (y) => {
    // ماهِ فعلی را در سال جدید نگه می‌داریم، مگر اینکه خارج از بازه باشد.
    setView(clampMonth(y, view.m, bounds));
    setMode('months');
  };

  const pickMonth = (m) => {
    if (isMonthDisabled(system, view.y, m, bounds)) return;
    setView({ y: view.y, m });
    setMode('days');
  };

  const pickDay = (date) => {
    if (isDayDisabled(date, bounds)) return;
    onSelect?.(formatDate(system, date));
  };

  // --- years: روی سالِ نمایش‌داده‌شده اسکرول شود --------------------------
  const yearsRef = useRef(null);
  const years = useMemo(() => yearRange(bounds), [bounds]);
  const scrollYears = () => {
    const row = Math.floor((view.y - bounds.minYear) / YEAR_COLUMNS);
    const y = Math.max(0, row * YEAR_ROW_HEIGHT - bodyHeight / 2 + YEAR_ROW_HEIGHT / 2);
    yearsRef.current?.scrollTo({ y, animated: false });
  };

  const header = (
    <View style={[styles.header, { flexDirection: isJalaali ? 'row-reverse' : 'row' }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="previous month"
        onPress={() => goMonth(prev)}
        disabled={prevDisabled || mode !== 'days'}
        hitSlop={8}
        style={[styles.arrow, (prevDisabled || mode !== 'days') && styles.faded]}
      >
        <Ionicons name={isJalaali ? 'chevron-forward' : 'chevron-back'} size={20} color={accentColor} />
      </Pressable>

      <View style={[styles.chips, { flexDirection: isJalaali ? 'row-reverse' : 'row' }]}>
        <Pressable
          accessibilityRole="button"
          testID="calendar-month-chip"
          onPress={() => setMode(mode === 'months' ? 'days' : 'months')}
          style={[styles.chip, mode === 'months' && { backgroundColor: accentColor }]}
        >
          <Text style={[styles.chipText, { fontFamily: bold }, mode === 'months' && styles.chipTextActive]}>
            {monthNames[view.m - 1]}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          testID="calendar-year-chip"
          onPress={() => setMode(mode === 'years' ? 'days' : 'years')}
          style={[styles.chip, mode === 'years' && { backgroundColor: accentColor }]}
        >
          <Text style={[styles.chipText, { fontFamily: bold }, mode === 'years' && styles.chipTextActive]}>
            {digits(view.y)}
          </Text>
          <Ionicons
            name={mode === 'years' ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={mode === 'years' ? colors.textInverse.color : colors.textSecondary.color}
          />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="next month"
        onPress={() => goMonth(next)}
        disabled={nextDisabled || mode !== 'days'}
        hitSlop={8}
        style={[styles.arrow, (nextDisabled || mode !== 'days') && styles.faded]}
      >
        <Ionicons name={isJalaali ? 'chevron-back' : 'chevron-forward'} size={20} color={accentColor} />
      </Pressable>
    </View>
  );

  const renderDays = () => {
    const cells = monthGrid(system, view.y, view.m);
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    const rowDir = isJalaali ? 'row-reverse' : 'row';
    return (
      <View>
        <View style={[styles.row, { flexDirection: rowDir }]}>
          {weekdays.map((name) => (
            <Text key={name} style={[styles.weekday, { width: cell, fontFamily: light }]}>
              {name}
            </Text>
          ))}
        </View>
        {rows.map((row, r) => (
          <View key={r} style={[styles.row, { flexDirection: rowDir }]}>
            {row.map((date, c) => {
              if (!date) return <View key={`e${c}`} style={{ width: cell, height: cell }} />;
              const key = dayKey(date);
              const disabled = isDayDisabled(date, bounds);
              const isSelected = key === selectedKey;
              const isToday = key === dayKey(today);
              return (
                <Pressable
                  key={key}
                  testID={`calendar-day-${date.d}`}
                  accessibilityRole="button"
                  accessibilityState={{ disabled, selected: isSelected }}
                  disabled={disabled}
                  onPress={() => pickDay(date)}
                  style={[styles.dayCell, { width: cell, height: cell }]}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      { width: cell - 6, height: cell - 6, borderRadius: (cell - 6) / 2 },
                      isToday && !isSelected && { borderWidth: 1.5, borderColor: accentColor },
                      isSelected && { backgroundColor: accentColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { fontFamily: isSelected ? bold : light },
                        isSelected && styles.chipTextActive,
                        disabled && styles.disabledText,
                      ]}
                    >
                      {digits(date.d)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const renderMonths = () => (
    <View style={[styles.grid, { height: bodyHeight, flexDirection: isJalaali ? 'row-reverse' : 'row' }]}>
      {monthNames.map((name, index) => {
        const m = index + 1;
        const disabled = isMonthDisabled(system, view.y, m, bounds);
        const active = m === view.m;
        return (
          <Pressable
            key={name}
            testID={`calendar-month-${m}`}
            accessibilityRole="button"
            accessibilityState={{ disabled, selected: active }}
            disabled={disabled}
            onPress={() => pickMonth(m)}
            style={[styles.gridItem, { width: '31%', height: bodyHeight / 4 - spacing.sm }, active && { backgroundColor: accentColor, borderColor: accentColor }]}
          >
            <Text style={[styles.gridText, { fontFamily: bold }, active && styles.chipTextActive, disabled && styles.disabledText]}>
              {name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderYears = () => (
    <ScrollView
      ref={yearsRef}
      style={{ height: bodyHeight }}
      onContentSizeChange={scrollYears}
      showsVerticalScrollIndicator
    >
      <View style={[styles.yearGrid, { flexDirection: isJalaali ? 'row-reverse' : 'row' }]}>
        {years.map((y) => {
          const active = y === view.y;
          const isCurrent = y === today.y;
          return (
            <Pressable
              key={y}
              testID={`calendar-year-${y}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => pickYear(y)}
              style={[
                styles.yearItem,
                { width: `${100 / YEAR_COLUMNS}%`, height: YEAR_ROW_HEIGHT },
              ]}
            >
              <View
                style={[
                  styles.yearPill,
                  isCurrent && !active && { borderColor: accentColor },
                  active && { backgroundColor: accentColor, borderColor: accentColor },
                ]}
              >
                <Text style={[styles.gridText, { fontFamily: bold }, active && styles.chipTextActive]}>
                  {digits(y)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, style]}>
      {header}
      <View style={{ width: '100%' }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {cell > 0 && (mode === 'days' ? renderDays() : mode === 'months' ? renderMonths() : renderYears())}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surface.bgColor(1),
    borderRadius: radius.md,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.bgColor(0.08),
  },
  faded: {
    opacity: 0.3,
  },
  chips: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primary.bgColor(0.08),
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary.color,
  },
  chipTextActive: {
    color: colors.textInverse.color,
  },
  row: {
    alignItems: 'center',
  },
  weekday: {
    height: 28,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 28,
    fontSize: fontSize.xs,
    color: colors.textSecondary.color,
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary.color,
  },
  disabledText: {
    color: colors.disabled.color,
    opacity: 0.5,
  },
  grid: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-around',
  },
  gridItem: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.bgColor(1),
  },
  gridText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary.color,
  },
  yearGrid: {
    flexWrap: 'wrap',
  },
  yearItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  yearPill: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.primary.bgColor(0.06),
  },
});
