import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import DatePickerModal from '../../DatePickerModal';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('../../Button', () => {
  const { Text } = require('react-native');
  return ({ title, onPress }) => <Text onPress={onPress}>{title}</Text>;
});

const layout = (tree) => {
  const measured = tree.root.findAll((n) => typeof n.props?.onLayout === 'function')[0];
  act(() => measured.props.onLayout({ nativeEvent: { layout: { width: 350, height: 0 } } }));
};
const dayButton = (tree, d) =>
  tree.root.find((n) => n.props?.testID === `calendar-day-${d}` && typeof n.props.onPress === 'function');

describe('DatePickerModal', () => {
  const pad = (n) => String(n).padStart(2, '0');
  const cases = [
    ['fa', () => {
      const { toJalaali } = require('jalaali-js');
      const t = new Date();
      const { jy, jm, jd } = toJalaali(t.getFullYear(), t.getMonth() + 1, t.getDate());
      return { d: jd, expected: `${jy}/${pad(jm)}/${pad(jd)}` };
    }],
    ['en', () => {
      const t = new Date();
      return { d: t.getDate(), expected: `${t.getFullYear()}/${pad(t.getMonth() + 1)}/${pad(t.getDate())}` };
    }],
  ];

  it.each(cases)('keeps the old output format in %s and caps at today by default', (lang, todayCase) => {
    const i18n = require('i18next');
    const previous = i18n.language;
    i18n.language = lang;
    try {
      const setBirthDate = jest.fn();
      const onDateChange = jest.fn();
      let tree;
      act(() => {
        tree = TestRenderer.create(
          <DatePickerModal
            datePickerModal
            setDatePickerModal={jest.fn()}
            birthDate=""
            setBirthDate={setBirthDate}
            onDateChange={onDateChange}
          />
        );
      });
      layout(tree);

      const { d, expected } = todayCase();
      act(() => dayButton(tree, d).props.onPress());
      expect(setBirthDate).toHaveBeenCalledWith(expected);
      expect(onDateChange).toHaveBeenCalledWith(expected);

      // no maximumDate → the day after today is disabled
      const later = tree.root.findAll(
        (n) => n.props?.testID === `calendar-day-${d + 1}` && typeof n.props.onPress === 'function'
      );
      if (later.length) expect(later[0].props.disabled).toBe(true);
    } finally {
      i18n.language = previous;
    }
  });

  it('closes from the confirm button', () => {
    const setDatePickerModal = jest.fn();
    let tree;
    act(() => {
      tree = TestRenderer.create(
        <DatePickerModal datePickerModal setDatePickerModal={setDatePickerModal} birthDate="" setBirthDate={jest.fn()} />
      );
    });
    const confirm = tree.root.find((n) => n.props?.children === 'Confirm' && typeof n.props.onPress === 'function');
    act(() => confirm.props.onPress());
    expect(setDatePickerModal).toHaveBeenCalledWith(false);
  });
});
