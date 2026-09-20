/**
 * قواعدِ فرمِ آدرس. سه چیز را قفل می‌کند:
 *
 * - شماره‌ی موبایل هر شکلی که وارد شود به یک صورتِ استاندارد درمی‌آید. باگِ
 *   قبلی: فرم `'0' + text` ذخیره می‌کرد و برای نمایش یک صفر برمی‌داشت، پس با
 *   هر حرفِ تایپ‌شده یک صفرِ اضافه ته‌نشین می‌شد.
 * - تلفن ثابتِ خالی «۰۲۱»ِ تنها ذخیره نمی‌کند (آن عدد بعداً روی رسید چاپ می‌شد).
 * - هر فیلدِ خراب پیامِ خودش را دارد، نه یک پیامِ کلی برای کلِ فرم.
 */
import {
  buildAddressPayload,
  composeLandline,
  firstErrorField,
  localLandline,
  mapFillPatch,
  normalizeMobile,
  serverFieldErrors,
  submitErrorMessage,
  validateAddressForm,
} from '../addressForm';

const t = (key) => key;

const validAddress = {
  title: 'منزل',
  fname: 'مهرداد',
  lname: 'تقی‌زاده',
  mobile: '09121234567',
  telephone: '02188776655',
  city: 'تهران',
  region: '6',
  number: '12',
  unit: '3',
  floor: '2',
  address: 'خیابان ولیعصر، کوچه‌ی دوم، پلاک ۱۲',
  latitude: 35.7,
  longitude: 51.4,
  locationPicked: true,
};

describe('normalizeMobile', () => {
  it.each([
    ['09121234567', '09121234567'],
    ['9121234567', '09121234567'],
    ['+989121234567', '09121234567'],
    ['00989121234567', '09121234567'],
    ['۰۹۱۲۱۲۳۴۵۶۷', '09121234567'],
    ['0912 123 4567', '09121234567'],
    ['', ''],
  ])('%s → %s', (input, expected) => {
    expect(normalizeMobile(input)).toBe(expected);
  });

  it('روی مقدارِ قبلاً نرمال‌شده تغییری نمی‌دهد', () => {
    expect(normalizeMobile(normalizeMobile('9121234567'))).toBe('09121234567');
  });
});

describe('تلفن ثابت', () => {
  it('ورودیِ خالی پیش‌شماره‌ی تنها نمی‌سازد', () => {
    expect(composeLandline('')).toBe('');
    expect(composeLandline('   ')).toBe('');
  });

  it('پیش‌شماره را یک‌بار می‌چسباند و بازمی‌گرداند', () => {
    expect(composeLandline('88776655')).toBe('02188776655');
    expect(localLandline('02188776655')).toBe('88776655');
    expect(localLandline('')).toBe('');
  });

  it('ارقامِ فارسی را می‌پذیرد', () => {
    expect(composeLandline('۸۸۷۷۶۶۵۵')).toBe('02188776655');
  });
});

describe('validateAddressForm', () => {
  it('فرمِ کامل خطا ندارد', () => {
    expect(validateAddressForm(validAddress, t)).toEqual({});
  });

  it('بدونِ مختصات، خطای موقعیت می‌دهد', () => {
    const errors = validateAddressForm({ ...validAddress, latitude: null, longitude: null }, t);
    expect(errors.location).toBeTruthy();
    expect(firstErrorField(errors)).toBe('location');
  });

  it('مختصاتِ بدونِ انتخابِ کاربر قبول نیست', () => {
    // نقشه‌ی داخلِ فرم همیشه یک مرکز دارد؛ مرکزِ پیش‌فرض «موقعیتِ انتخاب‌شده» نیست.
    const errors = validateAddressForm({ ...validAddress, locationPicked: false }, t);
    expect(errors.location).toBeTruthy();
  });

  it('منطقه فقط ۱ تا ۲۲', () => {
    expect(validateAddressForm({ ...validAddress, region: '23' }, t).region).toBeTruthy();
    expect(validateAddressForm({ ...validAddress, region: '0' }, t).region).toBeTruthy();
    expect(validateAddressForm({ ...validAddress, region: '' }, t).region).toBeTruthy();
    expect(validateAddressForm({ ...validAddress, region: '۲۲' }, t).region).toBeUndefined();
  });

  it('تلفن ثابتِ ناقص رد می‌شود', () => {
    expect(validateAddressForm({ ...validAddress, telephone: '0218877' }, t).telephone).toBeTruthy();
    expect(validateAddressForm({ ...validAddress, telephone: '' }, t).telephone).toBeTruthy();
  });

  it('موبایلِ نامعتبر رد می‌شود', () => {
    expect(validateAddressForm({ ...validAddress, mobile: '0212345678' }, t).mobile).toBeTruthy();
    expect(validateAddressForm({ ...validAddress, mobile: '' }, t).mobile).toBeTruthy();
  });

  it('آدرسِ خیلی کوتاه رد می‌شود', () => {
    expect(validateAddressForm({ ...validAddress, address: 'تهران' }, t).address).toBeTruthy();
  });

  it('هر فیلدِ خالی پیامِ خودش را دارد', () => {
    const errors = validateAddressForm({ latitude: 1, longitude: 1, locationPicked: true }, t);
    ['title', 'fname', 'lname', 'mobile', 'telephone', 'region', 'number', 'unit', 'floor', 'address'].forEach(
      (field) => expect(errors[field]).toBeTruthy()
    );
    expect(errors.location).toBeUndefined();
  });

  it('اولین خطا به ترتیبِ چیدمانِ فرم برمی‌گردد', () => {
    const errors = validateAddressForm({ ...validAddress, fname: '', address: '' }, t);
    expect(firstErrorField(errors)).toBe('fname');
  });
});

