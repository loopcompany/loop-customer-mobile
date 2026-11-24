// پیکربندی مسیر «انتخاب سیستماتیک» (اپلیکیشن کاربر سازمانی / شرکتی).
//
// در طرح تحویلی، کاربر سازمانی بعد از انتخاب «انتخاب سیستماتیک» یک شبکه‌ی
// آیکونی از دسته‌ها می‌بیند (حساب کاربری، لپ تاپ، پرینتر/کپی، مانیتور، کیس،
// ضایعات، آل این وان، هارد دیسک) و با انتخاب هر دسته، مراحل مخصوص همان دسته
// به‌صورت stepper باز می‌شود - مثلاً برای «لپ تاپ» سیزده مرحله از «برند لپ تاپ»
// تا «نمایش / استعلام / ثبت سفارش».
//
// این فایل فقط داده است؛ رندر همه‌ی انواع مرحله در org/SystematicDeviceScreen.js
// انجام می‌شود و از همان کیت رابط کاربری «انتخاب جامع» استفاده می‌کند.

import { PROCUREMENT_ITEMS, SOFTWARE_ITEMS } from './deviceCatalog';

const sectionIcon = {
  software: require('@assets/icons/sections/software-services.png'),
  hardware: require('@assets/icons/sections/hardware-services.png'),
  procurement: require('@assets/icons/sections/procurement.png'),
  equipmentStatus: require('@assets/icons/sections/equipment-status.png'),
  deliveryMode: require('@assets/icons/sections/delivery-mode.png'),
  serviceLevel: require('@assets/icons/sections/service-level.png'),
  technician: require('@assets/icons/sections/technician.png'),
  timeRange: require('@assets/icons/sections/time-range.png'),
  orderActions: require('@assets/icons/sections/order-actions.png'),
  operatorInfo: require('@assets/icons/sections/operator-info.png'),
  criticalInfra: require('@assets/icons/sections/critical-infra.png'),
};

// تصاویر کاشی‌های صفحه‌ی «انتخاب سیستماتیک»: همان تصاویر اصلی که کارفرما داده است
// (روی سرور: category/*.png و userfolder/TrashV.png؛ masterها در
// `1/original-category-icons/`). تا ۱۴۰۵/۰۹/۰۲ این کاشی‌ها آیکون‌های بازطراحی‌شده‌ی
// سرمه‌ای را نشان می‌دادند و کاشی Trash اصلا تصویر نداشت. برای نمایش فوری فقط اندازه
// کوچک شده (۵۱۲ پیکسل WebP، مجموع ۲۵۲ کیلوبایت به‌جای ۱۰ مگابایت)؛ ظاهر دست‌نخورده است.
const deviceIcon = {
  laptop: require('@assets/icons/systematic/laptop.webp'),
  monitor: require('@assets/icons/systematic/monitor.webp'),
  case: require('@assets/icons/systematic/case.webp'),
  allInOne: require('@assets/icons/systematic/all-in-one.webp'),
  printer: require('@assets/icons/systematic/printer.webp'),
  hardDisk: require('@assets/icons/systematic/hard-disk.webp'),
  trash: require('@assets/icons/systematic/trash.webp'),
};

// ---------------------------------------------------------------------------
// شبکه‌ی دسته‌ها - همان کاشی‌های صفحه‌ی «انتخاب سیستماتیک» در طرح
//
// ترتیب، همان ترتیب سند کارفرما (۲۵ آبان ۱۴۰۵، بند ۲۹) است:
// حساب کاربری، مانیتور، Trash، لپ تاپ، کیس، آل این وان، پرینتر / کپی، هارد.
// ---------------------------------------------------------------------------
export const SYSTEMATIC_CATEGORIES = [
  {
    id: 'user_account',
    title: 'حساب کاربری',
    subtitle: 'User Account',
    image: require('@assets/icons/systematic/account.webp'),
    // این کاشی مرحله‌ای ندارد و مستقیم صفحه‌ی حساب کاربری موجود را باز می‌کند.
    screen: 'Profile',
  },
  { id: 'monitor', title: 'مانیتور', subtitle: 'Monitor', image: deviceIcon.monitor },
  // «Trash» طبق سند در هر دو زبان همین‌طور نوشته می‌شود؛ با ضربه پیام «به زودی» می‌آید.
  { id: 'trash', title: 'Trash', subtitle: 'Coming soon', image: deviceIcon.trash },
  { id: 'laptop', title: 'لپ تاپ', subtitle: 'Laptop', image: deviceIcon.laptop },
  { id: 'case', title: 'کیس', subtitle: 'Case', image: deviceIcon.case },
  { id: 'all_in_one', title: 'آل این وان', subtitle: 'All in One', image: deviceIcon.allInOne },
  { id: 'printer_copy', title: 'پرینتر / کپی', subtitle: 'Printer / Copy', image: deviceIcon.printer },
  { id: 'hard_disk', title: 'هارد دیسک', subtitle: 'Hard Disk', image: deviceIcon.hardDisk },
];

// ---------------------------------------------------------------------------
// برندها - در طرح به‌صورت دایره‌های لوگو نمایش داده شده‌اند. اگر برندی در
// logoMap مربوط به دسته‌اش نباشد (لوگوی معتبری برایش پیدا نشد)، BrandGrid به‌طور
// خودکار نام برند را به‌جای تصویر داخل همان دایره می‌نویسد.
// ---------------------------------------------------------------------------
const toBrands = (names) => names.map((name) => ({ id: name.toLowerCase().replace(/[^a-z0-9]/g, '_'), title: name }));

