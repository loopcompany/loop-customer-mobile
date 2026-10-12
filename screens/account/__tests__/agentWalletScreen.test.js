/**
 * «کیف پول مأمور خرید»: کاربر غیرمأمور فقط پیام می‌بیند؛ مأمور خرید موجودی،
 * پورسانت‌ها و فرم برداشت/تهاتر را.
 */
import '@i18n';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureStore } from '@reduxjs/toolkit';

import AgentWalletScreen from '../AgentWalletScreen';
import * as api from '@services/AgentWalletApi';

jest.mock('@services/AgentWalletApi', () => ({
  ...jest.requireActual('@services/AgentWalletApi'),
  getAgentSummary: jest.fn(),
  listCommissions: jest.fn(),
  listWithdrawals: jest.fn(),
}));
jest.mock('@components/ScreenHeaders', () => () => null);
jest.mock('@contexts/MenuContext', () => ({
  ...jest.requireActual('@contexts/MenuContext'),
  useMenu: () => ({ footerSpace: 0 }),
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const store = configureStore({
  reducer: {
    auth: (s = { token: 'tok' }) => s,
    user: (s = { data: {} }) => s,
    wallet: (s = { balance: 0 }) => s,
  },
});

const textOf = (node) =>
  (node.children || [])
    .map((child) => (typeof child === 'string' ? child : textOf(child)))
    .join('');

const mounted = [];
const render = async () => {
  let tree;
  await act(async () => {
    tree = TestRenderer.create(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <Provider store={store}>
          <AgentWalletScreen />
        </Provider>
      </SafeAreaProvider>
    );
  });
  mounted.push(tree);
  return tree;
};
afterEach(async () => {
  await act(async () => mounted.splice(0).forEach((tree) => tree.unmount()));
});

it('tells a non-agent that the wallet is for purchase agents', async () => {
  api.getAgentSummary.mockResolvedValue({ ok: true, data: { is_agent: false } });
  api.listCommissions.mockResolvedValue({ ok: true, data: [] });
  api.listWithdrawals.mockResolvedValue({ ok: true, data: [] });
  const tree = await render();
  const text = textOf(tree.root);
  expect(text).toContain('این کیف پول فقط برای مأموران خرید دارای کد معرف است.');
  expect(text).not.toContain('درخواست برداشت');
});

it('shows balances, commissions and the withdraw form to an agent', async () => {
  api.getAgentSummary.mockResolvedValue({
    ok: true,
    data: {
      is_agent: true,
      referral_code: 'LOOP-AB12CD',
      commission_percent: 5,
      available_balance: 750000,
      min_withdraw_amount: 0,
    },
  });
  api.listCommissions.mockResolvedValue({
    ok: true,
    data: [
      {
        id: 1,
        order_id: 42,
        order_amount: 15000000,
        commission_percent: 5,
        commission_amount: 750000,
        status: 'available',
      },
    ],
  });
  api.listWithdrawals.mockResolvedValue({ ok: true, data: [] });
  const tree = await render();
  const text = textOf(tree.root);
  expect(text).toContain('LOOP-AB12CD');
  expect(text).toContain('750,000');
  expect(text).toContain('سفارش #42');
  expect(text).toContain('درخواست برداشت');
  expect(text).toContain('هنوز برداشتی انجام نشده است.');
});

it('shows «coming soon» while the endpoint does not exist', async () => {
  api.getAgentSummary.mockResolvedValue({ ok: false, status: 404 });
  api.listCommissions.mockResolvedValue({ ok: false, status: 404 });
  api.listWithdrawals.mockResolvedValue({ ok: false, status: 404 });
  const tree = await render();
  expect(textOf(tree.root)).toContain('این بخش به‌زودی فعال می‌شود.');
});
