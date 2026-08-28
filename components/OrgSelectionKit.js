// کیت رابط کاربری مشترک مسیرهای سازمانی («انتخاب جامع» و «انتخاب سیستماتیک»).
// این کامپوننت‌ها ابتدا داخل org/ComprehensiveSelectionScreen.js نوشته شده بودند و
// چون «انتخاب سیستماتیک» باید دقیقاً همان استایل را داشته باشد، به اینجا منتقل شدند
// تا هر دو مسیر از یک منبع واحد استفاده کنند (نه دو نسخه‌ی جدا که از هم دور می‌افتند).
import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import HintBadge from './HintBadge';
import { showToastOrAlert } from '@helpers/Common';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor10, colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize } from '@theme/Typography';
import { shadow } from '@theme/Shadows';

// سربرگ آکاردئونی هر بخش. با پاس‌دادن step، شماره‌ی مرحله در سمت راست عنوان
// نمایش داده می‌شود (حالت stepper در «انتخاب سیستماتیک»).
export const AccordionHeader = ({ title, hint, icon, expanded, onPress, step, done }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      marginTop: 6,
    }}
  >
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: '100%',
        backgroundColor: themeColor0.bgColor(1),
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View style={{ width: 26, alignItems: 'flex-start' }}>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={themeColor1.bgColor(1)}
        />
      </View>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {icon ? <Image source={icon} style={{ width: 36, height: 36, marginHorizontal: spacing.xs }} resizeMode="contain" /> : null}
        <Text
          style={{
            color: themeColor4.bgColor(1),
            fontSize: fontSize.md,
            fontWeight: 'bold',
            fontFamily: 'VazirBold',
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
        {step ? <StepBadge step={step} done={done} /> : null}
      </View>
      <View style={{ width: 26, alignItems: 'flex-end' }}>
        <HintBadge hint={hint} title={title} size={22} />
      </View>
    </TouchableOpacity>
  </View>
);

// شماره‌ی مرحله کنار عنوان - وقتی مرحله تکمیل شده باشد تیک سبز نشان می‌دهد.
export const StepBadge = ({ step, done }) => (
  <View
    style={{
      width: 22,
      height: 22,
      borderRadius: 11,
      marginRight: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: done ? colors.success.bgColor(1) : colors.accent.bgColor(1),
    }}
  >
    {done ? (
      <Ionicons name="checkmark" size={13} color={themeColor4.bgColor(1)} />
    ) : (
      <Text style={{ fontFamily: 'VazirBold', fontSize: 11, color: themeColor0.color }}>{step}</Text>
    )}
  </View>
);

export const SectionBody = ({ children }) => (
  <BlurView
    intensity={40}
    tint="light"
    style={{
      backgroundColor: colors.surface.bgColor(0.35),
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      overflow: 'hidden',
    }}
  >
    {children}
  </BlurView>
);

export const RadioList = ({ options, value, onChange }) => (
  <View>
    {options.map((opt) => {
      const selected = value === opt.id;
      return (
        <TouchableOpacity
          key={opt.id}
          onPress={() => onChange(opt.id)}
          style={{
            flexDirection: 'row-reverse',
            alignItems: 'center',
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: themeColor10.bgColor(0.08),
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: themeColor0.bgColor(1),
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 10,
            }}
          >
            {selected && (
              <View
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 6,
                  backgroundColor: themeColor0.bgColor(1),
                }}
              />
            )}
          </View>
          <Text style={{ fontFamily: 'VazirLight', fontSize: 14, color: themeColor10.bgColor(1) }}>
            {opt.title}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// دکمه‌های سفید با بوردر برای گزینه‌هایی که باید به‌جای رادیو، به‌صورت دکمه
// نمایش داده شوند - با multi=true چند‌انتخابی (value: آرایه)، در غیر این‌صورت
// تک‌انتخابی (value: رشته یا null) با امکان لغو انتخاب با لمس دوباره.
export const SelectableOptions = ({ options, value, onChange, multi = false, columns = 2 }) => {
  const isSelected = (id) => (multi ? Array.isArray(value) && value.includes(id) : value === id);

  const handlePress = (id) => {
    if (multi) {
      const current = Array.isArray(value) ? value : [];
      onChange(current.includes(id) ? current.filter((v) => v !== id) : [...current, id]);
    } else {
      onChange(value === id ? null : id);
    }
  };

  const itemWidth = columns === 1 ? '100%' : `${Math.floor(100 / columns) - 3}%`;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {options.map((opt) => {
        const selected = isSelected(opt.id);
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => handlePress(opt.id)}
            activeOpacity={0.75}
            style={{
              width: itemWidth,
              minHeight: 52,
              borderRadius: radius.md,
              borderWidth: 1.5,
              borderColor: selected ? colors.primary.color : colors.border.bgColor(1),
              backgroundColor: selected ? colors.primary.bgColor(0.08) : colors.surface.bgColor(1),
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.sm,
              marginBottom: spacing.sm,
            }}
          >
            <Text
              style={{
                fontFamily: 'VazirBold',
                fontSize: 13,
                textAlign: 'center',
                color: selected ? colors.primary.color : colors.textPrimary.color,
              }}
              numberOfLines={2}
            >
              {opt.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const CounterRow = ({ title, count, onIncrement, onDecrement }) => (
  <View
    style={{
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    }}
  >
    <Text style={{ fontFamily: 'VazirLight', fontSize: 13, color: themeColor10.bgColor(1), flex: 1 }}>
      {title}
    </Text>
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
      <TouchableOpacity
        onPress={onIncrement}
        style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: themeColor0.bgColor(1), alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons name="add" size={18} color={themeColor4.bgColor(1)} />
      </TouchableOpacity>
      <Text style={{ minWidth: 30, textAlign: 'center', fontFamily: 'VazirBold', fontSize: 14, color: themeColor10.bgColor(1) }}>
        {count}
      </Text>
      <TouchableOpacity
        onPress={onDecrement}
        style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: themeColor3.bgColor(1), alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons name="remove" size={18} color={themeColor4.bgColor(1)} />
      </TouchableOpacity>
    </View>
  </View>
);

// شمارشگر فشرده دایره‌ای (⊖ عدد ⊕) - برای شبکه‌ی آیکون‌های سیستم عامل و ردیف انتخاب تعداد دستگاه
export const MiniCounter = ({ count, onIncrement, onDecrement }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColor4.bgColor(1),
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primary.bgColor(0.4),
      paddingHorizontal: 3,
      paddingVertical: 3,
    }}
  >
    <TouchableOpacity
      onPress={onDecrement}
      style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary.bgColor(1), alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name="remove" size={14} color={themeColor4.bgColor(1)} />
    </TouchableOpacity>
    <Text style={{ minWidth: 26, textAlign: 'center', fontFamily: 'VazirBold', fontSize: 13, color: themeColor10.bgColor(1) }}>
      {count}
    </Text>
    <TouchableOpacity
      onPress={onIncrement}
      style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary.bgColor(1), alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name="add" size={14} color={themeColor4.bgColor(1)} />
    </TouchableOpacity>
  </View>
);

// جعبه‌ی تصویر محصول واقعی (assets/icons/hardware-services|procurement)
export const HardwareIconBox = ({ image, size = 60 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: radius.sm,
      backgroundColor: colors.primaryLight.bgColor(0.15),
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}
  >
    <Image source={image} style={{ width: size * 0.8, height: size * 0.8 }} resizeMode="contain" />
  </View>
);

// فیلد توضیحات مشترک - جایگزین NewStyles.textInput عمومی که روی پس‌زمینه‌ی
// بلور شده‌ی SectionBody کنتراست کمی داشت.
export const DescriptionInput = ({ value, onChangeText, placeholder = 'توضیحات (اختیاری)', style }) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor={colors.textMuted.bgColor(1)}
    multiline
    style={[
      {
        backgroundColor: colors.surface.bgColor(0.92),
        borderWidth: 1,
        borderColor: colors.border.bgColor(1),
        borderRadius: radius.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        marginTop: spacing.sm,
        minHeight: 40,
        fontSize: fontSize.xs,
        fontFamily: 'VazirLight',
        color: colors.textPrimary.color,
        textAlignVertical: 'top',
        textAlign: 'right',
      },
      style,
    ]}
  />
);

// بارگذاری عکس مرتبط با سفارش + فیلد توضیحات - مطابق بخش «وضعیت لپ تاپ / مانیتور»
// در طرح (یک ردیف بارگذاری از گالری، یک ردیف گرفتن عکس با دوربین، سپس توضیحات).
export const PhotoNoteInput = ({
  photos = [],
  note = '',
  onChangePhotos,
  onChangeNote,
  notePlaceholder = 'توضیحات دیگری دارید بنویسید...',
}) => {
  const addPhotos = async (fromCamera) => {
    try {
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          showToastOrAlert('برای گرفتن عکس، دسترسی به دوربین لازم است');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showToastOrAlert('برای انتخاب عکس، دسترسی به گالری لازم است');
          return;
        }
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            quality: 0.7,
            allowsMultipleSelection: true,
          });

      if (!result.canceled && result.assets?.length) {
        onChangePhotos([...photos, ...result.assets.map((asset) => asset.uri)]);
      }
    } catch (error) {
      console.warn('PhotoNoteInput image error:', error);
      showToastOrAlert('خطا در انتخاب عکس');
    }
  };

  const removePhoto = (uri) => onChangePhotos(photos.filter((item) => item !== uri));

  const row = {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surface.bgColor(0.92),
    borderWidth: 1,
    borderColor: colors.border.bgColor(1),
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  };
  const rowText = {
    fontFamily: 'VazirBold',
    fontSize: fontSize.xs,
    color: colors.textPrimary.color,
    marginRight: spacing.sm,
  };

  return (
    <View>
      <TouchableOpacity onPress={() => addPhotos(false)} style={row} activeOpacity={0.75}>
        <Ionicons name="cloud-upload-outline" size={20} color={colors.primary.color} />
        <Text style={rowText}>بارگزاری عکس مرتبط با سفارش</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => addPhotos(true)} style={row} activeOpacity={0.75}>
        <Ionicons name="camera-outline" size={20} color={colors.primary.color} />
        <Text style={rowText}>عکس از گالری و دوربین</Text>
      </TouchableOpacity>

      {photos.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm }}>
          {photos.map((uri) => (
            <View key={uri} style={{ marginLeft: spacing.sm, marginBottom: spacing.sm }}>
              <Image source={{ uri }} style={{ width: 64, height: 64, borderRadius: radius.sm }} />
              <TouchableOpacity
                onPress={() => removePhoto(uri)}
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: colors.error.bgColor(1),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={12} color={colors.textInverse.color} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : null}

      <DescriptionInput value={note} onChangeText={onChangeNote} placeholder={notePlaceholder} />
    </View>
  );
};

// کارت خدمات سخت‌افزاری: ردیف اول = تصویر (چپ) + شمارشگر (وسط) + عنوان (راست)، ردیف دوم = توضیحات
export const HardwareCard = ({ image, title, count, desc, onIncrement, onDecrement, onDescChange }) => (
  <View
    style={{
      backgroundColor: colors.surface.bgColor(1),
      borderWidth: 1,
      borderColor: colors.border.bgColor(1),
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <HardwareIconBox image={image} />
      <View style={{ width: spacing.sm }} />
      <MiniCounter count={count} onIncrement={onIncrement} onDecrement={onDecrement} />
      <Text
        style={{ flex: 1, marginLeft: spacing.sm, fontFamily: 'VazirBold', fontSize: 14, color: colors.textPrimary.color }}
        numberOfLines={2}
      >
        {title}
      </Text>
    </View>
    <DescriptionInput value={desc} onChangeText={onDescChange} />
  </View>
);

// ردیف شمارشگر با برچسب داخل همان قاب - برای بخش‌هایی که چند شمارشگر برچسب‌دار
// باید زیر هم (تک‌ستونه) بیایند، نه کنار هم با برچسب جدا بالای هر کدام.
export const LabeledCounterRow = ({ label, count, onIncrement, onDecrement }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.primaryLight.bgColor(0.08),
      borderWidth: 1,
      borderColor: colors.border.bgColor(1),
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      marginBottom: spacing.xs,
    }}
  >
    <Text style={{ fontFamily: 'VazirLight', fontSize: 12, color: colors.textSecondary.color }}>
      {label}
    </Text>
    <MiniCounter count={count} onIncrement={onIncrement} onDecrement={onDecrement} />
  </View>
);

// کارت تامین تجهیزات/کالا: ردیف اول = تصویر (چپ) + دو شمارشگر آکبند/کارکرده (وسط) + عنوان (راست)، ردیف دوم = توضیحات
export const ProcurementCard = ({ image, title, newCount, usedCount, desc, onNewInc, onNewDec, onUsedInc, onUsedDec, onDescChange }) => (
  <View
    style={{
      backgroundColor: colors.surface.bgColor(1),
      borderWidth: 1,
      borderColor: colors.border.bgColor(1),
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <HardwareIconBox image={image} />
      <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
        <LabeledCounterRow label="آکبند" count={newCount} onIncrement={onNewInc} onDecrement={onNewDec} />
        <LabeledCounterRow label="کارکرده" count={usedCount} onIncrement={onUsedInc} onDecrement={onUsedDec} />
      </View>
      <Text style={{ fontFamily: 'VazirBold', fontSize: 14, color: colors.textPrimary.color }} numberOfLines={2}>
        {title}
      </Text>
    </View>
    <DescriptionInput value={desc} onChangeText={onDescChange} />
  </View>
);

export const CounterWithDescription = ({ title, count, desc, onIncrement, onDecrement, onDescChange }) => (
  <View style={{ marginBottom: 10 }}>
    <CounterRow title={title} count={count} onIncrement={onIncrement} onDecrement={onDecrement} />
    <DescriptionInput value={desc} onChangeText={onDescChange} />
  </View>
);

export const SummaryBox = ({ title, lines }) => {
  if (!lines.length) return null;
  return (
    <View
      style={{
        backgroundColor: colors.primary.bgColor(1),
        borderRadius: radius.md,
        padding: spacing.md,
        marginTop: spacing.md,
      }}
    >
      <Text style={{ fontFamily: 'VazirBold', fontSize: fontSize.md, marginBottom: spacing.xs, color: colors.accent.color }}>
        {title}
      </Text>
      {lines.map((line, idx) => (
        <View
          key={idx}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 3 }}
        >
          <Text style={{ minWidth: 32, fontFamily: 'VazirBold', fontSize: fontSize.sm, color: colors.accent.color, textAlign: 'left' }}>
            {line.value}
          </Text>
          <Text style={{ flex: 1, marginLeft: spacing.sm, fontFamily: 'VazirLight', fontSize: fontSize.sm, lineHeight: 22, color: colors.textInverse.color }}>
            {line.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

// شبکه‌ی برندها - کاشی‌های دایره‌ای سفید مطابق طرح. چون asset لوگوی برندها در
// پروژه موجود نیست، نام برند داخل دایره نوشته می‌شود؛ اگر بعداً لوگو اضافه شد
// کافی است فیلد image به آیتم برند اضافه شود.
export const BrandGrid = ({ brands, value, onChange, columns = 3 }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
    {brands.map((brand) => {
      const selected = value === brand.id;
      return (
        <TouchableOpacity
          key={brand.id}
          activeOpacity={0.75}
          onPress={() => onChange(selected ? null : brand.id)}
          style={{
            width: `${Math.floor(100 / columns) - 2}%`,
            alignItems: 'center',
            marginBottom: spacing.md,
          }}
        >
          <View
            style={{
              width: 74,
              height: 74,
              borderRadius: 37,
              backgroundColor: colors.surface.bgColor(1),
              borderWidth: selected ? 3 : 1.5,
              borderColor: selected ? colors.primary.color : colors.accent.color,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              ...shadow.sm,
            }}
          >
            {brand.image ? (
              <Image source={brand.image} style={{ width: 54, height: 54 }} resizeMode="contain" />
            ) : (
              <Text
                style={{
                  fontFamily: 'VazirBold',
                  fontSize: 12,
                  textAlign: 'center',
                  paddingHorizontal: 4,
                  color: selected ? colors.primary.color : colors.textPrimary.color,
                }}
                numberOfLines={2}
              >
                {brand.title}
              </Text>
            )}
          </View>
          {selected ? (
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={colors.success.color}
              style={{ marginTop: 4 }}
            />
          ) : null}
        </TouchableOpacity>
      );
    })}
  </View>
);

// شبکه‌ی آیکونی تک‌انتخابی - برای انتخاب سیستم عامل در مسیر سیستماتیک که
// برخلاف «انتخاب جامع» تعداد ندارد و فقط یک مورد انتخاب می‌شود.
export const IconOptionGrid = ({ options, value, onChange, columns = 3, imageSize = 72 }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
    {options.map((opt) => {
      const selected = value === opt.id;
      return (
        <TouchableOpacity
          key={opt.id}
          activeOpacity={0.75}
          onPress={() => onChange(selected ? null : opt.id)}
          style={{
            width: `${Math.floor(100 / columns) - 2}%`,
            alignItems: 'center',
            marginBottom: spacing.lg,
            paddingVertical: spacing.sm,
            borderRadius: radius.md,
            borderWidth: selected ? 2 : 0,
            borderColor: colors.primary.color,
            backgroundColor: selected ? colors.primary.bgColor(0.08) : 'transparent',
          }}
        >
          <Image
            source={opt.image}
            style={{ width: imageSize, height: imageSize, marginBottom: 6 }}
            resizeMode="contain"
          />
          <Text
            style={{
              fontFamily: 'VazirBold',
              fontSize: 11,
              color: selected ? colors.primary.color : themeColor10.bgColor(0.85),
              textAlign: 'center',
            }}
            numberOfLines={1}
          >
            {opt.title}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// دکمه‌های «نمایش / استعلام / ثبت سفارش» - همان چهار دکمه‌ی پایانی هر دو مسیر.
export const OrderActionButtons = ({ onIssueReceipt, onShowReceipt, onSubmit, onCancel }) => (
  <View>
    <ActionButton title="صدور پیش‌رسید" color={colors.success} onPress={onIssueReceipt} />
    <ActionButton title="نمایش پیش‌رسید" color={colors.primary} onPress={onShowReceipt} />
    <ActionButton title="ثبت سفارش" color={colors.success} onPress={onSubmit} />
    <ActionButton title="لغو سفارش" color={colors.warning} onPress={onCancel} last />
  </View>
);

export const ActionButton = ({ title, color, onPress, last }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: color.bgColor(1),
      borderRadius: radius.sm,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginBottom: last ? 0 : spacing.sm,
    }}
  >
    <Text style={{ color: colors.textInverse.color, fontFamily: 'VazirBold' }}>{title}</Text>
  </TouchableOpacity>
);
