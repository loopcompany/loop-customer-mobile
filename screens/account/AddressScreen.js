// AddressScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeaders from "../../components/ScreenHeaders";
import NewStyles from "../../styles/NewStyles";
import { themeColor1, themeColor4, themeColor0, themeColor3 } from "../../theme/Color";
import { addressAPI } from "../../services/Api";
import { showToastOrAlert, showAlert } from "../../helpers/Common";
import Button from "../../components/Button";

export default function AddressScreen({ route, navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Refresh when navigating back from Add New Address
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAddresses();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressAPI.getAll();

      if (response.success && response.data) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      // Don't show alert on first load if no addresses
      if (addresses.length > 0) {
        showToastOrAlert('خطا در دریافت آدرس‌ها');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAddresses();
  };

  const handleDelete = (id) => {
    showAlert(
      'حذف آدرس',
      'آیا مطمئن هستید که می‌خواهید این آدرس را حذف کنید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await addressAPI.delete(id);
              if (response.success) {
                showToastOrAlert('آدرس با موفقیت حذف شد');
                fetchAddresses();
              }
            } catch (error) {
              console.error('Error deleting address:', error);
              showToastOrAlert('خطا در حذف آدرس');
            }
          },
        },
      ]
    );
  };

  const renderAddressCard = ({ item }) => {
    return (
      <View style={[styles.addressCard, NewStyles.border10]}>
        <View style={styles.cardHeader}>
          <Text style={[NewStyles.title10, { fontSize: 16 }]}>
            {item.title || 'بدون عنوان'}
          </Text>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.iconBtn}
          >
            <Ionicons name="trash-outline" size={20} color="#d32f2f" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          {item.fname && item.lname && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color={themeColor3.bgColor(1)} />
              <Text style={[NewStyles.text10, { marginRight: 8 }]}>
                {item.fname} {item.lname}
              </Text>
            </View>
          )}

          {item.mobile && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color={themeColor3.bgColor(1)} />
              <Text style={[NewStyles.text10, { marginRight: 8 }]}>
                {item.mobile}
              </Text>
            </View>
          )}

          {item.telephone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color={themeColor3.bgColor(1)} />
              <Text style={[NewStyles.text10, { marginRight: 8 }]}>
                {item.telephone}
              </Text>
            </View>
          )}

          {item.city && item.region && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={themeColor3.bgColor(1)} />
              <Text style={[NewStyles.text10, { marginRight: 8 }]}>
                {item.city} - {item.region}
              </Text>
            </View>
          )}

          {item.address && (
            <View style={styles.infoRow}>
              <Ionicons name="home-outline" size={16} color={themeColor3.bgColor(1)} />
              <Text style={[NewStyles.text10, { marginRight: 8, flex: 1 }]}>
                {item.address}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="location-outline" size={80} color={themeColor3.bgColor(1)} />
        <Text style={[NewStyles.text10, { marginTop: 20, fontSize: 16 }]}>
          هنوز آدرسی ثبت نشده است
        </Text>
        <Text style={[NewStyles.text10, { marginTop: 10, opacity: 0.7 }]}>
          با دکمه زیر اولین آدرس خود را اضافه کنید
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
      <ScreenHeaders
        title="آدرس‌های من"
      />

      <View style={{ flex: 1 }}>
        {loading && addresses.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeColor1.bgColor(1)} />
            <Text style={[NewStyles.text10, { marginTop: 10 }]}>در حال بارگذاری...</Text>
          </View>
        ) : (
          <FlatList
            data={addresses}
            renderItem={renderAddressCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[
              NewStyles.wrapper,
              addresses.length === 0 && { flex: 1 }
            ]}
            ListEmptyComponent={renderEmptyState}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <View style={styles.footer}>

        <Button title="افزودن آدرس جدید" onPress={() => navigation.navigate('AddNewAddress')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  addressCard: {
    backgroundColor: themeColor4.bgColor(1),
    padding: 15,
    marginBottom: 15,
    shadowColor: themeColor0.bgColor(1),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: themeColor3.bgColor(0.2),
  },
  iconBtn: {
    padding: 5,
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  footer: {
    padding: 15,
    ...NewStyles.center

  },
  addBtn: {
    backgroundColor: themeColor1.bgColor(1),
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
});

