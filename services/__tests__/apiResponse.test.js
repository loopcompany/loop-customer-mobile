/**
 * The wallet, discount and referral backends all report business failures with
 * a 2xx status and answer with inconsistent envelopes. `apiResponse` is the one
 * place that absorbs both, so every rule it enforces is pinned here — a
 * regression would silently turn "code already used" into a success.
 */
import { isOk, normalize, normalizeError, request, unwrapList } from '../apiResponse';

describe('isOk', () => {
  it('treats only an explicit success:false as failure', () => {
    expect(isOk({ success: false })).toBe(false);
    expect(isOk({ success: true })).toBe(true);
  });

  it('accepts bodies that carry no success field at all', () => {
    // `/user/discounts` and `/discounts/list` return the bare collection.
    expect(isOk([{ id: 1 }])).toBe(true);
    expect(isOk({ discount_code_percent: 10 })).toBe(true);
    expect(isOk(undefined)).toBe(true);
  });
});

describe('normalize', () => {
  it('unwraps the data envelope when there is one', () => {
    const result = normalize({
      status: 200,
      data: { success: true, message: 'ok', data: { wallet_balance: 250000 } },
    });

    expect(result).toEqual({
      ok: true,
      data: { wallet_balance: 250000 },
      message: 'ok',
      code: undefined,
      status: 200,
    });
  });

  it('keeps the top-level body when there is no data field', () => {
    const result = normalize({ status: 200, data: [{ id: 1 }] });
    expect(result.data).toEqual([{ id: 1 }]);
  });

  it('reports a 200 business error as not ok, carrying its error_code', () => {
    // This is the referral case: axios resolves, but the code was not accepted.
    const result = normalize({
      status: 200,
      data: { success: false, message: 'used', error_code: 'REFERRAL_CODE_USED' },
    });

    expect(result.ok).toBe(false);
    expect(result.code).toBe('REFERRAL_CODE_USED');
  });

  it('does not mistake a present-but-null data field for a missing one', () => {
    const result = normalize({ status: 200, data: { success: true, data: null } });
    expect(result.data).toBeNull();
  });
});

describe('normalizeError', () => {
  it('carries the status and error_code off an axios error', () => {
    const result = normalizeError({
      response: { status: 402, data: { message: 'no money', error_code: 'INSUFFICIENT_BALANCE' } },
    });

    expect(result).toEqual({
      ok: false,
      data: undefined,
      message: 'no money',
      code: 'INSUFFICIENT_BALANCE',
      status: 402,
    });
  });

  it('survives a transport failure with no response', () => {
    const result = normalizeError(new Error('Network Error'));
    expect(result).toEqual({
      ok: false,
      data: undefined,
      message: undefined,
      code: undefined,
      status: undefined,
    });
  });
});

describe('request', () => {
  it('never throws — a rejected call comes back as ok:false', async () => {
    const boom = Object.assign(new Error('nope'), {
      response: { status: 409, data: { message: 'taken' } },
    });
    const result = await request(() => Promise.reject(boom));

    expect(result.ok).toBe(false);
    expect(result.status).toBe(409);
    expect(result.message).toBe('taken');
  });

  it('normalizes a resolved call', async () => {
    const result = await request(() =>
      Promise.resolve({ status: 201, data: { success: true, data: { id: 7 } } })
    );
    expect(result).toMatchObject({ ok: true, data: { id: 7 }, status: 201 });
  });
});

describe('unwrapList', () => {
  it('accepts every shape the transactions endpoint is documented to return', () => {
    expect(unwrapList([1, 2], 'transactions')).toEqual([1, 2]);
    expect(unwrapList({ transactions: [1] }, 'transactions')).toEqual([1]);
    expect(unwrapList({ data: [3] })).toEqual([3]);
  });

  it('returns an array for anything else, so a FlatList never receives a non-array', () => {
    expect(unwrapList(null)).toEqual([]);
    expect(unwrapList({ pagination: {} }, 'transactions')).toEqual([]);
    expect(unwrapList('nope')).toEqual([]);
  });
});
