/**
 * چیزی که مسیرهای سازمانی واقعاً به `/orders/submit` می‌فرستند.
 *
 * این صفحه تا پیش از این همیشه `total_price: 0` و `steps: []` می‌فرستاد، چون
 * فرمِ محلیِ «انتخاب سیستماتیک»/«انتخاب جامع» هیچ نرخی ندارد و هیچ‌کدام از
 * صفحه‌های مبدا پارامتر `price` را پاس نمی‌دادند. حالا نرخ‌ها از
 * `/steps/fetch` می‌آیند؛ این تست بدنه‌ی واقعیِ درخواست را می‌بیند، نه یک
 * تابع کمکی را — همان جایی که باگ زندگی می‌کرد.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureStore } from '@reduxjs/toolkit';

import OrderSummaryScreen from '../OrderSummaryScreen';
import apiClient from '@services/axiosConfig';
import { fetchCategorySteps } from '@services/StepsApi';

jest.mock('@services/StepsApi', () => ({ fetchCategorySteps: jest.fn() }));

jest.mock('@services/axiosConfig', () => ({
  __esModule: true,
  default: { post: jest.fn(), get: jest.fn(), interceptors: { request: {}, response: {} } },
}));

jest.mock('@services/NotificationService', () => ({
  notificationAPI: { sendOrderConfirmation: jest.fn().mockResolvedValue({}) },
}));

jest.mock('@hooks/useReceiptSources', () => ({
  __esModule: true,
  default: () => ({
    user: { id: 1, fname: 'سارا', lname: 'م', account_type: 'organization' },
    orgProfile: null,
    profile: null,
    addresses: [{ id: 7, address: 'تهران', city: 'تهران', mobile: '09120000000' }],
    selectedAddressId: 7,
  }),
}));

const mockCodeHook = { needsCheck: false, appliedCode: null, reject: jest.fn() };
jest.mock('@hooks/usePromoCode', () => ({ __esModule: true, default: () => mockCodeHook }));
jest.mock('@hooks/useReferralCode', () => ({ __esModule: true, default: () => mockCodeHook }));

// نوار وضعیت به stateِ ناوبری نیاز دارد و این تست ناوبر واقعی ندارد؛ فاصله‌ی
// زیر صفحه هم از MenuContext می‌آید که در اپ کلِ ناوبر را می‌پوشاند.
jest.mock('@components/CustomStatusBar', () => () => null);
jest.mock('@contexts/MenuContext', () => ({
  ...jest.requireActual('@contexts/MenuContext'),
  useMenu: () => ({ footerSpace: 0 }),
}));

// این بخش فقط دو هوکِ بالا را نشان می‌دهد و ربطی به مبلغ ندارد.
jest.mock('@components/OrderCodesSection', () => () => null);

jest.mock('@helpers/Common', () => ({
  ...jest.requireActual('@helpers/Common'),
  showToastOrAlert: jest.fn(),
}));

const detail = (over) => ({
  price: 100000,
  show_price: 1,
  affect_on_price: 1,
  value: 0,
  type: 'radioButton',
  ...over,
});

const API_STEPS = [
  [
    {
      id: 10,
      title: 'نصب سیستم عامل',
      type: 'radioButton',
      field_details: [
        detail({ id: 101, title: 'ویندوز 11', price: 200000 }),
        detail({ id: 102, title: 'ویندوز 10', price: 150000 }),
      ],
    },
  ],
  [
    {
      id: 11,
      title: 'خدمات سخت‌افزاری',
      type: 'counter',
      field_details: [detail({ id: 103, title: 'لپ تاپ', price: 100000, type: 'counter' })],
    },
  ],
];

const SUMMARY_LINES = [
  { label: 'نصب سیستم عامل', value: 'ویندوز 11' },
  { label: 'لپ تاپ', value: 2 },
  { label: 'تاریخ مراجعه', value: 'شنبه' },
];

const makeStore = () =>
  configureStore({
    reducer: {
      auth: (s = { token: 'tok', userType: 'organization' }) => s,
      user: (s = { data: { id: 1 } }) => s,
      address: (s = { data: [] }) => s,
      organization: (s = { profileData: null }) => s,
      step: (s = { addressId: 7 }) => s,
    },
  });

const navigation = { replace: jest.fn(), goBack: jest.fn(), navigate: jest.fn() };

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const renderScreen = async (params) => {
  let tree;
  await act(async () => {
    tree = TestRenderer.create(
      // عنوان صفحه insets می‌خواهد؛ در اپ، App.js این provider را دارد.
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <Provider store={makeStore()}>
          <OrderSummaryScreen navigation={navigation} route={{ params }} />
        </Provider>
      </SafeAreaProvider>
    );
  });
  return tree;
};

/** دکمه‌ی «ثبت نهایی سفارش» را پیدا و فشار می‌دهد. */
const submit = async (tree) => {
  const button = tree.root
    .findAll((node) => typeof node.props?.onPress === 'function' && node.props?.disabled === false)
    .pop();
  await act(async () => {
    await button.props.onPress();
  });
};

