import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment-jalaali';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor5 } from '../theme/Color';
import { orderAPI } from '../services/Api';
import { showToastOrAlert } from '../helpers/Common';

export default function OrderDropdown({ value, onChange, placeholder = "انتخاب شماره سفارش" }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFocus, setIsFocus] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderAPI.getOrdersSummary();
            
            if (response.success && response.data?.orders) {
                // Format orders for dropdown
                const formattedOrders = response.data.orders.map(order => ({
                    label: `#${order.order_id} - ${formatDate(order.created_at)}${order.product_name ? ` - ${order.product_name}` : ''}`,
                    value: order.order_id.toString(),
                    ...order // Keep all order data
                }));
                
                setOrders(formattedOrders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            showToastOrAlert('خطا در دریافت لیست سفارشات');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            return moment(dateString).format('jYYYY/jMM/jDD');
        } catch {
            return dateString;
        }
    };

    const formatPrice = (price) => {
        if (!price || price === 0) return 'تعیین نشده';
        return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
    };

    const renderItem = (item) => {
        return (
            <View style={styles.item}>
                <View style={styles.itemHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[NewStyles.title10, { fontSize: 14 }]}>
                            سفارش #{item.order_id}
                        </Text>
                        {item.finished_at && (
                            <View style={[styles.statusBadge, { backgroundColor: themeColor1.bgColor(0.1) }]}>
                                <Text style={[NewStyles.text10, { fontSize: 10, color: themeColor1.bgColor(1) }]}>
                                    ✓ تکمیل شده
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={[NewStyles.text10, { fontSize: 11, opacity: 0.7 }]}>
                        {formatDate(item.created_at)}
                    </Text>
                </View>
                
                {item.product_name && (
                    <Text style={[NewStyles.text10, { fontSize: 12, marginTop: 4 }]}>
                        📦 {item.product_name}
                    </Text>
                )}
                
                <View style={styles.itemFooter}>
                    {item.technician_referral_code && (
                        <Text style={[NewStyles.text10, { fontSize: 11, opacity: 0.6 }]}>
                            تکنسین: {item.technician_referral_code}
                        </Text>
                    )}
                    
                    {item.final_paid_amount > 0 && (
                        <Text style={[NewStyles.text10, { fontSize: 11, color: themeColor1.bgColor(1) }]}>
                            {formatPrice(item.final_paid_amount)}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, NewStyles.border10]}>
                <ActivityIndicator size="small" color={themeColor1.bgColor(1)} />
                <Text style={[NewStyles.text10, { marginRight: 10 }]}>در حال بارگذاری سفارشات...</Text>
            </View>
        );
    }

    if (orders.length === 0) {
        return (
            <View style={[styles.emptyContainer, NewStyles.border10]}>
                <Ionicons name="clipboard-outline" size={24} color={themeColor0.bgColor(0.5)} />
                <Text style={[NewStyles.text10, { marginRight: 10, opacity: 0.7 }]}>
                    سفارشی یافت نشد
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Dropdown
                style={[styles.dropdown, isFocus && styles.dropdownFocused]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={orders}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? placeholder : '...'}
                searchPlaceholder="جستجو در سفارشات..."
                
                value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    onChange(item);
                    setIsFocus(false);
                }}
                renderLeftIcon={() => (
                    <Ionicons
                        name="receipt-outline"
                        size={20}
                        color={isFocus ? themeColor1.bgColor(1) : themeColor0.bgColor(0.7)}
                        style={styles.icon}
                    />
                )}
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    dropdown: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1.5,
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    dropdownFocused: {
        borderColor: themeColor1.bgColor(1),
    },
    icon: {
        marginLeft: 10,
    },
    placeholderStyle: {
        fontSize: 14,
        fontFamily: 'VazirLight',
        textAlign: 'right',
        color: '#999',
    },
    selectedTextStyle: {
        fontSize: 14,
        fontFamily: 'VazirBold',
        textAlign: 'right',
        color: themeColor0.bgColor(1),
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 14,
        fontFamily: 'VazirLight',
        textAlign: 'right',
        borderRadius: 8,
    },
    item: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        marginRight: 8,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#ddd',
    },
    emptyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderWidth: 1.5,
        borderColor: '#ddd',
    },
});
