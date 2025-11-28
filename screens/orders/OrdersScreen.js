import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, FlatList, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DatePicker from 'react-native-modern-datepicker';
import moment from 'moment-jalaali';
import { withOrganizationAccess, ACCESS_PRESETS } from '../../components/withOrganizationAccess';

import NewStyles from '../../styles/NewStyles';
import ScreenHeaders from '../../components/ScreenHeaders';
import { fetchOrders } from '../../slices/ordersSlice';
import { themeColor0 } from '../../theme/Color';
import OrderItem from '../../components/OrderItem';
import BlankScreen from '../../components/BlankScreen';

function OrdersScreen({ navigation }) {
  const dispatch = useDispatch();
  const orders = useSelector(state => state.orders?.data);
  
  const [refreshing, setRefreshing] = useState(false);
  
  // فیلتر تاریخ و وضعیت
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [status, setStatus] = useState(null);
  const [tempFromDate, setTempFromDate] = useState(null);
  const [tempToDate, setTempToDate] = useState(null);
  const [tempStatus, setTempStatus] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    const params = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    if (status !== null) params.status = status;
    
    dispatch(fetchOrders(params));
  }, [dispatch, fromDate, toDate, status]);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchOrders());
    }, [dispatch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    const params = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    if (status !== null) params.status = status;
    
    await dispatch(fetchOrders(params));
    setRefreshing(false);
  };

  // تبدیل تاریخ جلالی به میلادی (Y-m-d)
  const convertJalaliToGregorian = (jalaliDate) => {
    if (!jalaliDate) return null;
    const gregorian = moment(jalaliDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
    return gregorian;
  };

  // باز کردن modal فیلتر
  const openFilterModal = () => {
    setTempFromDate(fromDate);
    setTempToDate(toDate);
    setTempStatus(status);
    setShowFilterModal(true);
  };

  // اعمال فیلتر
  const applyFilter = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    setStatus(tempStatus);
    setShowFilterModal(false);
  };

  // پاک کردن فیلتر
  const clearFilter = () => {
    setFromDate(null);
    setToDate(null);
    setStatus(null);
    setTempFromDate(null);
    setTempToDate(null);
    setTempStatus(null);
    setShowFilterModal(false);
  };

  // متن وضعیت سفارش
  const getStatusText = (statusValue) => {
    switch(statusValue) {
      case 0: return 'در انتظار';
      case 1: return 'در حال انجام';
      case 2: return 'تمام شده';
      case 3: return 'لغو شده';
      default: return 'همه';
    }
  };

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title="تراکنش ها/سفارش‌ها" />
      
      {/* دکمه فیلتر */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, (fromDate || toDate || status !== null) && styles.filterButtonActive]}
          onPress={openFilterModal}
        >
          <Ionicons 
            name="filter" 
            size={18} 
            color={(fromDate || toDate || status !== null) ? '#fff' : themeColor0.bgColor(1)} 
          />
          <Text style={[styles.filterButtonText, (fromDate || toDate || status !== null) && { color: '#fff' }]}>
            فیلتر
          </Text>
        </TouchableOpacity>
      </View>

      {/* نمایش فیلتر فعال */}
      {(fromDate || toDate || status !== null) && (
        <View style={styles.activeFilterBadge}>
          <Text style={styles.activeFilterText}>
            {fromDate && `از: ${moment(fromDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD')}`}
            {fromDate && toDate && ' | '}
            {toDate && `تا: ${moment(toDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD')}`}
            {(fromDate || toDate) && status !== null && ' | '}
            {status !== null && `وضعیت: ${getStatusText(status)}`}
          </Text>
          <TouchableOpacity onPress={clearFilter} style={styles.clearFilterBtn}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 20, gap: 15 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => {
          return (
            <BlankScreen />
          )
        }}
        renderItem={({ item }) => {
          return (
            <OrderItem item={item} navigation={navigation} />
          )
        }}
      />

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
              <Text style={styles.modalTitle}>فیلتر سفارشات</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {/* از تاریخ */}
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>از تاریخ:</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowFromPicker(!showFromPicker)}
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
                  selected={tempFromDate ? moment(tempFromDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD') : ''}
                  onDateChange={(date) => {
                    const gregorian = convertJalaliToGregorian(date);
                    setTempFromDate(gregorian);
                    setShowFromPicker(false);
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
                onPress={() => setShowToPicker(!showToPicker)}
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
                  selected={tempToDate ? moment(tempToDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD') : ''}
                  onDateChange={(date) => {
                    const gregorian = convertJalaliToGregorian(date);
                    setTempToDate(gregorian);
                    setShowToPicker(false);
                  }}
                  style={{ borderRadius: 10 }}
                />
              )}
            </View>

            {/* انتخاب وضعیت */}
            <View style={styles.statusContainer}>
              <Text style={styles.dateLabel}>وضعیت سفارش:</Text>
              <View style={styles.statusButtons}>
                {[null, 0, 1, 2, 3].map((statusValue) => (
                  <TouchableOpacity
                    key={statusValue}
                    style={[
                      styles.statusBtn,
                      tempStatus === statusValue && styles.statusBtnActive
                    ]}
                    onPress={() => setTempStatus(statusValue)}
                  >
                    <Text style={[
                      styles.statusBtnText,
                      tempStatus === statusValue && styles.statusBtnTextActive
                    ]}>
                      {getStatusText(statusValue)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: themeColor0.bgColor(1),
  },
  filterButtonActive: {
    backgroundColor: themeColor0.bgColor(1),
    borderColor: themeColor0.bgColor(1),
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: themeColor0.bgColor(1),
    textAlign: 'right',
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f8ff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColor0.bgColor(0.3),
  },
  activeFilterText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  clearFilterBtn: {
    padding: 5,
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
    maxHeight: '85%',
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
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  dateInputContainer: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  statusBtnActive: {
    backgroundColor: themeColor0.bgColor(1),
    borderColor: themeColor0.bgColor(1),
  },
  statusBtnText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'right',
  },
  statusBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearBtn: {
    backgroundColor: '#ff4444',
  },
  applyBtn: {
    backgroundColor: themeColor0.bgColor(1),
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

// محافظت از صفحه لیست سفارشات - نیاز به تایید کامل
export default withOrganizationAccess(OrdersScreen, {
    ...ACCESS_PRESETS.ORDER_RELATED,
    screenName: 'OrdersScreen'
});
