/**
 * صفحه‌ی نقشه فقط یک *انتخابگر* است.
 *
 * قبلاً همین فایل خودش آدرس را ثبت می‌کرد و مختصات را روی هر جابه‌جاییِ نقشه
 * در Redux می‌نوشت. این تست سه قاعده‌ی نسخه‌ی فعلی را قفل می‌کند:
 *   • تا وقتی کاربر تایید نکرده، هیچ مختصاتی در Redux نمی‌نشیند.
 *   • فیلدهای خالیِ فرم از آدرسِ ژئوکدشده پر می‌شوند.
 *   • متنی که کاربر خودش نوشته بازنویسی نمی‌شود.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import addressReducer, { setAddressFields } from '@slices/addressSlice';
import Map from '../Map';

let confirmProps = null;

jest.mock('../NeshanMap', () => {
  const React = require('react');
  return function NeshanMapMock(props) {
    confirmProps = props;
    return React.createElement('View', null);
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'fa' } }),
}));

jest.mock('@slices/radiusSlice', () => ({
  __esModule: true,
  fetchRadii: () => ({ type: 'radius/noop' }),
  default: (state = { data: [] }) => state,
}));

const PICKED = {
  latitude: 35.7,
  longitude: 51.4,
  resolved: { formatted: 'تهران، ونک، خیابان گاندی', city: 'تهران', region: '3', number: '8' },
};

const makeStore = () =>
  configureStore({
    reducer: {
      address: addressReducer,
      auth: (state = { token: 'tok' }) => state,
      radius: (state = { data: [] }) => state,
    },
  });

const renderMap = async (store, navigation) => {
  await act(async () => {
    TestRenderer.create(
      <Provider store={store}>
        <Map navigation={navigation} />
      </Provider>
    );
  });
};

describe('Map picker', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn(), canGoBack: () => true };

  beforeEach(() => {
    confirmProps = null;
    jest.clearAllMocks();
  });

  it('تا قبل از تایید چیزی در Redux نمی‌نویسد', async () => {
    const store = makeStore();
    await renderMap(store, navigation);

    expect(store.getState().address.latitude).toBeNull();
    expect(store.getState().address.longitude).toBeNull();
  });

  it('با تایید، مختصات و فیلدهای خالی را پر می‌کند و برمی‌گردد', async () => {
    const store = makeStore();
    await renderMap(store, navigation);

    await act(async () => {
      confirmProps.onConfirm(PICKED);
    });

    const address = store.getState().address;
    expect(address.latitude).toBe(35.7);
    expect(address.longitude).toBe(51.4);
    expect(address.address).toBe('تهران، ونک، خیابان گاندی');
    expect(address.region).toBe('3');
    expect(address.number).toBe('8');
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('نوشته‌ی کاربر را بازنویسی نمی‌کند', async () => {
    const store = makeStore();
    store.dispatch(setAddressFields({ address: 'خودم نوشتم: کوچه‌ی سوم، زنگ دوم', region: '5' }));

    await renderMap(store, navigation);
    await act(async () => {
      confirmProps.onConfirm(PICKED);
    });

    const address = store.getState().address;
    expect(address.address).toBe('خودم نوشتم: کوچه‌ی سوم، زنگ دوم');
    expect(address.region).toBe('5');
    expect(address.latitude).toBe(35.7);
  });

  it('متنی که خودش از نقشه آمده بود جای تازه می‌دهد', async () => {
    const store = makeStore();
    await renderMap(store, navigation);

    await act(async () => {
      confirmProps.onConfirm(PICKED);
    });
    await act(async () => {
      confirmProps.onConfirm({
        latitude: 35.8,
        longitude: 51.5,
        resolved: { formatted: 'تهران، سعادت‌آباد' },
      });
    });

    expect(store.getState().address.address).toBe('تهران، سعادت‌آباد');
  });

  it('نقشه روی نقطه‌ی قبلی باز می‌شود', async () => {
    const store = makeStore();
    store.dispatch(setAddressFields({ latitude: 35.1, longitude: 51.1 }));

    await renderMap(store, navigation);

    expect(confirmProps.initialCoords).toEqual({ latitude: 35.1, longitude: 51.1 });
  });
});
