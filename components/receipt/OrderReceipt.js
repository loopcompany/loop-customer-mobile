// رسید سفارش - بازسازی طرحِ «رسیدها/» با عرض کاملِ صفحه.
//
// چیدمان، رنگ‌ها و گرافیک از خودِ طرح می‌آیند: دارایی‌های تزئینی (سپر، نشان ∞،
// خط طلایی، بوک‌مارک ستاره، آیکون‌های حالت) عیناً از همان JPGها بریده شده‌اند و
// رنگ‌ها با نمونه‌برداری از تصویر درآمده‌اند. فقط مقادیر از روی سفارش پر می‌شوند.
//
// رسید هیچ transform یا مقیاسی ندارد: با عرض ۱۰۰٪ چیده می‌شود و اندازه‌ی قلم‌ها
// pt واقعی است. فقط دارایی‌های تصویری از عرضِ اندازه‌گیری‌شده‌ی رسید مقیاس
// می‌گیرند تا نسبتِ طرح حفظ شود.

import React, { useMemo, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getFontFamily } from '@theme/Typography';
import { formatPrice } from '@helpers/Common';
import {
  RECEIPT_STATE,
  ORDER_KIND,
  ISSUER,
  PRICE_ON_REQUEST,
  NOT_SET,
  ORDER_NUMBER_PENDING,
} from '@services/receipt';
import ReceiptTable from './ReceiptTable';
import {
  receiptColors as C,
  layout as L,
  fonts as F,
  art,
  sizeArt,
  stateIcons,
  sizeStateIcon,
  assets,
} from './receiptDesign';
// ---------------------------------------------------------------------------
// پیکربندی حالت‌ها - مطابق سه گروه «توضیحات رسیدها.pdf»
// ---------------------------------------------------------------------------
// در «انجام شد» تیتر جدول‌ها «نهایی» است و در دو حالت دیگر «درخواستی».
const STATE_CONFIG = {
  [RECEIPT_STATE.DONE]: {
    title: 'انجام شد',
    icon: assets.stateDone,
    iconBox: sizeStateIcon(stateIcons.done),
    tone: C.success,
    itemsTitle: 'اقلام نهایی',
    servicesTitle: 'خدمات نهایی',
  },
  [RECEIPT_STATE.PENDING]: {
    title: 'جزئیات سفارش',
    icon: assets.statePending,
    iconBox: sizeStateIcon(stateIcons.pending),
    tone: C.warning,
    itemsTitle: 'اقلام درخواستی',
    servicesTitle: 'خدمات درخواستی',
    subtitle: 'سفارش شما در انتظار تایید و پرداخت',
  },
  [RECEIPT_STATE.FAILED]: {
    title: 'ناموفق',
    icon: assets.stateFailed,
    iconBox: sizeStateIcon(stateIcons.failed),
    tone: C.error,
    itemsTitle: 'اقلام درخواستی',
    servicesTitle: 'خدمات درخواستی',
    subtitle: 'سفارش شما لغو شده است.',
  },
};

/** زیرعنوان «انجام شد» به نوع سفارش بستگی دارد - عیناً مثل طرح. */
const doneSubtitle = (kind) =>
  kind === ORDER_KIND.SERVICES
    ? 'خدمات شما با موفقیت انجام و تحویل داده شد.'
    : 'سفارش شما با موفقیت انجام و تحویل داده شد.';

// عرض ستون‌ها بر حسب pt. جدول داخل کارت افقی اسکرول می‌شود، چون ۱۱ ستون در
// عرض موبایل جا نمی‌شود - همان استثنایی که قوانین پروژه برای جدول‌ها قائل است.
const ITEM_COLUMNS = [
  { key: 'index', title: 'ردیف', width: 38 },
  { key: 'title', title: 'کالا', width: 74 },
  { key: 'brand', title: 'برند', width: 66 },
  { key: 'model', title: 'مدل', width: 80 },
  { key: 'warranty', title: 'گارانتی', width: 80 },
  { key: 'testPeriod', title: 'مهلت تست', width: 62 },
  { key: 'barcode', title: 'بارکد', width: 100 },
  { key: 'condition', title: 'وضعیت', width: 58 },
  { key: 'qty', title: 'تعداد', width: 44 },
  { key: 'unitPrice', title: 'قیمت واحد (تومان)', width: 86, isPrice: true },
  { key: 'totalPrice', title: 'قیمت کل (تومان)', width: 86, isPrice: true },
];

