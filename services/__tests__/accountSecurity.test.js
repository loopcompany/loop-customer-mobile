import {
  activityLabel,
  alertTypeLabel,
  deletionStatusOf,
  isMutableAlertSeverity,
  otherDevicesCount,
  severityOf,
  shortId,
} from '../accountSecurityLabels';
import { isNotImplemented } from '../AccountSecurityApi';
import { VERIFICATION_STATUS, resolveVerificationStatus } from '../OrganizationAccountApi';

describe('isNotImplemented', () => {
  it('treats 404/405/501 failures as "not built yet"', () => {
    expect(isNotImplemented({ ok: false, status: 404 })).toBe(true);
    expect(isNotImplemented({ ok: false, status: 405 })).toBe(true);
    expect(isNotImplemented({ ok: false, status: 501 })).toBe(true);
  });

  it('does not hide real errors or successes', () => {
    expect(isNotImplemented({ ok: false, status: 422 })).toBe(false);
    expect(isNotImplemented({ ok: false, status: undefined })).toBe(false);
    expect(isNotImplemented({ ok: true, status: 404 })).toBe(false);
  });
});

describe('security labels', () => {
  it('maps known types and falls back to the server title', () => {
    expect(activityLabel({ type: 'login_failed' })).toBe('ورود ناموفق');
    expect(activityLabel({ type: 'something_new', title: 'رویداد تازه' })).toBe('رویداد تازه');
    expect(alertTypeLabel({ type: 'NEW_DEVICE_LOGIN' })).toBe('ورود از دستگاه جدید');
  });

  it('defaults unknown severity to low and keeps critical alerts on', () => {
    expect(severityOf('unknown').label).toBe('کم');
    expect(severityOf('critical').tone).toBe('error');
    expect(isMutableAlertSeverity('critical')).toBe(false);
    expect(isMutableAlertSeverity('medium')).toBe(true);
  });

  it('reads the deletion request status', () => {
    expect(deletionStatusOf('pending').label).toBe('در انتظار بررسی');
    expect(deletionStatusOf('weird')).toBeNull();
  });

  it('shortens long device ids and counts other devices', () => {
    expect(shortId('abcdef1234567890')).toBe('abcd…7890');
    expect(shortId('abc')).toBe('abc');
    expect(otherDevicesCount([{ is_current: true }, {}, {}])).toBe(2);
    expect(otherDevicesCount(null)).toBe(0);
  });
});

describe('resolveVerificationStatus', () => {
  it('prefers the profile field and normalises aliases', () => {
    expect(resolveVerificationStatus({ verification_status: 'suspended' }, 'approved')).toBe(
      VERIFICATION_STATUS.SUSPENDED
    );
    expect(resolveVerificationStatus({ verification_status: 'in_review' })).toBe(VERIFICATION_STATUS.PENDING);
  });

  it('falls back to the access-control profile_status', () => {
    expect(resolveVerificationStatus({}, 'approved')).toBe(VERIFICATION_STATUS.APPROVED);
    expect(resolveVerificationStatus(null, null)).toBeNull();
    expect(resolveVerificationStatus({ verification_status: '???' })).toBeNull();
  });
});
