/**
 * مشتری‌ای که از «سفارش سیستماتیک» وارد شده صفحه‌ی اصلی‌اش /systematic-selection
 * است و نباید /list (انتخابگر سازمانی) را ببیند.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureStore } from '@reduxjs/toolkit';

import {
  CUSTOMER_HOME_ROUTE,
  ORGANIZATION_HOME_ROUTE,
  homeRouteFor,
  resetToHome,
} from '../homeRoute';
import { routes } from '../routes';
import List from '@org/List';

jest.mock('@components/CustomStatusBar', () => () => null);
jest.mock('@components/ScreenHeaders', () => () => null);

describe('homeRouteFor', () => {
  it('sends customers to «انتخاب سیستماتیک» and organisations to List', () => {
    expect(homeRouteFor('individual')).toBe(CUSTOMER_HOME_ROUTE);
    expect(homeRouteFor('organization')).toBe(ORGANIZATION_HOME_ROUTE);
    // نوع حساب نامعلوم: همان رفتار قبلی.
    expect(homeRouteFor(null)).toBe(ORGANIZATION_HOME_ROUTE);
  });

  it('points at real routes with the expected URLs', () => {
    const pathOf = (name) => routes.find((route) => route.name === name)?.path;
    expect(pathOf(CUSTOMER_HOME_ROUTE)).toBe('systematic-selection');
    expect(pathOf(ORGANIZATION_HOME_ROUTE)).toBe('list');
  });

  it('resets the stack so neither the login page nor List stays beneath', () => {
    const navigation = { reset: jest.fn() };
    resetToHome(navigation, 'individual');
    expect(navigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: CUSTOMER_HOME_ROUTE }] });
  });
});

describe('List guard', () => {
  const SAFE_AREA_METRICS = {
    frame: { x: 0, y: 0, width: 390, height: 844 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  };

  const render = async (userType) => {
    const navigation = { replace: jest.fn(), navigate: jest.fn() };
    const store = configureStore({
      reducer: {
        auth: (s = { token: 'tok', userType }) => s,
        organization: (s = { profile: null }) => s,
      },
    });
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
          <Provider store={store}>
            <List navigation={navigation} />
          </Provider>
        </SafeAreaProvider>
      );
    });
    return { tree, navigation };
  };

  it('never shows List to a customer and replaces it with their home', async () => {
    const { tree, navigation } = await render('individual');
    expect(navigation.replace).toHaveBeenCalledWith(CUSTOMER_HOME_ROUTE);
    expect(tree.root.findAllByType('Text')).toHaveLength(0);
  });

  it('still shows the organisation chooser to organisation users', async () => {
    const { tree, navigation } = await render('organization');
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(tree.root.findAllByType('Text').length).toBeGreaterThan(0);
  });
});
