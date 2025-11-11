import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { withOrganizationAccess, ACCESS_PRESETS } from '../../components/withOrganizationAccess';

import NewStyles from '../../styles/NewStyles';
import ScreenHeaders from '../../components/ScreenHeaders';
import { fetchOrders } from '../../slices/ordersSlice';
import OrderItem from '../../components/OrderItem';
import BlankScreen from '../../components/BlankScreen';

function OrdersScreen({ navigation }) {
  const dispatch = useDispatch();
  const orders = useSelector(state => state.orders?.data);
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useFocusEffect(
    React.useCallback(() => {
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
      <ScreenHeaders title="تراکنش ها/سفارش‌ها" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 
});

// محافظت از صفحه لیست سفارشات - نیاز به تایید کامل
export default withOrganizationAccess(OrdersScreen, {
    ...ACCESS_PRESETS.ORDER_RELATED,
    screenName: 'OrdersScreen'
});