const SERVICE_COLUMNS = [
  { key: 'index', title: 'ردیف', width: 38 },
  { key: 'title', title: 'کالا', width: 74 },
  { key: 'brand', title: 'برند', width: 66 },
  { key: 'model', title: 'مدل', width: 80 },
  { key: 'description', title: 'شرح خدمات درخواستی', width: 210 },
  { key: 'qty', title: 'تعداد', width: 44 },
  { key: 'unitPrice', title: 'قیمت واحد (تومان)', width: 86, isPrice: true },
  { key: 'totalPrice', title: 'قیمت کل (تومان)', width: 86, isPrice: true },
];

// ---------------------------------------------------------------------------
// اجزا
// ---------------------------------------------------------------------------

/**
 * کارت با تبِ سرمه‌ای.
 *
 * تب *داخل* کارت و چسبیده به گوشه‌ی بالا-راست است: گوشه‌ی بالا-راستش شعاعِ خودِ
 * کارت را دارد تا روی آن بنشیند، گوشه‌ی پایین-چپش گرد است و دو گوشه‌ی دیگر
 * تیزند - همان شکلی که در طرح دیده می‌شود.
 */
function Section({ title, icon, children, s, style }) {
  return (
    <View style={[s.card, style]}>
      <View style={s.tab}>
        <Text style={s.tabText}>{title}</Text>
        <Ionicons name={icon} size={13} color={C.tabGold} style={s.tabIcon} />
      </View>
      <View style={s.cardBody}>{children}</View>
    </View>
  );
}

/**
 * ردیف «برچسب / مقدار» با آیکون طلایی.
 *
 * چیدمان اپ LTR است، پس در یک `row` فرزند اول سمت چپ می‌نشیند: ترتیب JSX
 * «مقدار، برچسب، آیکون» یعنی مقدار چپ و آیکونِ طلایی در انتهای راست - مثل طرح.
 *
 * `small` برای مقادیری است که جمله‌اند نه داده (مثل «پس از ثبت نهایی نمایش داده
 * می‌شود»): در ستونِ نصف‌عرضِ رسید با قلمِ عادی سه خط می‌شکنند و ارتفاع دو ستون
 * را به‌هم می‌ریزند.
 */
function Row({ icon, label, value, s, tone, last, small }) {
  return (
    <View style={[s.row, last && s.rowLast]}>
      <Text style={[s.rowValue, small && s.rowValueSmall, tone && { color: tone }]}>
        {value == null || value === '' ? NOT_SET : value}
      </Text>
      <Text style={s.rowLabel}>{label}</Text>
      <Ionicons name={icon} size={14} color={C.iconGold} />
    </View>
  );
}

/**
 * سلولِ شبکه‌ای - آیکون و برچسب بالا، مقدار زیرش. برای بخش‌هایی که در طرح
 * چند ستونی‌اند (مشخصات کاربر / مشخصات محصول).
 */
function Cell({ icon, label, value, image, s }) {
  return (
    <View style={s.cell}>
      <View style={s.cellHead}>
        <Ionicons name={icon} size={13} color={C.iconGold} />
        <Text style={s.cellLabel}>{label}</Text>
      </View>
      {image ? (
        // لوگوی برند بدون پس‌زمینه - در طرح هم به‌جای نام برند، تصویرش می‌آید.
        <Image source={image} style={s.brandLogo} resizeMode="contain" />
      ) : (
        <Text style={s.cellValue}>{value == null || value === '' ? NOT_SET : value}</Text>
      )}
    </View>
  );
}

/** خط عمودی طلایی بین ستون‌ها. */
const VRule = ({ s }) => <View style={s.vRule} />;

// ---------------------------------------------------------------------------

/**
 * @param {object} props
 * @param {object} props.receipt رسید نرمال‌شده از '@services/receipt'.
 */
