import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ImageBackground } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import ScreenHeaders from '@components/ScreenHeaders';
import ScreenTitle from '@components/ScreenTitle';
import CustomStatusBar from '@components/CustomStatusBar';
import DatePickerModal from '@components/DatePickerModal';
import SchedulePicker from '@components/SchedulePicker';
import SavedAddressPicker from '@components/SavedAddressPicker';
import useOrderDraft from '@hooks/useOrderDraft';
import { DRAFT_SOURCE } from '@services/orderDrafts';
import {
  AccordionHeader,
  SectionBody,
  SelectableOptions,
  SubSectionBanner,
  DeviceCountRow,
  DeviceCountTile,
  HardwareCard,
  ProcurementCard,
  CounterWithDescription,
  SummaryBox,
} from '@components/OrgSelectionKit';
import {
  DEVICE_TYPES,
  HARDWARE_ITEMS,
  PROCUREMENT_ITEMS,
  OS_ITEMS,
  SOFTWARE_DEVICE_TYPES,
  SOFTWARE_ITEMS,
  TECHNICIAN_GENDER_OPTIONS,
  TIME_SLOT_OPTIONS,
} from './deviceCatalog';
import NewStyles from '@styles/NewStyles';
import { themeColor0, themeColor7, themeColor10, themeColor11, themeColor4, colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { fontSize } from '@theme/Typography';
import { showAlert, showToastOrAlert, validateMelicode, validatePhone } from '@helpers/Common';
import { useMenu } from '@contexts/MenuContext';
import useAccordionScroll from '@hooks/useAccordionScroll';
import { L, LO } from './orgI18n';
import { getMissingComprehensiveStep } from './comprehensiveValidation';
import { toProcurementItemsPayload } from './procurementPayload';
import { counterLines, procurementLines } from './summaryLines';
import { RECEIPT_STATE, receiptFromComprehensive } from '@services/receipt';
import useReceiptSources from '@hooks/useReceiptSources';

const DELIVERY_MODE_OPTIONS = [
  { id: 'once_short', title: 'کوتاه مدت / یکبار' },
  { id: 'monthly_short', title: 'کوتاه مدت / ماهانه' },
  { id: 'yearly_long', title: 'بلند مدت / سالیانه' },
  { id: 'project', title: 'پروژه‌ای' },
];

const EQUIPMENT_STATUS_OPTIONS = [
  { id: 'needs_software_review', title: 'نیاز به بررسی نرم‌افزاری' },
  { id: 'needs_hardware_review', title: 'نیاز به بررسی سخت‌افزاری' },
  { id: 'supply_technical_review', title: 'تامین کالا / بررسی فنی' },
  { id: 'no_equipment_supply', title: 'فاقد تجهیزات / تامین کالا' },
];

const CRITICAL_INFRA_OPTIONS = [
  { id: 'org_software', title: 'نرم‌افزارهای سازمانی' },
  { id: 'network_internet', title: 'شبکه / اینترنت' },
  { id: 'hardware', title: 'سخت‌افزار' },
];

const SERVICE_LEVEL_OPTIONS = [
  { id: 'standard', title: 'استاندارد' },
  { id: 'priority', title: 'اولویت‌دار' },
  { id: 'emergency', title: 'اضطراری' },
];

const VISIT_FREQUENCY_OPTIONS = [
  { id: 'visits_2', title: '۲ بازدید در ماه' },
  { id: 'visits_4', title: '۴ بازدید در ماه' },
  { id: 'visits_6', title: '۶ بازدید در ماه' },
  { id: 'per_agreement', title: 'طبق توافق‌نامه' },
  { id: 'per_presence', title: 'برحسب زمان حضور' },
  { id: 'project_delivery', title: 'فروش تحویل پروژه' },
  { id: 'project_progress', title: 'طبق پیشرفت پروژه' },
];

const SECTIONS = [
  {
    id: 'delivery_mode',
    title: 'نحوه ارائه خدمات',
    hint: 'مشخص کنید خدمات به چه شکل و در چه بازه‌ای ارائه شود: کوتاه‌مدت/یکبار، ماهانه، سالیانه یا پروژه‌ای.',
    icon: require('@assets/icons/sections/delivery-mode.png'),
  },
  {
    id: 'software_services',
    title: 'خدمات نرم‌افزاری',
    hint: 'تعداد سیستم‌عامل‌ها و نرم‌افزارهای مورد نیاز برای نصب را برای هر مورد مشخص کنید.',
    icon: require('@assets/icons/sections/software-services.png'),
  },
  {
    id: 'hardware_services',
    title: 'خدمات سخت‌افزاری',
    hint: 'تعداد و توضیحات مربوط به سرویس سخت‌افزاری هر دسته از تجهیزات (لپ‌تاپ، کیس، مانیتور و ...) را وارد کنید.',
    icon: require('@assets/icons/sections/hardware-services.png'),
  },
  {
    id: 'procurement',
    title: 'تامین تجهیزات / کالا',
    hint: 'اگر علاوه بر سرویس، قصد خرید کالا یا قطعه دارید (مثلاً یک پرینتر یا لوازم جانبی)، تعداد آکبند/کارکرده هر مورد را وارد کنید.',
    icon: require('@assets/icons/sections/procurement.png'),
  },
  {
    id: 'equipment_status',
    title: 'وضعیت فعلی تجهیزات',
    hint: 'وضعیت کنونی تجهیزات سازمان را از نظر نیاز به بررسی نرم‌افزاری، سخت‌افزاری یا تامین کالا مشخص کنید.',
    icon: require('@assets/icons/sections/equipment-status.png'),
  },
  {
    id: 'critical_infra',
    title: 'زیر ساخت‌های حیاتی',
    hint: 'مهم‌ترین زیرساخت سازمان (نرم‌افزار سازمانی، شبکه/اینترنت یا سخت‌افزار) را انتخاب کنید تا در اولویت بررسی قرار گیرد.',
    icon: require('@assets/icons/sections/critical-infra.png'),
  },
  {
    id: 'service_level',
    title: 'سطح خدمات و تامین تجهیزات',
    hint: 'سطح اولویت ارائه خدمت (استاندارد، اولویت‌دار یا اضطراری) را انتخاب کنید.',
    icon: require('@assets/icons/sections/service-level.png'),
  },
  {
    id: 'time_range',
    title: 'بازه زمانی / رزرو',
    hint: 'بسته به نحوه ارائه خدمات انتخابی، تاریخ، بازه زمانی و تعداد بازدید مورد نیاز را تعیین کنید.',
    icon: require('@assets/icons/sections/time-range.png'),
  },
  {
    id: 'operator_info',
    title: 'اطلاعات اپراتور',
    hint: 'مشخصات فردی که به عنوان اپراتور/رابط سازمان با تکنسین در ارتباط خواهد بود را وارد کنید.',
    icon: require('@assets/icons/sections/operator-info.png'),
  },
  {
    id: 'technician',
    title: 'انتخاب تکنسین',
    hint: 'جنسیت تکنسینی که برای انجام خدمت مراجعه می‌کند را انتخاب کنید.',
    icon: require('@assets/icons/sections/technician.png'),
  },
  {
    id: 'letter_upload',
    title: 'بارگزاری نامه / درخواست',
    hint: 'در صورت نیاز، نامه یا درخواست رسمی سازمان را به‌صورت فایل بارگذاری کنید (اختیاری).',
    icon: require('@assets/icons/sections/letter-upload.png'),
  },
  {
    id: 'order_actions',
    title: 'نمایش / استعلام / ثبت سفارش',
    hint: 'پیش از ثبت نهایی می‌توانید پیش‌رسید را صادر یا مشاهده کنید و در نهایت سفارش را ثبت یا لغو نمایید.',
    icon: require('@assets/icons/sections/order-actions.png'),
  },
  // در JSX درست بعد از «بازه زمانی / رزرو» رندر می‌شود؛ انتهای آرایه آمده تا
  // اندیس‌های SEC[n] بخش‌های قبلی جابه‌جا نشوند.
  {
    id: 'address',
    title: 'آدرس‌های منتخب',
    hint: 'آدرس محل ارائه خدمت را از آدرس‌های ذخیره‌شده انتخاب کنید یا از همین‌جا آدرس جدیدی اضافه کنید.',
    icon: require('@assets/icons/sections/address.png'),
  },
];


// ------------------------------------------------------------------------------------------

const ComprehensiveSelectionScreen = ({ navigation, route }) => {
  // useTranslation subscribes the screen to runtime language switches so L()/LO() re-evaluate.
  const { i18n } = useTranslation();
  // فضای رزرو شده زیر محتوا تا آخرین بخش (نمایش/استعلام/ثبت سفارش) زیر داک شناور پنهان نشود
  const { footerSpace } = useMenu();
  // باز شدن هر بخش، همان بخش را به بالای صفحه می‌آورد تا کاربر مجبور به اسکرول
  // دستی نشود (بخش‌های بلند فرم این مشکل را داشتند).
  const { scrollRef, registerSection, requestScrollTo } = useAccordionScroll();
  const SEC = useMemo(
    () => SECTIONS.map((s) => ({ ...s, title: L(s.title), hint: L(s.hint) })),
    [i18n.language]
  );
  const SEC_ADDRESS = SEC.find((section) => section.id === 'address');
  // برای «وضعیت کاربری» و «مشخصات کاربر» روی پیش‌رسید. آدرس و تلفن ثابت از
  // آدرس‌های ذخیره‌شده و - در نبودشان - از پروفایلِ سازمان می‌آید؛
  // `organization.profileData` هیچ‌جای اپ پر نمی‌شود و به‌تنهایی رسید را
  // «نامشخص» می‌کرد.
  const receiptSources = useReceiptSources();

  const [expanded, setExpanded] = useState('delivery_mode');

  const [deliveryMode, setDeliveryMode] = useState([]);

  const [deviceCounts, setDeviceCounts] = useState({});
  const [osCounts, setOsCounts] = useState({});
  const [softwareDeviceCounts, setSoftwareDeviceCounts] = useState({});
  const [softwareItems, setSoftwareItems] = useState({});

  const [hardwareItems, setHardwareItems] = useState({});
  const [procurementItems, setProcurementItems] = useState({});

  const [equipmentStatus, setEquipmentStatus] = useState([]);
  const [criticalInfra, setCriticalInfra] = useState(null);
  const [serviceLevel, setServiceLevel] = useState(null);

  const [visitFrequency, setVisitFrequency] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(null);
  const [onceDate, setOnceDate] = useState('');

  const [operatorInfo, setOperatorInfo] = useState({
    jobTitle: '', fullName: '', nationalId: '', mobile: '', birthDate: '',
  });
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);

  const [technicianGender, setTechnicianGender] = useState(null);

  const [letterFile, setLetterFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [addressId, setAddressId] = useState(null);
  const handleAddressChange = useCallback((id) => setAddressId(id ?? null), []);

  // سفارش نیمه‌کاره به‌صورت پیش‌نویس ذخیره می‌شود و از «سفارشات» قابل ادامه است.
  const draftData = useMemo(
    () => ({
      deliveryMode,
      deviceCounts,
      osCounts,
      softwareDeviceCounts,
      softwareItems,
      hardwareItems,
      procurementItems,
      equipmentStatus,
      criticalInfra,
      serviceLevel,
      visitFrequency,
      startDate,
      timeSlot,
      onceDate,
      operatorInfo,
      technicianGender,
      letterFile: letterFile
        ? { name: letterFile.name, uri: letterFile.uri, mimeType: letterFile.mimeType, size: letterFile.size }
        : null,
      addressId,
    }),
    [deliveryMode, deviceCounts, osCounts, softwareDeviceCounts, softwareItems, hardwareItems,
      procurementItems, equipmentStatus, criticalInfra, serviceLevel, visitFrequency, startDate,
      timeSlot, onceDate, operatorInfo, technicianGender, letterFile, addressId]
  );

  const draftHasContent = useMemo(
    () =>
      deliveryMode.length > 0 ||
      equipmentStatus.length > 0 ||
      [deviceCounts, osCounts, softwareDeviceCounts].some((map) => Object.values(map).some((n) => n > 0)) ||
      [softwareItems, hardwareItems].some((map) => Object.values(map).some((e) => e?.count > 0)) ||
      Object.values(procurementItems).some((e) => e?.new > 0 || e?.used > 0) ||
      Boolean(criticalInfra || serviceLevel || visitFrequency || startDate || onceDate || timeSlot) ||
      Object.values(operatorInfo).some((v) => String(v || '').trim()) ||
      Boolean(technicianGender || letterFile || addressId),
    [deliveryMode, equipmentStatus, deviceCounts, osCounts, softwareDeviceCounts, softwareItems,
      hardwareItems, procurementItems, criticalInfra, serviceLevel, visitFrequency, startDate,
      onceDate, timeSlot, operatorInfo, technicianGender, letterFile, addressId]
  );

  const restoreDraft = (saved) => {
    if (!saved || typeof saved !== 'object') return;
    if (Array.isArray(saved.deliveryMode)) setDeliveryMode(saved.deliveryMode);
    if (saved.deviceCounts) setDeviceCounts(saved.deviceCounts);
    if (saved.osCounts) setOsCounts(saved.osCounts);
    if (saved.softwareDeviceCounts) setSoftwareDeviceCounts(saved.softwareDeviceCounts);
    if (saved.softwareItems) setSoftwareItems(saved.softwareItems);
    if (saved.hardwareItems) setHardwareItems(saved.hardwareItems);
    if (saved.procurementItems) setProcurementItems(saved.procurementItems);
    if (Array.isArray(saved.equipmentStatus)) setEquipmentStatus(saved.equipmentStatus);
    setCriticalInfra(saved.criticalInfra ?? null);
    setServiceLevel(saved.serviceLevel ?? null);
    setVisitFrequency(saved.visitFrequency ?? null);
    setStartDate(saved.startDate || '');
    setTimeSlot(saved.timeSlot ?? null);
    setOnceDate(saved.onceDate || '');
    if (saved.operatorInfo) setOperatorInfo((prev) => ({ ...prev, ...saved.operatorInfo }));
    setTechnicianGender(saved.technicianGender ?? null);
    setLetterFile(saved.letterFile?.uri ? saved.letterFile : null);
    setAddressId(saved.addressId ?? null);
  };

  const { draftId, discardDraft } = useOrderDraft({
    source: DRAFT_SOURCE.COMPREHENSIVE,
    initialDraftId: route?.params?.draftId,
    meta: { title: L('انتخاب جامع - خدمات سازمانی') },
    data: draftData,
    hasContent: draftHasContent,
    onRestore: restoreDraft,
  });

  const toggleSection = (id) =>
    setExpanded((prev) => {
      if (prev === id) return null;
      requestScrollTo(id);
      return id;
    });

  const changeDeviceCount = (id, delta) =>
    setDeviceCounts((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));

  const changeOsCount = (id, delta) =>
    setOsCounts((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));

  const changeSoftwareDeviceCount = (id, delta) =>
    setSoftwareDeviceCounts((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));

  const updateSoftwareItem = (id, patch) =>
    setSoftwareItems((prev) => ({ ...prev, [id]: { count: 0, desc: '', ...prev[id], ...patch } }));

  const updateHardwareItem = (id, patch) =>
    setHardwareItems((prev) => ({ ...prev, [id]: { count: 0, desc: '', ...prev[id], ...patch } }));

  const updateProcurementItem = (id, key, delta) =>
    setProcurementItems((prev) => {
      const current = prev[id] || { new: 0, used: 0, desc: '' };
      return { ...prev, [id]: { ...current, [key]: Math.max(0, current[key] + delta) } };
    });

  const updateProcurementDesc = (id, desc) =>
    setProcurementItems((prev) => ({ ...prev, [id]: { new: 0, used: 0, ...prev[id], desc } }));

  // «بازه زمانی/رزرو» شرطیه: اگر «کوتاه‌مدت/یکبار» جزو حالت‌های انتخاب‌شده باشد
  // (نحوه ارائه خدمات چندانتخابی است)، فقط تاریخ+ساعت نمایش داده می‌شود.
  const isOnceShort = deliveryMode.includes('once_short');

  const handleUploadLetter = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      setUploading(true);
      setLetterFile(result.assets[0]);
      setUploading(false);
    } catch (e) {
      setUploading(false);
      showToastOrAlert(L('خطا در بارگذاری فایل'));
    }
  };

  // اولین مشکلِ «اطلاعات اپراتور» را با پیامِ دقیق برمی‌گرداند (null یعنی مشکلی نیست).
  // قبلاً برای هر نوع خطا - حتی کد ملیِ پر ولی نامعتبر - فقط «اطلاعات اپراتور را کامل
  // کنید» نمایش داده می‌شد و کاربر نمی‌دانست کدام فیلد ایراد دارد.
  const getOperatorInfoError = () => {
    if (!operatorInfo.jobTitle.trim()) return L('عنوان شغلی اپراتور را وارد کنید.');
    if (!operatorInfo.fullName.trim()) return L('نام و نام خانوادگی اپراتور را وارد کنید.');
    // کد ملی اختیاری است، ولی اگر وارد شده باید معتبر باشد.
    if (operatorInfo.nationalId.trim()) {
      const { isValid, message } = validateMelicode(operatorInfo.nationalId);
      if (!isValid) return `${L('کد ملی اپراتور')}: ${message}`;
    }
    const { isValid, message } = validatePhone(operatorInfo.mobile);
    if (!isValid) return `${L('موبایل اپراتور')}: ${message}`;
    return null;
  };

  const softwareSummaryLines = useMemo(() => {
    const lines = [];
    // تعداد لپ‌تاپ/کیسِ «نصب سیستم عامل» هم باید در خلاصه بیاید - قبلاً فقط
    // سیستم‌عامل‌ها و نرم‌افزارها شمرده می‌شدند و انتخاب کاربر گم می‌شد.
    DEVICE_TYPES.forEach((device) => {
      if (deviceCounts[device.id] > 0) {
        lines.push({ label: L(device.title), value: deviceCounts[device.id] });
      }
    });
    OS_ITEMS.forEach((os) => {
      if (osCounts[os.id] > 0) lines.push({ label: L(os.title), value: osCounts[os.id] });
    });
    SOFTWARE_DEVICE_TYPES.forEach((device) => {
      if (softwareDeviceCounts[device.id] > 0) {
        lines.push({ label: L(device.title), value: softwareDeviceCounts[device.id] });
      }
    });
    // تعداد هر نرم‌افزار و توضیح کاربر برای آن.
    lines.push(...counterLines(softwareItems, LO(SOFTWARE_ITEMS), L));
    return lines;
  }, [deviceCounts, osCounts, softwareDeviceCounts, softwareItems]);

  // توضیح هر قلم هم در خلاصه می‌آید (بند ۴ سند دسکتاپ ۲) - قبلاً فقط تعداد بود.
  const hardwareSummaryLines = useMemo(
    () => counterLines(hardwareItems, LO(HARDWARE_ITEMS), L),
    [hardwareItems]
  );

  const procurementSummaryLines = useMemo(
    () => procurementLines(procurementItems, LO(PROCUREMENT_ITEMS), L),
    [procurementItems]
  );

  const handleOrderAction = (action) => {
    // «انتخاب جامع» روی سرور ثبت نمی‌شود؛ رسید از همین state ساخته می‌شود.
    // این مسیر برند/مدل نمی‌پرسد، پس رسیدش «مشخصات محصول» ندارد.
    const preReceipt = () =>
      receiptFromComprehensive({
        deviceCounts,
        osCounts,
        softwareDeviceCounts,
        softwareItems,
        hardwareItems,
        procurementItems,
        operatorInfo,
        startDate,
        onceDate,
        timeSlot,
        ...receiptSources,
        // آدرسِ همین سفارش (بخش «آدرس‌های منتخب»).
        selectedAddressId: addressId ?? receiptSources.selectedAddressId,
        state: RECEIPT_STATE.PENDING,
      });

    if (action === 'cancel_order') {
      showAlert(L('لغو سفارش'), L('آیا از لغو سفارش مطمئن هستید؟'), [
        { text: L('انصراف'), style: 'cancel' },
        {
          text: L('لغو سفارش'),
          style: 'destructive',
          onPress: async () => {
            // لغو صریح توسط کاربر - تنها حالتی که پیش‌نویس بدون ثبت سفارش پاک می‌شود.
            await discardDraft();
            showToastOrAlert(L('سفارش لغو شد'));
            if (navigation.canGoBack()) navigation.goBack();
          },
        },
      ]);
      return;
    }
    if (action === 'submit_order') {
      // فقط مراحل اجباری سند (بند ۱۱) چک می‌شوند؛ کاربری که فقط تامین کالا
      // می‌خواهد مجبور به پر کردن بخش‌های خدماتی نیست.
      const missing = getMissingComprehensiveStep({
        deviceCounts,
        osCounts,
        softwareDeviceCounts,
        softwareItems,
        hardwareItems,
        procurementItems,
        deliveryMode,
        onceDate,
        startDate,
        timeSlot,
        addressId,
        operatorError: getOperatorInfoError(),
        technicianGender,
      });
      if (missing) {
        showToastOrAlert(L(missing.message));
        setExpanded(missing.section);
        requestScrollTo(missing.section);
        return;
      }
      navigation.navigate('OrderSummaryScreen', {
        source: 'comprehensive',
        // «جامع سازمانی» در بک‌اند category_id ثابت ۳ دارد (طبق ORGANIZATION_ORDER_API.md)،
        // برخلاف «سیستماتیک» که هر کاشی زیرشاخه‌ی متفاوتی است.
        categoryId: 3,
        orderTitle: L('انتخاب جامع - خدمات سازمانی'),
        // هر سه بخش انتخاب‌شده در یک فهرست خلاصه‌ی واحد.
        summaryLines: [
          ...softwareSummaryLines,
          ...hardwareSummaryLines,
          ...procurementSummaryLines,
        ],
        schedule: { date: isOnceShort ? onceDate : startDate, slot: timeSlot },
        contact: { fullName: operatorInfo.fullName, mobile: operatorInfo.mobile },
        addressId,
        draftId,
        orderExtras: {
          procurement_items: toProcurementItemsPayload(procurementItems),
          delivery_mode: deliveryMode,
          technician_gender: technicianGender,
        },
        // پس از ثبت نهایی، OrderSummaryScreen همین رسید را با شماره‌ی سفارش
        // تکمیل و نمایش می‌دهد.
        receipt: preReceipt(),
      });
      return;
    }
    if (action === 'issue_receipt' || action === 'show_receipt') {
      navigation.navigate('OrderReceipt', { receipt: preReceipt() });
      return;
    }
  };

  return (
    <ImageBackground source={require('@assets/moon.jpg')} style={{ flex: 1 }} imageStyle={{ width: '100%', height: '100%' }}>
      <CustomStatusBar />
      <ScreenHeaders title={L('سازمانی / دولتی')} />
      <ScreenTitle
        title={L('انتخاب جامع')}
        textStyle={{ fontSize: fontSize.xl, letterSpacing: 0.5 }}
        style={{ borderBottomWidth: 3, borderBottomColor: colors.accent.color }}
      />

      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 40 + footerSpace }}>

        {/* ۱. نحوه ارائه خدمات */}
        <AccordionHeader
          title={SEC[0].title}
          hint={SEC[0].hint}
          icon={SEC[0].icon}
          expanded={expanded === 'delivery_mode'}
          onPress={() => toggleSection('delivery_mode')}
          innerRef={registerSection('delivery_mode')}
        />
        {expanded === 'delivery_mode' && (
          <SectionBody>
            <SelectableOptions options={LO(DELIVERY_MODE_OPTIONS)} value={deliveryMode} onChange={setDeliveryMode} multi columns={2} />
          </SectionBody>
        )}

        {/* ۲. خدمات نرم‌افزاری */}
        <AccordionHeader
          title={SEC[1].title}
          hint={SEC[1].hint}
          icon={SEC[1].icon}
          expanded={expanded === 'software_services'}
          onPress={() => toggleSection('software_services')}
          innerRef={registerSection('software_services')}
        />
        {expanded === 'software_services' && (
          <SectionBody>
            {/* زیربخش ۱: نصب سیستم عامل */}
            <SubSectionBanner title={L('نصب سیستم عامل')} />

            {/* تعداد دستگاه‌ها */}
            {DEVICE_TYPES.map((device) => (
              <DeviceCountRow
                key={device.id}
                title={L(device.title)}
                image={device.image}
                count={deviceCounts[device.id] || 0}
                onIncrement={() => changeDeviceCount(device.id, 1)}
                onDecrement={() => changeDeviceCount(device.id, -1)}
              />
            ))}

            {/* شبکه‌ی سه‌ستونه‌ی سیستم‌عامل‌ها */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: spacing.md }}>
              {OS_ITEMS.map((os) => (
                <DeviceCountTile
                  key={os.id}
                  title={L(os.title)}
                  image={os.image}
                  count={osCounts[os.id] || 0}
                  onIncrement={() => changeOsCount(os.id, 1)}
                  onDecrement={() => changeOsCount(os.id, -1)}
                />
              ))}
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: colors.border.bgColor(0.9),
                marginTop: spacing.sm,
                marginBottom: spacing.lg,
              }}
            />

            {/* زیربخش ۲: نصب نرم‌افزارها */}
            <SubSectionBanner title={L('نصب نرم‌افزارها')} style={{ marginTop: spacing.sm }} />

            {SOFTWARE_DEVICE_TYPES.map((device) => (
              <DeviceCountRow
                key={device.id}
                title={L(device.title)}
                image={device.image}
                count={softwareDeviceCounts[device.id] || 0}
                onIncrement={() => changeSoftwareDeviceCount(device.id, 1)}
                onDecrement={() => changeSoftwareDeviceCount(device.id, -1)}
              />
            ))}

            {/* موارد توضیح‌دار نصب نرم‌افزار - هرکدام در قاب مستقل */}
            <View style={{ marginTop: spacing.md }}>
              {SOFTWARE_ITEMS.map((item) => {
                const entry = softwareItems[item.id] || { count: 0, desc: '' };
                return (
                  <CounterWithDescription
                    key={item.id}
                    title={L(item.title)}
                    count={entry.count}
                    desc={entry.desc}
                    onIncrement={() => updateSoftwareItem(item.id, { count: entry.count + 1 })}
                    onDecrement={() => updateSoftwareItem(item.id, { count: Math.max(0, entry.count - 1) })}
                    onDescChange={(text) => updateSoftwareItem(item.id, { desc: text })}
                  />
                );
              })}
            </View>

            <SummaryBox title={L('خدمات نرم‌افزاری')} lines={softwareSummaryLines} />
          </SectionBody>
        )}

        {/* ۳. خدمات سخت‌افزاری */}
        <AccordionHeader
          title={SEC[2].title}
          hint={SEC[2].hint}
          icon={SEC[2].icon}
          expanded={expanded === 'hardware_services'}
          onPress={() => toggleSection('hardware_services')}
          innerRef={registerSection('hardware_services')}
        />
        {expanded === 'hardware_services' && (
          <SectionBody>
            {HARDWARE_ITEMS.map((item) => {
              const entry = hardwareItems[item.id] || { count: 0, desc: '' };
              return (
                <HardwareCard
                  key={item.id}
                  image={item.image}
                  title={L(item.title)}
                  count={entry.count}
                  desc={entry.desc}
                  onIncrement={() => updateHardwareItem(item.id, { count: entry.count + 1 })}
                  onDecrement={() => updateHardwareItem(item.id, { count: Math.max(0, entry.count - 1) })}
                  onDescChange={(text) => updateHardwareItem(item.id, { desc: text })}
                />
              );
            })}
            <SummaryBox title={L('خدمات سخت‌افزاری')} lines={hardwareSummaryLines} />
          </SectionBody>
        )}

        {/* ۴. تامین تجهیزات / کالا */}
        <AccordionHeader
          title={SEC[3].title}
          hint={SEC[3].hint}
          icon={SEC[3].icon}
          expanded={expanded === 'procurement'}
          onPress={() => toggleSection('procurement')}
          innerRef={registerSection('procurement')}
        />
        {expanded === 'procurement' && (
          <SectionBody>
            {PROCUREMENT_ITEMS.map((item) => {
              const entry = procurementItems[item.id] || { new: 0, used: 0, desc: '' };
              return (
                <ProcurementCard
                  key={item.id}
                  image={item.image}
                  title={L(item.title)}
                  newCount={entry.new}
                  usedCount={entry.used}
                  desc={entry.desc}
                  onNewInc={() => updateProcurementItem(item.id, 'new', 1)}
                  onNewDec={() => updateProcurementItem(item.id, 'new', -1)}
                  onUsedInc={() => updateProcurementItem(item.id, 'used', 1)}
                  onUsedDec={() => updateProcurementItem(item.id, 'used', -1)}
                  onDescChange={(text) => updateProcurementDesc(item.id, text)}
                />
              );
            })}
            <SummaryBox title={L('تامین تجهیزات / کالا')} lines={procurementSummaryLines} />
          </SectionBody>
        )}

        {/* ۵. وضعیت فعلی تجهیزات */}
        <AccordionHeader
          title={SEC[4].title}
          hint={SEC[4].hint}
          icon={SEC[4].icon}
          expanded={expanded === 'equipment_status'}
          onPress={() => toggleSection('equipment_status')}
          innerRef={registerSection('equipment_status')}
        />
        {expanded === 'equipment_status' && (
          <SectionBody>
            <SelectableOptions options={LO(EQUIPMENT_STATUS_OPTIONS)} value={equipmentStatus} onChange={setEquipmentStatus} multi columns={2} />
          </SectionBody>
        )}

        {/* ۶. زیر ساخت‌های حیاتی */}
        <AccordionHeader
          title={SEC[5].title}
          hint={SEC[5].hint}
          icon={SEC[5].icon}
          expanded={expanded === 'critical_infra'}
          onPress={() => toggleSection('critical_infra')}
          innerRef={registerSection('critical_infra')}
        />
        {expanded === 'critical_infra' && (
          <SectionBody>
            <SelectableOptions options={LO(CRITICAL_INFRA_OPTIONS)} value={criticalInfra} onChange={setCriticalInfra} columns={3} />
          </SectionBody>
        )}

        {/* ۷. سطح خدمات و تامین تجهیزات */}
        <AccordionHeader
          title={SEC[6].title}
          hint={SEC[6].hint}
          icon={SEC[6].icon}
          expanded={expanded === 'service_level'}
          onPress={() => toggleSection('service_level')}
          innerRef={registerSection('service_level')}
        />
        {expanded === 'service_level' && (
          <SectionBody>
            <SelectableOptions options={LO(SERVICE_LEVEL_OPTIONS)} value={serviceLevel} onChange={setServiceLevel} columns={3} />
          </SectionBody>
        )}

        {/* ۸. بازه زمانی / رزرو - شرطی به «نحوه ارائه خدمات» */}
        <AccordionHeader
          title={SEC[7].title}
          hint={SEC[7].hint}
          icon={SEC[7].icon}
          expanded={expanded === 'time_range'}
          onPress={() => toggleSection('time_range')}
          innerRef={registerSection('time_range')}
        />
        {expanded === 'time_range' && (
          <SectionBody>
            {/* «تعداد بازدید» همیشه دیده می‌شود؛ ولی وقتی خدمت «کوتاه مدت / یکبار»
                باشد معنایی ندارد، پس قفل و غیرفعال می‌شود تا کاربر ببیند چرا
                نمی‌تواند «۶ بار در ماه» را انتخاب کند. */}
            <SubSectionBanner title={L('تعداد بازدید')} />
            {isOnceShort ? (
              <Text style={{ fontFamily: 'VazirLight', fontSize: fontSize.xs, color: themeColor10.bgColor(0.7), marginBottom: spacing.sm }}>
                {L('چون «کوتاه مدت / یکبار» انتخاب شده، تعداد بازدید قفل است و فقط روز و بازه ساعتی مراجعه را انتخاب می‌کنید.')}
              </Text>
            ) : null}
            <SelectableOptions
              options={LO(VISIT_FREQUENCY_OPTIONS)}
              value={isOnceShort ? null : visitFrequency}
              onChange={setVisitFrequency}
              columns={2}
              disabled={isOnceShort}
            />
            <View style={{ height: spacing.md }} />
            {isOnceShort ? (
              <SchedulePicker
                date={onceDate}
                onChangeDate={setOnceDate}
                slot={timeSlot}
                onChangeSlot={setTimeSlot}
                slots={LO(TIME_SLOT_OPTIONS)}
              />
            ) : (
              <SchedulePicker
                date={startDate}
                onChangeDate={setStartDate}
                slot={timeSlot}
                onChangeSlot={setTimeSlot}
                slots={LO(TIME_SLOT_OPTIONS)}
                dateTitle={L('تاریخ شروع')}
              />
            )}
          </SectionBody>
        )}

        {/* ۸-۱. آدرس‌های منتخب - بعد از «بازه زمانی / رزرو» */}
        <AccordionHeader
          title={SEC_ADDRESS.title}
          hint={SEC_ADDRESS.hint}
          icon={SEC_ADDRESS.icon}
          expanded={expanded === 'address'}
          onPress={() => toggleSection('address')}
          innerRef={registerSection('address')}
        />
        {expanded === 'address' && (
          <SectionBody>
            <SavedAddressPicker value={addressId} onChange={handleAddressChange} navigation={navigation} />
          </SectionBody>
        )}

        {/* ۹. اطلاعات اپراتور */}
        <AccordionHeader
          title={SEC[8].title}
          hint={SEC[8].hint}
          icon={SEC[8].icon}
          expanded={expanded === 'operator_info'}
          onPress={() => toggleSection('operator_info')}
          innerRef={registerSection('operator_info')}
        />
        {expanded === 'operator_info' && (
          <SectionBody>
            <TextInput
              value={operatorInfo.jobTitle}
              onChangeText={(t) => setOperatorInfo((p) => ({ ...p, jobTitle: t }))}
              placeholder={L('عنوان شغلی اپراتور')}
              placeholderTextColor={themeColor10.bgColor(0.4)}
              style={[NewStyles.textInput, NewStyles.border10, { marginBottom: 8 }]}
            />
            <TextInput
              value={operatorInfo.fullName}
              onChangeText={(t) => setOperatorInfo((p) => ({ ...p, fullName: t }))}
              placeholder={L('نام و نام خانوادگی اپراتور')}
              placeholderTextColor={themeColor10.bgColor(0.4)}
              style={[NewStyles.textInput, NewStyles.border10, { marginBottom: 8 }]}
            />
            <TextInput
              value={operatorInfo.nationalId}
              onChangeText={(t) => setOperatorInfo((p) => ({ ...p, nationalId: t }))}
              placeholder={L('شماره ملی اپراتور')}
              placeholderTextColor={themeColor10.bgColor(0.4)}
              keyboardType="number-pad"
              style={[NewStyles.textInput, NewStyles.border10, { marginBottom: 8 }]}
            />
            <TextInput
              value={operatorInfo.mobile}
              onChangeText={(t) => setOperatorInfo((p) => ({ ...p, mobile: t }))}
              placeholder={L('شماره تلفن موبایل اپراتور')}
              placeholderTextColor={themeColor10.bgColor(0.4)}
              keyboardType="phone-pad"
              style={[NewStyles.textInput, NewStyles.border10, { marginBottom: 8 }]}
            />
            <TouchableOpacity
              onPress={() => setShowBirthDatePicker(true)}
              style={[NewStyles.textInput, NewStyles.border10, { justifyContent: 'center' }]}
            >
              <Text style={{ fontFamily: 'VazirLight', color: themeColor10.bgColor(operatorInfo.birthDate ? 1 : 0.5) }}>
                {operatorInfo.birthDate || L('تاریخ تولد (روز/ماه/سال)')}
              </Text>
            </TouchableOpacity>
            <DatePickerModal
              datePickerModal={showBirthDatePicker}
              setDatePickerModal={setShowBirthDatePicker}
              birthDate={operatorInfo.birthDate}
              setBirthDate={(d) => setOperatorInfo((p) => ({ ...p, birthDate: d }))}
            />
          </SectionBody>
        )}

        {/* ۱۰. انتخاب تکنسین - فعلاً فقط انتخاب جنسیت تکنسین */}
        <AccordionHeader
          title={SEC[9].title}
          hint={SEC[9].hint}
          icon={SEC[9].icon}
          expanded={expanded === 'technician'}
          onPress={() => toggleSection('technician')}
          innerRef={registerSection('technician')}
        />
        {expanded === 'technician' && (
          <SectionBody>
            <SelectableOptions
              options={LO(TECHNICIAN_GENDER_OPTIONS)}
              value={technicianGender}
              onChange={setTechnicianGender}
              columns={2}
            />
          </SectionBody>
        )}

        {/* ۱۱. بارگزاری نامه / درخواست - اختیاری، باکس آپلود بزرگ */}
        <AccordionHeader
          title={SEC[10].title}
          hint={SEC[10].hint}
          icon={SEC[10].icon}
          expanded={expanded === 'letter_upload'}
          onPress={() => toggleSection('letter_upload')}
          innerRef={registerSection('letter_upload')}
        />
        {expanded === 'letter_upload' && (
          <SectionBody>
            <TouchableOpacity
              onPress={handleUploadLetter}
              disabled={uploading}
              style={{
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: themeColor0.bgColor(0.5),
                borderRadius: 12,
                paddingVertical: 30,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: themeColor0.bgColor(0.04),
              }}
            >
              <Ionicons name="cloud-upload-outline" size={32} color={themeColor0.bgColor(0.8)} />
              <Text style={{ fontFamily: 'VazirBold', fontSize: 13, color: themeColor10.bgColor(0.8), marginTop: 8 }}>
                {letterFile ? letterFile.name : L('بارگزاری نامه (اختیاری)')}
              </Text>
            </TouchableOpacity>
          </SectionBody>
        )}

        {/* ۱۲. نمایش / استعلام / ثبت سفارش */}
        <AccordionHeader
          title={SEC[11].title}
          hint={SEC[11].hint}
          icon={SEC[11].icon}
          expanded={expanded === 'order_actions'}
          onPress={() => toggleSection('order_actions')}
          innerRef={registerSection('order_actions')}
        />
        {expanded === 'order_actions' && (
          <SectionBody>
            <TouchableOpacity
              onPress={() => handleOrderAction('issue_receipt')}
              style={{ backgroundColor: themeColor7.bgColor(1), borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 8 }}
            >
              <Text style={{ color: themeColor4.bgColor(1), fontFamily: 'VazirBold' }}>{L('صدور پیش‌رسید')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleOrderAction('show_receipt')}
              style={{ backgroundColor: themeColor0.bgColor(1), borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 8 }}
            >
              <Text style={{ color: themeColor4.bgColor(1), fontFamily: 'VazirBold' }}>{L('نمایش پیش‌رسید')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleOrderAction('submit_order')}
              style={{ backgroundColor: themeColor7.bgColor(1), borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 8 }}
            >
              <Text style={{ color: themeColor4.bgColor(1), fontFamily: 'VazirBold' }}>{L('ثبت سفارش')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleOrderAction('cancel_order')}
              style={{ backgroundColor: themeColor11.bgColor(1), borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: themeColor4.bgColor(1), fontFamily: 'VazirBold' }}>{L('لغو سفارش')}</Text>
            </TouchableOpacity>
          </SectionBody>
        )}

      </ScrollView>
    </ImageBackground>
  );
};

export default ComprehensiveSelectionScreen;
