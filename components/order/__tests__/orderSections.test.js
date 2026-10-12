/**
 * رندر بخش‌های تازه‌ی جزئیات سفارش و حساب سازمانی (بند ۹، ۱۰، ۱۱، ۱۵) و مرحله‌ی
 * دوم ورود. متن‌ها فارسی‌اند چون زبان پیش‌فرض اپ در تست هم فارسی است.
 */
import '@i18n';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import ProcurementQuoteSection from '../ProcurementQuoteSection';
import DeliveryDetailsSection from '../DeliveryDetailsSection';
import { OrganizationEditRequestCard } from '@components/account/OrganizationAccountSections';
import TwoFactorChallenge from '@components/auth/TwoFactorChallenge';
import * as fulfillment from '@services/OrderFulfillmentApi';
import * as common from '@helpers/Common';
import { readEditRequestState } from '@services/OrganizationAccountApi';

jest.mock('@services/OrderFulfillmentApi', () => ({
  ...jest.requireActual('@services/OrderFulfillmentApi'),
  acceptProcurementQuote: jest.fn(),
  updateDeliveryDetails: jest.fn(),
}));
jest.mock('@helpers/Common', () => ({
  ...jest.requireActual('@helpers/Common'),
  showToastOrAlert: jest.fn(),
  showAlert: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));

const store = configureStore({
  reducer: {
    auth: (s = { token: 'tok' }) => s,
    user: (s = { data: { name: 'مریم', last_name: 'احمدی' } }) => s,
    wallet: (s = { balance: 5_000_000 }) => s,
    orders: (s = {}) => s,
  },
});

const mounted = [];
const render = async (element) => {
  let tree;
  await act(async () => {
    tree = TestRenderer.create(<Provider store={store}>{element}</Provider>);
  });
  mounted.push(tree);
  return tree;
};

// شمارنده‌ی «ارسال مجدد» و انیمیشن مودال‌ها نباید بعد از تست زنده بمانند.
afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
});

// متن رندرشده‌ی یک گره (همه‌ی رشته‌های زیردرخت).
const textOf = (node) =>
  (node.children || [])
    .map((child) => (typeof child === 'string' ? child : textOf(child)))
    .join('');

const texts = (tree) => textOf(tree.root);

const pressByText = async (tree, label) => {
  // درونی‌ترین گره‌ی قابل‌لمس که این متن را دارد.
  const candidates = tree.root.findAll(
    (node) => typeof node.props.onPress === 'function' && textOf(node).includes(label)
  );
  const button = candidates[candidates.length - 1];
  if (!button) throw new Error(`button not found: ${label}`);
  await act(async () => {
    await button.props.onPress();
  });
};

beforeEach(() => jest.clearAllMocks());

describe('ProcurementQuoteSection', () => {
  const order = {
    procurement: {
      status: 'quoted',
      items: [
        {
          item_id: 'laptop',
          title: 'لپ تاپ',
          condition: 'new',
          quantity: 2,
          unit_price: 1_000_000,
        },
      ],
      valid_until: '2099-01-01T17:00:00Z',
    },
  };

  it('shows the validity note and the 60% prepayment', async () => {
    const tree = await render(<ProcurementQuoteSection order={order} orderId={5} />);
    const all = texts(tree);
    expect(all).toContain('این رسید تا پایان ساعات کاری روز جاری معتبر است.');
    expect(all).toContain('1,200,000'); // ۶۰٪ از ۲٬۰۰۰٬۰۰۰
    expect(all).toContain('800,000');
  });

  it('accepts the quote after confirmation', async () => {
    fulfillment.acceptProcurementQuote.mockResolvedValue({ ok: true, message: 'ok' });
    const onUpdate = jest.fn();
    const tree = await render(
      <ProcurementQuoteSection order={order} orderId={5} onUpdate={onUpdate} />
    );
    await pressByText(tree, 'تأیید قیمت‌ها');
    const buttons = common.showAlert.mock.calls[0][2];
    await act(async () => {
      await buttons[1].onPress();
    });
    expect(fulfillment.acceptProcurementQuote).toHaveBeenCalledWith('tok', 5);
    expect(onUpdate).toHaveBeenCalled();
  });

  it('renders nothing without a procurement block', async () => {
    const tree = await render(<ProcurementQuoteSection order={{}} orderId={5} />);
    expect(tree.toJSON()).toBeNull();
  });
});

describe('DeliveryDetailsSection', () => {
  it('blocks saving without a method, then saves a representative', async () => {
    fulfillment.updateDeliveryDetails.mockResolvedValue({ ok: true });
    const tree = await render(<DeliveryDetailsSection order={{ send_to_loop: 1 }} orderId={9} />);

    await pressByText(tree, 'نماینده / شخص دیگر');
    const inputs = tree.root.findAllByType(TextInput);
    await act(async () => {
      inputs[0].props.onChangeText('علی رضایی');
      inputs[1].props.onChangeText('09120000000');
    });
    await pressByText(tree, 'ذخیره');
    expect(common.showToastOrAlert).toHaveBeenCalledWith('روش ارسال را انتخاب کنید.');
    expect(fulfillment.updateDeliveryDetails).not.toHaveBeenCalled();

    await pressByText(tree, 'توسط پیک حمل و نقل');
    await pressByText(tree, 'ذخیره');
    expect(fulfillment.updateDeliveryDetails).toHaveBeenCalledWith(
      'tok',
      9,
      expect.objectContaining({
        receiverType: 'representative',
        receiverName: 'علی رضایی',
        receiverMobile: '09120000000',
        method: 'courier',
      })
    );
  });

  it('shows the recorded delivery time read-only once delivered', async () => {
    const tree = await render(
      <DeliveryDetailsSection
        order={{
          delivery: { receiver_type: 'self', method: 'user', delivered_at: '2026-10-12T14:23:00Z' },
        }}
        orderId={9}
      />
    );
    const all = texts(tree);
    expect(all).toContain('خودم - مریم احمدی');
    expect(all).not.toContain('ویرایش مشخصات تحویل');
  });
});

describe('OrganizationEditRequestCard', () => {
  it('requires the stamped letter', async () => {
    const tree = await render(
      <OrganizationEditRequestCard
        editState={readEditRequestState({})}
        formOpen
        onCloseForm={jest.fn()}
      />
    );
    await pressByText(tree, 'ارسال درخواست');
    expect(common.showToastOrAlert).toHaveBeenCalledWith(
      'بارگذاری نامه‌ی دارای مهر و امضا الزامی است.'
    );
  });

  it('shows a pending request instead of the form', async () => {
    const tree = await render(
      <OrganizationEditRequestCard
        editState={readEditRequestState({
          edit_request: { status: 'pending', description: 'تغییر نام' },
        })}
        formOpen
        onCloseForm={jest.fn()}
      />
    );
    const all = texts(tree);
    expect(all).toContain('در انتظار بررسی پنل مدیریت');
    expect(all).not.toContain('ارسال درخواست');
  });
});

describe('TwoFactorChallenge', () => {
  it('submits the code', async () => {
    const onSubmit = jest.fn().mockResolvedValue({ ok: true });
    const tree = await render(
      <TwoFactorChallenge visible method="sms" onSubmit={onSubmit} onCancel={jest.fn()} />
    );
    const input = tree.root.findAllByType(TextInput)[0];
    await act(async () => {
      input.props.onChangeText('123456');
    });
    await pressByText(tree, 'تأیید و ورود');
    expect(onSubmit).toHaveBeenCalledWith('123456');
  });
});
