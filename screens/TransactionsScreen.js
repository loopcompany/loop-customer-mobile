import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import DatePicker from 'react-native-modern-datepicker';
import moment from 'moment-jalaali';
import { useTranslation } from 'react-i18next';
import { createStyles } from '../styles/NewStyles';
import ScreenHeaders from '../components/ScreenHeaders';
import { formatPrice, formatDateTime, showToastOrAlert } from '../helpers/Common';
import { themeColor0, themeColor1, themeColor11, themeColor4, themeColor6, themeColor7, themeColor8 } from '../theme/Color';
import { getTransactions } from '../services/WalletApi';

export default function TransactionsScreen() {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const token = useSelector((state) => state?.auth?.token);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState(null);

  // فیلتر تاریخ
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [tempFromDate, setTempFromDate] = useState(null);
  const [tempToDate, setTempToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [fromDate, toDate]);

  const fetchTransactions = async () => {
    try {
      // ساختن پارامترهای فیلتر
      const params = {};
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      // استفاده از service
      const data = await getTransactions(token, params);

      if (data?.success) {
        setTransactions(data.data.transactions || []);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('Error retrieving transactions');
      showToastOrAlert(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  // تبدیل تاریخ جلالی به میلادی (Y-m-d)
  const convertJalaliToGregorian = (jalaliDate) => {
    if (!jalaliDate) return null;
    // jalaliDate format: 1403/09/08
    const gregorian = moment(jalaliDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
    return gregorian;
  };

  // باز کردن modal فیلتر
  const openFilterModal = () => {
    setTempFromDate(fromDate);
    setTempToDate(toDate);
    setShowFilterModal(true);
  };

  // اعمال فیلتر
  const applyFilter = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    setShowFilterModal(false);
    setLoading(true);
  };

  // پاک کردن فیلتر
  const clearFilter = () => {
    setFromDate(null);
    setToDate(null);
    setTempFromDate(null);
    setTempToDate(null);
    setShowFilterModal(false);
    setLoading(true);
  };

  // تبدیل type به متن فارسی
  const getTypeText = (type) => {
    switch (type) {
      case '1':
        return t('Wallet recharge');
      case '2':
        return t('Online Payment');
      case '3':
        return t('Wallet Deduction');
      default:
        return t('Unknown');
    }
  };

  // رنگ بر اساس وضعیت (status)
  const getStatusColor = (status) => {
    switch (status) {
      case '100':
        return themeColor7.bgColor(1); // موفق - سبز
      case '-1':
        return themeColor11.bgColor(1); // ناموفق - قرمز
      case '0':
        return themeColor8.bgColor(1); // در انتظار - آبی
      default:
        return themeColor11.bgColor(1);
    }
  };

  // متن وضعیت
  const getStatusText = (status) => {
    switch (status) {
      case '100':
        return t('Successful');
      case '-1':
        return t('Failed');
      case '0':
        return t('Pending');
      default:
        return t('Unknown');
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
        <ScreenHeaders title={t("Transactions")} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor1.bgColor(1)} />
          <Text style={[NewStyles.text10, { marginTop: 10 }]}>{t("Loading...")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={t("Transactions")} />

      {/* دکمه فیلتر */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={openFilterModal}
          style={[
            styles.filterButton,
            (fromDate || toDate) && styles.filterButtonActive
          ]}
        >
          <Ionicons
            name="filter"
            size={20}
            color={(fromDate || toDate) ? '#fff' : themeColor0.bgColor(1)}
          />
          <Text style={[
            styles.filterButtonText,
            { color: (fromDate || toDate) ? '#fff' : themeColor0.bgColor(1) }
          ]}>
            {t("Filter by Date")}
          </Text>
        </TouchableOpacity>
      </View>


      {/* نمایش فیلتر فعال */}
      {(fromDate || toDate) && (
        <View style={styles.activeFilterBadge}>
          <Ionicons name="funnel" size={16} color="#fff" />
          <Text style={styles.activeFilterText}>
            {t("Active filter:")}
            {fromDate && ` ${t("from")} ${moment(fromDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD')}`}
            {toDate && ` ${t("to")} ${moment(toDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD')}`}
          </Text>
          <TouchableOpacity onPress={clearFilter} style={styles.clearFilterBtn}>
            <Ionicons name="close-circle" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {transactions.length == 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[NewStyles.text10, { textAlign: 'center' }]}>
            {t("No transactions found")}
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }} >
          <FlatList
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                colors={[themeColor0.bgColor(1)]}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
            contentContainerStyle={styles.container}
            data={transactions}
            renderItem={({ item, index }) => (
              <View
                key={item.id || index}
                style={[
                  styles.transactionBox,
                  { backgroundColor: getStatusColor(item.status?.toString()) }
                ]}
              >
                <View style={styles.transactionRow}>
                  <Text style={[NewStyles.text4, { flex: 1 }]}>{formatDateTime(item.created_at)}</Text>
                  <Text style={[NewStyles.text4, styles.statusBadge]}>{getStatusText(item.status?.toString())}</Text>
                </View>

                <View style={styles.transactionRow}>
                  <Text style={[NewStyles.text4]}>{t("Amount")}:</Text>
                  <Text style={[NewStyles.title4]}>{formatPrice(item.price)} {t("T")}</Text>
                </View>

                <View style={styles.transactionRow}>
                  <Text style={[NewStyles.text4]}>{t("Type")}:</Text>
                  <Text style={[NewStyles.text4]}>{getTypeText(item.type?.toString())}</Text>
                </View>

                {item.referenceId && (
                  <View style={styles.transactionRow}>
                    <Text style={[NewStyles.text4]}>{t("Tracking Number:")}</Text>
                    <Text style={[NewStyles.text4]}>{item.referenceId}</Text>
                  </View>
                )}

                {item.description && (
                  <Text style={[NewStyles.text4]}>{item.description}</Text>
                )}
              </View>
            )}
          />
        </View>
      )}

      {/* Modal فیلتر */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}

      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("Date Filter")}</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* از تاریخ */}
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>{t("From Date:")}</Text>
                <TouchableOpacity
                  style={[styles.dateInput, showFromPicker && styles.dateInputActive]}
                  onPress={() => {
                    setShowToPicker(false);
                    setShowFromPicker(!showFromPicker);
                  }}
                >
                  <Text style={[styles.dateText, tempFromDate && styles.dateTextSelected]}>
                    {tempFromDate ? moment(tempFromDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD') : t("Select Date")}
                  </Text>
                  <Ionicons name={showFromPicker ? "chevron-up" : "calendar-outline"} size={20} color={showFromPicker ? themeColor0.bgColor(1) : "#666"} />
                </TouchableOpacity>
                {showFromPicker && (
                  <View style={styles.pickerContainer}>
                    <DatePicker
                      mode="calendar"
                      isGregorian={false}
                      options={{
                        backgroundColor: '#fff',
                        textHeaderColor: themeColor0.bgColor(1),
                        textDefaultColor: '#333',
                        selectedTextColor: '#fff',
                        mainColor: themeColor0.bgColor(1),
                        textSecondaryColor: '#999',
                        defaultFont: 'VazirLight',
                        headerFont: 'VazirLight',
                      }}
                      selected={tempFromDate ? moment(tempFromDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD') : ''}
                      onDateChange={() => { }}
                      onMonthYearChange={() => { }}
                      onSelectedChange={(date) => {
                        const gregorian = convertJalaliToGregorian(date);
                        setTempFromDate(gregorian);
                      }}
                      style={{ borderRadius: 10 }}
                    />
                    <TouchableOpacity
                      style={styles.confirmDateBtn}
                      onPress={() => {
                        setShowFromPicker(false);
                        // Auto-open end date picker
                        setShowToPicker(true);
                      }}
                    >
                      <Ionicons name="arrow-back" size={18} color="#fff" />
                      <Text style={styles.confirmDateBtnText}>
                        {tempFromDate ? t("Confirm and Select End Date") : t("Close")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* تا تاریخ */}
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>{t("To Date:")}</Text>
                <TouchableOpacity
                  style={[styles.dateInput, showToPicker && styles.dateInputActive]}
                  onPress={() => {
                    setShowFromPicker(false);
                    setShowToPicker(!showToPicker);
                  }}
                >
                  <Text style={[styles.dateText, tempToDate && styles.dateTextSelected]}>
                    {tempToDate ? moment(tempToDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD') : t("Select Date")}
                  </Text>
                  <Ionicons name={showToPicker ? "chevron-up" : "calendar-outline"} size={20} color={showToPicker ? themeColor0.bgColor(1) : "#666"} />
                </TouchableOpacity>
                {showToPicker && (
                  <View style={styles.pickerContainer}>
                    <DatePicker
                      mode="calendar"
                      isGregorian={false}
                      options={{
                        backgroundColor: '#fff',
                        textHeaderColor: themeColor0.bgColor(1),
                        textDefaultColor: '#333',
                        selectedTextColor: '#fff',
                        mainColor: themeColor0.bgColor(1),
                        textSecondaryColor: '#999',
                        defaultFont: 'VazirLight',
                        headerFont: 'VazirLight',
                      }}
                      selected={tempToDate ? moment(tempToDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD') : ''}
                      onDateChange={() => { }}
                      onMonthYearChange={() => { }}
                      onSelectedChange={(date) => {
                        const gregorian = convertJalaliToGregorian(date);
                        setTempToDate(gregorian);
                      }}
                      style={{ borderRadius: 10 }}
                    />
                    <TouchableOpacity
                      style={styles.confirmDateBtn}
                      onPress={() => setShowToPicker(false)}
                    >
                      <Ionicons name="checkmark" size={18} color="#fff" />
                      <Text style={styles.confirmDateBtnText}>{t("Confirm End Date")}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* دکمه‌ها */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.clearBtn]}
                  onPress={clearFilter}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.modalBtnText}>{t("Clear")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.applyBtn]}
                  onPress={applyFilter}
                >
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.modalBtnText}>{t("Apply Filter")}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  header: {
    ...NewStyles.title10,
    backgroundColor: themeColor1.bgColor(1),
    color: '#fff',
    padding: 12,
    textAlign: 'center',
    borderRadius: 8,
    marginBottom: 15,
    width: '90%',
    alignSelf: 'center',
    marginTop: 10
  },
  transactionBox: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    ...NewStyles.shadow,
  },
  transactionRow: {
    ...NewStyles.row,
    marginBottom: 8,
    gap: 10,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
  },
  paginationInfo: {
    marginTop: 20,
    marginBottom: 10,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: themeColor4.bgColor(1),
  },
  filterButton: {
    ...NewStyles.row,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColor0.bgColor(0.3),
    gap: 8,
  },
  filterButtonActive: {
    backgroundColor: themeColor0.bgColor(1),
    borderColor: themeColor0.bgColor(1),
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'VazirBold',
    ...NewStyles.text4,
  },
  activeFilterBadge: {
    ...NewStyles.row,
    alignItems: 'center',
    backgroundColor: themeColor0.bgColor(1),
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
    width: '90%',
    alignSelf: 'center',
    marginTop: 10
  },
  activeFilterText: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontFamily: 'VazirLight',
    ...NewStyles.text4,
  },
  clearFilterBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalHeader: {
    ...NewStyles.row,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'VazirBold',
    color: '#333',
    ...NewStyles.text10,
  },
  dateInputContainer: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: 'VazirBold',
    color: '#333',
    marginBottom: 8,
    ...NewStyles.text10,
  },
  dateInput: {
    ...NewStyles.row,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateInputActive: {
    borderColor: themeColor0.bgColor(1),
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#333',
    ...NewStyles.text10,
  },
  dateTextSelected: {
    fontFamily: 'VazirBold',
    color: themeColor0.bgColor(1),
  },
  pickerContainer: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center'
  },
  confirmDateBtn: {
    ...NewStyles.row,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColor0.bgColor(1),
    padding: 12,
    gap: 8,
  },
  confirmDateBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'VazirBold',
  },
  modalButtons: {
    ...NewStyles.row,
    gap: 10,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    ...NewStyles.row,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  applyBtn: {
    backgroundColor: themeColor0.bgColor(1),
  },
  clearBtn: {
    backgroundColor: themeColor6.bgColor(1),
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'VazirBold',
    ...NewStyles.text4,
  },
});
