import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../../styles/NewStyles';
import ScreenHeaders from '../../components/ScreenHeaders';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import { fetchOrders } from '../../slices/ordersSlice';
import { useFocusEffect } from '@react-navigation/native';
import OrderItem from '../../components/OrderItem';
import { withOrganizationAccess, ACCESS_PRESETS } from '../../components/withOrganizationAccess';

function CanceledOrdersScreen({ navigation }) {
  const dispatch = useDispatch();
  const orders = useSelector(state => state.orders?.data);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchOrders());
    }, [dispatch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchOrders());
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={'لغو شده ها'} />

      <FlatList
        contentContainerStyle={{  paddingVertical: 20, gap: 15 }}
        data={orders?.filter(order => (order.status == 3 || order.status == 4 || order.status == 5 || order.status == 6))}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponentStyle={{paddingHorizontal: '5%',}}
        ListHeaderComponent={() => {
          return (
            <View style={styles.header}>
              <Text style={[NewStyles.text10, { textAlign: 'center' }]}>لغو شده</Text>
            </View>
          )
        }}
        renderItem={({ item }) => {
          return (
            <OrderItem item={item} navigation={navigation} />
          )
        }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e0f0ff',
    alignItems: 'stretch',
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#fcd600',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  headerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
    textAlign: 'right',
  },
  value: {
    fontWeight: 'bold',
    color: '#000',
  },
  viewBtn: {
    marginTop: 10,
    backgroundColor: '#2196f3',
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewBtnText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
});

// محافظت از صفحه سفارشات لغو شده - بخشی از مدیریت سفارشات
export default withOrganizationAccess(CanceledOrdersScreen, {
    ...ACCESS_PRESETS.ORDER_RELATED,
    screenName: 'CanceledOrdersScreen'
});
