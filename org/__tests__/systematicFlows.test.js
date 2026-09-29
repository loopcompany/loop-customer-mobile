/**
 * قفلِ تغییرات «انتخاب سیستماتیک» از لیست ادیت‌های ۱۴۰۵/۰۷/۰۳ - تا اگر کسی
 * بعداً مرحله‌ای را عوض کرد، خواسته‌های کارفرما بی‌صدا برنگردند.
 */
import { getFlow } from '../systematicFlows';

const step = (categoryId, stepId) => getFlow(categoryId).find((s) => s.id === stepId);
const titles = (options) => options.map((o) => o.title);

describe('systematic flows — 1405/07/03 edits', () => {
  it('کیس مرحله‌ی برند/لوگو ندارد', () => {
    expect(step('case', 'brand')).toBeUndefined();
    expect(getFlow('case')[0].id).toBe('model');
  });

  it('مدل کیس پنج نوع کاربری دارد', () => {
    const model = step('case', 'model');
    expect(model.type).toBe('options');
    expect(model.required).toBe(true);
    expect(titles(model.options)).toEqual([
      'کیس اداری',
      'کیس خانگی',
      'کیس گیمینگ',
      'کیس حرفه‌ای / ورک استیشن',
      'کیس سروری',
    ]);
  });

  it('مشخصات کیس (CPU / RAM / گرافیک ...) اختیاری است', () => {
    const specs = step('case', 'specs');
    expect(specs.type).toBe('fields');
    expect(specs.required).toBeFalsy();
    expect(specs.fields.map((f) => f.id)).toEqual(expect.arrayContaining(['cpu', 'ram', 'gpu']));
  });

  it('مدل آل این وان چهار نوع کاربری دارد', () => {
    expect(titles(step('all_in_one', 'model').options)).toEqual([
      'آل‌این‌وان اداری',
      'آل‌این‌وان خانگی',
      'آل‌این‌وان حرفه‌ای',
      'آل‌این‌وان گیمینگ',
    ]);
  });

  it.each(['printer_copy', 'all_in_one', 'case', 'laptop', 'hard_disk', 'monitor'])(
    'وضعیت %s: نو/آکبند، کارکرده، گارانتی و عکس از گالری و دوربین',
    (categoryId) => {
      const status = step(categoryId, 'device_status');
      expect(status).toBeDefined();
      expect(status.type).toBe('options');
      expect(titles(status.options)).toEqual(['نو / آکبند', 'کارکرده']);
      expect(titles(status.extra.options)).toEqual(['دارای گارانتی', 'عدم گارانتی', 'نامشخص']);
      expect(status.photo).toBe(true);
    }
  );

  it('کپی صنعتی زیر «پرینتر / کپی» است و همان مرحله‌ی وضعیت را دارد', () => {
    const types = step('printer_copy', 'device_type').options.map((o) => o.id);
    expect(types).toContain('industrial_copier');
  });

  it('زیر ابعاد مانیتور و ظرفیت هارد کادر مقدار دقیق هست', () => {
    const size = step('monitor', 'size');
    expect(size.note).toBe(true);
    expect(size.noteSatisfies).toBe(true);
    expect(size.notePlaceholder).toContain('اینچ دقیق');

    const capacity = step('hard_disk', 'capacity');
    expect(capacity.note).toBe(true);
    expect(capacity.notePlaceholder).toContain('حجم هارد');
  });
});

