/**
 * ورود با تأیید دومرحله‌ای: پاسخ ورود به‌جای توکن، چالش مرحله‌ی دوم دارد.
 */
import { readTwoFactorChallenge } from '../AccountSecurityApi';

describe('readTwoFactorChallenge', () => {
  it('ignores a normal login response', () => {
    expect(readTwoFactorChallenge({ success: true, data: { token: 'x' } })).toBeNull();
    expect(readTwoFactorChallenge(undefined)).toBeNull();
  });

  it('needs both the flag and the challenge token', () => {
    expect(readTwoFactorChallenge({ requires_two_factor: true })).toBeNull();
  });

  it('reads the method, defaulting to sms', () => {
    expect(readTwoFactorChallenge({ requires_two_factor: true, two_factor_token: 'abc' })).toEqual({
      token: 'abc',
      method: 'sms',
    });
    expect(
      readTwoFactorChallenge({ requires_two_factor: true, two_factor_token: 'abc', method: 'app' })
        .method
    ).toBe('app');
  });
});