const monitorLogoMap = {
  'alienware': require('@assets/icons/monitor_logos_transparent/Alienware.png'),
  'aoc': require('@assets/icons/monitor_logos_transparent/AOC.png'),
  'aopen': require('@assets/icons/monitor_logos_transparent/AOPEN.png'),
  'asus': require('@assets/icons/monitor_logos_transparent/ASUS.png'),
  'acer': require('@assets/icons/monitor_logos_transparent/Acer.png'),
  'benq': require('@assets/icons/monitor_logos_transparent/BenQ.png'),
  'cooler_master': require('@assets/icons/monitor_logos_transparent/Cooler_Master.png'),
  'crua': require('@assets/icons/monitor_logos_transparent/CRUA.png'),
  'daewoo': require('@assets/icons/monitor_logos_transparent/Daewoo.png'),
  'dahua': require('@assets/icons/monitor_logos_transparent/Dahua.png'),
  'dell': require('@assets/icons/monitor_logos_transparent/Dell.png'),
  'fotor': require('@assets/icons/monitor_logos_transparent/Fotor.png'),
  'gigabyte': require('@assets/icons/monitor_logos_transparent/Gigabyte.png'),
  'gplus': require('@assets/icons/monitor_logos_transparent/GPlus.png'),
  'horizon': require('@assets/icons/monitor_logos_transparent/Horizon.png'),
  'hp': require('@assets/icons/monitor_logos_transparent/HP.png'),
  'huawei': require('@assets/icons/monitor_logos_transparent/Huawei.png'),
  'hyundai': require('@assets/icons/monitor_logos_transparent/Hyundai.png'),
  'innoview': require('@assets/icons/monitor_logos_transparent/InnoView.png'),
  'kefeya': require('@assets/icons/monitor_logos_transparent/Kefeya.png'),
  'koorui': require('@assets/icons/monitor_logos_transparent/Koorui.png'),
  'lg': require('@assets/icons/monitor_logos_transparent/LG.png'),
  'life_digital': require('@assets/icons/monitor_logos_transparent/Life_Digital.png'),
  'master_tech': require('@assets/icons/monitor_logos_transparent/Master_Tech.png'),
  'meva': require('@assets/icons/monitor_logos_transparent/MEVA.png'),
  'mindos': require('@assets/icons/monitor_logos_transparent/MINDOS.png'),
  'mnn': require('@assets/icons/monitor_logos_transparent/MNN.png'),
  'msi': require('@assets/icons/monitor_logos_transparent/MSI.png'),
  'nec': require('@assets/icons/monitor_logos_transparent/NEC.png'),
  'nexar': require('@assets/icons/monitor_logos_transparent/Nexar.png'),
  'philips_badge': require('@assets/icons/monitor_logos_transparent/Philips_Badge.png'),
  'philips_wordmark': require('@assets/icons/monitor_logos_transparent/Philips_Wordmark.png'),
  'pixio': require('@assets/icons/monitor_logos_transparent/Pixio.png'),
  'samsung': require('@assets/icons/monitor_logos_transparent/Samsung.png'),
  'sam': require('@assets/icons/monitor_logos_transparent/SAM.png'),
  'sansui': require('@assets/icons/monitor_logos_transparent/Sansui.png'),
  'sceptre': require('@assets/icons/monitor_logos_transparent/Sceptre.png'),
  'snowa': require('@assets/icons/monitor_logos_transparent/Snowa.png'),
  'twisted_minds': require('@assets/icons/monitor_logos_transparent/Twisted_Minds.png'),
  'univo': require('@assets/icons/monitor_logos_transparent/Univo.png'),
  'viewsonic': require('@assets/icons/monitor_logos_transparent/ViewSonic.png'),
  'xiaomi': require('@assets/icons/monitor_logos_transparent/Xiaomi.png'),
  'xvision': require('@assets/icons/monitor_logos_transparent/XVision.png'),
  'lenovo': require('@assets/icons/monitor_logos_transparent/Lenovo.png'),
  'sony': require('@assets/icons/monitor_logos_transparent/Sony.png'),
};

const laptopLogoMap = {
  'apple': require('@assets/icons/laptop_logos_transparent/Apple.png'),
  'hp': require('@assets/icons/laptop_logos_transparent/HP.png'),
  'lenovo': require('@assets/icons/laptop_logos_transparent/Lenovo.png'),
  'asus': require('@assets/icons/laptop_logos_transparent/ASUS.png'),
  'acer': require('@assets/icons/laptop_logos_transparent/Acer.png'),
  'dell': require('@assets/icons/laptop_logos_transparent/Dell.png'),
  'msi': require('@assets/icons/laptop_logos_transparent/MSI.png'),
  'microsoft': require('@assets/icons/laptop_logos_transparent/Microsoft.png'),
  'sony': require('@assets/icons/laptop_logos_transparent/Sony.png'),
  'toshiba': require('@assets/icons/laptop_logos_transparent/Toshiba.png'),
  'samsung': require('@assets/icons/laptop_logos_transparent/Samsung.png'),
  'fujitsu': require('@assets/icons/laptop_logos_transparent/Fujitsu.png'),
  'gigabyte': require('@assets/icons/laptop_logos_transparent/Gigabyte.png'),
  'panasonic': require('@assets/icons/laptop_logos_transparent/Panasonic.png'),
  'packard_bell': require('@assets/icons/laptop_logos_transparent/Packard_Bell.png'),
  'hcl': require('@assets/icons/laptop_logos_transparent/HCL.png'),
  'lg': require('@assets/icons/laptop_logos_transparent/LG.png'),
  // 'htc': لوگوی معتبری برای HTC پیدا نشد (فقط عکس استوک لپ‌تاپ با صفحه HTC بود).
};

// لوگوی CASE_BRANDS - هم برای «کیس» و هم برای «آل این وان» استفاده می‌شود.
const caseLogoMap = {
  'hp': require('@assets/icons/allinone_logos_transparent/HP.png'),
  'lenovo': require('@assets/icons/allinone_logos_transparent/Lenovo.png'),
  'dell': require('@assets/icons/allinone_logos_transparent/Dell.png'),
  'asus': require('@assets/icons/allinone_logos_transparent/ASUS.png'),
  'acer': require('@assets/icons/allinone_logos_transparent/Acer.png'),
  'msi': require('@assets/icons/allinone_logos_transparent/MSI.png'),
  'gigabyte': require('@assets/icons/allinone_logos_transparent/Gigabyte.png'),
  'green': require('@assets/icons/allinone_logos_transparent/Green.png'),
  // 'tsco' و 'مونتاژ ایرانی' لوگوی رسمی مشخصی ندارند.
};

const printerLogoMap = {
  'hp': require('@assets/icons/printer_logos_transparent/HP.png'),
  'canon': require('@assets/icons/printer_logos_transparent/Canon.png'),
  'epson': require('@assets/icons/printer_logos_transparent/Epson.png'),
  'brother': require('@assets/icons/printer_logos_transparent/Brother.png'),
  'samsung': require('@assets/icons/printer_logos_transparent/Samsung.png'),
  'xerox': require('@assets/icons/printer_logos_transparent/Xerox.png'),
  'ricoh': require('@assets/icons/printer_logos_transparent/Ricoh.png'),
  'sharp': require('@assets/icons/printer_logos_transparent/Sharp.png'),
  'konica_minolta': require('@assets/icons/printer_logos_transparent/Konica_Minolta.png'),
  // 'pantum': فایل موجود در assets واقعاً لوگوی برند رنگ Pantone بود، نه Pantum.
};

