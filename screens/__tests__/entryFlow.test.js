/**
 * مسیر ورود به اپ: Landing → Welcome → OrderMenuScreen
 *
 * The app's four-way entry menu (`OrderMenuScreen`: systematic order, urgent
 * order, AI, organisation/company — and the organisation login behind it) hangs
 * off a two-link chain, and `Welcome` is the *only* screen that navigates to
 * it. When `Landing` stopped routing through `Welcome`, both screens became
 * unreachable from a cold start and the entry menu silently disappeared from
 * the product while every file involved still existed and still passed review.
 *
 * These assertions make that break loud.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import Welcome from '../Welcome';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'fa' } }),
}));

// The splash only dispatches this for the contact numbers; the network call is
// irrelevant to where it navigates.
jest.mock('@slices/contactSlice', () => ({
  fetchContacts: () => ({ type: 'contacts/fetch/mock' }),
}));

const makeStore = (auth) =>
  configureStore({
    reducer: {
      auth: (s = auth) => s,
      contacts: (s = { data: null }) => s,
    },
  });

const renderWelcome = (auth) => {
  const replace = jest.fn();

  act(() => {
    TestRenderer.create(
      <Provider store={makeStore(auth)}>
        <Welcome navigation={{ replace, navigate: jest.fn() }} />
      </Provider>
    );
  });

  return replace;
};

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Welcome splash', () => {
  it('lands a signed-in user on the four-way entry menu', () => {
    const replace = renderWelcome({ token: 'tok', isRestored: true });

    act(() => jest.advanceTimersByTime(4000));

    expect(replace).toHaveBeenCalledWith('OrderMenuScreen');
  });

  it('lands a signed-out visitor on the same menu, not on the sign-in chooser', () => {
    // The menu is where both sign-in paths start — the customer chooser and the
    // organisation login. Short-circuiting a guest straight to `SignInLanding`
    // is what removed organisation sign-in from the app.
    const replace = renderWelcome({ token: null, isRestored: true });

    act(() => jest.advanceTimersByTime(4000));

    expect(replace).toHaveBeenCalledWith('OrderMenuScreen');
  });

  it('waits for the stored session to be read before choosing', () => {
    // `token: null` is ambiguous until AsyncStorage has been read — navigating
    // on it would throw a signed-in user out on every cold start.
    const replace = renderWelcome({ token: null, isRestored: false });

    act(() => jest.advanceTimersByTime(10000));

    expect(replace).not.toHaveBeenCalled();
  });
});

describe('Landing', () => {
  // Landing pulls in the video player and TokenManager, which makes a render
  // test more machinery than signal. What must not regress is the destination
  // of each branch, so assert on those directly.
  const source = () => require('fs').readFileSync(require.resolve('../Landing.js'), 'utf8');

  it('routes a signed-in cold start through the Welcome splash', () => {
    expect(source()).toMatch(/navigateToMainApp\s*=\s*\(\)\s*=>\s*settle\('Welcome'\)/);
  });

  it('routes a signed-out cold start through it too', () => {
    expect(source()).toMatch(/navigateToWelcome\s*=\s*\(\)\s*=>\s*settle\('Welcome'\)/);
  });
});
