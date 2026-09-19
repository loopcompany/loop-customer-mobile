// ثابت‌های طرح رسید - رنگ‌ها و نسبت‌ها از روی خودِ تصاویر «رسیدها/» اندازه‌گیری
// شده‌اند.
//
// رسید با عرض کاملِ صفحه رندر می‌شود (بدون transform و بدون مقیاس). طرحِ تحویلی
// یک سند ۱۰۲۴ پیکسلی است، پس هر چیزی که «اندازه‌ی ثابت» دارد - لوگو، نشان ∞،
// خط طلایی، بوک‌مارک - به‌صورت *درصدی از عرض* نوشته شده تا روی هر صفحه‌ای همان
// نسبتِ طرح را نگه دارد. در مقابل، اندازه‌ی قلم‌ها بر حسب pt واقعی‌اند: اگر
// آن‌ها را هم نسبتِ عرض می‌گرفتیم، روی موبایل به ۵pt می‌رسیدند و خوانا نبودند.
//
// رنگ‌ها عمداً از theme/Color.js نمی‌آیند: پالت اپ سرمه‌ای #002B54 دارد، ولی
// سرمه‌ای طرحِ رسید #011339 است و اختلافشان روی صفحه دیده می‌شود.

/** عرض بوم طرح - مبنای محاسبه‌ی نسبت‌ها. */
export const DESIGN_WIDTH = 1024;

export const receiptColors = {
  pageBg: '#FDFDFD',
  cardBg: '#FCFCFC',

  /** حاشیه‌ی طلایی کارت‌ها. */
  cardBorder: '#E9C788',

  /** سرمه‌ای تب عنوان بخش و سپر سربرگ. */
  tabNavy: '#011339',
  shieldNavy: '#021C37',

  /** طلاییِ متن روی تب، و طلاییِ ملایم‌ترِ آیکون‌ها و زیرنویس پاورقی. */
  tabGold: '#F9D020',
  iconGold: '#E4B253',

  rowDivider: '#D8D8DA',

  textNavy: '#0A1733',
  textBody: '#3A3A3E',
  textMuted: '#727272',
  tableHead: '#878787',

  success: '#289506',
  error: '#DF0001',
  warning: '#E4B253',
};

/**
 * دارایی‌های تزئینی، بر حسب *کسری از عرض کل رسید* و نسبت تصویرشان. اعداد از
 * ابعاد واقعیِ برش‌ها در فضای ۱۰۲۴ پیکسلی طرح می‌آیند.
 *
 * این‌ها عمداً کسرِ عددی‌اند نه درصدِ CSS: درصد در React Native نسبت به *والدِ
 * مستقیم* حساب می‌شود، و چون نشان ∞ داخل ستونِ باریکِ سربرگ است، «۸.۴٪» آنجا
 * یعنی ۸.۴٪ از آن ستون - حدود ۲٪ از عرض رسید. برای همین اندازه‌ها از عرضِ
 * اندازه‌گیری‌شده‌ی رسید حساب می‌شوند (sizeArt).
 */
export const art = {
  // سپر عمداً کمی کوچک‌تر از طرح است (۴۲٪ به‌جای ۵۴٪): در عرض موبایل، سهمِ
  // طرح برای دو بلوک کناری آنقدر کم می‌گذاشت که متنشان می‌شکست و ارتفاعشان
  // با هم یکی نمی‌شد.
  shield: { fraction: 0.42, ratio: 548 / 206 },
  infinity: { fraction: 86 / DESIGN_WIDTH, ratio: 86 / 52 },
  divider: { fraction: 197 / DESIGN_WIDTH, ratio: 197 / 17 },
  ribbon: { fraction: 94 / DESIGN_WIDTH, ratio: 94 / 104 },
};

/**
 * ابعاد یک دارایی را از عرضِ رسید حساب می‌کند.
 *
 * @param {{fraction: number, ratio: number}} piece یکی از اعضای `art`.
 * @param {number} receiptWidth عرض اندازه‌گیری‌شده‌ی رسید.
 * @param {number} [boost] بزرگ‌نماییِ اختیاری نسبت به طرح.
 * @returns {{width: number, height: number}}
 */
export const sizeArt = (piece, receiptWidth, boost = 1) => {
  const width = receiptWidth * piece.fraction * boost;
  return { width, height: width / piece.ratio };
};

/**
 * آیکون‌های حالت: ارتفاع بر حسب pt و نسبتِ واقعیِ تصویر.
 *
 * نسبت لازم است چون این سه تصویر مربع نیستند - ساعت‌شنی بلند و باریک است
 * (۰.۷۳) و اگر در کادر مربع رندر شود، بخشی از آن بیرون می‌ماند یا له می‌شود.
 */
export const stateIcons = {
  done: { height: 34, ratio: 0.9848 },
  failed: { height: 34, ratio: 1.1045 },
  pending: { height: 54, ratio: 0.7328 },
};

/**
 * @param {{height: number, ratio: number}} icon یکی از اعضای `stateIcons`.
 * @returns {{width: number, height: number}}
 */
export const sizeStateIcon = (icon) => ({
  width: icon.height * icon.ratio,
  height: icon.height,
});

/** فاصله‌ها و شعاع‌ها بر حسب pt واقعی. */
export const layout = {
  pagePadding: 12,
  sectionGap: 14,
  cardRadius: 10,
  cardBorderWidth: 1,
  cardPaddingH: 12,
  tabHeight: 24,
  tabRadius: 12,
  tabPaddingH: 12,
  rowPaddingV: 9,
  rowGap: 16,
};

/**
 * اندازه‌ی قلم‌ها بر حسب pt. کوچک‌تر از theme/Typography (که از ۱۲ شروع می‌شود)
 * چون رسید یک سند متراکم است و جدولش تا ۱۱ ستون دارد.
 */
export const fonts = {
  issuerName: 12,
  issuerMeta: 10,
  dateLabel: 10,
  dateValue: 14,
  bannerTitle: 22,
  bannerSubtitle: 12,
  tab: 12,
  rowLabel: 12,
  rowValue: 12,
  tableHead: 10,
  tableCell: 11,
  totalLabel: 11,
  totalValue: 13,
  footerTitle: 18,
  footerSubtitle: 11,
};

/** دارایی‌های بریده‌شده از خودِ تصاویر طرح. */
export const assets = {
  shield: require('@assets/icons/receipt/shield.png'),
  infinity: require('@assets/icons/receipt/infinity.png'),
  divider: require('@assets/icons/receipt/divider.png'),
  ribbon: require('@assets/icons/receipt/ribbon.png'),
  stateDone: require('@assets/icons/receipt/state_done.png'),
  stateFailed: require('@assets/icons/receipt/state_failed.png'),
  statePending: require('@assets/icons/receipt/state_pending.png'),
  // QR ثابتِ شرکت. قبلاً با react-native-qrcode-svg از روی لینکِ رسید ساخته
  // می‌شد؛ کارفرما تصویرِ رسمی را جایگزین کرد تا همان کدی چاپ شود که روی بقیه‌ی
  // اقلام چاپیِ شرکت هست.
  qr: require('@assets/qrcode.jpg'),
};