const hddLogoMap = {
  'western_digital': require('@assets/icons/hdd_logos_transparent/Western_Digital.png'),
  'seagate': require('@assets/icons/hdd_logos_transparent/Seagate.png'),
  'samsung': require('@assets/icons/hdd_logos_transparent/Samsung.png'),
  'toshiba': require('@assets/icons/hdd_logos_transparent/Toshiba.png'),
  'kingston': require('@assets/icons/hdd_logos_transparent/Kingston.png'),
  'adata': require('@assets/icons/hdd_logos_transparent/ADATA.png'),
  'crucial': require('@assets/icons/hdd_logos_transparent/Crucial.png'),
  'sandisk': require('@assets/icons/hdd_logos_transparent/SanDisk.png'),
  'intel': require('@assets/icons/hdd_logos_transparent/Intel.png'),
};

const LAPTOP_BRANDS = toBrands([
  'Apple', 'HP', 'Lenovo', 'Asus', 'Acer', 'Dell', 'MSI', 'Microsoft', 'Sony',
  'Toshiba', 'Samsung', 'Fujitsu', 'GIGABYTE', 'Panasonic', 'Packard Bell', 'HTC', 'HCL', 'LG',
]).map((brand) => ({ ...brand, image: laptopLogoMap[brand.id] }));

const MONITOR_BRANDS = toBrands([
  'Alienware', 'AOC', 'AOPEN', 'ASUS', 'Acer', 'BenQ', 'Cooler Master', 'CRUA', 'Daewoo', 'Dahua',
  'Dell', 'Fotor', 'Gigabyte', 'G-Plus', 'Horizon', 'HP', 'Huawei', 'Hyundai', 'InnoView', 'Kefeya',
  'Koorui', 'LG', 'Life Digital', 'Master Tech', 'MEVA', 'MINDOS', 'MNN', 'MSI', 'NEC', 'Nexar',
  'Philips', 'Pixio', 'Samsung', 'SAM', 'Sansui', 'Sceptre', 'Snowa', 'Twisted Minds', 'Univo', 'ViewSonic',
  'Xiaomi', 'XVision', 'Lenovo', 'Sony', 'Sonic',
]).map((brand) => ({
  ...brand,
  image: monitorLogoMap[brand.id],
}));

const CASE_BRANDS = toBrands([
  'HP', 'Lenovo', 'Dell', 'Asus', 'Acer', 'MSI', 'GIGABYTE', 'Green', 'TSCO', 'مونتاژ ایرانی',
]).map((brand) => ({ ...brand, image: caseLogoMap[brand.id] }));

const PRINTER_BRANDS = toBrands([
  'HP', 'Canon', 'Epson', 'Brother', 'Samsung', 'Xerox', 'Ricoh', 'Sharp', 'Konica Minolta', 'Pantum',
]).map((brand) => ({ ...brand, image: printerLogoMap[brand.id] }));

const HDD_BRANDS = toBrands([
  'Western Digital', 'Seagate', 'Samsung', 'Toshiba', 'Kingston', 'ADATA', 'Crucial', 'SanDisk', 'Intel',
]).map((brand) => ({ ...brand, image: hddLogoMap[brand.id] }));

// ---------------------------------------------------------------------------
// گزینه‌های مشترک بین چند دسته
// ---------------------------------------------------------------------------
const DEVICE_STATUS_OPTIONS = [
  { id: 'new', title: 'نو / آکبند' },
  { id: 'used_healthy', title: 'کارکرده و سالم' },
  { id: 'faulty', title: 'معیوب / نیاز به تعمیر' },
  { id: 'scrap', title: 'اسقاط / غیرقابل استفاده' },
];

const WARRANTY_OPTIONS = [
  { id: 'in_warranty', title: 'در گارانتی' },
  { id: 'out_of_warranty', title: 'خارج از گارانتی' },
  { id: 'unknown', title: 'نامشخص' },
];

const APPEARANCE_ISSUE_OPTIONS = [
  { id: 'healthy_body', title: 'بدنه سالم است' },
  { id: 'scratches', title: 'خط و خش روی بدنه' },
  { id: 'broken_body', title: 'شکستگی بدنه / لولا' },
  { id: 'screen_scratch', title: 'خط افتادگی صفحه نمایش' },
  { id: 'worn_keyboard', title: 'کیبورد / دکمه‌ها فرسوده' },
  { id: 'damaged_label', title: 'برچسب / گارانتی مخدوش' },
];

const HARD_DISK_DATA_OPTIONS = [
  { id: 'has_important_data', title: 'اطلاعات مهم دارد - بکاپ گرفته شود' },
  { id: 'no_important_data', title: 'اطلاعات مهم ندارد' },
  { id: 'wipe_disk', title: 'هارد کاملاً پاک‌سازی شود' },
  { id: 'replace_and_transfer', title: 'تعویض هارد و انتقال اطلاعات' },
];

const LOANER_OPTIONS = [
  { id: 'needed', title: 'بله، دستگاه امانی لازم دارم' },
  { id: 'if_long', title: 'فقط اگر تعمیر طولانی شود' },
  { id: 'not_needed', title: 'خیر، لازم ندارم' },
];

const softwareChecklist = SOFTWARE_ITEMS.map((item) => ({ id: item.id, title: item.title }));

// مراحل پایانی مشترک همه‌ی دسته‌ها (تکنسین / بازه زمانی / ثبت سفارش).
// afterProcurement برای مراحلی است که در طرح دقیقاً بعد از «تامین تجهیزات / کالا»
// می‌آیند - مثل «لپ تاپ بصورت موقت / امانت».
const closingSteps = (procurementIds, afterProcurement = []) => [
  ...(procurementIds
    ? [
        {
          id: 'procurement',
          title: 'تامین تجهیزات / کالا',
          hint: 'اگر علاوه بر سرویس، نیاز به تامین دستگاه یا قطعه دارید، تعداد آکبند/کارکرده هر مورد را وارد کنید.',
          icon: sectionIcon.procurement,
          type: 'procurement',
          itemIds: procurementIds,
        },
      ]
    : []),
  ...afterProcurement,
  {
    id: 'technician',
    title: 'انتخاب تکنسین',
    hint: 'جنسیت تکنسینی که برای انجام خدمت مراجعه می‌کند را انتخاب کنید.',
    icon: sectionIcon.technician,
    type: 'technician',
    required: true,
  },
  {
    id: 'time_range',
    title: 'بازه زمانی / رزرو',
    hint: 'تاریخ مراجعه و بازه ساعتی مورد نظر خود را انتخاب کنید.',
    icon: sectionIcon.timeRange,
    type: 'schedule',
    required: true,
  },
  {
    id: 'address',
    title: 'آدرس‌های منتخب',
    hint: 'آدرس محل مراجعه را انتخاب کنید.',
    type: 'address',
    required: true,
  },
  {
    id: 'order_actions',
    title: 'نمایش / استعلام / ثبت سفارش',
    hint: 'پیش از ثبت نهایی می‌توانید پیش‌رسید را صادر یا مشاهده کنید و در نهایت سفارش را ثبت یا لغو نمایید.',
    icon: sectionIcon.orderActions,
    type: 'orderActions',
  },
];

