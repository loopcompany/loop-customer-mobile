/**
 * بخش پیام: کارت «ارتباط با پشتیبانی»، ایموجی در محل نشانگر، و سنجاق که فقط وقتی
 * سرور پیوست را پشتیبانی می‌کند فعال است.
 */
import '@i18n';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import MessageScreen from '../MessageScreen';
import * as api from '@services/Api';
import * as common from '@helpers/Common';
import * as DocumentPicker from 'expo-document-picker';

jest.mock('@services/Api', () => ({
  ...jest.requireActual('@services/Api'),
  getTicketsList: jest.fn(),
  sendTicketMessage: jest.fn(),
}));
jest.mock('@helpers/Common', () => ({
  ...jest.requireActual('@helpers/Common'),
  showToastOrAlert: jest.fn(),
  showAlert: jest.fn(),
}));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('@components/ScreenHeaders', () => () => null);
jest.mock('@components/CustomStatusBar', () => () => null);
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: (cb) => require('react').useEffect(cb, []),
}));
jest.mock('@contexts/MenuContext', () => ({
  ...jest.requireActual('@contexts/MenuContext'),
  useMenu: () => ({ footerSpace: 0 }),
}));

const store = configureStore({
  reducer: { contacts: (s = { data: { data: { contact: null } } }) => s },
});
const textOf = (node) =>
  (node.children || [])
    .map((child) => (typeof child === 'string' ? child : textOf(child)))
    .join('');
const press = async (tree, predicate) => {
  const nodes = tree.root.findAll(
    (node) => typeof node.props.onPress === 'function' && predicate(node)
  );
  await act(async () => {
    await nodes[nodes.length - 1].props.onPress();
  });
};

const mounted = [];
const render = async () => {
  let tree;
  await act(async () => {
    tree = TestRenderer.create(
      <Provider store={store}>
        <MessageScreen navigation={{ navigate: jest.fn() }} />
      </Provider>
    );
  });
  mounted.push(tree);
  return tree;
};
afterEach(async () => {
  await act(async () => mounted.splice(0).forEach((tree) => tree.unmount()));
  jest.clearAllMocks();
});

it('shows the support card with the new title and text', async () => {
  api.getTicketsList.mockResolvedValue({ success: true, data: [], attachmentsSupported: false });
  const tree = await render();
  const text = textOf(tree.root);
  expect(text).toContain('ارتباط با پشتیبانی');
  expect(text).toContain('برای دریافت راهنمایی، با تیم پشتیبانی لوپ تماس بگیرید.');
});

it('inserts an emoji at the caret', async () => {
  api.getTicketsList.mockResolvedValue({ success: true, data: [], attachmentsSupported: false });
  const tree = await render();
  const input = () => tree.root.findAllByType(TextInput)[0];
  await act(async () => {
    input().props.onChangeText('سلام دنیا');
    input().props.onSelectionChange({ nativeEvent: { selection: { start: 4, end: 4 } } });
  });
  await press(tree, (node) => node.props.accessibilityLabel === 'ایموجی');
  await press(tree, (node) => node.props.accessibilityLabel === '😊');
  expect(input().props.value).toBe('سلام😊 دنیا');
});

it('keeps the paperclip off until the server supports attachments', async () => {
  api.getTicketsList.mockResolvedValue({ success: true, data: [], attachmentsSupported: false });
  const tree = await render();
  await press(tree, (node) => node.props.accessibilityLabel === 'پیوست فایل');
  expect(common.showToastOrAlert).toHaveBeenCalledWith('ارسال فایل به‌زودی فعال می‌شود.');
});

it('sends a picked PDF with the message', async () => {
  api.getTicketsList.mockResolvedValue({ success: true, data: [], attachmentsSupported: true });
  api.sendTicketMessage.mockResolvedValue({ success: true });
  DocumentPicker.getDocumentAsync.mockResolvedValue({
    canceled: false,
    assets: [
      {
        uri: 'file:///tmp/letter.pdf',
        name: 'letter.pdf',
        mimeType: 'application/pdf',
        size: 2000,
      },
    ],
  });
  const tree = await render();
  await press(tree, (node) => node.props.accessibilityLabel === 'پیوست فایل');
  await press(tree, (node) => textOf(node).includes('فایل PDF یا تصویر'));
  expect(textOf(tree.root)).toContain('letter.pdf');

  await press(tree, (node) => textOf(node).includes('ارسال پیام به لوپ'));
  expect(api.sendTicketMessage).toHaveBeenCalledWith('', [
    expect.objectContaining({ name: 'letter.pdf', mimeType: 'application/pdf' }),
  ]);
});
