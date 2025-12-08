import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import DatePicker from 'react-native-modern-datepicker';
import moment from 'moment-jalaali';

import NewStyles from '../styles/NewStyles';
import ScreenHeaders from '../components/ScreenHeaders';
import { formatPrice, formatDateTime, showToastOrAlert } from '../helpers/Common';
import { themeColor0, themeColor1, themeColor4, themeColor6, themeColor7 } from '../theme/Color';
import { getTransactions } from '../services/WalletApi';

export default function TransactionsScreen() {
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
      const message = error?.response?.data?.message || 'خطا در دریافت تراکنش‌ها';
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
        return 'شارژ کیف پول';
      case '2':
        return 'پرداخت آنلاین';
      case '3':
        return 'کسر هزینه از کیف پول';
      default:
        return 'نامشخص';
    }
  };

  // رنگ بر اساس وضعیت (status)
  const getStatusColor = (status) => {
    switch (status) {
      case '100':
        return themeColor7.bgColor(1); // موفق - سبز
      case '-1':
        return themeColor6.bgColor(1); // ناموفق - قرمز
      case '0':
        return themeColor0.bgColor(1); // در انتظار - آبی
      default:
        return themeColor1.bgColor(1);
    }
  };

  // متن وضعیت
  const getStatusText = (status) => {
    switch (status) {
      case '100':
        return 'موفق';
      case '-1':
        return 'ناموفق';
      case '0':
        return 'در انتظار';
      default:
        return 'نامشخص';
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
        <ScreenHeaders title={"تراکنش ها"} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor1.bgColor(1)} />
          <Text style={[NewStyles.text10, { marginTop: 10 }]}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title="تراکنش ها" />
      
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
            فیلتر تاریخ
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            colors={[themeColor0.bgColor(1)]}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* نمایش فیلتر فعال */}
        {(fromDate || toDate) && (
          <View style={styles.activeFilterBadge}>
            <Ionicons name="funnel" size={16} color="#fff" />
            <Text style={styles.activeFilterText}>
              فیلتر فعال: 
              {fromDate && ` از ${moment(fromDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD')}`}
              {toDate && ` تا ${moment(toDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD')}`}
            </Text>
            <TouchableOpacity onPress={clearFilter} style={styles.clearFilterBtn}>
              <Ionicons name="close-circle" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {transactions.length == 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[NewStyles.text10, { textAlign: 'center' }]}>
              تراکنشی یافت نشد
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.header}>تراکنش‌ها</Text>
            {transactions.map((item, index) => (
              <View
                key={item.id || index}
                style={[
                  styles.transactionBox,
                  { backgroundColor: getStatusColor(item.status) }
                ]}
              >
                <View style={styles.transactionRow}>
                  <Text style={[NewStyles.text10, { flex: 1 }]}>
                    {formatDateTime(item.created_at)}
                  </Text>
                  <Text style={[NewStyles.text10, styles.statusBadge]}>
                    {getStatusText(item.status)}
                  </Text>
                </View>

                <View style={styles.transactionRow}>
                  <Text style={[NewStyles.text10]}>
                    مبلغ:
                  </Text>
                  <Text style={[NewStyles.title10]}>
                    {formatPrice(item.price * 10)} ریال
                  </Text>
                </View>

                <View style={styles.transactionRow}>
                  <Text style={[NewStyles.text10]}>
                    نوع:
                  </Text>
                  <Text style={[NewStyles.text10]}>
                    {getTypeText(item.type)}
                  </Text>
                </View>

                {item.referenceId && (
                  <View style={styles.transactionRow}>
                    <Text style={[NewStyles.text10]}>
                      شماره پیگیری:
                    </Text>
                    <Text style={[NewStyles.text10]}>
                      {item.referenceId}
                    </Text>
                  </View>
                )}

                {item.description && (
                  <Text style={[NewStyles.text10]}>
                    {item.description}
                  </Text>
                )}
              </View>
            ))}

            {pagination && (
              <View style={styles.paginationInfo}>
                <Text style={[NewStyles.text10, { textAlign: 'center' }]}>
                  صفحه {pagination.current_page} از {pagination.last_page}
                </Text>
                <Text style={[NewStyles.text3, { textAlign: 'center', marginTop: 5 }]}>
                  مجموع: {pagination.total} تراکنش
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

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
              <Text style={styles.modalTitle}>فیلتر تاریخ</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {/* از تاریخ */}
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>از تاریخ:</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => {
                  setShowFromPicker(!showFromPicker);
                  if (!showFromPicker) {
                    // Clear temp when opening to allow re-selection
                    setTempFromDate(null);
                  }
                }}
              >
                <Text style={styles.dateText}>
                  {tempFromDate ? moment(tempFromDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD') : 'انتخاب تاریخ'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
              {showFromPicker && (
                <DatePicker
                  mode="calendar"
                  options={{
                    backgroundColor: '#fff',
                    textHeaderColor: themeColor0.bgColor(1),
                    textDefaultColor: '#333',
                    selectedTextColor: '#fff',
                    mainColor: themeColor0.bgColor(1),
                    textSecondaryColor: '#999',
                  }}
                  selected={fromDate ? moment(fromDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD') : ''}
                  onSelectedChange={(date) => {
                    const gregorian = convertJalaliToGregorian(date);
                    setTempFromDate(gregorian);
                    setShowFromPicker(false);
                  }}
                  onDateChange={(date) => {
                    const gregorian = convertJalaliToGregorian(date);
                    setTempFromDate(gregorian);
                  }}
                  style={{ borderRadius: 10 }}
                />
              )}
            </View>

            {/* تا تاریخ */}
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>تا تاریخ:</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => {
                  setShowToPicker(!showToPicker);
                  if (!showToPicker) {
                    // Clear temp when opening to allow re-selection
                    setTempToDate(null);
                  }
                }}
              >
                <Text style={styles.dateText}>
                  {tempToDate ? moment(tempToDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD') : 'انتخاب تاریخ'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
              {showToPicker && (
                <DatePicker
                  mode="calendar"
                  options={{
                    backgroundColor: '#fff',
                    textHeaderColor: themeColor0.bgColor(1),
                    textDefaultColor: '#333',
                    selectedTextColor: '#fff',
                    mainColor: themeColor0.bgColor(1),
                    textSecondaryColor: '#999',
                  }}
                  selected={toDate ? moment(toDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD') : ''}
                  onSelectedChange={(date) => {
                    const gregorian = convertJalaliToGregorian(date);
                    setTempToDate(gregorian);
                    setShowToPicker(false);
                  }}
                  onDateChange={(date) => {
                    const gregorian = convertJalaliToGregorian(date);
                    setTempToDate(gregorian);
                  }}
                  style={{ borderRadius: 10 }}
                />
              )}
            </View>

            {/* دکمه‌ها */}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.clearBtn]}
                onPress={clearFilter}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.modalBtnText}>پاک کردن</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, styles.applyBtn]}
                onPress={applyFilter}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.modalBtnText}>اعمال فیلتر</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
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
  },
  transactionBox: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    ...NewStyles.shadow,
  },
  transactionRow: {
    ...NewStyles.rowWrapper,
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
    flexDirection: 'row',
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
    textAlign: 'right',
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColor0.bgColor(1),
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  activeFilterText: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontFamily: 'VazirLight',
    textAlign: 'right',
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
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
    textAlign: 'right',
  },
  dateInputContainer: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: 'VazirBold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#333',
    textAlign: 'right',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    flexDirection: 'row',
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
    textAlign: 'right',
  },
});
