// صفحه‌ی مراحل هر دسته در مسیر «انتخاب سیستماتیک».
//
// طرح تحویلی برای هر دسته (لپ تاپ، مانیتور، کیس، ...) یک فهرست مرحله‌ای دارد؛
// این صفحه همان فهرست را از org/systematicFlows.js می‌خواند و با همان کیت رابط
// کاربری «انتخاب جامع» (components/OrgSelectionKit.js) رندر می‌کند تا دو مسیر
// دقیقاً یک ظاهر داشته باشند.

import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, ImageBackground, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeaders from '@components/ScreenHeaders';
import ScreenTitle from '@components/ScreenTitle';
import CustomStatusBar from '@components/CustomStatusBar';
import SchedulePicker from '@components/SchedulePicker';
import {
  AccordionHeader,
  SectionBody,
  SelectableOptions,
  BrandGrid,
  IconOptionGrid,
  HardwareCard,
  ProcurementCard,
  DescriptionInput,
  PhotoNoteInput,
  SummaryBox,
  OrderActionButtons,
} from '@components/OrgSelectionKit';
import {
  HARDWARE_ITEMS,
  OS_ITEMS,
  PROCUREMENT_ITEMS,
  TECHNICIAN_GENDER_OPTIONS,
  TIME_SLOT_OPTIONS,
} from './deviceCatalog';
import { getCategory, getFlow } from './systematicFlows';
import NewStyles from '@styles/NewStyles';
import { themeColor10, colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize } from '@theme/Typography';
import { describePickerDate, showAlert, showToastOrAlert } from '@helpers/Common';
import { useMenu } from '@contexts/MenuContext';
import useAccordionScroll from '@hooks/useAccordionScroll';
import { L, LO } from './orgI18n';
import { RECEIPT_STATE, receiptFromSystematic } from '@services/receipt';

const itemsByIds = (source, ids) =>
  (ids ? source.filter((item) => ids.includes(item.id)) : source);

const titleOf = (options, id) => options.find((opt) => opt.id === id)?.title || id;

// آیا این مرحله پر شده است؟ - هم برای تیک سبز کنار شماره‌ی مرحله و هم برای
// اعتبارسنجی مراحلی که required هستند استفاده می‌شود.
const isStepFilled = (step, value) => {
  switch (step.type) {
    case 'brands':
      return Boolean(value?.brand || (value?.other || '').trim());
    case 'fields':
      return Boolean((value?.[step.fields[0].id] || '').trim());
    case 'osGrid':
      return Boolean(value);
    case 'options':
      return step.multi ? Boolean(value?.selected?.length) : Boolean(value?.selected);
    case 'checklist':
      return Boolean(value?.selected?.length);
    case 'note':
      return Boolean((value?.note || '').trim());
    case 'photo':
      return Boolean(value?.photos?.length || (value?.note || '').trim());
    case 'procurement':
      return Object.values(value || {}).some((entry) => entry.new > 0 || entry.used > 0);
    case 'hardwareCounters':
      return Object.values(value || {}).some((entry) => entry.count > 0);
    case 'schedule':
      return Boolean(value?.date && value?.slot);
    case 'technician':
      return Boolean(value?.gender);
    default:
      return false;
  }
};

