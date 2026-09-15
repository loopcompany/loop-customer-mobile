// جدول اقلام / خدمات رسید.
//
// جدولِ اقلام تا ۱۱ ستون دارد (ردیف، کالا، برند، مدل، گارانتی، مهلت تست، بارکد،
// وضعیت، تعداد، قیمت واحد، قیمت کل). این عرض در هیچ موبایلی جا نمی‌شود، پس
// ستون‌ها عرض ثابت دارند و خودِ جدول افقی اسکرول می‌کند - همان استثنایی که
// قوانین پروژه برای جدول‌ها قائل شده‌اند (بدنه‌ی صفحه هرگز افقی اسکرول نمی‌کند).
//
// ردیف «جمع کل» بیرون از ناحیه‌ی اسکرول است تا همیشه دیده شود.

import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getFontFamily } from '@theme/Typography';
import { formatPrice } from '@helpers/Common';
import { PRICE_ON_REQUEST } from '@services/receipt';
import { receiptColors as C, layout as L, fonts as F } from './receiptDesign';

const cellText = (value) => (value == null ? '' : String(value).trim());

/** قیمت یا «استعلام» - مسیرهای سازمانی قیمت ندارند. */
const priceText = (value) =>
  value == null || value === '' ? PRICE_ON_REQUEST : formatPrice(value);

/**
 * @param {object} props
 * @param {{key: string, title: string, width: number, isPrice?: boolean}[]} props.columns
 * @param {object[]} props.rows
 * @param {string} props.totalLabel
 * @param {number|null} props.total
 */
function ReceiptTable({ columns, rows, totalLabel, total }) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'fa';
  const s = useMemo(() => createStyles(lang), [lang]);

  const tableWidth = useMemo(
    () => columns.reduce((sum, column) => sum + column.width, 0),
    [columns]
  );

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: tableWidth }}>
          <View style={s.headRow}>
            {columns.map((column) => (
              <Text
                key={column.key}
                style={[s.headCell, { width: column.width }]}
                numberOfLines={2}
              >
                {column.title}
              </Text>
            ))}
          </View>

          {rows.map((row, index) => (
            <View key={row.id ?? index} style={s.bodyRow}>
              {columns.map((column) => (
                <Text
                  key={column.key}
                  style={[
                    s.bodyCell,
                    { width: column.width },
                    column.key === 'index' && s.indexCell,
                  ]}
                >
                  {column.key === 'index'
                    ? index + 1
                    : column.isPrice
                      ? priceText(row[column.key])
                      : cellText(row[column.key])}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ترتیب JSX «مقدار، برچسب» است؛ 'row' یعنی عدد چپ و برچسب راست. */}
      <View style={s.totalRow}>
        <Text style={s.totalValue}>{total == null ? PRICE_ON_REQUEST : formatPrice(total)}</Text>
        <Text style={s.totalLabel}>{totalLabel}</Text>
      </View>
    </View>
  );
}

const createStyles = (lang) => {
  const bold = getFontFamily('bold', lang);
  const light = getFontFamily('light', lang);
  return {
    // ستون‌ها از راست شروع می‌شوند: «ردیف» اولین عضو آرایه و راست‌ترین ستون است.
    headRow: {
      flexDirection: 'row-reverse',
      borderBottomWidth: 1,
      borderBottomColor: C.rowDivider,
      paddingVertical: 8,
    },
    headCell: {
      fontFamily: light,
      fontSize: F.tableHead,
      color: C.tableHead,
      textAlign: 'center',
      paddingHorizontal: 2,
    },
    bodyRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: C.rowDivider,
      paddingVertical: 8,
    },
    bodyCell: {
      fontFamily: light,
      fontSize: F.tableCell,
      color: C.textBody,
      textAlign: 'center',
      paddingHorizontal: 2,
    },
    indexCell: { fontFamily: bold },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: L.rowGap,
      paddingVertical: 10,
    },
    totalLabel: { fontFamily: light, fontSize: F.totalLabel, color: C.textBody },
    totalValue: { fontFamily: bold, fontSize: F.totalValue, color: C.textNavy },
  };
};

export default React.memo(ReceiptTable);
