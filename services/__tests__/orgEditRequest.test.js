/**
 * بند ۱۰: کاربر سازمانی فیلدهای آزاد را خودش ویرایش می‌کند؛ فیلدهای قفل فقط
 * پس از تأیید «درخواست ویرایش» توسط پنل. پیش‌فرض همیشه قفل است.
 */
import {
  EDIT_REQUEST_STATUS,
  FREE_PROFILE_FIELDS,
  LOCKED_PROFILE_FIELDS,
  isProfileFieldEditable,
  pickEditableProfileValues,
  readEditRequestState,
} from '../OrganizationAccountApi';

describe('readEditRequestState', () => {
  it('is locked with no request', () => {
    const state = readEditRequestState({});
    expect(state.unlocked).toBe(false);
    expect(state.unlockedFields).toEqual([]);
    expect(state.canRequest).toBe(true);
  });

  it('blocks a second request while one is pending', () => {
    const state = readEditRequestState({ edit_request: { id: 1, status: 'pending' } });
    expect(state.status).toBe(EDIT_REQUEST_STATUS.PENDING);
    expect(state.canRequest).toBe(false);
    expect(state.unlocked).toBe(false);
  });

  it('unlocks every locked field once approved', () => {
    const state = readEditRequestState({ edit_request: { status: 1 } });
    expect(state.unlocked).toBe(true);
    expect(state.unlockedFields).toEqual(LOCKED_PROFILE_FIELDS);
    expect(state.canRequest).toBe(false);
  });

  it('unlocks only the fields the panel approved', () => {
    const state = readEditRequestState({
      edit_request: { status: 'approved' },
      unlocked_fields: ['organization_name', 'agent_name', 'not_a_field'],
    });
    expect(state.unlockedFields).toEqual(['organization_name']);
  });

  it('honours an explicit server lock even for an approved request', () => {
    expect(
      readEditRequestState({ edit_request: { status: 'approved' }, locked_fields_unlocked: false })
        .unlocked
    ).toBe(false);
  });

  it('locks again after the edit was used', () => {
    const state = readEditRequestState({ edit_request: { status: 'used' } });
    expect(state.unlocked).toBe(false);
    expect(state.canRequest).toBe(true);
  });
});

describe('field editability and payload', () => {
  it('free fields are editable only while editing', () => {
    expect(isProfileFieldEditable('agent_name', { editing: false })).toBe(false);
    expect(isProfileFieldEditable('agent_name', { editing: true })).toBe(true);
    expect(isProfileFieldEditable('organization_name', { editing: true })).toBe(false);
    expect(
      isProfileFieldEditable('organization_name', {
        editing: true,
        unlockedFields: ['organization_name'],
      })
    ).toBe(true);
  });

  it('never sends a locked field without approval', () => {
    const values = {
      organization_name: 'X',
      agent_name: 'Y',
      manager_mobile: '0912',
      postal_code: '1',
    };
    expect(pickEditableProfileValues(values, [])).toEqual({ agent_name: 'Y', postal_code: '1' });
    expect(pickEditableProfileValues(values, ['organization_name'])).toEqual({
      organization_name: 'X',
      agent_name: 'Y',
      postal_code: '1',
    });
  });

  it('keeps the two lists disjoint', () => {
    expect(FREE_PROFILE_FIELDS.filter((f) => LOCKED_PROFILE_FIELDS.includes(f))).toEqual([]);
  });
});