describe('buildAddressPayload', () => {
  it('فقط فیلدهای آدرس را می‌فرستد', () => {
    const payload = buildAddressPayload({
      ...validAddress,
      data: [{ id: 1 }],
      loading: false,
      error: '',
    });
    expect(Object.keys(payload).sort()).toEqual(
      [
        'address',
        'city',
        'floor',
        'fname',
        'latitude',
        'lname',
        'longitude',
        'mobile',
        'number',
        'region',
        'telephone',
        'title',
        'unit',
      ].sort()
    );
  });

  it('ارقامِ فارسی را لاتین می‌کند و مقدارِ خالی را حذف', () => {
    const payload = buildAddressPayload({
      ...validAddress,
      region: '۶',
      unit: '۱۲',
      mobile: '۰۹۱۲۱۲۳۴۵۶۷',
      telephone: '',
    });
    expect(payload.region).toBe('6');
    expect(payload.unit).toBe('12');
    expect(payload.mobile).toBe('09121234567');
    expect(payload.telephone).toBeUndefined();
  });
});

describe('mapFillPatch', () => {
  const resolved = {
    formatted: 'تهران، ونک، خیابان گاندی',
    city: 'تهران',
    region: '3',
    number: '8',
  };

  it('فیلدهای خالی را پر می‌کند', () => {
    expect(mapFillPatch({}, resolved)).toEqual({
      address: 'تهران، ونک، خیابان گاندی',
      addressFromMap: 'تهران، ونک، خیابان گاندی',
      city: 'تهران',
      region: '3',
      number: '8',
    });
  });

  it('نوشته‌ی کاربر را بازنویسی نمی‌کند', () => {
    const patch = mapFillPatch({ address: 'خودم نوشتم', region: '5' }, resolved);
    expect(patch.address).toBeUndefined();
    expect(patch.region).toBeUndefined();
    expect(patch.city).toBe('تهران');
  });

  it('متنِ قبلیِ خودِ نقشه را تازه می‌کند', () => {
    const patch = mapFillPatch({ address: 'قدیمی', addressFromMap: 'قدیمی' }, resolved);
    expect(patch.address).toBe('تهران، ونک، خیابان گاندی');
  });

  it('بدونِ نتیجه، پچِ خالی', () => {
    expect(mapFillPatch({}, null)).toEqual({});
  });
});

describe('خطاهای سرور', () => {
  it('۴۲۲ لاراول را به نگاشتِ فیلد→پیام تبدیل می‌کند', () => {
    const error = {
      response: { status: 422, data: { errors: { region: ['منطقه معتبر نیست'], title: 'تکراری' } } },
    };
    expect(serverFieldErrors(error)).toEqual({ region: 'منطقه معتبر نیست', title: 'تکراری' });
    expect(submitErrorMessage(error, t)).toBe('منطقه معتبر نیست');
  });

  it('قطعِ شبکه با خطای سرور اشتباه نمی‌شود', () => {
    expect(submitErrorMessage({ message: 'Network Error' }, t)).toBe('Network error!');
    expect(submitErrorMessage({ code: 'ECONNABORTED' }, t)).toBe('Request timed out.');
    expect(submitErrorMessage({ response: { status: 500, data: {} } }, t)).toBe(
      'Server error, please try again later.'
    );
    expect(submitErrorMessage({ response: { status: 401, data: {} } }, t)).toBe(
      'Unauthorized access!'
    );
  });

  it('پاسخِ بدونِ errors چیزی برنمی‌گرداند', () => {
    expect(serverFieldErrors({ response: { data: { message: 'x' } } })).toEqual({});
  });
});
