import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import CalendarPicker from '../CalendarPicker';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const render = (props) => {
  let tree;
  act(() => {
    tree = TestRenderer.create(<CalendarPicker calendar="jalaali" {...props} />);
  });
  // cells are sized from the measured width
  const measured = tree.root.findAll((n) => typeof n.props?.onLayout === 'function')[0];
  act(() => measured.props.onLayout({ nativeEvent: { layout: { width: 350, height: 0 } } }));
  return tree;
};

const byTestId = (tree, id) => tree.root.find((n) => n.props?.testID === id && typeof n.props.onPress === 'function');
const press = (tree, id) => act(() => byTestId(tree, id).props.onPress());

describe('CalendarPicker', () => {
  it('picks year → month → day and emits the old jYYYY/jMM/jDD format', () => {
    const onSelect = jest.fn();
    const tree = render({ value: '1405/07/06', onSelect, maximumDate: '1405/07/06' });

    press(tree, 'calendar-year-chip');
    // every year is shown as a tappable tile, back 100 years
    expect(byTestId(tree, 'calendar-year-1305')).toBeTruthy();
    expect(byTestId(tree, 'calendar-year-1405')).toBeTruthy();

    press(tree, 'calendar-year-1370');
    press(tree, 'calendar-month-5');
    press(tree, 'calendar-day-12');

    expect(onSelect).toHaveBeenCalledWith('1370/05/12');
  });

  it('does not let the user pick a day after maximumDate', () => {
    const onSelect = jest.fn();
    const tree = render({ value: '1405/07/06', onSelect, maximumDate: '1405/07/06' });

    const day7 = byTestId(tree, 'calendar-day-7');
    expect(day7.props.disabled).toBe(true);
    press(tree, 'calendar-day-7');
    expect(onSelect).not.toHaveBeenCalled();

    press(tree, 'calendar-day-6');
    expect(onSelect).toHaveBeenCalledWith('1405/07/06');
  });

  it('opens on the month of a gregorian value (filters store YYYY-MM-DD)', () => {
    const onSelect = jest.fn();
    const tree = render({ value: '2026-09-28', onSelect });
    // 2026-09-28 = 6 Mehr 1405 → Mehr has 30 days, day 30 exists, 31 does not
    expect(byTestId(tree, 'calendar-day-30')).toBeTruthy();
    expect(tree.root.findAll((n) => n.props?.testID === 'calendar-day-31')).toHaveLength(0);
    press(tree, 'calendar-day-30');
    expect(onSelect).toHaveBeenCalledWith('1405/07/30');
  });
});
