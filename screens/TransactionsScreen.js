import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import NewStyles from '../styles/NewStyles';
import ScreenHeaders from '../components/ScreenHeaders';
import { formatPrice, formatDateTime, showToastOrAlert } from '../helpers/Common';
import { themeColor1, themeColor6, themeColor7, themeColor0 } from '../theme/Color';
import { getTransactions } from '../services/WalletApi';

export default function TransactionsScreen() {
  const token = useSelector((state) => state?.auth?.token);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // استفاده از service
      const data = await getTransactions(token);

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

  // تبدیل type به متن فارسی
  const getTypeText = (type) => {
    switch (type) {
      case 1:
        return 'شارژ کیف پول';
      case 2:
        return 'پرداخت آنلاین';
      case 3:
        return 'کسر هزینه از کیف پول';
      default:
        return 'نامشخص';
    }
  };

  // رنگ بر اساس وضعیت (status)
  const getStatusColor = (status) => {
    switch (status) {
      case 100:
        return themeColor7.bgColor(1); // موفق - سبز
      case -1:
        return themeColor6.bgColor(1); // ناموفق - قرمز
      case 0:
        return themeColor0.bgColor(1); // در انتظار - آبی
      default:
        return themeColor1.bgColor(1);
    }
  };

  // متن وضعیت
  const getStatusText = (status) => {
    switch (status) {
      case 100:
        return 'موفق';
      case -1:
        return 'ناموفق';
      case 0:
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
      <ScreenHeaders title={"تراکنش ها"} />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            colors={[themeColor1.bgColor(1)]}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {transactions.length === 0 ? (
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
                  <Text style={[NewStyles.text4, { flex: 1 }]}>
                    {formatDateTime(item.created_at)}
                  </Text>
                  <Text style={[NewStyles.text4, styles.statusBadge]}>
                    {getStatusText(item.status)}
                  </Text>
                </View>

                <View style={styles.transactionRow}>
                  <Text style={[NewStyles.text10, { color: '#fff' }]}>
                    مبلغ:
                  </Text>
                  <Text style={[NewStyles.title10, { color: '#fff' }]}>
                    {formatPrice(item.price * 10)} ریال
                  </Text>
                </View>

                <View style={styles.transactionRow}>
                  <Text style={[NewStyles.text10, { color: '#fff' }]}>
                    نوع:
                  </Text>
                  <Text style={[NewStyles.text10, { color: '#fff' }]}>
                    {getTypeText(item.type)}
                  </Text>
                </View>

                {item.referenceId && (
                  <View style={styles.transactionRow}>
                    <Text style={[NewStyles.text3, { color: '#fff', fontSize: 11 }]}>
                      شماره پیگیری:
                    </Text>
                    <Text style={[NewStyles.text3, { color: '#fff', fontSize: 11 }]}>
                      {item.referenceId}
                    </Text>
                  </View>
                )}

                {item.description && (
                  <Text style={[NewStyles.text3, { color: '#fff', marginTop: 5, fontSize: 11 }]}>
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
});