describe('brand logos & OS list — 1405/07/03 assets', () => {
  const { OS_ITEMS } = require('../deviceCatalog');
  const brandsOf = (categoryId) => step(categoryId, 'brand').brands;

  it('۹ سیستم عامل، از جمله ویندوز 11 اورجینال', () => {
    expect(OS_ITEMS).toHaveLength(9);
    expect(OS_ITEMS.map((o) => o.id)).toEqual(expect.arrayContaining(['win11_original', 'win11']));
    OS_ITEMS.forEach((os) => expect(os.image).toBeTruthy());
  });

  it('همه‌ی برندهای ارسالی لپ تاپ با لوگو هستند (به‌جز HTC که لوگو نداشت)', () => {
    const brands = brandsOf('laptop');
    expect(brands).toHaveLength(43);
    expect(brands.filter((b) => !b.image).map((b) => b.title)).toEqual(['HTC']);
  });

  it('برندهای آل این وان همان لیست ارسالی است', () => {
    const titles = brandsOf('all_in_one').map((b) => b.title);
    expect(titles).toHaveLength(20);
    expect(titles).not.toContain('TSCO');
    expect(titles).toEqual(expect.arrayContaining(['Maya', 'NEXT', 'Microsoft Surface', 'Univo']));
  });

  it('برندهای پرینتر و هارد کامل و بدون تکرار هستند', () => {
    ['printer_copy', 'hard_disk', 'laptop', 'all_in_one', 'monitor'].forEach((categoryId) => {
      const ids = brandsOf(categoryId).map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
    expect(brandsOf('printer_copy')).toHaveLength(19);
    expect(brandsOf('hard_disk')).toHaveLength(67);
  });
});

describe('پیش‌فرض‌ها — «پیش فرض ها.pdf»', () => {
  const { getVisibleFlow } = require('../systematicFlows');
  const { receiptFromSystematic } = require('@services/receipt');
  const opts = (categoryId, stepId) => step(categoryId, stepId).options.map((o) => o.title);

  it('لپ تاپ: ۱۷ نرم‌افزاری و ۱۶ سخت‌افزاری، به ترتیب فایل', () => {
    const sw = opts('laptop', 'software_default');
    const hw = opts('laptop', 'hardware_default');
    expect(sw).toHaveLength(17);
    expect(hw).toHaveLength(16);
    expect([sw[0], sw[16]]).toEqual(['پیغام صفحه آبی', 'سرعت ویندوز کند شده']);
    expect([hw[0], hw[15]]).toEqual(['لپتاپ دیر شارژ میشود', 'وای فای روشن نمیشود']);
    expect(step('laptop', 'software_default').title).toBe('نرم افزار (پیش فرض)');
    expect(step('laptop', 'hardware_default').title).toBe('سخت افزار (پیش فرض)');
    // پیش‌فرض‌های قدیمی حذف شده‌اند
    expect(sw).not.toContain('آنتی ویروس، بروزرسانی یا آپدیت نمی‌شود');
  });

  it('کیس: فقط سخت‌افزاری، ۱۵ مورد', () => {
    expect(step('case', 'software_default')).toBeUndefined();
    const hw = opts('case', 'hardware_default');
    expect(hw).toHaveLength(15);
    expect([hw[0], hw[14]]).toEqual(['دمای پردازنده بیش از حد بالا میرود', 'پیام پر شدن فضای هارد']);
  });

  it('هارد: ۱۵ نرم‌افزاری و ۱۱ سخت‌افزاری', () => {
    const sw = opts('hard_disk', 'software_default');
    const hw = opts('hard_disk', 'hardware_default');
    expect(sw).toHaveLength(15);
    expect(hw).toHaveLength(11);
    expect(sw).toContain('هارد به صورت Read Only نمایش داده میشود');
    expect(hw[hw.length - 1]).toBe('سلامت هارد در حال کاهش است');
  });

  it('پرینتر ۱۶ + ۱۶ و دستگاه کپی ۱۵ مورد', () => {
    expect(opts('printer_copy', 'software_default')).toHaveLength(16);
    expect(opts('printer_copy', 'hardware_default')).toHaveLength(16);
    expect(opts('printer_copy', 'copier_default')).toHaveLength(15);
  });

  it('با «کپی صنعتی» فقط ایرادهای دستگاه کپی دیده می‌شود، وگرنه فقط پرینتر', () => {
    const ids = (answers) => getVisibleFlow('printer_copy', answers).map((s) => s.id);
    expect(ids({})).toEqual(expect.arrayContaining(['software_default', 'hardware_default']));
    expect(ids({})).not.toContain('copier_default');
    expect(ids({ device_type: { selected: 'laser_multi' } })).not.toContain('copier_default');

    const copier = ids({ device_type: { selected: 'industrial_copier' } });
    expect(copier).toContain('copier_default');
    expect(copier).not.toContain('software_default');
    expect(copier).not.toContain('hardware_default');
  });

  it('پاسخِ مرحله‌ی پنهان وارد رسید نمی‌شود', () => {
    const receipt = receiptFromSystematic({
      categoryId: 'printer_copy',
      answers: {
        device_type: { selected: 'industrial_copier' },
        // کاربر اول پرینتر را انتخاب کرده بود و بعد نوع را عوض کرد
        software_default: { selected: ['printer_sw_1'] },
        copier_default: { selected: ['copier_4'] },
      },
    });
    const description = receipt.services[0].description;
    expect(description).toContain('پودر تونر میریزد');
    expect(description).not.toContain('نشان دادن وضعیت آفلاین پرینتر');
  });

  it('همه‌ی گزینه‌ها ترجمه‌ی انگلیسی دارند', () => {
    const i18n = require('@i18n').default || require('@i18n');
    const { LO } = require('../orgI18n');
    const previous = i18n.language;
    i18n.language = 'en';
    try {
      [
        ['laptop', 'software_default'], ['laptop', 'hardware_default'], ['case', 'hardware_default'],
        ['printer_copy', 'software_default'], ['printer_copy', 'hardware_default'],
        ['printer_copy', 'copier_default'], ['hard_disk', 'software_default'], ['hard_disk', 'hardware_default'],
      ].forEach(([c, s]) => {
        LO(step(c, s).options).forEach((o) => expect(o.title).toMatch(/^[\x20-\x7E]+$/));
      });
    } finally {
      i18n.language = previous;
    }
  });
});
