/**
 * بند ۴ سند دسکتاپ ۲: خلاصه‌ی سفارش باید متن گزینه‌ها و توضیح کاربر را نشان
 * دهد، نه «۱».
 */
import { counterLines, procurementLines, selectedTitles, titleWithNote } from '../summaryLines';

const L = (fa) => fa;
const OPTIONS = [
  { id: 'no_boot', title: 'روشن نمی‌شود' },
  { id: 'slow', title: 'کند است' },
];

describe('selectedTitles', () => {
  it('lists the chosen option texts instead of a count', () => {
    expect(selectedTitles(OPTIONS, ['no_boot'])).toBe('روشن نمی‌شود');
    expect(selectedTitles(OPTIONS, ['no_boot', 'slow'])).toBe('روشن نمی‌شود، کند است');
  });

  it('handles a single value, unknown ids and nothing selected', () => {
    expect(selectedTitles(OPTIONS, 'slow')).toBe('کند است');
    expect(selectedTitles(OPTIONS, ['custom'])).toBe('custom');
    expect(selectedTitles(OPTIONS, null)).toBe('');
  });
});

describe('procurementLines', () => {
  const catalog = [
    { id: 'accessories', title: 'لوازم جانبی' },
    { id: 'monitor', title: 'مانیتور' },
  ];

  it('includes the user note (e.g. mouse) after the counts', () => {
    expect(
      procurementLines({ accessories: { new: 1, used: 0, desc: ' ماوس ' } }, catalog, L)
    ).toEqual([
      { label: 'لوازم جانبی / آکبند', value: 1 },
      { label: 'لوازم جانبی / توضیحات', value: 'ماوس' },
    ]);
  });

  it('ignores a note on an item that was not ordered', () => {
    expect(procurementLines({ monitor: { new: 0, used: 0, desc: 'x' } }, catalog, L)).toEqual([]);
  });
});

it('counterLines adds the note line', () => {
  expect(
    counterLines(
      { laptop: { count: 2, desc: 'باتری' }, case: { count: 0, desc: 'y' } },
      [
        { id: 'laptop', title: 'لپ تاپ' },
        { id: 'case', title: 'کیس' },
      ],
      L
    )
  ).toEqual([
    { label: 'لپ تاپ', value: 2 },
    { label: 'لپ تاپ / توضیحات', value: 'باتری' },
  ]);
});

it('titleWithNote appends the note in parentheses', () => {
  expect(titleWithNote('لوازم جانبی', ' ماوس ')).toBe('لوازم جانبی (ماوس)');
  expect(titleWithNote('مانیتور', '')).toBe('مانیتور');
});