const textsOf = (tree) =>
  tree.root
    .findAllByType('Text')
    .map((n) => n.children.filter((c) => typeof c === 'string').join(''))
    .filter(Boolean);

const baseParams = {
  source: 'systematic',
  categoryId: 4,
  orderTitle: 'انتخاب سیستماتیک - لپ تاپ',
  summaryLines: SUMMARY_LINES,
  schedule: { date: '1404/07/03', slot: 'slot_10_12' },
};

beforeEach(() => {
  jest.clearAllMocks();
  apiClient.post.mockResolvedValue({
    status: 200,
    data: { success: true, data: { order_id: 55 } },
  });
});

describe('OrderSummaryScreen — مبلغ سفارش سازمانی', () => {
  it('مبلغ را از نرخ‌های همان دسته می‌فرستد، نه صفر', async () => {
    fetchCategorySteps.mockResolvedValue(API_STEPS);

    const tree = await renderScreen(baseParams);
    await submit(tree);

    expect(fetchCategorySteps).toHaveBeenCalledWith(4);
    const [, payload] = apiClient.post.mock.calls[0];
    // ۲۰۰٬۰۰۰ (ویندوز ۱۱) + ۲ × ۱۰۰٬۰۰۰ (لپ تاپ)
    expect(payload.total_price).toBe(400000);
    expect(payload.category_id).toBe(4);
    expect(payload.address_id).toBe(7);
  });

  it('انتخاب‌ها را هم می‌فرستد تا سفارش `order_details` داشته باشد', async () => {
    fetchCategorySteps.mockResolvedValue(API_STEPS);

    const tree = await renderScreen(baseParams);
    await submit(tree);

    const [, payload] = apiClient.post.mock.calls[0];
    const details = payload.steps.flat().flatMap((field) => field.field_details);
    expect(details.find((d) => d.id === 101).value).toBe(1); // ویندوز ۱۱ انتخاب شده
    expect(details.find((d) => d.id === 102).value).toBe(0); // ویندوز ۱۰ نه
    expect(details.find((d) => d.id === 103).value).toBe(2); // دو لپ تاپ
  });

  it('مبلغ را پیش از ثبت به کاربر نشان می‌دهد', async () => {
    fetchCategorySteps.mockResolvedValue(API_STEPS);

    const tree = await renderScreen(baseParams);

    expect(textsOf(tree).some((text) => text.includes('400,000') || text.includes('۴۰۰٬۰۰۰'))).toBe(
      true
    );
  });

  it('وقتی نرخی پیدا نشود، سفارش استعلامی می‌ماند', async () => {
    // دسته‌ای که مراحلش با فرمِ محلی هم‌نام نیست - هیچ گزینه‌ای نمی‌خورد.
    fetchCategorySteps.mockResolvedValue([
      [
        {
          id: 20,
          title: 'چیز دیگری',
          type: 'radioButton',
          field_details: [detail({ id: 201, title: 'گزینه‌ی نامربوط', price: 999000 })],
        },
      ],
    ]);

    const tree = await renderScreen(baseParams);
    await submit(tree);

    const [, payload] = apiClient.post.mock.calls[0];
    expect(payload.total_price).toBe(0);
    expect(payload.steps).toEqual([]);
    expect(textsOf(tree)).toContain('پس از بررسی کارشناس اعلام می‌شود');
  });

  it('تا نرخ‌ها نرسیده‌اند، ثبت انجام نمی‌شود', async () => {
    // وگرنه کاربری که سریع دکمه را می‌زند، سفارشش با مبلغ صفر ثبت می‌شد.
    fetchCategorySteps.mockReturnValue(new Promise(() => {}));

    const tree = await renderScreen(baseParams);
    await submit(tree);

    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('خطای دریافت نرخ جلوی ثبت سفارش را نمی‌گیرد', async () => {
    fetchCategorySteps.mockRejectedValue(new Error('Network Error'));

    const tree = await renderScreen(baseParams);
    await submit(tree);

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(apiClient.post.mock.calls[0][1].total_price).toBe(0);
  });
});