// ---------------------------------------------------------------------------
// مراحل هر دسته
// ---------------------------------------------------------------------------
export const SYSTEMATIC_FLOWS = {
  // «لپ تاپ» - سیزده مرحله‌ی طرح
  laptop: [
    {
      id: 'brand',
      title: 'برند لپ تاپ',
      hint: 'برند لپ تاپ خود را انتخاب کنید. اگر برند شما در فهرست نیست، آن را در کادر «برند دیگر» بنویسید.',
      icon: deviceIcon.laptop,
      type: 'brands',
      brands: LAPTOP_BRANDS,
      required: true,
    },
    {
      id: 'model',
      title: 'مدل لپ تاپ',
      hint: 'مدل لپ تاپ معمولاً از روش‌های زیر قابل پیدا کردن است:\nداخل ویندوز: Win + R را بزنید، msinfo32 را وارد کنید و مقابل System Model مدل را ببینید.\nبرچسب مشخصات زیر یا کنار دستگاه، جعبه یا فاکتور خرید را بررسی کنید.\nاگر دستگاه روشن نمی‌شود از برچسب یا جعبه کمک بگیرید. مثال: X555',
      icon: deviceIcon.laptop,
      type: 'fields',
      fields: [
        { id: 'model', placeholder: 'مدل لپ تاپ (مثلاً X550)' },
      ],
      required: true,
    },
    {
      id: 'os',
      title: 'انتخاب سیستم عامل',
      hint: 'سیستم عاملی که باید روی دستگاه نصب شود را انتخاب کنید.',
      icon: sectionIcon.software,
      type: 'osGrid',
    },
    {
      id: 'software_install',
      title: 'نصب نرم افزار',
      hint: 'نرم‌افزارهای مورد نیاز برای نصب روی این دستگاه را انتخاب کنید.',
      icon: sectionIcon.software,
      type: 'checklist',
      options: softwareChecklist,
      columns: 1,
    },
    // طبق سند کارفرما (۲۵ آبان ۱۴۰۵): بند ۱۱ نام‌ها را «عیوب نرم افزار» و «عیوب سخت
    // افزار» گذاشت و بند ۳۵ گفت یکی از چهار مرحله‌ی خدمات (سیستم عامل / نصب نرم
    // افزار / عیوب نرم افزار / عیوب سخت افزار) حتماً باید انتخاب شود.
    //
    // تا ۱۴۰۵/۰۹/۰۲ فقط یکی از این دو مرحله وجود داشت و آن هم با نام «عیوب سخت افزار»
    // گزینه‌های نرم‌افزاری داشت؛ مرحله‌ی software_default وجود نداشت و getFlow برای
    // بقیه‌ی دستگاه‌ها از روی قالبی ناموجود یک مرحله‌ی بی‌id می‌ساخت.
    //
    // این مرحله قالب «عیوب نرم افزار» بقیه‌ی دستگاه‌ها هم هست (getFlow).
    {
      id: 'software_default',
      title: 'عیوب نرم افزار',
      // متن‌ها مستقل از دستگاه هستند، چون getFlow همین مرحله را برای کیس، آل این
      // وان، هارد و پرینتر هم کپی می‌کند.
      hint: 'مشکلات نرم‌افزاری دستگاه؛ هر مورد که مصداق دارد را انتخاب کنید.',
      icon: sectionIcon.software,
      type: 'checklist',
      options: [
        { id: 'blue_screen', title: 'پیغام صفحه آبی می‌آید' },
        { id: 'apps_not_running', title: 'برخی برنامه‌ها اجرا نمی‌شوند' },
        { id: 'software_not_installing', title: 'برخی نرم‌افزارها نصب نمی‌شوند' },
        { id: 'antivirus_not_updating', title: 'آنتی ویروس، بروزرسانی یا آپدیت نمی‌شود' },
        { id: 'infected', title: 'ویروسی شدن دستگاه' },
        { id: 'windows_not_installing', title: 'ویندوز نصب نمی‌شود' },
        { id: 'missing_storage_drivers', title: 'درایورهای هارد در زمان نصب ویندوز نمایش داده نمی‌شوند' },
      ],
      columns: 1,
    },
    {
      id: 'hardware_default',
      title: 'عیوب سخت افزار',
      hint: 'عیوب قطعات و سخت‌افزار لپ تاپ؛ هر مورد که مصداق دارد را انتخاب کنید.',
      icon: sectionIcon.hardware,
      type: 'checklist',
      options: [
        { id: 'no_power', title: 'روشن نمی‌شود' },
        { id: 'screen_fault', title: 'صفحه نمایش خط دارد، خاموش است یا شکسته' },
        { id: 'keyboard_fault', title: 'کیبورد یا بعضی کلیدها کار نمی‌کند' },
        { id: 'charge_fault', title: 'شارژ نمی‌شود / پورت شارژ مشکل دارد' },
        { id: 'battery_fault', title: 'باتری خیلی زود تخلیه می‌شود' },
        { id: 'overheat_noise', title: 'زیاد داغ می‌کند / فن صدای زیادی دارد' },
        { id: 'disk_fault', title: 'هارد صدا می‌دهد یا شناخته نمی‌شود' },
        { id: 'ports_fault', title: 'پورت‌های USB / HDMI کار نمی‌کنند' },
        { id: 'hinge_case_fault', title: 'لولا یا بدنه آسیب دیده' },
        { id: 'other_hardware', title: 'سایر عیوب سخت‌افزاری' },
      ],
      columns: 1,
    },
    {
      id: 'appearance_issue',
      title: 'ایراد ظاهری',
      hint: 'در صورتی که لپ تاپ دارای نواقص ظاهری می‌باشد بنویسید.',
      icon: sectionIcon.equipmentStatus,
      type: 'note',
      notePlaceholder: 'در صورتی که لپ تاپ دارای نواقص ظاهری می‌باشد بنویسید...',
    },
    {
      id: 'device_status',
      title: 'وضعیت لپ تاپ',
      hint: 'عکس مرتبط با وضعیت دستگاه را بارگذاری کنید و در صورت نیاز توضیح دهید.',
      icon: sectionIcon.equipmentStatus,
      type: 'photo',
      notePlaceholder: 'توضیحات دیگری دارید بنویسید...',
    },
    {
      id: 'hard_disk_data',
      title: 'اطلاعات شخصی در هارد دیسک',
      hint: 'تعیین تکلیف محتویات موجود روی هارد لپ تاپ پیش از تحویل دستگاه به تکنسین.',
      icon: deviceIcon.hardDisk,
      type: 'options',
      options: [
        { id: 'has_personal_data', title: 'دارای محتویات شخصی در هارد' },
        { id: 'full_wipe', title: 'حذف کامل محتویات هارد' },
        { id: 'transfer_backup', title: 'انتقال / بکاپ محتویات توسط تکنسین' },
      ],
      columns: 1,
      note: true,
      required: true,
    },
    ...closingSteps(
      ['laptop', 'laptop_parts', 'accessories', 'storage_drive'],
      [
        {
          id: 'loaner',
          title: 'لپ تاپ بصورت موقت / امانت',
          hint: 'این بخش برای درخواست دستگاه جایگزین تا زمان تعمیر، به‌زودی فعال می‌شود.',
          icon: sectionIcon.deliveryMode,
          type: 'comingSoon',
        },
      ]
    ),
  ],

  // «مانیتور» - هشت مرحله‌ی طرح
  monitor: [
    {
      id: 'brand',
      title: 'برند مانیتور',
      hint: 'برند مانیتور خود را انتخاب کنید. اگر برند شما در فهرست نیست، آن را در کادر «برند دیگر» بنویسید.',
      icon: require('@assets/icons/sections/monitor-brand.png'),
      type: 'brands',
      brands: MONITOR_BRANDS,
      required: true,
    },
    {
      id: 'panel_type',
      title: 'مدل مانیتور',
      hint: 'نوع پنل مانیتور را انتخاب و در صورت نیاز مدل دقیق را بنویسید.',
      icon: require('@assets/icons/sections/monitor-model.png'),
      type: 'options',
      options: [
        { id: 'lcd', title: 'LCD' },
        { id: 'led', title: 'LED' },
        { id: 'oled', title: 'OLED' },
      ],
      columns: 1,
      note: true,
      notePlaceholder: 'مدل دقیق / شماره سریال (اختیاری)',
      required: true,
    },
    {
      id: 'size',
      title: 'ابعاد مانیتور',
      hint: 'اندازه‌ی صفحه‌ی مانیتور بر حسب اینچ.',
      icon: sectionIcon.serviceLevel,
      type: 'options',
      options: [
        { id: 'in_19', title: '۱۹ اینچ' },
        { id: 'in_215', title: '۲۱.۵ اینچ' },
        { id: 'in_22', title: '۲۲ اینچ' },
        { id: 'in_24', title: '۲۴ اینچ' },
        { id: 'in_27', title: '۲۷ اینچ' },
        { id: 'in_32', title: '۳۲ اینچ و بالاتر' },
      ],
      columns: 3,
      required: true,
    },
    {
      id: 'physical_issue',
      title: 'ایراد فیزیکی / ظاهری مانیتور',
      hint: 'مشکلات مشاهده‌شده روی مانیتور را انتخاب کنید.',
      icon: sectionIcon.hardware,
      type: 'checklist',
      options: [
        { id: 'no_power', title: 'مانیتور روشن نمی‌شود' },
        { id: 'no_image', title: 'مانیتور تصویر ندارد' },
        { id: 'no_hdmi', title: 'پورت HDMI / کابل مشکل دارد' },
        { id: 'flicker', title: 'تصویر چشمک می‌زند یا قطع و وصل می‌شود' },
        { id: 'stain', title: 'لکه، خط عمودی یا خط و خش روی صفحه' },
        { id: 'color', title: 'رنگ‌ها را درست نمایش نمی‌دهد' },
        { id: 'broken_stand', title: 'پایه / بدنه شکسته است' },
        { id: 'other', title: 'سایر مشکلات مانیتور' },
      ],
      columns: 1,
    },
    {
      id: 'device_status',
      title: 'وضعیت مانیتور',
      hint: 'وضعیت کلی مانیتور و شرایط گارانتی آن را انتخاب کنید.',
      icon: sectionIcon.equipmentStatus,
      type: 'options',
      options: DEVICE_STATUS_OPTIONS,
      extra: { id: 'warranty', title: 'وضعیت گارانتی', options: WARRANTY_OPTIONS, columns: 3 },
      note: true,
    },
    ...closingSteps(null),
  ],

  // «کیس» - همان فهرست ایرادهای HardwareIssueScreen موجود در پروژه
  case: [
    {
      id: 'brand',
      title: 'برند کیس',
      hint: 'برند کیس یا مونتاژکننده‌ی آن را انتخاب کنید.',
      icon: deviceIcon.case,
      type: 'brands',
      brands: CASE_BRANDS,
      required: true,
    },
    {
      id: 'model',
      title: 'مدل / مشخصات کیس',
      hint: 'مدل و مشخصات سخت‌افزاری کیس را وارد کنید.',
      icon: deviceIcon.case,
      type: 'fields',
      fields: [
        { id: 'model', placeholder: 'مدل کیس' },
        { id: 'serial', placeholder: 'شماره سریال' },
        { id: 'specs', placeholder: 'مشخصات (CPU / RAM / هارد / گرافیک)' },
      ],
      required: true,
    },
    {
      id: 'os',
      title: 'انتخاب سیستم عامل',
      hint: 'سیستم عاملی که باید روی کیس نصب شود را انتخاب کنید.',
      icon: sectionIcon.software,
      type: 'osGrid',
    },
    {
      id: 'software_install',
      title: 'نصب نرم افزار',
      hint: 'نرم‌افزارهای مورد نیاز برای نصب روی این دستگاه را انتخاب کنید.',
      icon: sectionIcon.software,
      type: 'checklist',
      options: softwareChecklist,
      columns: 1,
    },
    {
      id: 'hardware_default',
      title: 'عیوب سخت افزار',
      hint: 'ایرادهای سخت‌افزاری متداول کیس؛ هر مورد که مصداق دارد را انتخاب کنید.',
      icon: sectionIcon.hardware,
      type: 'checklist',
      options: [
        { id: 'no_power', title: 'کیس روشن نمی‌شود' },
        { id: 'not_working', title: 'کیس کار نمی‌کند' },
        { id: 'slow', title: 'کیس کند است' },
        { id: 'reset', title: 'کیس ریست می‌شود' },
        { id: 'hang', title: 'کیس هنگ می‌کند' },
        { id: 'noise', title: 'کیس صدا دارد' },
        { id: 'overheat', title: 'کیس داغ می‌شود' },
        { id: 'no_display', title: 'مانیتور تصویر ندارد' },
        { id: 'keyboard', title: 'کیبورد کار نمی‌کند' },
        { id: 'mouse', title: 'ماوس کار نمی‌کند' },
        { id: 'ports', title: 'پورت‌ها کار نمی‌کنند' },
        { id: 'other', title: 'سایر مشکلات' },
      ],
      columns: 1,
    },
    {
      id: 'appearance_issue',
      title: 'ایراد ظاهری',
      hint: 'وضعیت ظاهری دستگاه را مشخص کنید تا هنگام تحویل اختلافی پیش نیاید.',
      icon: sectionIcon.equipmentStatus,
      type: 'checklist',
      options: APPEARANCE_ISSUE_OPTIONS,
    },
    {
      id: 'device_status',
      title: 'وضعیت محصول / دستگاه',
      hint: 'وضعیت کلی دستگاه و شرایط گارانتی آن را انتخاب کنید.',
      icon: sectionIcon.equipmentStatus,
      type: 'options',
      options: DEVICE_STATUS_OPTIONS,
      extra: { id: 'warranty', title: 'وضعیت گارانتی', options: WARRANTY_OPTIONS, columns: 3 },
      note: true,
    },
    {
      id: 'hard_disk_data',
      title: 'اطلاعات شخصی در هارد دیسک',
      hint: 'تعیین تکلیف اطلاعات موجود روی هارد پیش از تحویل دستگاه به تکنسین.',
      icon: deviceIcon.hardDisk,
      type: 'options',
      options: HARD_DISK_DATA_OPTIONS,
      columns: 1,
      note: true,
      required: true,
    },
    ...closingSteps(
      ['case_standard', 'case_professional', 'mini_case', 'case_parts', 'accessories'],
      [
        {
          id: 'loaner',
          title: 'کیس بصورت موقت / امانت',
          hint: 'اگر تا زمان تعمیر به دستگاه جایگزین نیاز دارید، اینجا مشخص کنید.',
          icon: sectionIcon.deliveryMode,
          type: 'options',
          options: LOANER_OPTIONS,
          columns: 1,
          note: true,
        },
      ]
    ),
  ],

  // «آل این وان» - ترکیب مسیر کیس و مانیتور
  all_in_one: [
    {
      id: 'brand',
      title: 'برند آل این وان',
      hint: 'برند دستگاه آل این وان خود را انتخاب کنید.',
      icon: deviceIcon.allInOne,
      type: 'brands',
      brands: CASE_BRANDS,
      required: true,
    },
    {
      id: 'model',
      title: 'مدل آل این وان',
      hint: 'مدل، شماره سریال و مشخصات کلی دستگاه را وارد کنید.',
      icon: deviceIcon.allInOne,
      type: 'fields',
      fields: [
        { id: 'model', placeholder: 'مدل دستگاه' },
        { id: 'serial', placeholder: 'شماره سریال' },
        { id: 'specs', placeholder: 'مشخصات (CPU / RAM / هارد)' },
      ],
      required: true,
    },
    {
      id: 'os',
      title: 'انتخاب سیستم عامل',
      hint: 'سیستم عاملی که باید روی دستگاه نصب شود را انتخاب کنید.',
      icon: sectionIcon.software,
      type: 'osGrid',
    },
    {
      id: 'software_install',
      title: 'نصب نرم افزار',
      hint: 'نرم‌افزارهای مورد نیاز برای نصب روی این دستگاه را انتخاب کنید.',
      icon: sectionIcon.software,
      type: 'checklist',
      options: softwareChecklist,
      columns: 1,
    },
    {
      id: 'hardware_default',
      title: 'عیوب سخت افزار',
      hint: 'ایرادهای سخت‌افزاری متداول دستگاه؛ هر مورد که مصداق دارد را انتخاب کنید.',
      icon: sectionIcon.hardware,
      type: 'checklist',
      options: [
        { id: 'no_power', title: 'دستگاه روشن نمی‌شود' },
        { id: 'no_image', title: 'صفحه نمایش تصویر ندارد' },
        { id: 'touch', title: 'تاچ صفحه کار نمی‌کند' },
        { id: 'slow', title: 'دستگاه کند است' },
        { id: 'hang_reset', title: 'هنگ می‌کند / ریست می‌شود' },
        { id: 'noise', title: 'صدا / فن مشکل دارد' },
        { id: 'ports', title: 'پورت‌ها کار نمی‌کنند' },
        { id: 'other', title: 'سایر مشکلات' },
      ],
      columns: 1,
    },
    {
      id: 'appearance_issue',
      title: 'ایراد ظاهری',
      hint: 'وضعیت ظاهری دستگاه را مشخص کنید تا هنگام تحویل اختلافی پیش نیاید.',
      icon: sectionIcon.equipmentStatus,
      type: 'checklist',
      options: APPEARANCE_ISSUE_OPTIONS,
    },
    {
      id: 'device_status',
      title: 'وضعیت محصول / دستگاه',
      hint: 'وضعیت کلی دستگاه و شرایط گارانتی آن را انتخاب کنید.',
      icon: sectionIcon.equipmentStatus,
      type: 'options',
      options: DEVICE_STATUS_OPTIONS,
      extra: { id: 'warranty', title: 'وضعیت گارانتی', options: WARRANTY_OPTIONS, columns: 3 },
      note: true,
    },
    {
      id: 'hard_disk_data',
      title: 'اطلاعات شخصی در هارد دیسک',
      hint: 'تعیین تکلیف اطلاعات موجود روی هارد پیش از تحویل دستگاه به تکنسین.',
      icon: deviceIcon.hardDisk,
      type: 'options',
      options: HARD_DISK_DATA_OPTIONS,
      columns: 1,
      note: true,
      required: true,
    },
    ...closingSteps(['all_in_one', 'accessories', 'storage_drive']),
  ],

  // «پرینتر / کپی»
  printer_copy: [
    {
      id: 'brand',
      title: 'برند پرینتر / کپی',
      hint: 'برند دستگاه چاپ یا کپی خود را انتخاب کنید.',
      icon: deviceIcon.printer,
      type: 'brands',
      brands: PRINTER_BRANDS,
      required: true,
    },
    {
      id: 'model',
      title: 'مدل پرینتر / کپی',
      hint: 'مدل دقیق دستگاه و شماره سریال آن را وارد کنید.',
      icon: deviceIcon.printer,
      type: 'fields',
      fields: [
        { id: 'model', placeholder: 'مدل دستگاه' },
        { id: 'serial', placeholder: 'شماره سریال' },
      ],
      required: true,
    },
    {
      id: 'device_type',
      title: 'نوع دستگاه',
      hint: 'نوع دستگاه چاپ را مشخص کنید.',
      icon: sectionIcon.hardware,
      type: 'options',
      options: [
        { id: 'laser_single', title: 'لیزری تک‌کاره' },
        { id: 'laser_multi', title: 'لیزری چندکاره' },
        { id: 'inkjet', title: 'جوهرافشان' },
        { id: 'industrial_copier', title: 'کپی صنعتی' },
      ],
      required: true,
    },
    {
      id: 'connection',
      title: 'نحوه اتصال',
      hint: 'دستگاه از چه طریقی به سیستم‌ها متصل می‌شود.',
      icon: sectionIcon.criticalInfra,
      type: 'options',
      options: [
        { id: 'usb', title: 'USB / مستقیم' },
        { id: 'network', title: 'شبکه (LAN)' },
        { id: 'wireless', title: 'وایرلس' },
      ],
      columns: 3,
      note: true,
    },
    {
      id: 'hardware_default',
      title: 'ایراد دستگاه',
      hint: 'مشکلات مشاهده‌شده روی دستگاه چاپ را انتخاب کنید.',
      icon: sectionIcon.hardware,
      type: 'checklist',
      options: [
        { id: 'no_power', title: 'دستگاه روشن نمی‌شود' },
        { id: 'no_print', title: 'چاپ نمی‌کند' },
        { id: 'paper_jam', title: 'کاغذ گیر می‌کند' },
        { id: 'low_quality', title: 'کیفیت چاپ پایین است / خط می‌اندازد' },
        { id: 'toner', title: 'تونر / کارتریج نیاز به شارژ یا تعویض دارد' },
        { id: 'scanner', title: 'اسکنر یا کپی کار نمی‌کند' },
        { id: 'network_issue', title: 'در شبکه شناسایی نمی‌شود' },
        { id: 'driver', title: 'درایور نصب نمی‌شود' },
        { id: 'other', title: 'سایر مشکلات' },
      ],
      columns: 1,
    },
    {
      id: 'device_status',
      title: 'وضعیت دستگاه',
      hint: 'وضعیت کلی دستگاه و شرایط گارانتی آن را انتخاب کنید.',
      icon: sectionIcon.equipmentStatus,
      type: 'options',
      options: DEVICE_STATUS_OPTIONS,
      extra: { id: 'warranty', title: 'وضعیت گارانتی', options: WARRANTY_OPTIONS, columns: 3 },
      note: true,
    },
    ...closingSteps(['printer_single', 'printer_multi', 'industrial_copier', 'accessories']),
  ],

  // «هارد دیسک»
  hard_disk: [
    {
      id: 'brand',
      title: 'برند هارد دیسک',
      hint: 'برند هارد یا حافظه‌ی خود را انتخاب کنید.',
      icon: deviceIcon.hardDisk,
      type: 'brands',
      brands: HDD_BRANDS,
      required: true,
    },
    {
      id: 'disk_type',
      title: 'نوع حافظه',
      hint: 'نوع حافظه‌ای که سرویس روی آن انجام می‌شود.',
      icon: deviceIcon.hardDisk,
      type: 'options',
      options: [
        { id: 'hdd', title: 'HDD اینترنال' },
        { id: 'ssd', title: 'SSD' },
        { id: 'nvme', title: 'NVMe / M.2' },
        { id: 'external', title: 'هارد اکسترنال' },
      ],
      required: true,
    },
    {
      id: 'capacity',
      title: 'ظرفیت',
      hint: 'ظرفیت حافظه را انتخاب کنید.',
      icon: sectionIcon.serviceLevel,
      type: 'options',
      options: [
        { id: 'c_256', title: '۲۵۶ گیگابایت' },
        { id: 'c_512', title: '۵۱۲ گیگابایت' },
        { id: 'c_1t', title: '۱ ترابایت' },
        { id: 'c_2t', title: '۲ ترابایت' },
        { id: 'c_4t', title: '۴ ترابایت و بالاتر' },
      ],
      columns: 3,
    },
    {
      id: 'hardware_default',
      title: 'ایراد حافظه',
      hint: 'مشکل مشاهده‌شده روی هارد یا حافظه را انتخاب کنید.',
      icon: sectionIcon.hardware,
      type: 'checklist',
      options: [
        { id: 'not_detected', title: 'شناسایی نمی‌شود' },
        { id: 'bad_sector', title: 'بدسکتور دارد / کند است' },
        { id: 'noise', title: 'صدای غیرعادی می‌دهد' },
        { id: 'data_loss', title: 'اطلاعات پاک شده است' },
        { id: 'format_needed', title: 'نیاز به فرمت / پارتیشن‌بندی دارد' },
        { id: 'other', title: 'سایر مشکلات' },
      ],
      columns: 1,
    },
    {
      id: 'hard_disk_data',
      title: 'اطلاعات شخصی در هارد دیسک',
      hint: 'تعیین تکلیف اطلاعات موجود روی هارد پیش از تحویل به تکنسین.',
      icon: deviceIcon.hardDisk,
      type: 'options',
      options: [
        ...HARD_DISK_DATA_OPTIONS,
        { id: 'recovery', title: 'بازیابی اطلاعات پاک‌شده' },
      ],
      columns: 1,
      note: true,
      required: true,
    },
    {
      id: 'device_status',
      title: 'وضعیت هارد دیسک',
      hint: 'وضعیت فعلی هارد دیسک را انتخاب کنید.',
      icon: sectionIcon.equipmentStatus,
      type: 'options',
      options: DEVICE_STATUS_OPTIONS,
    },
    ...closingSteps(['storage_drive', 'accessories']),
  ],

  // «ضایعات» - جمع‌آوری و تحویل اقلام اسقاط سازمان
  trash: [
    {
      id: 'scrap_items',
      title: 'اقلام ضایعاتی',
      hint: 'تعداد اقلام اسقاط سازمان را به تفکیک نوع دستگاه وارد کنید.',
      icon: sectionIcon.procurement,
      type: 'hardwareCounters',
      itemIds: [
        'laptop', 'monitor', 'case_standard', 'case_professional',
        'mini_case', 'all_in_one', 'printer_single', 'printer_multi',
        'industrial_copier', 'storage_drive',
      ],
      required: true,
    },
    {
      id: 'scrap_status',
      title: 'وضعیت اقلام',
      hint: 'وضعیت کلی اقلام تحویلی را مشخص کنید.',
      icon: sectionIcon.equipmentStatus,
      type: 'options',
      options: [
        { id: 'repairable', title: 'قابل تعمیر / بازیابی' },
        { id: 'parts_only', title: 'فقط قطعات قابل استفاده' },
        { id: 'full_scrap', title: 'اسقاط کامل' },
      ],
      columns: 3,
      note: true,
      required: true,
    },
    {
      id: 'hard_disk_data',
      title: 'اطلاعات شخصی در هارد دیسک',
      hint: 'پیش از تحویل اقلام، تکلیف اطلاعات روی هاردها را مشخص کنید.',
      icon: deviceIcon.hardDisk,
      type: 'options',
      options: HARD_DISK_DATA_OPTIONS,
      columns: 1,
      note: true,
      required: true,
    },
    {
      id: 'pickup_mode',
      title: 'نحوه تحویل / جمع‌آوری',
      hint: 'اقلام توسط تکنسین لوپ جمع‌آوری شود یا سازمان خودش تحویل می‌دهد.',
      icon: sectionIcon.deliveryMode,
      type: 'options',
      options: [
        { id: 'loop_pickup', title: 'جمع‌آوری توسط لوپ' },
        { id: 'org_delivery', title: 'تحویل توسط سازمان' },
      ],
      note: true,
      required: true,
    },
    ...closingSteps(null),
  ],
};

