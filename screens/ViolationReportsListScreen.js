// ViolationReportsListScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeaders from '../components/ScreenHeaders';
import NewStyles from '../styles/NewStyles';
import { themeColor1, themeColor0, themeColor10 } from '../theme/Color';
import violationReportAPI from '../services/ViolationReportApi';
import { formatJalaaliDate, formatPrice, showToastOrAlert } from '../helpers/Common';

export default function ViolationReportsListScreen({ navigation }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async (page = 1, refresh = false) => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else if (page === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await violationReportAPI.getReports(page, 10);

            if (response.status === 'success') {
                if (page === 1 || refresh) {
                    setReports(response.data.reports);
                } else {
                    setReports(prev => [...prev, ...response.data.reports]);
                }
                setPagination(response.data.pagination);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Fetch reports error:', error);

            let errorMessage = 'خطا در دریافت گزارش‌ها';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            showToastOrAlert(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const onRefresh = () => {
        fetchReports(1, true);
    };

    const loadMore = () => {
        if (pagination && currentPage < pagination.last_page && !loadingMore) {
            fetchReports(currentPage + 1);
        }
    };

    const renderReportItem = ({ item }) => (
        <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
                <Text style={styles.reportSubject} numberOfLines={1}>
                    {item.subject || 'بدون موضوع'}
                </Text>
                <Text style={styles.reportDate}>{item.date}</Text>
            </View>

            {item.name && (
                <View style={styles.reportRow}>
                    <Ionicons name="person-outline" size={16} color={themeColor10.bgColor(0.7)} />
                    <Text style={styles.reportName}>{item.name}</Text>
                </View>
            )}

            <View style={styles.reportRow}>
                <Ionicons name="cash-outline" size={16} color={themeColor10.bgColor(0.7)} />
                <Text style={styles.reportAmount}>{formatPrice(item.amount)} تومان</Text>
            </View>

            <Text style={styles.reportDescription} numberOfLines={3}>
                {item.description}
            </Text>

            <View style={styles.reportFooter}>
                <Text style={styles.reportId}>شناسه: #{item.id}</Text>
                <Text style={styles.reportCreatedAt}>
                    ثبت شده: {formatJalaaliDate(item?.created_at)}
                </Text>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={80} color={themeColor10.bgColor(0.5)} />
            <Text style={styles.emptyTitle}>هیچ گزارش تخلفی یافت نشد</Text>
            <Text style={styles.emptyMessage}>
                شما هنوز هیچ گزارش تخلفی ثبت نکرده‌اید
            </Text>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={themeColor1.bgColor(1)} />
                <Text style={styles.loadingText}>در حال بارگذاری...</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
                <ScreenHeaders
                    title="پیگیری گزارش‌ها"
                    showLeftIcon={true}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={themeColor1.bgColor(1)} />
                    <Text style={styles.loadingText}>در حال بارگذاری...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <ScreenHeaders
                title="پیگیری گزارش‌ها"
                showLeftIcon={true}
            />


            <FlatList
                data={reports}
                renderItem={renderReportItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[themeColor1.bgColor(1)]}
                    />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmptyState}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        ...NewStyles.text10,
        marginTop: 10,
        textAlign: 'center',
    },
    summaryContainer: {
        padding: 15,
        backgroundColor: themeColor1.bgColor(0.1),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    summaryText: {
        ...NewStyles.text10,
        textAlign: 'center',
        color: themeColor10.bgColor(0.7),
    },
    listContainer: {
        padding: 15,
        flexGrow: 1,
    },
    reportCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    reportHeader: {
        ...NewStyles.rowWrapper,
        marginBottom: 10,
    },
    reportSubject: {
        ...NewStyles.title10,
        flex: 1,
        color: themeColor1.bgColor(1),
    },
    reportDate: {
        ...NewStyles.text10,
        color: themeColor10.bgColor(0.7),
        fontSize: 12,
    },
    reportRow: {
        ...NewStyles.row,
        marginBottom: 8,
        gap: 10
    },
    reportName: {
        ...NewStyles.text10,
        marginLeft: 8,
        color: themeColor10.bgColor(0.8),
    },
    reportAmount: {
        ...NewStyles.text10,
        marginLeft: 8,
        color: '#2196f3',
    },
    reportDescription: {
        ...NewStyles.text10,
        lineHeight: 20,
        color: themeColor10.bgColor(0.8),
        marginVertical: 10,
    },
    reportFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    reportId: {
        ...NewStyles.text10,
        fontSize: 12,
        color: themeColor10.bgColor(0.6),
    },
    reportCreatedAt: {
        ...NewStyles.text10,
        fontSize: 12,
        color: themeColor10.bgColor(0.6),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        ...NewStyles.title10,
        marginTop: 20,
        textAlign: 'center',
        color: themeColor10.bgColor(0.7),
    },
    emptyMessage: {
        ...NewStyles.text10,
        marginTop: 10,
        textAlign: 'center',
        lineHeight: 22,
        color: themeColor10.bgColor(0.6),
    },
    footerLoader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});