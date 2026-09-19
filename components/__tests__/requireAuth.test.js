/**
 * نگهبانِ مسیر نباید کاربرِ واردشده را به صفحه‌ی ورود بفرستد.
 *
 * The guard's whole risk is the false positive: a signed-in user reopening the
 * app must land where they left off, not on the login page. `token: null` is
 * ambiguous during the AsyncStorage read on a cold start, so the guard has to
 * wait for `isRestored` before it is allowed to redirect — these tests pin that
 * ordering, because getting it wrong looks like "the app logs me out every
 * time I close it".
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

let mockState = {};

jest.mock('react-redux', () => ({
  useSelector: (selector) => selector(mockState),
}));

import RequireAuth from '../RequireAuth';

const Screen = () => null;

const render = (auth) => {
  mockState = { auth };
  const navigation = { replace: jest.fn() };
  let tree;

  act(() => {
    tree = renderer.create(
      <RequireAuth navigation={navigation}>
        <Screen />
      </RequireAuth>
    );
  });

  const showsScreen = tree.root.findAllByType(Screen).length > 0;
  return { navigation, showsScreen, tree };
};

describe('RequireAuth', () => {
  it('renders the screen for a signed-in user', () => {
    const { navigation, showsScreen } = render({ token: 'abc', isRestored: true });

    expect(navigation.replace).not.toHaveBeenCalled();
    expect(showsScreen).toBe(true);
  });

  it('waits instead of redirecting while storage is still being read', () => {
    // The cold-start window: a perfectly valid token is in AsyncStorage but has
    // not reached Redux yet. Redirecting here is the regression.
    const { navigation, showsScreen } = render({ token: null, isRestored: false });

    expect(navigation.replace).not.toHaveBeenCalled();
    expect(showsScreen).toBe(false);
  });

  it('lets the screen through once a restored token arrives', () => {
    const { navigation, tree } = render({ token: null, isRestored: false });

    act(() => {
      mockState = { auth: { token: 'abc', isRestored: true } };
      tree.update(
        <RequireAuth navigation={navigation}>
          <Screen />
        </RequireAuth>
      );
    });

    expect(navigation.replace).not.toHaveBeenCalled();
    expect(tree.root.findAllByType(Screen).length).toBe(1);
  });

  it('redirects only once it knows there is no session', () => {
    const { navigation, showsScreen } = render({ token: null, isRestored: true });

    expect(navigation.replace).toHaveBeenCalledWith('SignInLanding');
    expect(showsScreen).toBe(false);
  });

  it('redirects when the session is cleared underneath a live screen', () => {
    // Session expiry / logout while the user sits on a guarded screen.
    const { navigation, tree } = render({ token: 'abc', isRestored: true });
    expect(navigation.replace).not.toHaveBeenCalled();

    act(() => {
      mockState = { auth: { token: null, isRestored: true } };
      tree.update(
        <RequireAuth navigation={navigation}>
          <Screen />
        </RequireAuth>
      );
    });

    expect(navigation.replace).toHaveBeenCalledWith('SignInLanding');
  });
});