const REQUIRED_DEVICE_STEPS = {
  laptop: ['brand', 'model', 'device_status', 'hard_disk_data'],
  monitor: ['brand', 'panel_type', 'size', 'physical_issue', 'device_status'],
  case: ['model', 'device_status', 'hard_disk_data'],
  all_in_one: ['brand', 'model', 'device_status', 'hard_disk_data'],
  hard_disk: ['brand', 'disk_type', 'device_status', 'hard_disk_data'],
  printer_copy: ['brand', 'model', 'device_type', 'device_status'],
};

export const SERVICE_STEP_IDS = ['os', 'software_install', 'software_default', 'hardware_default'];

export const getFlow = (categoryId) => {
  const flow = SYSTEMATIC_FLOWS[categoryId] || [];
  const required = REQUIRED_DEVICE_STEPS[categoryId];
  if (!required) return flow;
  const normalized = flow.slice();
  if (['case', 'all_in_one', 'hard_disk', 'printer_copy'].includes(categoryId) && !normalized.some((step) => step.id === 'software_default')) {
    const template = SYSTEMATIC_FLOWS.laptop.find((step) => step.id === 'software_default');
    // اگر قالب نباشد، `{...undefined}` یک مرحله‌ی بدون id و type می‌ساخت (باگ
    // ۱۴۰۵/۰۹/۰۲: یک آکاردئون خالی و بی‌اثر در وسط سفارش). خطای صریح بهتر از
    // مرحله‌ی مرده است؛ تست‌ها همین را می‌گیرند.
    if (!template) throw new Error('software_default template is missing from the laptop flow');
    const anchor = normalized.findIndex((step) => step.id === 'hardware_default');
    if (anchor < 0) throw new Error('hardware_default step is missing from the ' + categoryId + ' flow');
    normalized.splice(anchor, 0, { ...template, title: 'عیوب نرم افزار' });
  }
  // Reject ambiguous step identities before navigation or receipt generation.
  const ids = normalized.map((step) => step.id);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate systematic step: ' + categoryId);
  return normalized.map((step) => ({
    ...step,
    required: required.includes(step.id) || ['technician', 'time_range', 'address'].includes(step.id),
  }));
};

