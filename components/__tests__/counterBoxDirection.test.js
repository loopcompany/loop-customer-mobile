/**
 * جعبه‌های «آیکون + عنوان + شمارشگر» باید در فارسی از راست شروع شوند (آیکون
 * راست، عنوان کنارش، شمارشگر در انتهای چپ) و در انگلیسی دقیقاً برعکس.
 *
 * چند مورد از این کارت‌ها جهتشان با 'row' ثابت کد شده بود و شمارشگر هم بین
 * آیکون و عنوان می‌نشست؛ این تست جلوی برگشتن آن حالت را می‌گیرد.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import i18n from 'i18next';
import Counter from '../Counter';
import CheckBox from '../CheckBox';
import RadioButton from '../RadioButton';
import QuantityStepper from '../QuantityStepper';
import {
  CounterRow,
  DeviceCountRow,
  HardwareCard,
  LabeledCounterRow,
  ProcurementCard,
} from '../OrgSelectionKit';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: require('i18next') }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: () => undefined,
}));
// stepSlice خودِ Redux Toolkit را می‌آورد و immer در transformIgnorePatterns
// نیست؛ برای این تستِ چیدمانی فقط به شکل اکشن‌ها نیاز داریم.
jest.mock('@slices/stepSlice', () => ({
  increment: (a) => ({ type: 'inc', payload: a }),
  decrement: (a) => ({ type: 'dec', payload: a }),
  updateCheckbox: (a) => ({ type: 'chk', payload: a }),
  updateRadioButton: (a) => ({ type: 'radio', payload: a }),
  setCounterInputValue: (a) => ({ type: 'input', payload: a }),
  addStep: (a) => ({ type: 'addStep', payload: a }),
}));

const field = {
  id: 1,
  title: 'field',
  field_details: [
    { id: 10, title: 'item title', value: 2, has_counter: 1, image_path: 'x.png', price: 0 },
  ],
};

const walk = (node, fn) => {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) return node.forEach((n) => walk(n, fn));
  fn(node);
  (node.children || []).forEach((c) => walk(c, fn));
};

const flatStyle = (node) => {
  const style = node.props?.style;
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.flat(Infinity).filter((s) => s && typeof s === 'object'));
  }
  return style || {};
};

const contains = (node, pred) => {
  let found = false;
  walk(node, (n) => {
    if (pred(n)) found = true;
  });
  return found;
};

const hasTitle = (n) => n.children?.some?.((c) => c === 'item title');
const isStepperButton = (n) => n.props?.accessibilityRole === 'button';

const render = (el) => {
  let tree;
  act(() => {
    tree = renderer.create(el);
  });
  return tree;
};

// آکاردئون این فیلدها پیش‌فرض بسته است؛ اولین Pressable سربرگ آن است.
const expand = (tree) => {
  const pressables = tree.root.findAll((n) => typeof n.props?.onPress === 'function', {
    deep: true,
  });
  if (pressables.length) act(() => pressables[0].props.onPress());
};

// درونی‌ترین ردیفی که هم عنوان و هم دکمه‌های شمارشگر را در خود دارد.
const rowWithTitleAndStepper = (json) => {
  const rows = [];
  walk(json, (n) => {
    const style = flatStyle(n);
    if (!style.flexDirection) return;
    if (contains(n, hasTitle) && contains(n, isStepperButton)) {
      rows.push({ direction: style.flexDirection, node: n });
    }
  });
  return rows[rows.length - 1];
};

describe.each([
  ['fa', 'row-reverse'],
  ['en', 'row'],
])('%s', (lang, expected) => {
  beforeEach(() => {
    i18n.language = lang;
    i18n.resolvedLanguage = lang;
  });

  test.each([
    ['Counter', () => <Counter step={0} data={field} />],
    ['CheckBox', () => <CheckBox step={0} data={field} />],
    ['RadioButton', () => <RadioButton step={0} data={field} setLoading={() => {}} />],
  ])('%s puts the title and the stepper in one direction-aware row', (name, element) => {
    const tree = render(element());
    if (!contains(tree.toJSON(), hasTitle)) expand(tree);

    const row = rowWithTitleAndStepper(tree.toJSON());

    expect(row).toBeDefined();
    expect(row.direction).toBe(expected);
  });

  test('org selection cards follow the same direction', () => {
    expect(
      render(<HardwareCard title="t" count={1} />).toJSON().children[0].props.style.flexDirection
    ).toBe(expected);
    expect(
      render(<ProcurementCard title="t" newCount={0} usedCount={0} />).toJSON().children[0].props
        .style.flexDirection
    ).toBe(expected);
    expect(render(<DeviceCountRow title="t" count={0} />).toJSON().props.style.flexDirection).toBe(
      expected
    );
    expect(
      render(<LabeledCounterRow label="l" count={0} />).toJSON().props.style.flexDirection
    ).toBe(expected);
    expect(render(<CounterRow title="t" count={0} />).toJSON().props.style.flexDirection).toBe(
      expected
    );
  });

  test('org cards order the row as icon, then title, then counter', () => {
    const hardware = render(<HardwareCard title="my title" count={1} />).toJSON().children[0];
    expect(hardware.children).toHaveLength(3);
    expect(hardware.children[1].children[0]).toBe('my title');

    const procurement = render(
      <ProcurementCard title="my title" newCount={0} usedCount={0} />
    ).toJSON().children[0];
    expect(procurement.children).toHaveLength(3);
    expect(procurement.children[1].children[0]).toBe('my title');
  });

  test('the stepper control itself keeps a fixed − / value / + order', () => {
    const stepper = render(<QuantityStepper value={3} />).toJSON();
    expect(flatStyle(stepper).flexDirection).toBe('row');
  });
});
