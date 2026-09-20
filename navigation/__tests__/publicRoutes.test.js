/**
 * A fresh install has an empty AsyncStorage, so `Landing` used to drop the
 * visitor on the signed-in home page with no session: every request went out
 * without an Authorization header, and `axiosConfig` deliberately ignores 401s
 * on unauthenticated requests, so nothing ever told the user to log in.
 *
 * The allowlist below is what makes that impossible now. It is pinned here
 * because it is a *deny-by-default* list: a typo in an entry does not fail
 * loudly, it just silently locks a screen behind a login, and the inverse
 * mistake — a screen quietly becoming public — is the security-relevant one.
 */
import { AUTH_ROUTE, PUBLIC_ROUTES, requiresAuth, ROOT_ROUTES, routes } from '../routes';

const routeNames = new Set(routes.map((route) => route.name));

describe('public route allowlist', () => {
  it('only names routes that actually exist', () => {
    const unknown = [...PUBLIC_ROUTES].filter((name) => !routeNames.has(name));

    // `ReceiptGallery` is registered only under __DEV__; everything else must
    // correspond to a real screen or the entry is a typo that silently guards
    // a page meant to be public.
    expect(unknown.filter((name) => name !== 'ReceiptGallery')).toEqual([]);
  });

  it('lets a signed-out visitor reach the sign-in flows', () => {
    // Guarding any of these would lock the user out of the app entirely: they
    // cannot be asked to sign in before they are allowed to see sign-in.
    for (const name of [
      'Landing',
      'SignInLanding',
      'LoginScreen',
      'MainSignIn',
      'RegistrationVerificationScreen',
      'ForgotPassword',
      'ResetPasswordScreen',
      'Login',
      'Register',
      'OTPVerification',
      // The entry menu is the only route to the organisation login; guarding it
      // removed organisation sign-in from the app.
      'OrderMenuScreen',
    ]) {
      expect(requiresAuth(name)).toBe(false);
    }
  });

  it('guards the screens that assume a session', () => {
    for (const name of [
      'List',
      'OrdersScreen',
      'TransactionsScreen',
      'MessageScreen',
      'AddressScreen',
      'Profile',
      'Increase',
      'Wallet',
      'ComprehensiveSelectionScreen',
      'SystematicCategoryScreen',
      'Preview',
    ]) {
      expect(requiresAuth(name)).toBe(true);
    }
  });

  it('denies by default, so an unlisted screen is never public', () => {
    expect(requiresAuth('SomeScreenAddedTomorrow')).toBe(true);
    expect(requiresAuth(undefined)).toBe(true);
  });

  it('sends signed-out visitors somewhere they are allowed to go', () => {
    expect(routeNames.has(AUTH_ROUTE)).toBe(true);
    expect(requiresAuth(AUTH_ROUTE)).toBe(false);
  });

  it('treats the signed-out landing page as a stack root', () => {
    // `Landing` replaces itself with AUTH_ROUTE, so nothing sits beneath it and
    // Android back must offer to exit rather than pop an empty stack.
    expect(ROOT_ROUTES).toContain(AUTH_ROUTE);
  });
});
