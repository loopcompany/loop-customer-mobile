/**
 * A smoke render of the wallet home.
 *
 * The screen reported as "empty" in the app, and an empty screen has two very
 * different causes: a render-time throw, or a real but blank UI. This mounts it
 * for real and asserts the things that must be on screen *regardless of data* —
 * balance, the recharge action, the transactions action — so the two cannot be
 * confused again.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import walletReducer from '@slices/walletSlice';
import Wallet from '../Wallet';
import { getTransactions, getWalletBalance } from '@services/WalletApi';

jest.mock('@services/WalletApi', () => ({
  ...jest.requireActual('@services/WalletApi'),
  getTransactions: jest.fn(),
  getWalletBalance: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'fa' } }),
}));

// `useFocusEffect` needs a navigation container; the screen only uses it to
// refresh on focus, so run the effect once like a mount.
// `FooterSpacer` reads the floating dock's height from MenuContext. In the app
// `MenuProvider` wraps the whole navigator (App.js); here only the value matters.
jest.mock('@contexts/MenuContext', () => ({
  ...jest.requireActual('@contexts/MenuContext'),
  useMenu: () => ({ footerSpace: 0 }),
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: (cb) => require('react').useEffect(cb, [cb]),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), canGoBack: () => false }),
}));

const makeStore = (auth = { token: 'tok' }, user = { data: { wallet: 250000 } }) =>
  configureStore({
    reducer: {
      wallet: walletReducer,
      auth: (s = auth) => s,
      user: (s = user) => s,
    },
  });

/** Every text string rendered anywhere in the tree. */
const textsOf = (tree) =>
  tree.root
    .findAllByType('Text')
    .map((n) => n.children.filter((c) => typeof c === 'string').join(''))
    .filter(Boolean);

const renderWallet = async (store) => {
  let tree;
  await act(async () => {
    tree = TestRenderer.create(
      <Provider store={store}>
        <Wallet navigation={{ navigate: jest.fn() }} />
      </Provider>
    );
  });
  return tree;
};

// `showToastOrAlert` falls back to `alert()` off-Android; jsdom-less Jest has none.
beforeAll(() => {
  global.alert = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  getWalletBalance.mockResolvedValue({ ok: true, data: { wallet_balance: 250000 } });
  getTransactions.mockResolvedValue({ ok: true, data: { transactions: [] } });
});

describe('Wallet screen', () => {
  it('renders the balance and both actions even with no transactions', async () => {
    const tree = await renderWallet(makeStore());
    const texts = textsOf(tree);

    expect(texts).toEqual(expect.arrayContaining(['Your current wallet balance:']));
    expect(texts).toEqual(expect.arrayContaining(['Wallet recharge']));
    expect(texts).toEqual(expect.arrayContaining(['Transactions']));
    expect(texts).toEqual(expect.arrayContaining(['No transactions yet.']));
    // The formatted balance must actually appear, not a blank or NaN.
    expect(texts.join(' ')).toMatch(/250/);
  });

  it('lists recent transactions when the API returns some', async () => {
    getTransactions.mockResolvedValue({
      ok: true,
      data: {
        transactions: [
          {
            id: 1,
            price: '500000.00',
            type: 1,
            status: 100,
            description: 'شارژ',
            created_at: '2026-09-19T10:00:00.000000Z',
          },
          {
            id: 2,
            price: '120000.00',
            type: 3,
            status: 100,
            description: 'پرداخت',
            created_at: '2026-09-18T10:00:00.000000Z',
          },
        ],
      },
    });

    const tree = await renderWallet(makeStore());
    const texts = textsOf(tree);

    expect(texts).toEqual(expect.arrayContaining(['شارژ']));
    expect(texts).toEqual(expect.arrayContaining(['پرداخت']));
    expect(texts).not.toEqual(expect.arrayContaining(['No transactions yet.']));
  });

  it('accepts a bare collection, which is what the backend sends without pagination', async () => {
    getTransactions.mockResolvedValue({
      ok: true,
      data: [
        {
          id: 9,
          price: '1000.00',
          type: 1,
          status: 100,
          description: 'bare',
          created_at: '2026-09-19T10:00:00.000000Z',
        },
      ],
    });

    const tree = await renderWallet(makeStore());
    expect(textsOf(tree)).toEqual(expect.arrayContaining(['bare']));
  });

  it('offers quick-charge amounts that the backend will accept', async () => {
    const navigate = jest.fn();
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        <Provider store={makeStore()}>
          <Wallet navigation={{ navigate }} />
        </Provider>
      );
    });

    expect(textsOf(tree)).toEqual(expect.arrayContaining(['Quick recharge']));

    // Tapping a chip must carry that exact amount to the charge form, otherwise
    // the shortcut is decorative and the user retypes it anyway.
    const chip = tree.root
      .findAll((n) => typeof n.props?.onPress === 'function')
      .find((n) =>
        n
          .findAllByType('Text')
          .some((node) => node.children.join('').replace(/[^\d]/g, '') === '100000')
      );

    expect(chip).toBeTruthy();
    act(() => chip.props.onPress());
    expect(navigate).toHaveBeenCalledWith('Increase', { amount: 100000 });
  });

  it('still renders the actions when the balance call fails', async () => {
    getWalletBalance.mockResolvedValue({ ok: false, message: 'boom' });
    getTransactions.mockResolvedValue({ ok: false, message: 'boom' });

    const tree = await renderWallet(makeStore());
    const texts = textsOf(tree);

    // A failed refresh must not leave the user on a page with nothing to press.
    expect(texts).toEqual(expect.arrayContaining(['Wallet recharge']));
    expect(texts).toEqual(expect.arrayContaining(['Transactions']));
  });
});