export const getCategory = (categoryId) =>
  SYSTEMATIC_CATEGORIES.find((c) => c.id === categoryId) || null;

export const procurementItemsByIds = (ids) =>
  PROCUREMENT_ITEMS.filter((item) => ids.includes(item.id));

// ---------------------------------------------------------------------------
// تطبیق دسته‌های برگشتی از API (`/api/categories`) با مسیرهای سیستماتیک بالا.
//
// صفحه‌ی «انتخاب سیستماتیک» همان کاشی‌ها و همان آیکون‌های سروری صفحه‌ی اصلی
// (screens/FolderScreen.js) را نشان می‌دهد؛ بنابراین آیتم‌ها از API می‌آیند و
// اینجا فقط به id مسیر داخلی نگاشت می‌شوند. عنوان‌ها بسته به زبان فارسی یا
// انگلیسی برمی‌گردند، پس هر دو حالت به‌عنوان alias ثبت شده است.
// ---------------------------------------------------------------------------
const CATEGORY_ALIASES = {
  user_account: ['حساب کاربری', 'user account', 'profile'],
  laptop: ['لپ تاپ', 'لپتاپ', 'laptop', 'notebook'],
  printer_copy: ['پرینتر / کپی', 'پرینتر کپی', 'پرینتر', 'کپی', 'printer copy', 'printer', 'copy', 'copier'],
  monitor: ['مانیتور', 'نمایشگر', 'monitor', 'display'],
  case: ['کیس', 'کیس پی سی', 'case', 'pc', 'desktop'],
  trash: ['ضایعات', 'اسقاط', 'trash', 'scrap', 'waste'],
  all_in_one: ['آل این وان', 'all in one', 'allinone', 'aio'],
  hard_disk: ['هارد دیسک', 'هارد', 'hard disk', 'harddisk', 'hdd', 'ssd', 'storage'],
};

