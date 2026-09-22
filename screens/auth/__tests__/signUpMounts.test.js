/**
 * صفحه‌ی «ثبت نام» (MainSignIn) کاملاً سفید بالا می‌آمد: داخل بدنه‌ی کامپوننت،
 * `const styles = useMemo(() => createLocalStyles(NewStyles, isRtl), [NewStyles, isRtl])`
 * یک خط *بالاتر* از `const isRtl = langIsRTL(...)` نوشته شده بود. آرایه‌ی
 * وابستگی‌ها همان‌جا ارزیابی می‌شود، پس رندر با ReferenceError (TDZ) می‌ترکید —
 * هم در وب و هم در اپ.
 *
 * دو نکته درباره‌ی این تست:
 *
 * ۱. ESLint این را نمی‌گیرد؛ `no-use-before-define` در این ریپو ۶۶۲ تخلف دارد
 *    (الگوی بی‌خطرِ `const styles = StyleSheet.create(...)` در انتهای فایل)، پس
 *    روشن کردنش گیتِ «صفر error» را بی‌معنا می‌کند.
 * ۲. صرفِ «رندر شد» هم کافی نیست: پریست jest-expo قدیمی‌تر کامپایل می‌کند و
 *    `const` را به `var` تبدیل می‌کند، پس TDZ از بین می‌رود و `isRtl` فقط
 *    undefined می‌شود — باندل وب/نیتیو اما `const` را نگه می‌دارد و می‌ترکد.
 *    برای همین تست علاوه بر mount، استایلی را می‌سنجد که *از* `isRtl` ساخته
 *    شده؛ با ترتیب غلط، آن استایل LTR درمی‌آید و تست می‌افتد.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'fa' } }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));
jest.mock('react-redux', () => ({
  useSelector: () => undefined,
  useDispatch: () => jest.fn(),
}));
jest.mock('@services/Api', () => ({ authAPI: { register: jest.fn() } }));
// CustomStatusBar روی useNavigationState سوار است و FooterSpacer روی
// MenuProvider؛ هر دو در اپ واقعی بالادست فراهم‌اند و موضوع این تست نیستند.
jest.mock('@components/CustomStatusBar', () => () => null);
jest.mock('@components/FooterSpacer', () => () => null);

const MainSignIn = require('@screens/auth/MainSignIn').default;

const walk = (node, fn) => {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) return node.forEach((n) => walk(n, fn));
  fn(node);
  (node.children || []).forEach((c) => walk(c, fn));
};

const flatStyle = (node) => {
  const style = node.props?.style;
  if (!style) return {};
  return Array.isArray(style)
    ? Object.assign({}, ...style.flat(Infinity).filter((s) => s && typeof s === 'object'))
    : style;
};

describe('صفحه‌ی ثبت نام', () => {
  it('بدون خطا رندر می‌شود و استایل‌های وابسته به isRtl درست ساخته می‌شوند', async () => {
    let tree;
    act(() => {
      tree = renderer.create(
        <MainSignIn navigation={{ navigate: jest.fn(), goBack: jest.fn() }} />
      );
    });
    expect(tree.toJSON()).toBeTruthy();

    // فرم خالی را submit می‌کنیم تا متن‌های خطا (که استایلشان از
    // createLocalStyles(NewStyles, isRtl) می‌آید) رندر شوند. validateForm قبل
    // از هر درخواست شبکه‌ای برمی‌گردد، پس چیزی صدا زده نمی‌شود.
    const submit = tree.root.findAll(
      (n) => typeof n.type !== 'string' && n.props?.onPress && n.props?.title === 'Sign up'
    )[0];
    expect(submit).toBeTruthy();
    await act(async () => {
      await submit.props.onPress();
    });

    // styles.fieldErrorText تنها استایلی است که هم از createLocalStyles می‌آید و
    // هم روی نودی نشسته که چیز دیگری رویش override نمی‌کند (fontSize 12، قرمز).
    const fieldErrors = [];
    walk(tree.toJSON(), (n) => {
      const s = flatStyle(n);
      if (s.color === '#ff4444' && s.fontSize === 12) fieldErrors.push(s);
    });

    expect(fieldErrors.length).toBeGreaterThan(0);
    // زبان fa است، پس استایلِ ساخته‌شده از isRtl باید rtl/right باشد؛ با ترتیبِ
    // غلطِ تعریف، isRtl برابر undefined می‌شد و اینجا ltr/left درمی‌آمد.
    fieldErrors.forEach((s) => {
      expect(s.writingDirection).toBe('rtl');
      expect(s.textAlign).toBe('right');
    });

    act(() => tree.unmount());
  });
});
