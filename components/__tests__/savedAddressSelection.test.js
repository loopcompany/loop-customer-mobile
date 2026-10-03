import { findNewAddressId, isAddressAvailable } from '../savedAddressSelection';

describe('isAddressAvailable', () => {
  const addresses = [{ id: 5 }, { id: '7' }];

  it('matches ids regardless of string/number type', () => {
    expect(isAddressAvailable(addresses, '5')).toBe(true);
    expect(isAddressAvailable(addresses, 7)).toBe(true);
  });

  it('is false for a deleted address or no selection', () => {
    expect(isAddressAvailable(addresses, 9)).toBe(false);
    expect(isAddressAvailable(addresses, null)).toBe(false);
    expect(isAddressAvailable(undefined, 5)).toBe(false);
  });
});

describe('findNewAddressId', () => {
  it('returns the id that was not there before', () => {
    expect(findNewAddressId(['1', '2'], [{ id: 1 }, { id: 2 }, { id: 3 }])).toBe(3);
  });

  it('returns null when nothing was added', () => {
    expect(findNewAddressId(['1'], [{ id: 1 }])).toBeNull();
    expect(findNewAddressId(null, [{ id: 1 }])).toBeNull();
  });

  it('picks the newest when several were added', () => {
    expect(findNewAddressId([], [{ id: 4 }, { id: 12 }, { id: 9 }])).toBe(12);
  });
});
