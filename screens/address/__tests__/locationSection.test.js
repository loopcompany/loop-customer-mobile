/**
 * نقشه‌ی بالای فرمِ آدرس.
 *
 * مهم‌ترین قاعده‌ای که اینجا قفل می‌شود: *باز شدنِ نقشه انتخابِ موقعیت نیست.*
 * نقشه همیشه یک مرکز دارد، پس اگر مرکزِ اولیه به‌حسابِ انتخاب نوشته شود،
 * کاربری که اصلاً به نقشه دست نزده مرکزِ پیش‌فرضِ شهر را به‌عنوان آدرسِ
 * خانه‌اش ثبت می‌کند.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import addressReducer from '@slices/addressSlice';
import LocationSection from '../LocationSection';

let canvasProps = null;
// نامِ `mock*` تنها راهی است که ارجاع به یک متغیرِ بیرونی داخلِ کارخانه‌ی
// jest.mock مجاز می‌شود (بقیه‌ی نام‌ها به‌خاطرِ hoisting رد می‌شوند).
const mockFlyTo = jest.fn();

jest.mock('@components/NeshanCanvas', () => {
  const React = require('react');
  return React.forwardRef(function NeshanCanvasMock(props, ref) {
    canvasProps = props;
    React.useImperativeHandle(ref, () => ({ flyTo: mockFlyTo }));
    return React.createElement('View', { testID: 'neshan-canvas' });
  });
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'fa' } }),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({ coords: { latitude: 35.75, longitude: 51.45 } })),
  Accuracy: { Balanced: 3 },
}));

// ژئوکدینگ در این تست نقشی ندارد و نباید به شبکه بزند.
jest.mock('@services/geocoding', () => ({
  isReverseGeocodeAvailable: () => false,
  resolvePoint: jest.fn(async () => null),
}));

const makeStore = () =>
  configureStore({
    reducer: {
      address: addressReducer,
      radius: (state = { data: [{ latitude: '35.6892', longitude: '51.389', radius: '20000' }] }) =>
        state,
    },
  });

const render = async (store, props = {}) => {
  let tree;
  await act(async () => {
    tree = TestRenderer.create(
      <Provider store={store}>
        <LocationSection onOpenFullScreen={jest.fn()} {...props} />
      </Provider>
    );
  });
  return tree;
};

const textsOf = (tree) =>
  tree.root
    .findAllByType('Text')
    .map((node) => node.children.filter((child) => typeof child === 'string').join(''))
    .filter(Boolean);

describe('LocationSection', () => {
  beforeEach(() => {
    canvasProps = null;
    jest.clearAllMocks();
  });

  it('باز شدنِ نقشه موقعیت را انتخاب نمی‌کند', async () => {
    const store = makeStore();
    const tree = await render(store);

    await act(async () => {
      canvasProps.onReady({ latitude: 35.6892, longitude: 51.389 });
    });

    expect(store.getState().address.locationPicked).toBe(false);
    expect(store.getState().address.latitude).toBeNull();
    expect(textsOf(tree)).toEqual(expect.arrayContaining(['Not selected']));
  });

  it('کشیدنِ نقشه توسطِ کاربر نقطه را ثبت می‌کند', async () => {
    const store = makeStore();
    const tree = await render(store);

    await act(async () => {
      canvasProps.onReady({ latitude: 35.6892, longitude: 51.389 });
      canvasProps.onMoveEnd({ latitude: 35.7, longitude: 51.4, user: true });
    });

    const address = store.getState().address;
    expect(address.locationPicked).toBe(true);
    expect(address.latitude).toBe(35.7);
    expect(address.longitude).toBe(51.4);
    expect(textsOf(tree)).toEqual(expect.arrayContaining(['Selected']));
  });

  it('حرکتِ برنامه‌ای (پرواز به نقطه) انتخاب حساب نمی‌شود', async () => {
    const store = makeStore();
    await render(store);

    await act(async () => {
      canvasProps.onMoveEnd({ latitude: 35.9, longitude: 51.9, user: false });
    });

    expect(store.getState().address.locationPicked).toBe(false);
  });

  it('«موقعیت من» نقطه را ثبت می‌کند', async () => {
    const store = makeStore();
    const tree = await render(store);

    const locate = tree.root.findAll((node) => node.props?.testID === 'map-locate-me')[0];
    await act(async () => {
      await locate.props.onPress();
    });

    expect(mockFlyTo).toHaveBeenCalledWith(35.75, 51.45, 17);

    // پایانِ همان پرواز باید «انتخابِ کاربر» شمرده شود، هرچند user=false است.
    await act(async () => {
      canvasProps.onMoveEnd({ latitude: 35.75, longitude: 51.45, user: false });
    });

    expect(store.getState().address.locationPicked).toBe(true);
    expect(store.getState().address.latitude).toBe(35.75);
  });

  it('نقشه قفل است تا کاربر ضربه بزند', async () => {
    const store = makeStore();
    const onActiveChange = jest.fn();
    const tree = await render(store, { onActiveChange });

    expect(canvasProps.interactive).toBe(false);

    const unlock = tree.root.findAll((node) => node.props?.testID === 'map-unlock')[0];
    await act(async () => {
      unlock.props.onPress();
    });

    expect(onActiveChange).toHaveBeenCalledWith(true);
    expect(canvasProps.interactive).toBe(true);
  });

  it('نقطه‌ی بیرون از محدوده هشدار می‌دهد', async () => {
    const store = makeStore();
    const tree = await render(store);

    await act(async () => {
      canvasProps.onMoveEnd({ latitude: 36.9, longitude: 54.9, user: true });
    });

    expect(textsOf(tree)).toEqual(expect.arrayContaining(['Out of range']));
  });
});