// حذف نیم‌فاصله/اعراب و یکدست‌کردن جداکننده‌ها تا «پرینتر / کپی» و «پرینتر/کپی»
// و «Printer / Copy» همگی یک کلید بدهند.
const normalizeTitle = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[‌‏‎]/g, ' ')
    .replace(/[ي]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[/\-_.,()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const ALIAS_LOOKUP = Object.entries(CATEGORY_ALIASES).reduce((acc, [id, aliases]) => {
  aliases.forEach((alias) => {
    acc[normalizeTitle(alias)] = id;
  });
  return acc;
}, {});

// دسته‌ی API (یا هر آبجکت {id, title}) را به id مسیر سیستماتیک تبدیل می‌کند؛
// اگر مسیری برای آن تعریف نشده باشد null برمی‌گرداند تا صفحه رفتار قبلی
// (زیر‌دسته / Steps) را برای آن دسته حفظ کند.
export const resolveSystematicCategoryId = (category) => {
  if (!category) return null;

  // ۱) id دقیقاً یکی از کلیدهای مسیرهاست (مثلاً وقتی از SYSTEMATIC_CATEGORIES
  //    محلی می‌آید و نه از API).
  const rawId = category.id;
  if (rawId && (SYSTEMATIC_FLOWS[rawId] || rawId === 'user_account')) return rawId;

  // ۲) id یا عنوان با یکی از alias‌ها می‌خواند (id عددی API از اینجا رد می‌شود
  //    و با عنوان تطبیق داده می‌شود).
  return (
    ALIAS_LOOKUP[normalizeTitle(rawId)] ||
    ALIAS_LOOKUP[normalizeTitle(category.title)] ||
    null
  );
};
