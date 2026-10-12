/**
 * کیف پول مأمور خرید (بند ۹): خواندن خلاصه، اعتبارسنجی شبا و درخواست برداشت/تهاتر.
 */
import {
  WITHDRAW_METHOD,
  isValidSheba,
  normalizeSheba,
  parseAmount,
  readAgentSummary,
  validateWithdrawal,
} from '../AgentWalletApi';

const VALID_SHEBA = 'IR050170000000123456789012';

describe('readAgentSummary', () => {
  it('is null for a non-agent', () => {
    expect(readAgentSummary(null)).toBeNull();
    expect(readAgentSummary({ is_agent: false })).toBeNull();
  });

  it('reads balances as numbers', () => {
    const summary = readAgentSummary({
      is_agent: true,
      referral_code: 'LOOP-ABC123',
      commission_percent: '7.5',
      available_balance: '1500000',
      pending_balance: null,
    });
    expect(summary.referralCode).toBe('LOOP-ABC123');
    expect(summary.commissionPercent).toBe(7.5);
    expect(summary.availableBalance).toBe(1_500_000);
    expect(summary.pendingBalance).toBe(0);
  });
});

describe('sheba', () => {
  it('validates the IBAN checksum', () => {
    expect(isValidSheba(VALID_SHEBA)).toBe(true);
    expect(isValidSheba('IR060170000000123456789012')).toBe(false);
    expect(isValidSheba('IR05017')).toBe(false);
  });

  it('accepts Persian digits, spaces and a missing IR prefix', () => {
    expect(normalizeSheba('۰۵۰۱ ۷۰۰۰ ۰۰۰۰ ۱۲۳۴ ۵۶۷۸ ۹۰۱۲')).toBe(VALID_SHEBA);
    expect(isValidSheba('ir05 0170 0000 0012 3456 7890 12')).toBe(true);
  });
});

describe('validateWithdrawal', () => {
  const base = {
    method: WITHDRAW_METHOD.SHEBA,
    sheba: VALID_SHEBA,
    available: 1_000_000,
    minAmount: 100_000,
  };

  it('accepts a valid sheba withdrawal', () => {
    expect(validateWithdrawal({ ...base, amount: '500,000' })).toBeNull();
  });

  it('rejects empty, too large and too small amounts', () => {
    expect(validateWithdrawal({ ...base, amount: '' })).toBe('Enter the amount.');
    expect(validateWithdrawal({ ...base, amount: '2000000' })).toMatch('more than');
    expect(validateWithdrawal({ ...base, amount: '50000' })).toMatch('minimum');
  });

  it('needs a valid sheba only for bank withdrawals', () => {
    expect(validateWithdrawal({ ...base, amount: '500000', sheba: 'IR00' })).toMatch('Sheba');
    expect(
      validateWithdrawal({ ...base, method: WITHDRAW_METHOD.OFFSET, sheba: '', amount: '50000' })
    ).toBeNull();
  });

  it('parses Persian-digit amounts', () => {
    expect(parseAmount('۱٬۲۰۰٬۰۰۰')).toBe(1_200_000);
  });
});
