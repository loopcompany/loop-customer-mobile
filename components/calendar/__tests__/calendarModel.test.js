import {
  JALAALI,
  GREGORIAN,
  parseDate,
  formatDate,
  resolveBounds,
  isDayDisabled,
  isMonthDisabled,
  clampMonth,
  addMonths,
  monthGrid,
  monthLength,
  yearRange,
  DEFAULT_YEAR_SPAN,
} from '../calendarModel';

// 1405/07/06 = 2026-09-28
const NOW = new Date(2026, 8, 28);

describe('calendarModel', () => {
  describe('parseDate', () => {
    it('reads Jalaali strings with Persian or Latin digits', () => {
      expect(parseDate('1370/05/12', JALAALI)).toEqual({ y: 1370, m: 5, d: 12 });
      expect(parseDate('۱۳۷۰/۰۵/۱۲', JALAALI)).toEqual({ y: 1370, m: 5, d: 12 });
    });

    it('converts between systems (gregorian API value shown on a Jalaali calendar)', () => {
      expect(parseDate('2026-09-28', JALAALI)).toEqual({ y: 1405, m: 7, d: 6 });
      expect(parseDate('1405/07/06', GREGORIAN)).toEqual({ y: 2026, m: 9, d: 28 });
      expect(parseDate(NOW, JALAALI)).toEqual({ y: 1405, m: 7, d: 6 });
    });

    it('ignores a trailing time part and rejects garbage / impossible dates', () => {
      expect(parseDate('1405/07/06 10:30', JALAALI)).toEqual({ y: 1405, m: 7, d: 6 });
      expect(parseDate('', JALAALI)).toBeNull();
      expect(parseDate(null, JALAALI)).toBeNull();
      expect(parseDate('abc', JALAALI)).toBeNull();
      expect(parseDate('1404/12/30', JALAALI)).toBeNull(); // 1404 is not leap
      expect(parseDate('2026-02-30', GREGORIAN)).toBeNull();
    });
  });

  it('formats exactly like react-native-modern-datepicker did', () => {
    expect(formatDate(JALAALI, { y: 1370, m: 5, d: 2 })).toBe('1370/05/02');
    expect(formatDate(GREGORIAN, { y: 1991, m: 8, d: 3 })).toBe('1991/08/03');
  });

  it('knows Esfand leap years', () => {
    expect(monthLength(JALAALI, 1403, 12)).toBe(30);
    expect(monthLength(JALAALI, 1404, 12)).toBe(29);
    expect(monthLength(JALAALI, 1405, 1)).toBe(31);
    expect(monthLength(JALAALI, 1405, 7)).toBe(30);
  });

  describe('monthGrid', () => {
    it('starts Jalaali weeks on Saturday', () => {
      // 1 Mehr 1405 = Wednesday 23 Sep 2026 → Sat Sun Mon Tue empty, Wed first.
      const cells = monthGrid(JALAALI, 1405, 7);
      expect(cells.slice(0, 4)).toEqual([null, null, null, null]);
      expect(cells[4]).toEqual({ y: 1405, m: 7, d: 1 });
      expect(cells.length % 7).toBe(0);
      expect(cells.filter(Boolean)).toHaveLength(30);
    });

    it('starts Gregorian weeks on Sunday', () => {
      // 1 Sep 2026 is a Tuesday.
      const cells = monthGrid(GREGORIAN, 2026, 9);
      expect(cells.slice(0, 2)).toEqual([null, null]);
      expect(cells[2]).toEqual({ y: 2026, m: 9, d: 1 });
    });
  });

  describe('resolveBounds', () => {
    it('defaults to 100 years back up to this year', () => {
      const b = resolveBounds(JALAALI, { now: NOW });
      expect(b.maxYear).toBe(1405);
      expect(b.minYear).toBe(1405 - DEFAULT_YEAR_SPAN);
      expect(b.min).toBeNull();
      expect(b.max).toBeNull();
    });

    it('uses the given limits, in any format', () => {
      const b = resolveBounds(JALAALI, { minimumDate: '2026-09-28', maximumDate: '1406/01/15', now: NOW });
      expect(b.min).toEqual({ y: 1405, m: 7, d: 6 });
      expect(b.max).toEqual({ y: 1406, m: 1, d: 15 });
      expect([b.minYear, b.maxYear]).toEqual([1405, 1406]);
    });

    it('always includes an already-selected year', () => {
      const b = resolveBounds(JALAALI, { selected: { y: 1290, m: 1, d: 1 }, now: NOW });
      expect(b.minYear).toBe(1290);
    });

    it('yearRange lists every year inclusive', () => {
      expect(yearRange({ minYear: 1400, maxYear: 1403 })).toEqual([1400, 1401, 1402, 1403]);
    });
  });

  it('disables days and whole months outside the bounds', () => {
    const bounds = { min: { y: 1405, m: 7, d: 6 }, max: { y: 1405, m: 9, d: 10 } };
    expect(isDayDisabled({ y: 1405, m: 7, d: 5 }, bounds)).toBe(true);
    expect(isDayDisabled({ y: 1405, m: 7, d: 6 }, bounds)).toBe(false);
    expect(isDayDisabled({ y: 1405, m: 9, d: 11 }, bounds)).toBe(true);
    expect(isMonthDisabled(JALAALI, 1405, 6, bounds)).toBe(true);
    expect(isMonthDisabled(JALAALI, 1405, 7, bounds)).toBe(false); // partly inside
    expect(isMonthDisabled(JALAALI, 1405, 10, bounds)).toBe(true);
  });

  it('clamps the shown month and steps across year boundaries', () => {
    const bounds = { min: { y: 1405, m: 7, d: 6 }, max: null };
    expect(clampMonth(1400, 3, bounds)).toEqual({ y: 1405, m: 7 });
    expect(clampMonth(1406, 3, bounds)).toEqual({ y: 1406, m: 3 });
    expect(addMonths({ y: 1405, m: 12 }, 1)).toEqual({ y: 1406, m: 1 });
    expect(addMonths({ y: 1405, m: 1 }, -1)).toEqual({ y: 1404, m: 12 });
  });
});
