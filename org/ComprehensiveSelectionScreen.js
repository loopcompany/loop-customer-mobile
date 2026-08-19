import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ImageBackground, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import ScreenHeaders from '../components/ScreenHeaders';
import ScreenTitle from '../components/ScreenTitle';
import CustomStatusBar from '../components/CustomStatusBar';
import DatePickerModal from '../components/DatePickerModal';
import {
  AccordionHeader,
  SectionBody,
  RadioList,
  SelectableOptions,
  MiniCounter,
  HardwareCard,
  ProcurementCard,
  CounterWithDescription,
  SummaryBox,
} from '../components/OrgSelectionKit';
import {
  DEVICE_TYPES,
  HARDWARE_ITEMS,
  PROCUREMENT_ITEMS,
  OS_ITEMS,
  SOFTWARE_ITEMS,
  TIME_SLOT_OPTIONS,
} from './deviceCatalog';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor7, themeColor10, themeColor11, themeColor4, themeColor14, colors } from '../theme/Color';
import { fontSize } from '../theme/Typography';
import { showAlert, showToastOrAlert, validateMelicode } from '../helpers/Common';

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
    icon: require('../assets/icons/sections/delivery-mode.png'),
  },
  {
    id: 'software_services',
    title: 'خدمات نرم‌افزاری',
    hint: 'تعداد سیستم‌عامل‌ها و نرم‌افزارهای مورد نیاز برای نصب را برای هر مورد مشخص کنید.',
    icon: require('../assets/icons/sections/software-services.png'),
  },
  {
    id: 'hardware_services',
    title: 'خدمات سخت‌افزاری',
    hint: 'تعداد و توضیحات مربوط به سرویس سخت‌افزاری هر دسته از تجهیزات (لپ‌تاپ، کیس، مانیتور و ...) را وارد کنید.',
    icon: require('../assets/icons/sections/hardware-services.png'),
  },
  {
    id: 'procurement',
    title: 'تامین تجهیزات / کالا',
    hint: 'تعداد تجهیزات آکبند یا کارکرده‌ای که نیاز به تامین دارید را برای هر دسته وارد کنید.',
    icon: require('../assets/icons/sections/procurement.png'),
  },
  {
    id: 'equipment_status',
    title: 'وضعیت فعلی تجهیزات',
    hint: 'وضعیت کنونی تجهیزات سازمان را از نظر نیاز به بررسی نرم‌افزاری، سخت‌افزاری یا تامین کالا مشخص کنید.',
    icon: require('../assets/icons/sections/equipment-status.png'),
  },
  {
    id: 'critical_infra',
    title: 'زیر ساخت‌های حیاتی',
    hint: 'مهم‌ترین زیرساخت سازمان (نرم‌افزار سازمانی، شبکه/اینترنت یا سخت‌افزار) را انتخاب کنید تا در اولویت بررسی قرار گیرد.',
    icon: require('../assets/icons/sections/critical-infra.png'),
  },
  {
    id: 'service_level',
    title: 'سطح خدمات و تامین تجهیزات',
    hint: 'سطح اولویت ارائه خدمت (استاندارد، اولویت‌دار یا اضطراری) را انتخاب کنید.',
    icon: require('../assets/icons/sections/service-level.png'),
  },
  {
    id: 'time_range',
    title: 'بازه زمانی / رزرو',
    hint: 'بسته به نحوه ارائه خدمات انتخابی، تاریخ، بازه زمانی و تعداد بازدید مورد نیاز را تعیین کنید.',
    icon: require('../assets/icons/sections/time-range.png'),
  },
  {
    id: 'operator_info',
    title: 'اطلاعات اپراتور',
    hint: 'مشخصات فردی که به عنوان اپراتور/رابط سازمان با تکنسین در ارتباط خواهد بود را وارد کنید.',
    icon: require('../assets/icons/sections/operator-info.png'),
  },
  {
    id: 'technician',
    title: 'انتخاب تکنسین',
    hint: 'این بخش برای انتخاب مستقیم تکنسین به‌زودی فعال می‌شود.',
    icon: require('../assets/icons/sections/technician.png'),
  },
  {
    id: 'letter_upload',
    title: 'بارگزاری نامه / درخواست',
    hint: 'در صورت نیاز، نامه یا درخواست رسمی سازمان را به‌صورت فایل بارگذاری کنید (اختیاری).',
    icon: require('../assets/icons/sections/letter-upload.png'),
  },
  {
    id: 'order_actions',
    title: 'نمایش / استعلام / ثبت سفارش',
    hint: 'پیش از ثبت نهایی می‌توانید پیش‌رسید را صادر یا مشاهده کنید و در نهایت سفارش را ثبت یا لغو نمایید.',
    icon: require('../assets/icons/sections/order-actions.png'),
  },
];