function OrderReceipt({ receipt }) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'fa';
  const s = useMemo(() => createStyles(lang), [lang]);

  // ابعاد گرافیک‌ها از عرضِ واقعیِ رسید حساب می‌شود، نه از درصدِ CSS - درصد
  // نسبت به والدِ مستقیم است و داخل ستون‌های باریکِ سربرگ نتیجه‌ی غلط می‌دهد.
  const [width, setWidth] = useState(0);
  const shield = useMemo(() => sizeArt(art.shield, width), [width]);
  const infinity = useMemo(() => sizeArt(art.infinity, width), [width]);
  const divider = useMemo(() => sizeArt(art.divider, width, 1.1), [width]);
  const ribbon = useMemo(() => sizeArt(art.ribbon, width, 1.5), [width]);
  const sideWidth = Math.max(0, (width - shield.width) / 2);

  const config = STATE_CONFIG[receipt?.state] || STATE_CONFIG[RECEIPT_STATE.PENDING];
  const { customer, order, product, delivery, payment } = receipt;
  const kind = order?.kind;
  const subtitle = config.subtitle || doneSubtitle(kind);

  const showItems = kind === ORDER_KIND.GOODS || kind === ORDER_KIND.BOTH;
  const showServices = kind === ORDER_KIND.SERVICES || kind === ORDER_KIND.BOTH;

  const kindLabel =
    kind === ORDER_KIND.BOTH
      ? 'تامین کالا / خدمات'
      : kind === ORDER_KIND.GOODS
        ? 'تامین کالا'
        : kind === ORDER_KIND.SERVICES
          ? 'خدمات'
          : null;

  return (
    <View
      style={s.page}
      onLayout={(event) => {
        const measured = event.nativeEvent.layout.width;
        setWidth((prev) => (Math.abs(prev - measured) > 1 ? measured : prev));
      }}
    >
      {/* ---------- سربرگ: صادرکننده (چپ) / سپر / تاریخ صدور (راست) ---------- */}
      <View style={[s.header, { minHeight: shield.height }]}>
        <Image
          source={assets.shield}
          style={[s.shield, { left: sideWidth, width: shield.width, height: shield.height }]}
          resizeMode="contain"
        />

        <View style={[s.headerSide, { width: sideWidth, minHeight: shield.height }]}>
          <Image
            source={assets.infinity}
            style={{ width: infinity.width, height: infinity.height }}
            resizeMode="contain"
          />
          <Text style={s.issuerName}>حلقه بی نهایت</Text>
          <Text style={s.issuerName}>رایانه ایرانیان</Text>
          <Text style={s.issuerMeta}>شماره ثبت : {ISSUER.registrationNumber}</Text>
          <Image
            source={assets.divider}
            style={[s.divider, { width: divider.width, height: divider.height }]}
            resizeMode="contain"
          />
        </View>

        <View
          style={[
            s.headerSide,
            { width: sideWidth, marginLeft: shield.width, minHeight: shield.height },
          ]}
        >
          <View style={s.dateLabelRow}>
            <Text style={s.dateLabel}>تاریخ صدور / نمایش</Text>
            <Ionicons name="calendar-outline" size={13} color={C.iconGold} />
          </View>
          <Text style={s.dateValue}>{receipt.issuedAt || NOT_SET}</Text>
          <Image
            source={assets.divider}
            style={[s.divider, { width: divider.width, height: divider.height }]}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* ---------- عنوان حالت ---------- */}
      <View style={s.banner}>
        <View style={s.bannerTitleRow}>
          <Text style={s.bannerTitle}>{config.title}</Text>
          <Image
            source={config.icon}
            style={[config.iconBox, { marginRight: 12 }]}
            resizeMode="contain"
          />
        </View>
        <Text style={s.bannerSubtitle}>{subtitle}</Text>
      </View>

      {/* ---------- مشخصات سفارش: دو ستون، جداشده با خط عمودی طلایی ---------- */}
      <Section title="مشخصات سفارش" icon="clipboard-outline" s={s}>
        <View style={s.twoCol}>
          <View style={s.col}>
            <Row icon="business-outline" label="وضعیت کاربری" value={order.userStatus} s={s} />
            <Row icon="calendar-outline" label="تاریخ ثبت" value={order.registeredDate} s={s} />
            <Row icon="time-outline" label="ساعت ثبت" value={order.registeredTime} s={s} />
            <Row icon="cube-outline" label="وضعیت سفارش" value={kindLabel} s={s} last />
          </View>

          <VRule s={s} />

          <View style={s.col}>
            {/* پیش‌رسید هنوز شماره ندارد؛ شماره را بک‌اند موقع ثبت می‌سازد. */}
            <Row
              icon="list-outline"
              label="شماره سفارش"
              value={order.number ?? ORDER_NUMBER_PENDING}
              small={order.number == null}
              s={s}
            />
            <Row icon="person-outline" label="کد کاربری" value={order.userCode} s={s} />
            <Row icon="person-circle-outline" label="نام کاربری" value={order.userName} s={s} />
            <Row icon="phone-portrait-outline" label="ثبت سفارش" value={order.channel} s={s} last />
          </View>
        </View>
      </Section>

      {/* ---------- مشخصات کاربر: سه ستون ---------- */}
      <Section title="مشخصات کاربر" icon="business-outline" s={s}>
        <View style={s.threeCol}>
          <Cell icon="call-outline" label="شماره تماس" value={customer.phone} s={s} />
          <VRule s={s} />
          <Cell
            icon="card-outline"
            label={customer.isOrganization ? 'شناسه ملی' : 'شماره ملی'}
            value={customer.nationalId}
            s={s}
          />
          <VRule s={s} />
          <Cell
            icon={customer.isOrganization ? 'business-outline' : 'person-outline'}
            label={customer.isOrganization ? 'نام سازمان' : 'نام کاربری'}
            value={customer.name}
            s={s}
          />
        </View>

        <View style={s.hRule} />

        <View style={s.threeCol}>
          <Cell icon="location-outline" label="آدرس" value={customer.address} s={s} />
          <VRule s={s} />
          <Cell icon="call-outline" label="تلفن ثابت" value={customer.landline} s={s} />
        </View>
      </Section>

      {/* ---------- مشخصات محصول: سه ستون ---------- */}
      {product ? (
        <Section title="مشخصات محصول" icon="laptop-outline" s={s}>
          <View style={s.threeCol}>
            <Cell icon="barcode-outline" label="مدل" value={product.model} s={s} />
            <VRule s={s} />
            <Cell
              icon="pricetag-outline"
              label="برند"
              value={product.brand}
              image={product.brandLogo}
              s={s}
            />
            <VRule s={s} />
            <Cell icon="laptop-outline" label="نوع محصول" value={product.type} s={s} />
          </View>
        </Section>
      ) : null}

      {/* ---------- اقلام ---------- */}
      {showItems ? (
        <Section title={config.itemsTitle} icon="cube-outline" s={s}>
          <ReceiptTable
            columns={ITEM_COLUMNS}
            rows={receipt.items}
            totalLabel="جمع کل اقلام سفارش (تومان)"
            total={receipt.itemsTotal}
          />
        </Section>
      ) : null}

      {/* ---------- خدمات ---------- */}
      {showServices ? (
        <Section title={config.servicesTitle} icon="construct-outline" s={s}>
          <ReceiptTable
            columns={SERVICE_COLUMNS}
            rows={receipt.services}
            totalLabel="جمع کل مبلغ خدمات درخواستی (تومان)"
            total={receipt.servicesTotal}
          />
        </Section>
      ) : null}

      {/* ---------- پرداخت و تحویل: کنار هم در یک ردیف ---------- */}
      <View style={s.pairRow}>
        <Section title="مشخصات پرداخت" icon="card-outline" s={s} style={s.pairCard}>
          <Row
            icon="cash-outline"
            label="مبلغ کل"
            value={payment.total == null ? PRICE_ON_REQUEST : formatPrice(payment.total)}
            s={s}
          />
          <Row icon="pricetag-outline" label="کد تشویقی" value={payment.discountCode} s={s} />
          <Row
            icon="remove-circle-outline"
            label="مبلغ کسر شده"
            value={payment.discountAmount == null ? null : formatPrice(payment.discountAmount)}
            s={s}
          />
          <Row
            icon="cash-outline"
            label="قابل پرداخت"
            value={payment.payable == null ? PRICE_ON_REQUEST : formatPrice(payment.payable)}
            s={s}
          />
          <Row
            icon="checkmark-circle-outline"
            label="وضعیت پرداخت"
            value={payment.status}
            tone={config.tone}
            s={s}
          />
          <Row
            icon="business-outline"
            label="روش پرداخت"
            value={payment.method}
            tone={config.tone}
            s={s}
            last
          />
        </Section>

        <Section title="مشخصات تحویل" icon="car-outline" s={s} style={s.pairCard}>
          <Row icon="person-outline" label="تحویل گیرنده" value={delivery.receiverName} s={s} />
          <Row icon="calendar-outline" label="تاریخ تحویل" value={delivery.date} s={s} />
          <Row
            icon="checkmark-circle-outline"
            label="وضعیت تحویل"
            value={delivery.status}
            s={s}
            last
          />
        </Section>
      </View>

      {/* ---------- پاورقی: بوک‌مارک چپ، QR راست ---------- */}
      <View style={s.footer}>
        <Image
          source={assets.ribbon}
          style={[s.ribbon, { width: ribbon.width, height: ribbon.height }]}
          resizeMode="contain"
        />
        <View style={s.footerText}>
          <Text style={s.footerTitle}>با تشکر از اعتماد شما</Text>
          <Text style={s.footerSubtitle}>با لوپ تا بی نهایت در کنار شما هستیم</Text>
        </View>
        {/* QR رسمیِ شرکت - تصویرِ ثابت، نه کدِ تولیدشده از لینکِ رسید. */}
        <Image source={assets.qr} style={s.qr} resizeMode="contain" />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
