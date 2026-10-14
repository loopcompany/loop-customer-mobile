// ProductIssueScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  I18nManager,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ScreenHeaders from '@components/ScreenHeaders';
import NewStyles from '@styles/NewStyles';
import Footer from './Footer';
import OrderDropdown from '@components/OrderDropdown';
import DatePickerModal from '@components/DatePickerModal';
import { formatDate, formatDateTime } from '@helpers/Common';
import { orderPaidAmount } from '@utils/orderPaidAmount';
import { findOrderByNumber, orderProductName } from '@utils/faultReportOrder';
import { faultReportAPI } from '@services/Api';
import { showToastOrAlert } from '@helpers/Common';
import { themeColor1, themeColor4, colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import Button from '@components/Button';
import { createStyles } from '@styles/NewStyles';
import FooterSpacer from '@components/FooterSpacer';


export default function ProductIssueScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const [form, setForm] = useState({
    name: '',
    orderDate: '',
    completeDate: '',
    orderNumber: '',
    techCode: '',
    amount: '',
    desc: '',
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // لیست سفارش‌ها را OrderDropdown بارگذاری می‌کند و به اینجا می‌دهد؛ جستجوی
  // شماره‌ی تایپ‌شده روی همین لیست انجام می‌شود.
  const [orders, setOrders] = useState([]);
  const [orderNumberInput, setOrderNumberInput] = useState('');
  // اگر سرور برای سفارش هیچ نامی برنگرداند، فیلد نام باید قابل‌ویرایش بماند؛
  // وگرنه فیلدی قفل و اجباری، ثبت گزارش را غیرممکن می‌کرد.
  const [nameAutoFilled, setNameAutoFilled] = useState(false);

  // Date picker states
  const [orderDatePickerVisible, setOrderDatePickerVisible] = useState(false);
  const [completeDatePickerVisible, setCompleteDatePickerVisible] = useState(false);

  const handleChange = (key, value) => {
    if (key === 'amount') {
      // Remove commas before setting the value
      value = value.replace(/,/g, '');
    }
    setForm({ ...form, [key]: value });
  };

  const handleOrderSelect = (item) => {
    setSelectedOrder(item);
    setOrderNumberInput(String(item.order_id));
    const productName = orderProductName(item);
    setNameAutoFilled(Boolean(productName));

    // همه‌ی فیلدها جز «توضیحات» از خودِ سفارش پر می‌شوند.
    // تاریخ‌های فرم همان قالب قبلی (فقط تاریخ) را برای سرور نگه می‌دارند؛
    // نمایش با تاریخ و ساعت از خودِ سفارش ساخته می‌شود.
    setForm(prev => ({
      ...prev,
      orderNumber: item.order_id.toString(),
      techCode: item.technician_referral_code || '',
      amount: orderPaidAmount(item),
      name: productName,
      orderDate: item.created_at ? formatDate(item.created_at) : '',
      completeDate: item.finished_at ? formatDate(item.finished_at) : '',
    }));
  };

  const handleOrderNumberLookup = () => {
    if (!orderNumberInput.trim()) {
      showToastOrAlert(t('Enter order number'));
      return;
    }
    const found = findOrderByNumber(orders, orderNumberInput);
    if (!found) {
      showToastOrAlert(t('No order was found with this number.'));
      return;
    }
    handleOrderSelect(found);
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedOrder) {
      showToastOrAlert(t('Please select an order'));
      return;
    }

    if (!form.name || form.name.trim().length < 3) {
      showToastOrAlert(t('Please enter product/service name (minimum 3 characters)'));
      return;
    }

    if (!form.desc || form.desc.trim().length < 10) {
      showToastOrAlert(t('Please enter description (minimum 10 characters)'));
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        order_id: selectedOrder.order_id,
        product_name: form.name,
        ordered_at: form.orderDate,
        delivered_at: form.completeDate,
        technician_code: form.techCode,
        paid_price: form.amount,
        description: form.desc,
      };

      console.log('Submitting fault report with payload:', payload);
      const response = await faultReportAPI.create(payload);

      if (response.success) {
        showToastOrAlert(response.message || t('Fault report successfully submitted'));

        // Reset form
        setForm({
          name: '',
          orderDate: '',
          completeDate: '',
          orderNumber: '',
          techCode: '',
          amount: '',
          desc: '',
        });
        setSelectedOrder(null);
        setOrderNumberInput('');
        setNameAutoFilled(false);

        // Navigate back or to reports list
        // navigation.goBack();
      }
    } catch (error) {
      // Detailed error handling: surface server message, validation errors or fallback to generic
      console.error('Error submitting fault report:', error);
      const resp = error.response?.data;
      let errorMessage = t('Error submitting fault report');

      if (resp) {
        // Prefer the server message
        if (resp.message) {
          errorMessage = resp.message;
        } else if (resp.error_code) {
          errorMessage = resp.error_code;
        } else if (resp.errors && typeof resp.errors === 'object') {
          // Join first field's errors into a readable string
          const firstKey = Object.keys(resp.errors)[0];
          const errs = resp.errors[firstKey];
          if (Array.isArray(errs)) {
            errorMessage = errs.join('\n');
          } else {
            errorMessage = String(errs);
          }
        } else {
          // Fallback: stringify the whole response (dev only)
          try {
            errorMessage = JSON.stringify(resp);
          } catch (e) {
            errorMessage = t('Unknown server error');
          }
        }
        // Log status code and full response for debugging
        console.debug('Fault report API response status:', error.response?.status, resp);
      } else {
        // No response (network or other axios error)
        errorMessage = error.message || errorMessage;
      }

      showToastOrAlert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={{ top: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={t('Service / Product Fault')} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>
        <ScrollView contentContainerStyle={[NewStyles.wrapper, { paddingBottom: 100 }]}>
          {/* توضیح بالای فرم - «گزارش ایرادات سفارش / محصول» */}
          <View style={styles.introCard}>
            <Ionicons name="construct-outline" size={22} color={colors.primary.color} />
            <Text style={[NewStyles.text10, styles.introText]}>
              {t('Please describe the issue or discrepancy you noticed in the order or product so it can be reviewed and followed up.')}
            </Text>
          </View>
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Order Number')} </Text>

          <View style={styles.lookupRow}>
            <TextInput
              placeholder={t('Enter order number')}
              value={orderNumberInput}
              onChangeText={setOrderNumberInput}
              onSubmitEditing={handleOrderNumberLookup}
              keyboardType="number-pad"
              returnKeyType="search"
              style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, styles.lookupInput]}
              placeholderTextColor={colors.textMuted.color}
            />
            <TouchableOpacity style={styles.lookupButton} onPress={handleOrderNumberLookup}>
              <Text style={styles.lookupButtonText}>{t('Find order')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[NewStyles.text10, styles.lookupHint]}>{t('Or select from your orders')}</Text>

          <OrderDropdown
            value={selectedOrder?.value}
            onChange={handleOrderSelect}
            onOrdersLoaded={setOrders}
            placeholder={t('Select Order Number')}
          />
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Product / Service Name')} </Text>

          <TextInput placeholder={t('Product / Service Name')} editable={Boolean(selectedOrder) && !nameAutoFilled} value={form.name} onChangeText={(text) => handleChange('name', text)} style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]} placeholderTextColor={colors.textMuted.color} />
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Order Registration Date')} </Text>

          <TouchableOpacity disabled={true} style={[NewStyles.textInput, NewStyles.border10]} onPress={() => setOrderDatePickerVisible(true)}>
            <Text style={[NewStyles.text10, !selectedOrder?.created_at && styles.placeholder]}>
              {formatDateTime(selectedOrder?.created_at) || t('Order Registration Date')}
            </Text>
          </TouchableOpacity>
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Delivery / Completion Date')}</Text>

          <TouchableOpacity disabled={true} style={[NewStyles.textInput, NewStyles.border10]} onPress={() => setCompleteDatePickerVisible(true)}>
            <Text style={[NewStyles.text10, !selectedOrder?.finished_at && styles.placeholder]}>
              {formatDateTime(selectedOrder?.finished_at) || t('Delivery / Completion Date')}
            </Text>
          </TouchableOpacity>

          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Technician Code')}</Text>

          <TextInput
            placeholder={t('Technician Code')}
            value={form.techCode}
            onChangeText={(text) => handleChange('techCode', text)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
            placeholderTextColor={colors.textMuted.color}
            editable={false}
          />
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Paid Amount')}</Text>

          <TextInput
            placeholder={t('Paid Amount')}
            value={form.amount?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            onChangeText={(text) => handleChange('amount', text)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10]}
            placeholderTextColor={colors.textMuted.color}
            keyboardType="numeric"
            editable={false}
          />
          <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{t('Description')}<Text style={NewStyles.title6}>*</Text></Text>

          <TextInput
            placeholder={t('Description')}
            value={form.desc}
            onChangeText={(text) => handleChange('desc', text)}
            style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { height: 120, textAlignVertical: 'top' }]}
            placeholderTextColor={colors.textMuted.color}
            multiline
          />

          <View style={styles.spacer} />


          <Button title={t('Submit')} onPress={handleSubmit} loading={isSubmitting} />

          <FooterSpacer />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      <DatePickerModal
        datePickerModal={orderDatePickerVisible}
        setDatePickerModal={setOrderDatePickerVisible}
        birthDate={form.orderDate}
        setBirthDate={(date) => setForm(prev => ({ ...prev, orderDate: date }))}
      />

      <DatePickerModal
        datePickerModal={completeDatePickerVisible}
        setDatePickerModal={setCompleteDatePickerVisible}
        birthDate={form.completeDate}
        setBirthDate={(date) => setForm(prev => ({ ...prev, completeDate: date }))}
      />

    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  // جهت ردیف از NewStyles.row می‌آید (فارسی: آیکون سمت راست).
  introCard: {
    ...NewStyles.row,
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primary.bgColor(0.08),
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  introText: {
    flex: 1,
    lineHeight: 24,
  },
  placeholder: {
    color: colors.textMuted.color,
  },
  lookupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lookupInput: {
    // NewStyles.textInput عرض ۱۰۰٪ دارد و دکمه را از سطر بیرون می‌انداخت.
    flex: 1,
    width: 'auto',
    minWidth: 0,
  },
  lookupButton: {
    backgroundColor: colors.primary.bgColor(1),
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  lookupButtonText: {
    color: colors.white.color,
    fontSize: fontSize.sm,
    fontFamily: getFontFamily('bold', 'fa'),
  },
  lookupHint: {
    marginBottom: spacing.xs,
    color: colors.textSecondary.color,
  },
  spacer: {
    height: 20,
  },
  saveBtn: {
    backgroundColor: themeColor1.bgColor(1),
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveBtnDisabled: {
    backgroundColor: themeColor4.bgColor(0.5),
  },
});
