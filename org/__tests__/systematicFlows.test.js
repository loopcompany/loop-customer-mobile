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