const SystematicDeviceScreen = ({ navigation, route }) => {
  useTranslation(); // subscribe to runtime language switches so L()/LO() re-evaluate
  // فضای رزرو شده زیر محتوا تا آخرین مرحله (نمایش/استعلام/ثبت سفارش) زیر داک شناور پنهان نشود
  const { footerSpace } = useMenu();
  // باز شدن هر مرحله، همان مرحله را به بالای صفحه می‌آورد (مراحل بلند، مرحله‌ی
  // بعدی را از کادر دید بیرون می‌انداختند).
  const { scrollRef, registerSection, requestScrollTo } = useAccordionScroll();
  const categoryId = route?.params?.categoryId;
  const category = getCategory(categoryId);
  const steps = getFlow(categoryId);

  // برای «وضعیت کاربری» و «مشخصات کاربر» روی پیش‌رسید.
  const user = useSelector((state) => state?.user?.data);
  const orgProfile = useSelector((state) => state?.organization?.profileData);

  const [answers, setAnswers] = useState({});
  const [expanded, setExpanded] = useState(steps[0]?.id || null);

  const setAnswer = (stepId, patch) =>
    setAnswers((prev) => ({ ...prev, [stepId]: { ...prev[stepId], ...patch } }));

  const toggleSection = (id) =>
    setExpanded((prev) => {
      if (prev === id) return null;
      requestScrollTo(id);
      return id;
    });

  const filledCount = useMemo(
    () => steps.filter((step) => isStepFilled(step, answers[step.id])).length,
    [steps, answers]
  );

  // خلاصه‌ی انتخاب‌ها - در بخش «نمایش / استعلام / ثبت سفارش» نمایش داده می‌شود.
  const summaryLines = useMemo(() => {
    const lines = [];
    steps.forEach((step) => {
      const value = answers[step.id];
      if (!isStepFilled(step, value)) return;
      switch (step.type) {
        case 'brands':
          lines.push({ label: L(step.title), value: value.brand ? titleOf(LO(step.brands), value.brand) : value.other });
          break;
        case 'fields':
          lines.push({ label: L(step.title), value: value[step.fields[0].id] });
          break;
        case 'osGrid':
          lines.push({ label: L(step.title), value: titleOf(LO(OS_ITEMS), value) });
          break;
        case 'options':
          lines.push({
            label: L(step.title),
            value: step.multi
              ? value.selected.length
              : titleOf(LO(step.options), value.selected),
          });
          break;
        case 'checklist':
          lines.push({ label: L(step.title), value: value.selected.length });
          break;
        case 'note':
          lines.push({ label: L(step.title), value: value.note });
          break;
        case 'photo':
          if (value.photos?.length) {
            lines.push({ label: `${L(step.title)} - ${L('عکس')}`, value: value.photos.length });
          }
          if ((value.note || '').trim()) {
            lines.push({ label: L(step.title), value: value.note });
          }
          break;
        case 'procurement':
          Object.entries(value).forEach(([itemId, entry]) => {
            if (entry.new > 0) lines.push({ label: `${titleOf(LO(PROCUREMENT_ITEMS), itemId)} / ${L('آکبند')}`, value: entry.new });
            if (entry.used > 0) lines.push({ label: `${titleOf(LO(PROCUREMENT_ITEMS), itemId)} / ${L('کارکرده')}`, value: entry.used });
          });
          break;
        case 'hardwareCounters':
          Object.entries(value).forEach(([itemId, entry]) => {
            if (entry.count > 0) lines.push({ label: titleOf(LO(HARDWARE_ITEMS), itemId), value: entry.count });
          });
          break;
        case 'technician':
          lines.push({ label: L(step.title), value: titleOf(LO(TECHNICIAN_GENDER_OPTIONS), value.gender) });
          break;
        case 'schedule': {
          const described = describePickerDate(value.date);
          lines.push({
            label: L('تاریخ مراجعه'),
            value: described ? `${described.weekday} ${described.dayLabel}` : value.date,
          });
          lines.push({ label: L('بازه ساعتی'), value: titleOf(LO(TIME_SLOT_OPTIONS), value.slot) });
          break;
        }
        default:
          break;
      }
    });
    return lines;
  }, [steps, answers]);

  const firstMissingStep = () =>
    steps.find((step) => step.required && !isStepFilled(step, answers[step.id]));

  const handleOrderAction = (action) => {
    if (action === 'cancel_order') {
      showAlert(L('لغو سفارش'), L('آیا از لغو سفارش مطمئن هستید؟'), [
        { text: L('انصراف'), style: 'cancel' },
        { text: L('لغو سفارش'), style: 'destructive', onPress: () => showToastOrAlert(L('سفارش لغو شد')) },
      ]);
      return;
    }

    const missing = firstMissingStep();
    if (action === 'submit_order' || action === 'issue_receipt') {
      if (missing) {
        showToastOrAlert(`${L(missing.title)} — ${L('لطفاً این مرحله را تکمیل کنید')}`);
        setExpanded(missing.id);
        requestScrollTo(missing.id);
        return;
      }
    }

    // این مسیر سفارش را روی سرور ثبت نمی‌کند، پس رسید کاملاً از همین answers
    // ساخته می‌شود و به‌صورت پارامتر پاس داده می‌شود (orderId ندارد).
    const preReceipt = () =>
      receiptFromSystematic({
        categoryId,
        answers,
        user,
        orgProfile,
        state: RECEIPT_STATE.PENDING,
      });

    if (action === 'submit_order') {
      // مرحله‌ی «بازه زمانی / رزرو» تاریخ و ساعت مراجعه را نگه می‌دارد.
      const scheduleStep = steps.find((step) => step.type === 'schedule');
      navigation.navigate('OrderSummaryScreen', {
        source: 'systematic',
        categoryId,
        categoryTitle: category?.title,
        orderTitle: category?.title ? `${L('انتخاب سیستماتیک')} - ${L(category.title)}` : undefined,
        summaryLines,
        schedule: scheduleStep ? answers[scheduleStep.id] : null,
        answers,
        // پس از ثبت نهایی، OrderSummaryScreen همین رسید را با شماره‌ی سفارش
        // تکمیل و نمایش می‌دهد.
        receipt: preReceipt(),
      });
      return;
    }
    if (action === 'issue_receipt' || action === 'show_receipt') {
      navigation.navigate('OrderReceipt', { receipt: preReceipt() });
    }
  };

  if (!category || steps.length === 0) {
    return (
      <ImageBackground source={require('@assets/moon.jpg')} style={{ flex: 1 }} imageStyle={{ width: '100%', height: '100%' }}>
        <CustomStatusBar />
        <ScreenHeaders title={L('انتخاب سیستماتیک')} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.textInverse.color} />
          <Text style={{ fontFamily: 'VazirBold', fontSize: fontSize.md, color: colors.textInverse.color, marginTop: spacing.md, textAlign: 'center' }}>
            {L('مراحل این دسته هنوز تعریف نشده است.')}
          </Text>
        </View>
      </ImageBackground>
    );
  }

  const renderStepBody = (step) => {
    const value = answers[step.id];

    switch (step.type) {
      case 'brands':
        return (
          <>
            <BrandGrid
              brands={LO(step.brands)}
              value={value?.brand || null}
              onChange={(brand) => setAnswer(step.id, { brand })}
            />
            <DescriptionInput
              value={value?.other || ''}
              onChangeText={(other) => setAnswer(step.id, { other })}
              placeholder={L('برند دیگر (اگر در فهرست بالا نیست)')}
            />
          </>
        );

      case 'fields':
        return (
          <>
            {step.fields.map((field) => (
              <TextInput
                key={field.id}
                value={value?.[field.id] || ''}
                onChangeText={(text) => setAnswer(step.id, { [field.id]: text })}
                placeholder={L(field.placeholder)}
                placeholderTextColor={themeColor10.bgColor(0.4)}
                keyboardType={field.keyboardType}
                style={[NewStyles.textInput, NewStyles.border10, { marginBottom: spacing.sm }]}
              />
            ))}
          </>
        );

      case 'osGrid':
        return (
          <IconOptionGrid
            options={LO(OS_ITEMS)}
            value={value || null}
            onChange={(os) => setAnswers((prev) => ({ ...prev, [step.id]: os }))}
          />
        );

      case 'options':
        return (
          <>
            <SelectableOptions
              options={LO(step.options)}
              value={step.multi ? value?.selected || [] : value?.selected || null}
              onChange={(selected) => setAnswer(step.id, { selected })}
              multi={step.multi}
              columns={step.columns || 2}
            />
            {step.extra ? (
              <>
                <Text style={styles.subLabel}>{L(step.extra.title)}</Text>
                <SelectableOptions
                  options={LO(step.extra.options)}
                  value={value?.[step.extra.id] || null}
                  onChange={(selected) => setAnswer(step.id, { [step.extra.id]: selected })}
                  columns={step.extra.columns || 2}
                />
              </>
            ) : null}
            {step.note ? (
              <DescriptionInput
                value={value?.note || ''}
                onChangeText={(note) => setAnswer(step.id, { note })}
                placeholder={L(step.notePlaceholder)}
              />
            ) : null}
          </>
        );

      case 'checklist':
        return (
          <>
            <SelectableOptions
              options={LO(step.options)}
              value={value?.selected || []}
              onChange={(selected) => setAnswer(step.id, { selected })}
              multi
              columns={step.columns || 2}
            />
            <DescriptionInput
              value={value?.note || ''}
              onChangeText={(note) => setAnswer(step.id, { note })}
              placeholder={L('درخواست دیگری دارید بنویسید...')}
            />
          </>
        );

      case 'hardwareCounters':
        return itemsByIds(HARDWARE_ITEMS, step.itemIds).map((item) => {
          const entry = value?.[item.id] || { count: 0, desc: '' };
          return (
            <HardwareCard
              key={item.id}
              image={item.image}
              title={L(item.title)}
              count={entry.count}
              desc={entry.desc}
              onIncrement={() => setAnswer(step.id, { [item.id]: { ...entry, count: entry.count + 1 } })}
              onDecrement={() => setAnswer(step.id, { [item.id]: { ...entry, count: Math.max(0, entry.count - 1) } })}
              onDescChange={(desc) => setAnswer(step.id, { [item.id]: { ...entry, desc } })}
            />
          );
        });

      case 'procurement':
        return itemsByIds(PROCUREMENT_ITEMS, step.itemIds).map((item) => {
          const entry = value?.[item.id] || { new: 0, used: 0, desc: '' };
          const patch = (changes) => setAnswer(step.id, { [item.id]: { ...entry, ...changes } });
          return (
            <ProcurementCard
              key={item.id}
              image={item.image}
              title={L(item.title)}
              newCount={entry.new}
              usedCount={entry.used}
              desc={entry.desc}
              onNewInc={() => patch({ new: entry.new + 1 })}
              onNewDec={() => patch({ new: Math.max(0, entry.new - 1) })}
              onUsedInc={() => patch({ used: entry.used + 1 })}
              onUsedDec={() => patch({ used: Math.max(0, entry.used - 1) })}
              onDescChange={(desc) => patch({ desc })}
            />
          );
        });

      case 'note':
        return (
          <DescriptionInput
            value={value?.note || ''}
            onChangeText={(note) => setAnswer(step.id, { note })}
            placeholder={L(step.notePlaceholder) || L('توضیحات...')}
          />
        );

      case 'photo':
        return (
          <PhotoNoteInput
            photos={value?.photos || []}
            note={value?.note || ''}
            onChangePhotos={(photos) => setAnswer(step.id, { photos })}
            onChangeNote={(note) => setAnswer(step.id, { note })}
            notePlaceholder={step.notePlaceholder}
          />
        );

      case 'technician':
        return (
          <SelectableOptions
            options={LO(TECHNICIAN_GENDER_OPTIONS)}
            value={value?.gender || null}
            onChange={(gender) => setAnswer(step.id, { gender })}
            columns={2}
          />
        );

      case 'comingSoon':
        return (
          <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
            <Ionicons name="time-outline" size={28} color={themeColor10.bgColor(0.4)} />
            <Text style={{ fontFamily: 'VazirBold', fontSize: 14, color: themeColor10.bgColor(0.5), marginTop: spacing.sm }}>
              {L('به زودی')}
            </Text>
          </View>
        );

      case 'schedule':
        return (
          <>
            <SchedulePicker
              date={value?.date || ''}
              onChangeDate={(date) => setAnswer(step.id, { date })}
              slot={value?.slot || null}
              onChangeSlot={(slot) => setAnswer(step.id, { slot })}
              slots={LO(TIME_SLOT_OPTIONS)}
            />
            <DescriptionInput
              value={value?.note || ''}
              onChangeText={(note) => setAnswer(step.id, { note })}
              placeholder={L('توضیح درباره زمان مراجعه (اختیاری)')}
            />
          </>
        );

      case 'orderActions':
        return (
          <>
            <OrderActionButtons
              onIssueReceipt={() => handleOrderAction('issue_receipt')}
              onShowReceipt={() => handleOrderAction('show_receipt')}
              onSubmit={() => handleOrderAction('submit_order')}
              onCancel={() => handleOrderAction('cancel_order')}
            />
            <SummaryBox title={`${L('خلاصه سفارش')} - ${L(category.title)}`} lines={summaryLines} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <ImageBackground source={require('@assets/moon.jpg')} style={{ flex: 1 }} imageStyle={{ width: '100%', height: '100%' }}>
      <CustomStatusBar />
      <ScreenHeaders title={L(category.title)} />
      <ScreenTitle
        title={L('انتخاب سیستماتیک')}
        textStyle={{ fontSize: fontSize.xl, letterSpacing: 0.5 }}
        style={{ borderBottomWidth: 3, borderBottomColor: colors.accent.color }}
      />

      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          {L('{n} از {total} مرحله تکمیل شده').replace('{n}', filledCount).replace('{total}', steps.length)}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(filledCount / steps.length) * 100}%` }]} />
        </View>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 40 + footerSpace }}>
        {steps.map((step, index) => (
          <View key={step.id}>
            <AccordionHeader
              title={L(step.title)}
              hint={L(step.hint)}
              icon={step.icon}
              step={index + 1}
              done={isStepFilled(step, answers[step.id])}
              expanded={expanded === step.id}
              onPress={() => toggleSection(step.id)}
              innerRef={registerSection(step.id)}
            />
            {expanded === step.id && <SectionBody>{renderStepBody(step)}</SectionBody>}
          </View>
        ))}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  subLabel: {
    fontFamily: 'VazirBold',
    fontSize: fontSize.xs,
    color: colors.textSecondary.color,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  progressRow: {
    paddingHorizontal: 14,
    marginBottom: spacing.sm,
  },
  progressText: {
    fontFamily: 'VazirLight',
    fontSize: fontSize.xs,
    color: colors.textInverse.color,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  progressTrack: {
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.textInverse.bgColor(0.25),
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.accent.bgColor(1),
  },
});

export default SystematicDeviceScreen;