const createStyles = (lang) => {
  const bold = getFontFamily('bold', lang);
  const light = getFontFamily('light', lang);

  return {
    page: {
      width: '100%',
      backgroundColor: C.pageBg,
      borderRadius: L.cardRadius,
      overflow: 'hidden',
      paddingBottom: L.sectionGap,
    },

    // --- سربرگ ---
    // سپر absolute است و به بالای رسید می‌چسبد (مثل طرح)؛ دو بلوک کناری در
    // جریان عادی‌اند و با marginLeft از کنارِ سپر رد می‌شوند.
    header: { flexDirection: 'row', alignItems: 'flex-start' },
    headerSide: { alignItems: 'center', paddingTop: 12 },
    shield: { position: 'absolute', top: 0 },
    // 'auto' خط را به ته بلوک می‌چسباند تا در هر دو ستونِ سربرگ هم‌تراز شود.
    divider: { marginTop: 'auto' },
    issuerName: {
      fontFamily: bold,
      fontSize: F.issuerName,
      color: C.textNavy,
      marginTop: 4,
      textAlign: 'center',
    },
    issuerMeta: {
      fontFamily: light,
      fontSize: F.issuerMeta,
      color: C.textNavy,
      marginTop: 4,
      textAlign: 'center',
    },
    dateLabelRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
    dateLabel: { fontFamily: light, fontSize: F.dateLabel, color: C.textNavy },
    dateValue: {
      fontFamily: bold,
      fontSize: F.dateValue,
      color: C.textNavy,
      marginTop: 8,
      textAlign: 'center',
    },

    // --- بنر حالت ---
    banner: { alignItems: 'center', paddingTop: 14, paddingBottom: 16 },
    bannerTitleRow: { flexDirection: 'row-reverse', alignItems: 'center' },
    bannerTitle: { fontFamily: bold, fontSize: F.bannerTitle, color: C.textNavy },
    bannerSubtitle: {
      fontFamily: light,
      fontSize: F.bannerSubtitle,
      color: C.textMuted,
      marginTop: 10,
      textAlign: 'center',
      paddingHorizontal: L.pagePadding,
    },

    // --- کارت + تب ---
    card: {
      marginHorizontal: L.pagePadding,
      marginTop: L.sectionGap,
      borderWidth: L.cardBorderWidth,
      borderColor: C.cardBorder,
      borderRadius: L.cardRadius,
      backgroundColor: C.cardBg,
      overflow: 'hidden',
    },
    // تب داخل کارت و چسبیده به گوشه‌ی بالا-راست: بالا-راست شعاع کارت،
    // پایین-چپ گرد، دو گوشه‌ی دیگر تیز.
    tab: {
      alignSelf: 'flex-end',
      // ترتیب JSX «عنوان، آیکون» است؛ در چیدمان LTR اپ، 'row' یعنی عنوان چپ و
      // آیکونِ طلایی سمت راستِ آن - همان جایی که در طرح نشسته است.
      flexDirection: 'row',
      alignItems: 'center',
      height: L.tabHeight,
      paddingHorizontal: L.tabPaddingH,
      backgroundColor: C.tabNavy,
      borderTopRightRadius: L.cardRadius,
      borderBottomLeftRadius: L.cardRadius,
      borderTopLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    tabIcon: { marginLeft: 6 },
    tabText: { fontFamily: bold, fontSize: F.tab, color: C.tabGold },
    cardBody: { paddingHorizontal: L.cardPaddingH, paddingTop: 2 },

    // --- شبکه‌ها ---
    twoCol: { flexDirection: 'row', alignItems: 'stretch' },
    threeCol: { flexDirection: 'row', alignItems: 'stretch', paddingVertical: 10 },
    col: { flex: 1 },
    /** خط عمودی طلایی بین ستون‌ها. */
    vRule: { width: 1, backgroundColor: C.cardBorder, marginHorizontal: 10 },
    /** خط افقی روشن بین ردیف‌های شبکه. */
    hRule: { height: 1, backgroundColor: C.rowDivider },

    cell: { flex: 1, alignItems: 'center', gap: 6 },
    cellHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
    cellLabel: { fontFamily: light, fontSize: F.rowLabel, color: C.textMuted },
    cellValue: {
      fontFamily: bold,
      fontSize: F.rowValue,
      color: C.textBody,
      textAlign: 'center',
    },
    /** لوگوی برند - بدون پس‌زمینه، هم‌ارتفاعِ یک خط متن. */
    brandLogo: { width: '80%', height: 22 },

    // --- ردیف‌ها ---
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: L.rowPaddingV,
      borderBottomWidth: 1,
      borderBottomColor: C.rowDivider,
    },
    rowLast: { borderBottomWidth: 0 },
    rowLabel: { fontFamily: bold, fontSize: F.rowLabel, color: C.textBody, textAlign: 'right' },
    rowValue: {
      flex: 1,
      fontFamily: light,
      fontSize: F.rowValue,
      color: C.textBody,
      textAlign: 'left',
    },
    rowValueSmall: { fontSize: F.tableCell - 1 },

    // --- پرداخت + تحویل کنار هم ---
    pairRow: { flexDirection: 'row', alignItems: 'flex-start' },
    pairCard: { flex: 1, marginHorizontal: L.pagePadding / 2 },

    // --- پاورقی ---
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: L.rowGap,
      marginHorizontal: L.pagePadding,
      marginTop: L.sectionGap,
      paddingHorizontal: L.cardPaddingH,
      paddingVertical: 10,
      borderWidth: L.cardBorderWidth,
      borderColor: C.cardBorder,
      borderRadius: L.cardRadius,
      backgroundColor: C.cardBg,
    },
    ribbon: { marginTop: -18 },
    // بزرگ‌تر از QRِ تولیدشده‌ی قبلی (۵۶): تصویرِ تحویلی ماژول‌های ریزتری دارد و
    // در ۵۶pt با دوربین خوانده نمی‌شد. گوشه‌ی گرد، کادرِ تیره‌ی تصویر را روی
    // کارتِ روشن به یک کاشیِ عمدی تبدیل می‌کند.
    qr: { width: 72, height: 72, borderRadius: L.cardRadius },
    footerText: { flex: 1, alignItems: 'center' },
    footerTitle: { fontFamily: bold, fontSize: F.footerTitle, color: C.textNavy },
    footerSubtitle: {
      fontFamily: light,
      fontSize: F.footerSubtitle,
      color: C.iconGold,
      marginTop: 6,
      textAlign: 'center',
    },
  };
};

export default React.memo(OrderReceipt);
