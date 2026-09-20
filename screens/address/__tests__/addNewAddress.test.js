/**
 * رندرِ واقعیِ فرمِ «افزودن آدرس» + دو رفتاری که به‌سادگی برمی‌گردند:
 *
 *  - ثبتِ فرمِ ناقص نباید هیچ درخواستی بفرستد و باید خطای *همان* فیلد را نشان
 *    دهد (نه یک پیامِ کلی).
 *  - بدنه‌ی درخواست باید نرمال‌شده باشد و فقط فیلدهای آدرس را داشته باشد؛
 *    نسخه‌ی قبلی کلِ اسلایس را می‌فرستاد (به‌همراه فهرستِ آدرس‌ها).
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { addressAPI } from '@services/Api';
import addressReducer, { setAddressFields } from '@slices/addressSlice';
import AddNewAddress from '../AddNewAddress';

jest.mock('@services/Api', () => ({ addressAPI: { create: jest.fn() } }));

// نقشه‌ی واقعی (WebView/لِفلِت) در تستِ فرم نقشی ندارد؛ رفتارِ خودش در
// locationSection.test.js تست می‌شود.
jest.mock('@components/NeshanCanvas', () => {
  const React = require('react');
  return React.forwardRef(function NeshanCanvasMock(props, ref) {
    React.useImperativeHandle(ref, () => ({ flyTo: jest.fn() }));
    return React.createElement('View', { testID: 'neshan-canvas' });
  });
});

jest.mock('@helpers/Common', () => ({
  ...jest.requireActual('@helpers/Common'),
  showToastOrAlert: jest.fn(),
}));

// ترجمه در تست = خودِ کلید، تا بشود روی پیام‌ها assert زد.
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'fa' } }),
}));

jest.mock('@contexts/MenuContext', () => ({
  ...jest.requireActual('@contexts/MenuContext'),
  useMenu: () => ({ footerSpace: 0 }),
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), canGoBack: () => false }),
}));

// این دو thunk واقعاً به شبکه می‌زنند؛ اینجا فقط باید dispatch شوند.
jest.mock('@slices/radiusSlice', () => ({
  __esModule: true,
  fetchRadii: () => ({ type: 'radius/noop' }),
  default: (state = { data: [] }) => state,
}));

jest.mock('@slices/addressSlice', () => {
  const actual = jest.requireActual('@slices/addressSlice');
  return { __esModule: true, ...actual, fetchAddresses: () => ({ type: 'address/fetch-noop' }) };
});

const VALID_FORM = {
  title: 'منزل',
  fname: 'مهرداد',
  lname: 'تقی‌زاده',
  mobile: '9121234567',
  telephone: '02188776655',
  city: 'تهران',
  region: '۶',
  number: '12',
  unit: '3',
  floor: '2',
  address: 'خیابان ولیعصر، کوچه‌ی دوم، پلاک ۱۲',
  latitude: 35.7,
  longitude: 51.4,
  locationPicked: true,
};

const makeStore = () =>
  configureStore({
    reducer: {
      address: addressReducer,
      auth: (state = { token: 'tok' }) => state,
      user: (state = { data: null }) => state,
      radius: (state = { data: [] }) => state,
    },
  });

const textsOf = (tree) =>
  tree.root
    .findAllByType('Text')
    .map((node) => node.children.filter((child) => typeof child === 'string').join(''))
    .filter(Boolean);

const renderForm = async (store, navigation) => {
  let tree;
  await act(async () => {
    tree = TestRenderer.create(
      <Provider store={store}>
        <AddNewAddress navigation={navigation} />
      </Provider>
    );
  });
  return tree;
};

const submitButton = (tree) =>
  tree.root.findAll(
    (node) => node.props?.title === 'Register Address' && typeof node.props?.onPress === 'function'
  )[0];

describe('AddNewAddress', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn(), canGoBack: () => true };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('فرم را با همه‌ی فیلدها رندر می‌کند', async () => {
    const tree = await renderForm(makeStore(), navigation);
    const texts = textsOf(tree);

    expect(texts).toEqual(
      expect.arrayContaining([
        'Address Title',
        'First Name',
        'Last Name',
        'Mobile Number',
        'Landline',
        'Region',
        'Number',
        'Unit',
        'Floor',
        'Full detailed address',
        'Register Address',
      ])
    );
    // نقشه بالای فرم است، نه یک کارت که به صفحه‌ی دیگری می‌برد.
    expect(tree.root.findAll((node) => node.props?.testID === 'neshan-canvas').length).toBe(1);
    expect(texts).toEqual(expect.arrayContaining(['Location on map', 'Not selected']));
  });

  it('فرمِ خالی را نمی‌فرستد و خطای هر فیلد را نشان می‌دهد', async () => {
    const tree = await renderForm(makeStore(), navigation);

    await act(async () => {
      submitButton(tree).props.onPress();
    });

    expect(addressAPI.create).not.toHaveBeenCalled();

    const texts = textsOf(tree);
    expect(texts).toEqual(
      expect.arrayContaining([
        'Please choose the location on the map.',
        'Address title is required.',
        'First name is required.',
        'Mobile number is required',
        'Full address is required.',
      ])
    );
  });

  it('فرمِ کامل را با بدنه‌ی نرمال‌شده می‌فرستد', async () => {
    const store = makeStore();
    addressAPI.create.mockResolvedValue({ success: true, message: 'ok' });

    const tree = await renderForm(store, navigation);
    await act(async () => {
      store.dispatch(setAddressFields(VALID_FORM));
    });

    await act(async () => {
      submitButton(tree).props.onPress();
    });

    expect(addressAPI.create).toHaveBeenCalledTimes(1);
    expect(addressAPI.create).toHaveBeenCalledWith({
      title: 'منزل',
      fname: 'مهرداد',
      lname: 'تقی‌زاده',
      // «۹۱۲…» ورودی بود؛ صفرِ ابتدایی و ارقامِ لاتین کارِ نرمال‌سازی است.
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
    });
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('خطای ۴۲۲ سرور را زیرِ همان فیلد می‌نشاند', async () => {
    const store = makeStore();
    addressAPI.create.mockRejectedValue({
      response: { status: 422, data: { errors: { region: ['منطقه معتبر نیست'] } } },
    });

    const tree = await renderForm(store, navigation);
    await act(async () => {
      store.dispatch(setAddressFields(VALID_FORM));
    });
    await act(async () => {
      submitButton(tree).props.onPress();
    });

    expect(textsOf(tree)).toEqual(expect.arrayContaining(['منطقه معتبر نیست']));
  });

  it('دکمه‌ی جست‌وجو انتخابگرِ تمام‌صفحه را باز می‌کند', async () => {
    const tree = await renderForm(makeStore(), navigation);
    const button = tree.root.findAll((node) => node.props?.testID === 'map-fullscreen')[0];
    await act(async () => {
      button.props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith('Map');
  });

  it('باز کردنِ نقشه اسکرولِ فرم را خاموش می‌کند', async () => {
    const tree = await renderForm(makeStore(), navigation);
    const scroll = () => tree.root.findAll((node) => node.props?.scrollEnabled !== undefined)[0];

    expect(scroll().props.scrollEnabled).toBe(true);

    const unlock = tree.root.findAll((node) => node.props?.testID === 'map-unlock')[0];
    await act(async () => {
      unlock.props.onPress();
    });

    expect(scroll().props.scrollEnabled).toBe(false);
  });
});