// ------------------------------------------------------------------------------------------

const ComprehensiveSelectionScreen = ({ navigation }) => {
  const [expanded, setExpanded] = useState('delivery_mode');

  const [deliveryMode, setDeliveryMode] = useState([]);

  const [deviceCounts, setDeviceCounts] = useState({});
  const [osCounts, setOsCounts] = useState({});
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
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [operatorInfo, setOperatorInfo] = useState({
    jobTitle: '', fullName: '', nationalId: '', mobile: '', birthDate: '',
  });
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);

  const [letterFile, setLetterFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const toggleSection = (id) => setExpanded((prev) => (prev === id ? null : id));

  const changeDeviceCount = (id, delta) =>
    setDeviceCounts((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));

  const changeOsCount = (id, delta) =>
    setOsCounts((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));

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
    setProcurementItems((prev) => ({ ...prev, [id]: { new: 0, used: 0, desc: '', ...prev[id], desc } }));

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
      showToastOrAlert('خطا در بارگذاری فایل');
    }
  };

  const validateOperatorInfo = () => {
    if (!operatorInfo.jobTitle || !operatorInfo.fullName || !operatorInfo.mobile) {
      return false;
    }
    if (operatorInfo.nationalId) {
      const { isValid } = validateMelicode(operatorInfo.nationalId);
      if (!isValid) return false;
    }
    return true;
  };

  const handleOrderAction = (action) => {
    if (action === 'cancel_order') {
      showAlert('لغو سفارش', 'آیا از لغو سفارش مطمئن هستید؟', [
        { text: 'انصراف', style: 'cancel' },
        { text: 'لغو سفارش', style: 'destructive', onPress: () => showToastOrAlert('سفارش لغو شد') },
      ]);
      return;
    }
    if (action === 'submit_order') {
      if (!validateOperatorInfo()) {
        showToastOrAlert('لطفاً اطلاعات اپراتور را کامل کنید.');
        setExpanded('operator_info');
        return;
      }
      navigation.navigate('OrderSummaryScreen');
      return;
    }
    if (action === 'issue_receipt') {
      showToastOrAlert('پیش‌رسید صادر شد');
      return;
    }
    if (action === 'show_receipt') {
      showToastOrAlert('نمایش پیش‌رسید');
      return;
    }
  };

  const softwareSummaryLines = useMemo(() => {
    const lines = [];
    OS_ITEMS.forEach((os) => {
      if (osCounts[os.id] > 0) lines.push({ label: os.title, value: osCounts[os.id] });
    });
    SOFTWARE_ITEMS.forEach((item) => {
      const entry = softwareItems[item.id];
      if (entry?.count > 0) lines.push({ label: item.title, value: entry.count });
    });
    return lines;
  }, [osCounts, softwareItems]);

  const hardwareSummaryLines = useMemo(() => {
    return HARDWARE_ITEMS
      .filter((item) => hardwareItems[item.id]?.count > 0)
      .map((item) => ({ label: item.title, value: hardwareItems[item.id].count }));
  }, [hardwareItems]);

  const procurementSummaryLines = useMemo(() => {
    const lines = [];
    PROCUREMENT_ITEMS.forEach((item) => {
      const entry = procurementItems[item.id];
      if (entry?.new > 0) lines.push({ label: `${item.title} / آکبند`, value: entry.new });
      if (entry?.used > 0) lines.push({ label: `${item.title} / کارکرده`, value: entry.used });
    });
    return lines;
  }, [procurementItems]);

  return (
    <ImageBackground source={require('../assets/moon.jpg')} style={{ flex: 1 }} imageStyle={{ width: '100%', height: '100%' }}>
      <CustomStatusBar />
      <ScreenHeaders title="سازمانی / دولتی" />
      <ScreenTitle
        title="انتخاب جامع"
        textStyle={{ fontSize: fontSize.xl, letterSpacing: 0.5 }}
        style={{ borderBottomWidth: 3, borderBottomColor: colors.accent.color }}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 40 }}>

        {/* ۱. نحوه ارائه خدمات */}
        <AccordionHeader
          title={SECTIONS[0].title}
          hint={SECTIONS[0].hint}
          icon={SECTIONS[0].icon}
          expanded={expanded === 'delivery_mode'}
          onPress={() => toggleSection('delivery_mode')}
        />
        {expanded === 'delivery_mode' && (
          <SectionBody>
            <SelectableOptions options={DELIVERY_MODE_OPTIONS} value={deliveryMode} onChange={setDeliveryMode} multi columns={2} />
          </SectionBody>
        )}

        {/* ۲. خدمات نرم‌افزاری */}
        <AccordionHeader
          title={SECTIONS[1].title}
          hint={SECTIONS[1].hint}
          icon={SECTIONS[1].icon}
          expanded={expanded === 'software_services'}
          onPress={() => toggleSection('software_services')}
        />
        {expanded === 'software_services' && (
          <SectionBody>
            {/* بنر «نصب سیستم عامل» */}
            <View style={{ position: 'relative', marginBottom: 18 }}>
              <View
                style={{
                  backgroundColor: themeColor0.bgColor(1),
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontFamily: 'VazirBold', fontSize: 14 }}>
                  نصب سیستم عامل
                </Text>
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: -8,
                  alignSelf: 'center',
                  width: 0,
                  height: 0,
                  borderLeftWidth: 9,
                  borderRightWidth: 9,
                  borderTopWidth: 8,
                  borderLeftColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderTopColor: themeColor0.color,
                }}
              />
            </View>

            {/* تعداد دستگاه‌ها */}
            {DEVICE_TYPES.map((device) => (
              <View
                key={device.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: themeColor10.bgColor(0.08),
                }}
              >
                <Text style={{ fontFamily: 'VazirBold', fontSize: 14, color: themeColor10.bgColor(1) }}>
                  {device.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MiniCounter
                    count={deviceCounts[device.id] || 0}
                    onIncrement={() => changeDeviceCount(device.id, 1)}
                    onDecrement={() => changeDeviceCount(device.id, -1)}
                  />
                  <View
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 12,
                      backgroundColor: themeColor14.bgColor(1),
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: 10,
                    }}
                  >
                    <Image source={device.image} style={{ width: 40, height: 40 }} resizeMode="contain" />
                  </View>
                </View>
              </View>
            ))}

            {/* شبکه‌ی سه‌ستونه‌ی سیستم‌عامل‌ها */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 }}>
              {OS_ITEMS.map((os) => (
                <View key={os.id} style={{ width: '31%', alignItems: 'center', marginBottom: 18 }}>
                  <Image
                    source={os.image}
                    style={{ width: 72, height: 72, marginBottom: 6 }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{ fontFamily: 'VazirBold', fontSize: 11, color: themeColor10.bgColor(0.85), textAlign: 'center', marginBottom: 6 }}
                    numberOfLines={1}
                  >
                    {os.title}
                  </Text>
                  <MiniCounter
                    count={osCounts[os.id] || 0}
                    onIncrement={() => changeOsCount(os.id, 1)}
                    onDecrement={() => changeOsCount(os.id, -1)}
                  />
                </View>
              ))}
            </View>

            <View style={{ height: 1, backgroundColor: themeColor10.bgColor(0.1), marginVertical: 10 }} />

            {SOFTWARE_ITEMS.map((item) => {
              const entry = softwareItems[item.id] || { count: 0, desc: '' };
              return (
                <CounterWithDescription
                  key={item.id}
                  title={item.title}
                  count={entry.count}
                  desc={entry.desc}
                  onIncrement={() => updateSoftwareItem(item.id, { count: entry.count + 1 })}
                  onDecrement={() => updateSoftwareItem(item.id, { count: Math.max(0, entry.count - 1) })}
                  onDescChange={(text) => updateSoftwareItem(item.id, { desc: text })}
                />
              );
            })}

            <SummaryBox title="خدمات نرم‌افزاری" lines={softwareSummaryLines} />
          </SectionBody>
        )}

        {/* ۳. خدمات سخت‌افزاری */}
        <AccordionHeader
          title={SECTIONS[2].title}
          hint={SECTIONS[2].hint}
          icon={SECTIONS[2].icon}
          expanded={expanded === 'hardware_services'}
          onPress={() => toggleSection('hardware_services')}
        />
        {expanded === 'hardware_services' && (
          <SectionBody>
            {HARDWARE_ITEMS.map((item) => {
              const entry = hardwareItems[item.id] || { count: 0, desc: '' };
              return (
                <HardwareCard
                  key={item.id}
                  image={item.image}
                  title={item.title}
                  count={entry.count}
                  desc={entry.desc}
                  onIncrement={() => updateHardwareItem(item.id, { count: entry.count + 1 })}
                  onDecrement={() => updateHardwareItem(item.id, { count: Math.max(0, entry.count - 1) })}
                  onDescChange={(text) => updateHardwareItem(item.id, { desc: text })}
                />
              );
            })}
            <SummaryBox title="خدمات سخت‌افزاری" lines={hardwareSummaryLines} />
          </SectionBody>
        )}

        {/* ۴. تامین تجهیزات / کالا */}
        <AccordionHeader
          title={SECTIONS[3].title}
          hint={SECTIONS[3].hint}
          icon={SECTIONS[3].icon}
          expanded={expanded === 'procurement'}
          onPress={() => toggleSection('procurement')}
        />
        {expanded === 'procurement' && (
          <SectionBody>
            {PROCUREMENT_ITEMS.map((item) => {
              const entry = procurementItems[item.id] || { new: 0, used: 0, desc: '' };
              return (
                <ProcurementCard
                  key={item.id}
                  image={item.image}
                  title={item.title}
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
            <SummaryBox title="تامین تجهیزات / کالا" lines={procurementSummaryLines} />
          </SectionBody>
        )}

        {/* ۵. وضعیت فعلی تجهیزات */}
        <AccordionHeader
          title={SECTIONS[4].title}
          hint={SECTIONS[4].hint}
          icon={SECTIONS[4].icon}
          expanded={expanded === 'equipment_status'}
          onPress={() => toggleSection('equipment_status')}
        />
        {expanded === 'equipment_status' && (
          <SectionBody>
            <SelectableOptions options={EQUIPMENT_STATUS_OPTIONS} value={equipmentStatus} onChange={setEquipmentStatus} multi columns={2} />
          </SectionBody>
        )}

        {/* ۶. زیر ساخت‌های حیاتی */}
        <AccordionHeader
          title={SECTIONS[5].title}
          hint={SECTIONS[5].hint}
          icon={SECTIONS[5].icon}
          expanded={expanded === 'critical_infra'}
          onPress={() => toggleSection('critical_infra')}
        />
        {expanded === 'critical_infra' && (
          <SectionBody>
            <SelectableOptions options={CRITICAL_INFRA_OPTIONS} value={criticalInfra} onChange={setCriticalInfra} columns={3} />
          </SectionBody>
        )}

        {/* ۷. سطح خدمات و تامین تجهیزات */}
        <AccordionHeader
          title={SECTIONS[6].title}
          hint={SECTIONS[6].hint}
          icon={SECTIONS[6].icon}
          expanded={expanded === 'service_level'}
          onPress={() => toggleSection('service_level')}
        />
        {expanded === 'service_level' && (
          <SectionBody>
            <SelectableOptions options={SERVICE_LEVEL_OPTIONS} value={serviceLevel} onChange={setServiceLevel} columns={3} />
          </SectionBody>
        )}

        {/* ۸. بازه زمانی / رزرو - شرطی به «نحوه ارائه خدمات» */}
        <AccordionHeader
          title={SECTIONS[7].title}
          hint={SECTIONS[7].hint}
          icon={SECTIONS[7].icon}
          expanded={expanded === 'time_range'}
          onPress={() => toggleSection('time_range')}
        />
        {expanded === 'time_range' && (
          <SectionBody>
            {isOnceShort ? (
              <>
                <Text style={{ fontFamily: 'VazirLight', fontSize: 12, color: themeColor10.bgColor(0.7), marginBottom: 8 }}>
                  چون «کوتاه مدت / یکبار» انتخاب شده، فقط تاریخ و ساعت را انتخاب کنید.
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={[NewStyles.textInput, NewStyles.border10, { justifyContent: 'center' }]}
                >
                  <Text style={{ fontFamily: 'VazirLight', color: themeColor10.bgColor(onceDate ? 1 : 0.5) }}>
                    {onceDate || 'انتخاب تاریخ'}
                  </Text>
                </TouchableOpacity>
                <View style={{ height: 8 }} />
                <RadioList options={TIME_SLOT_OPTIONS} value={timeSlot} onChange={setTimeSlot} />
              </>
            ) : (
              <>
                <RadioList options={VISIT_FREQUENCY_OPTIONS} value={visitFrequency} onChange={setVisitFrequency} />
                <View style={{ height: 8 }} />
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={[NewStyles.textInput, NewStyles.border10, { justifyContent: 'center' }]}
                >
                  <Text style={{ fontFamily: 'VazirLight', color: themeColor10.bgColor(startDate ? 1 : 0.5) }}>
                    {startDate || 'تاریخ شروع'}
                  </Text>
                </TouchableOpacity>
                <View style={{ height: 8 }} />
                <RadioList options={TIME_SLOT_OPTIONS} value={timeSlot} onChange={setTimeSlot} />
              </>
            )}

            <DatePickerModal
              datePickerModal={showDatePicker}
              setDatePickerModal={setShowDatePicker}
              birthDate={isOnceShort ? onceDate : startDate}
              setBirthDate={isOnceShort ? setOnceDate : setStartDate}
            />
          </SectionBody>
        )}

        {/* ۹. اطلاعات اپراتور */}
        <AccordionHeader
          title={SECTIONS[8].title}
          hint={SECTIONS[8].hint}
          icon={SECTIONS[8].icon}
          expanded={expanded === 'operator_info'}
          onPress={() => toggleSection('operator_info')}
        />
        {expanded === 'operator_info' && (
          <SectionBody>
            <TextInput
              value={operatorInfo.jobTitle}
              onChangeText={(t) => setOperatorInfo((p) => ({ ...p, jobTitle: t }))}
              placeholder="عنوان شغلی اپراتور"
              placeholderTextColor={themeColor10.bgColor(0.4)}
              style={[NewStyles.textInput, NewStyles.border10, { marginBottom: 8 }]}
            />
            <TextInput
              value={operatorInfo.fullName}
              onChangeText={(t) => setOperatorInfo((p) => ({ ...p, fullName: t }))}
              placeholder="نام و نام خانوادگی اپراتور"
              placeholderTextColor={themeColor10.bgColor(0.4)}
              style={[NewStyles.textInput, NewStyles.border10, { marginBottom: 8 }]}
            />
            <TextInput
              value={operatorInfo.nationalId}
              onChangeText={(t) => setOperatorInfo((p) => ({ ...p, nationalId: t }))}
              placeholder="شماره ملی اپراتور"
              placeholderTextColor={themeColor10.bgColor(0.4)}
              keyboardType="number-pad"
              style={[NewStyles.textInput, NewStyles.border10, { marginBottom: 8 }]}
            />
            <TextInput
              value={operatorInfo.mobile}
              onChangeText={(t) => setOperatorInfo((p) => ({ ...p, mobile: t }))}
              placeholder="شماره تلفن موبایل اپراتور"
              placeholderTextColor={themeColor10.bgColor(0.4)}
              keyboardType="phone-pad"
              style={[NewStyles.textInput, NewStyles.border10, { marginBottom: 8 }]}
            />
            <TouchableOpacity
              onPress={() => setShowBirthDatePicker(true)}
              style={[NewStyles.textInput, NewStyles.border10, { justifyContent: 'center' }]}
            >
              <Text style={{ fontFamily: 'VazirLight', color: themeColor10.bgColor(operatorInfo.birthDate ? 1 : 0.5) }}>
                {operatorInfo.birthDate || 'تاریخ تولد (روز/ماه/سال)'}
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

        {/* ۱۰. انتخاب تکنسین - placeholder / به زودی */}
        <AccordionHeader
          title={SECTIONS[9].title}
          hint={SECTIONS[9].hint}
          icon={SECTIONS[9].icon}
          expanded={expanded === 'technician'}
          onPress={() => toggleSection('technician')}
        />
        {expanded === 'technician' && (
          <SectionBody>
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Ionicons name="time-outline" size={28} color={themeColor10.bgColor(0.4)} />
              <Text style={{ fontFamily: 'VazirBold', fontSize: 14, color: themeColor10.bgColor(0.5), marginTop: 8 }}>
                به زودی
              </Text>
            </View>
          </SectionBody>
        )}

        {/* ۱۱. بارگزاری نامه / درخواست - اختیاری، باکس آپلود بزرگ */}
        <AccordionHeader
          title={SECTIONS[10].title}
          hint={SECTIONS[10].hint}
          icon={SECTIONS[10].icon}
          expanded={expanded === 'letter_upload'}
          onPress={() => toggleSection('letter_upload')}
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
                {letterFile ? letterFile.name : 'بارگزاری نامه (اختیاری)'}
              </Text>
            </TouchableOpacity>
          </SectionBody>
        )}

        {/* ۱۲. نمایش / استعلام / ثبت سفارش */}
        <AccordionHeader
          title={SECTIONS[11].title}
          hint={SECTIONS[11].hint}
          icon={SECTIONS[11].icon}
          expanded={expanded === 'order_actions'}
          onPress={() => toggleSection('order_actions')}
        />
        {expanded === 'order_actions' && (
          <SectionBody>
            <TouchableOpacity
              onPress={() => handleOrderAction('issue_receipt')}
              style={{ backgroundColor: themeColor7.bgColor(1), borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 8 }}
            >
              <Text style={{ color: themeColor4.bgColor(1), fontFamily: 'VazirBold' }}>صدور پیش‌رسید</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleOrderAction('show_receipt')}
              style={{ backgroundColor: themeColor0.bgColor(1), borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 8 }}
            >
              <Text style={{ color: themeColor4.bgColor(1), fontFamily: 'VazirBold' }}>نمایش پیش‌رسید</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleOrderAction('submit_order')}
              style={{ backgroundColor: themeColor7.bgColor(1), borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 8 }}
            >
              <Text style={{ color: themeColor4.bgColor(1), fontFamily: 'VazirBold' }}>ثبت سفارش</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleOrderAction('cancel_order')}
              style={{ backgroundColor: themeColor11.bgColor(1), borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: themeColor4.bgColor(1), fontFamily: 'VazirBold' }}>لغو سفارش</Text>
            </TouchableOpacity>
          </SectionBody>
        )}

      </ScrollView>
    </ImageBackground>
  );
};

export default ComprehensiveSelectionScreen;
