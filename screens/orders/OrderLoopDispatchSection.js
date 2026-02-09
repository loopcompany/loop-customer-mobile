import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTranslation } from 'react-i18next'

import { uri } from '../../services/URL'
import NewStyles from '../../styles/NewStyles'
import { formatPrice, showToastOrAlert } from '../../helpers/Common'
import { themeColor0, themeColor1, themeColor4, themeColor5 } from '../../theme/Color'
import Button from '../../components/Button'
import ConfirmationModal from '../../components/ConfirmationModal'

const OrderLoopDispatchSection = ({ orderId, onUpdate, onReportStatusChange }) => {
    const { t } = useTranslation()
    const token = useSelector((state) => state?.auth?.token)
    const [loading, setLoading] = useState(true)
    const [confirming, setConfirming] = useState(false)
    const [report, setReport] = useState(null)
    const [confirmModal, setConfirmModal] = useState(false)

    useEffect(() => {
        if (orderId) {
            fetchReport()
        }
    }, [orderId])

    const fetchReport = async () => {
        setLoading(true)
        try {
            const response = await axios.get(
                `${uri}/order-reports/by-order/${orderId}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (response.status == 200 && response.data?.success) {
                setReport(response.data?.data?.report)
                if (onReportStatusChange) onReportStatusChange(true)
            } else {
                setReport(null)
                if (onReportStatusChange) onReportStatusChange(false)
            }
        } catch (error) {
            // اگر report نبود، خطا نشان نمی‌دهیم
            setReport(null)
            if (onReportStatusChange) onReportStatusChange(false)
        } finally {
            setLoading(false)
        }
    }

    const handleConfirmReport = async () => {
        setConfirmModal(false)
        setConfirming(true)
        try {
            const response = await axios.post(
                `${uri}/order-reports/confirm`,
                { report_id: report?.id },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (response.status == 200 && response.data?.success) {
                showToastOrAlert(response.data?.message || t('Report confirmed successfully'))
                // بروزرسانی گزارش با داده‌های جدید
                if (response.data?.data?.report) {
                    setReport(response.data?.data?.report)
                } else {
                    fetchReport()
                }
                if (onUpdate) onUpdate()
            }
        } catch (error) {
            const message = error?.response?.data?.message || t('Error confirming report')
            showToastOrAlert(message)
        } finally {
            setConfirming(false)
        }
    }

    const renderRow = (text1, text2, textStyle1, textStyle2) => (
        <View style={NewStyles.rowWrapper}>
            <Text style={[NewStyles.text, textStyle1]}>{text1}</Text>
            <Text style={[NewStyles.text10, textStyle2]}>{text2}</Text>
        </View>
    )

    if (loading) {
        return (
            <View style={[styles.container, NewStyles.center]}>
                <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
            </View>
        )
    }

    if (!report) {
        return (
            <View style={[styles.container, NewStyles.center]}>
                <View style={styles.noticeBox}>
                    <Text style={[NewStyles.text10]}>
                        {t('The delivery report has not been submitted by technician yet')}
                    </Text>
                </View>
            </View>
        )
    }

    // چک کردن قفل بودن (تایید شده)
    const isConfirmed = report?.user_confirmed_at

    return (
        <View style={[{ width: '90%', alignSelf: 'center', paddingBottom: 10 }, NewStyles.center]}>
            {/* توضیحات */}
            <View style={[styles.noticeBox, !isConfirmed && { backgroundColor: themeColor1.bgColor(1) }]}>
                <Text style={[NewStyles.text10]}>
                    {isConfirmed
                        ? t('The delivery report has been confirmed by you')
                        : t('Please review the delivery report information and confirm it if correct')}
                </Text>
            </View>

            {/* اطلاعات گزارش */}
            <View style={[{ backgroundColor: themeColor4.bgColor(1), width: '100%', paddingVertical: 15, paddingHorizontal: '5%', gap: 10 }, NewStyles.border10]}>

                {/* نام و نام خانوادگی تحویل دهنده */}
                {report?.name && renderRow(
                    t('Submitter full name'),
                    report?.name,
                    NewStyles.text,
                    NewStyles.text10
                )}

                {/* کد ملی تحویل دهنده */}
                {report?.melicode && renderRow(
                    t('Submitter national ID'),
                    report?.melicode,
                    NewStyles.text,
                    NewStyles.text10
                )}

                {/* نام محصول */}
                {report?.product_name && renderRow(
                    t('Product name'),
                    report?.product_name,
                    NewStyles.text,
                    NewStyles.text10
                )}

                {/* برند محصول */}
                {report?.product_brand && renderRow(
                    t('Product brand'),
                    report?.product_brand,
                    NewStyles.text,
                    NewStyles.text10
                )}

                {/* مدل محصول */}
                {report?.product_model && renderRow(
                    t('Product model'),
                    report?.product_model,
                    NewStyles.text,
                    NewStyles.text10
                )}

                {/* رنگ محصول */}
                {report?.product_color && renderRow(
                    t('Product color'),
                    report?.product_color,
                    NewStyles.text,
                    NewStyles.text10
                )}

                {/* شماره سریال */}
                {report?.product_serial_number && renderRow(
                    t('Serial number'),
                    report?.product_serial_number,
                    NewStyles.text,
                    NewStyles.text10
                )}

                {/* کد برچسب دارایی */}
                {report?.asset_label_code && renderRow(
                    t('Asset label code'),
                    report?.asset_label_code,
                    NewStyles.text,
                    NewStyles.text10
                )}

                {/* لوازم جانبی */}
                {report?.accessories && (
                    <View style={{ gap: 5, marginTop: 5 }}>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Ionicons name="cube-outline" size={20} color={themeColor0.bgColor(1)} />
                            <Text style={NewStyles.title}>{t('Accessories')}</Text>
                        </View>
                        <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                            <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                            <Text style={[NewStyles.text10, { flex: 1 }]}>{report?.accessories}</Text>
                        </View>
                    </View>
                )}

                {/* مشکلات گزارش شده توسط کاربر */}
                {report?.user_reported_issues && (
                    <View style={{ gap: 5, marginTop: 5 }}>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Ionicons name="alert-circle-outline" size={20} color={themeColor0.bgColor(1)} />
                            <Text style={[NewStyles.title, { flex: 1 }]}>{t('Issues reported by user')}</Text>
                        </View>
                        <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                            <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                            <Text style={[NewStyles.text10, { flex: 1 }]}>{report?.user_reported_issues}</Text>
                        </View>
                    </View>
                )}

                {/* مشکلات گزارش شده توسط تکنسین */}
                {report?.technician_reported_issues && (
                    <View style={{ gap: 5, marginTop: 5 }}>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Ionicons name="construct-outline" size={20} color={themeColor0.bgColor(1)} />
                            <Text style={[NewStyles.title, { flex: 1 }]}>{t('Issues reported by technician')}</Text>
                        </View>
                        <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                            <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                            <Text style={[NewStyles.text10, { flex: 1 }]}>{report?.technician_reported_issues}</Text>
                        </View>
                    </View>
                )}

                {/* مشکلات مشاهده شده توسط تکنسین */}
                {report?.technician_observed_issues && (
                    <View style={{ gap: 5, marginTop: 5 }}>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Ionicons name="eye-outline" size={20} color={themeColor0.bgColor(1)} />
                            <Text style={[NewStyles.title, { flex: 1 }]}>{t('Issues observed by technician')}</Text>
                        </View>
                        <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                            <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                            <Text style={[NewStyles.text10, { flex: 1 }]}>{report?.technician_observed_issues}</Text>
                        </View>
                    </View>
                )}

                {/* خدمات درخواستی کاربر */}
                {report?.user_requested_services && (
                    <View style={{ gap: 5, marginTop: 5 }}>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Ionicons name="list-outline" size={20} color={themeColor0.bgColor(1)} />
                            <Text style={NewStyles.title}>{t('User requested services')}</Text>
                        </View>
                        <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                            <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                            <Text style={[NewStyles.text10, { flex: 1 }]}>{report?.user_requested_services}</Text>
                        </View>
                    </View>
                )}

                {/* مدت زمان تقریبی */}
                {report?.duration && renderRow(
                    t('Approximate order completion time'),
                    report?.duration,
                    NewStyles.text,
                    NewStyles.text10
                )}

                {/* هزینه تقریبی */}
                {report?.loop_cost_estimate && renderRow(
                    t('Estimated cost by Loop'),
                    formatPrice(report?.loop_cost_estimate) + ' ' + t('Toman'),
                    NewStyles.text,
                    [NewStyles.text10, { fontWeight: 'bold' }]
                )}

                {/* توضیحات لوپ */}
                {report?.loop_description && (
                    <View style={{ gap: 5, marginTop: 5 }}>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Ionicons name="document-text-outline" size={20} color={themeColor0.bgColor(1)} />
                            <Text style={NewStyles.title}>{t('Loop description')}</Text>
                        </View>
                        <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                            <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                            <Text style={[NewStyles.text10, { flex: 1 }]}>{report?.loop_description}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* دکمه تایید یا وضعیت تایید شده */}
            {isConfirmed ? (
                <View style={[styles.confirmedBox, NewStyles.center, NewStyles.border10]}>
                    <Ionicons name="checkmark-circle" size={40} color={themeColor0.bgColor(1)} />
                    <Text style={[NewStyles.title, { color: themeColor0.bgColor(1) }]}>
                        {t('Report confirmed')}
                    </Text>
                    <Text style={[NewStyles.text10]}>
                        {t('You have confirmed this report')}
                    </Text>
                </View>
            ) : (
                <View style={{ width: '100%', marginTop: 15, alignItems:'center' }}>
                    <Button
                        title={t('Confirm delivery report')}
                        onPress={() => setConfirmModal(true)}
                        loading={confirming}
                        textStyle={{color: themeColor4.bgColor(1)}}
                        style={{ backgroundColor: themeColor0.bgColor(1) }}
                    />
                    <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 8, color: themeColor0.bgColor(0.6) }]}>
                        {t('By confirming the report, you acknowledge the above information is correct')}
                    </Text>
                </View>
            )}

            {/* Modal */}
            <ConfirmationModal
                title={t('Confirm delivery report')}
                message={t('Are you sure the delivery report information is correct and you want to confirm it?')}
                action={handleConfirmReport}
                confirmationModal={confirmModal}
                setConfirmationModal={setConfirmModal}
            />
        </View>
    )
}

export default OrderLoopDispatchSection

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        width: '90%',
        alignSelf: 'center',
    },
    noticeBox: {
        backgroundColor: themeColor1.bgColor(1),
        padding: 10,
        ...NewStyles.border10,
        marginBottom: 12,
        width: '100%',
    },
    itemWrapper: {
        backgroundColor: themeColor5.bgColor(1),
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    confirmedBox: {
        backgroundColor: themeColor4.bgColor(1),
        padding: 20,
        marginTop: 15,
        width: '100%',
        gap: 10,
    },
})
