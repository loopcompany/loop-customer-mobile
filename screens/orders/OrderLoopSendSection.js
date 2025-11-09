import { StyleSheet, Text, View, TextInput } from 'react-native'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Ionicons from '@expo/vector-icons/Ionicons'

import { uri } from '../../services/URL'
import NewStyles from '../../styles/NewStyles'
import { formatPrice, showToastOrAlert } from '../../helpers/Common'
import { themeColor0, themeColor1, themeColor4, themeColor5, themeColor6, themeColor7 } from '../../theme/Color'
import Button from '../../components/Button'
import ConfirmationModal from '../../components/ConfirmationModal'

const OrderLoopSendSection = ({ data, orderId, onUpdate }) => {
    const token = useSelector((state) => state?.auth?.token)
    const [userDescription, setUserDescription] = useState('')
    const [accepting, setAccepting] = useState(false)
    const [rejecting, setRejecting] = useState(false)
    const [acceptModal, setAcceptModal] = useState(false)
    const [rejectModal, setRejectModal] = useState(false)

    // چک کردن قفل بودن (تایید یا رد شده)
    const isLocked = data?.user_accept_date || data?.status == 3

    // تشخیص نوع تصمیم
    const isAccepted = data?.user_accept_date
    const isRejected = data?.status == 3

    // چک کردن پر بودن اطلاعات مورد نیاز
    const isInfoComplete = data?.duration && data?.loop_cost_estimate

    const handleAccept = async () => {
        setAcceptModal(false)
        setAccepting(true)
        try {
            const response = await axios.post(
                `${uri}/orders/${orderId}/decision`,
                {
                    decision: 'ok',
                    reason: userDescription || undefined
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (response.status == 200 && response.data?.success) {
                showToastOrAlert(response.data?.message || 'سفارش با موفقیت تایید شد')
                if (onUpdate) onUpdate()
            }
        } catch (error) {
            const message = error?.response?.data?.message || 'خطا در تایید سفارش'
            showToastOrAlert(message)
        } finally {
            setAccepting(false)
        }
    }

    const handleReject = async () => {
        setRejectModal(false)
        setRejecting(true)
        try {
            const response = await axios.post(
                `${uri}/orders/${orderId}/decision`,
                {
                    decision: 'no',
                    reason: userDescription || undefined
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (response.status == 200 && response.data?.success) {
                showToastOrAlert(response.data?.message || 'سفارش با موفقیت لغو شد')
                if (onUpdate) onUpdate()
            }
        } catch (error) {
            const message = error?.response?.data?.message || 'خطا در رد سفارش'
            showToastOrAlert(message)
        } finally {
            setRejecting(false)
        }
    }

    const renderRow = (text1, text2, textStyle1, textStyle2) => (
        <View style={NewStyles.rowWrapper}>
            <Text style={[NewStyles.text, textStyle1]}>{text1}</Text>
            <Text style={[NewStyles.text10, textStyle2]}>{text2}</Text>
        </View>
    )

    return (
        <View style={[{ width: '90%', alignSelf: 'center', paddingBottom: 10 }, NewStyles.center]}>
            {/* توضیحات */}
            <View style={[styles.noticeBox, !isLocked && !isInfoComplete && { backgroundColor: themeColor1.bgColor(1) }]}>
                <Text style={[NewStyles.text10]}>
                    {isLocked
                        ? isAccepted
                            ? 'شما این درخواست را تایید کرده‌اید'
                            : 'شما این درخواست را رد کرده‌اید'
                        : isInfoComplete
                            ? 'لطفاً اطلاعات زیر را بررسی کرده و در صورت موافقت، درخواست اعزام به لوپ را تایید یا رد کنید'
                            : 'کاربر گرامی، محصول آورده شما در حال بررسی و عیب یابی توسط لوپ می باشد. از صبر و شکیبایی شما سپاس گزاریم'}
                </Text>
            </View>

            {/* اطلاعات اعزام به لوپ */}
            {(data?.duration && data?.loop_cost_estimate) && <View style={[{ backgroundColor: themeColor4.bgColor(1), width: '100%', paddingVertical: 15, paddingHorizontal: '5%', gap: 10 }, NewStyles.border10]}>

                {/* مدت زمان تقریبی */}
                {data?.duration && (
                    <View style={{ gap: 5 }}>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Ionicons name="time-outline" size={20} color={themeColor0.bgColor(1)} />
                            <Text style={NewStyles.title}>مدت زمان تقریبی انجام سفارش</Text>
                        </View>
                        <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                            <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                            <Text style={[NewStyles.text10, { flex: 1 }]}>{data?.duration} روز کاری</Text>
                        </View>
                    </View>
                )}

                {/* هزینه تقریبی */}
                {data?.loop_cost_estimate && (
                    <View style={{ gap: 5 }}>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Ionicons name="cash-outline" size={20} color={themeColor0.bgColor(1)} />
                            <Text style={NewStyles.title}>هزینه تقریبی اعلامی توسط لوپ</Text>
                        </View>
                        <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                            <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                            <Text style={[NewStyles.text10, { flex: 1 }]}>
                                {formatPrice(data?.loop_cost_estimate)} تومان
                            </Text>
                        </View>
                    </View>
                )}

                {/* توضیحات لوپ */}
                {data?.loop_description && (
                    <View style={{ gap: 5 }}>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Ionicons name="document-text-outline" size={20} color={themeColor0.bgColor(1)} />
                            <Text style={NewStyles.title}>توضیحات لوپ</Text>
                        </View>
                        <View style={[styles.itemWrapper, NewStyles.row, NewStyles.border10, { gap: 10 }]}>
                            <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                            <Text style={[NewStyles.text10, { flex: 1 }]}>{data?.loop_description}</Text>
                        </View>
                    </View>
                )}
            </View>}

            {/* وضعیت تایید یا رد شده */}
            {isLocked ? (
                <View style={[styles.lockedBox, NewStyles.center, NewStyles.border10]}>
                    <Ionicons
                        name={isAccepted ? "checkmark-circle" : "close-circle"}
                        size={40}
                        color={isAccepted ? themeColor7.bgColor(1) : themeColor6.bgColor(1)}
                    />
                    <Text style={[NewStyles.title, {
                        color: isAccepted ? themeColor7.bgColor(1) : themeColor6.bgColor(1)
                    }]}>
                        {isAccepted ? 'تایید شده' : 'رد شده'}
                    </Text>
                    {data?.user_cancellation_reason && (
                        <>
                            <Text style={[NewStyles.text10, { marginTop: 10 }]}>دلیل شما:</Text>
                            <Text style={[NewStyles.text10]}>{data?.user_cancellation_reason}</Text>
                        </>
                    )}
                </View>
            ) : isInfoComplete ? (
                <View style={{ width: '100%', marginTop: 15, gap: 10 }}>
                    {/* فیلد توضیحات کاربر */}
                    <View style={{ gap: 5 }}>
                        <Text style={NewStyles.text}>توضیحات شما (اختیاری)</Text>
                        <TextInput
                            style={[styles.textInput, NewStyles.border10]}
                            placeholder="توضیحات خود را وارد کنید..."
                            placeholderTextColor={themeColor0.bgColor(0.4)}
                            multiline
                            numberOfLines={4}
                            value={userDescription}
                            onChangeText={setUserDescription}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* دکمه‌های تایید و رد */}
                    <View style={[NewStyles.row, { gap: 10 }]}>
                        <View style={{ flex: 1 }}>
                            <Button
                                title="لغو سفارش"
                                onPress={() => setRejectModal(true)}
                                loading={rejecting}
                                textStyle={NewStyles.text4}
                                style={{ backgroundColor: themeColor6.bgColor(1) }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Button
                                title="می پذیرم"
                                onPress={() => setAcceptModal(true)}
                                loading={accepting}
                                textStyle={NewStyles.text4}
                                style={{ backgroundColor: themeColor7.bgColor(1) }}
                            />
                        </View>
                    </View>

                    <Text style={[NewStyles.text10, { textAlign: 'center', color: themeColor0.bgColor(0.6) }]}>
                        با تایید، موافقت خود را با اعزام دستگاه به لوپ اعلام می‌کنید
                    </Text>
                </View>
            ) : null}

            {/* Modal تایید */}
            <ConfirmationModal
                title="تایید اعزام به لوپ"
                message="آیا مبلغ و  مدت زمان اعلامی توسط لوپ را می‌پذیرید؟"
                action={handleAccept}
                confirmationModal={acceptModal}
                setConfirmationModal={setAcceptModal}
            />

            {/* Modal رد */}
            <ConfirmationModal
                title="لغو سفارش"
                message="آیا لغو سفارش و عودت محصول را تایید می‌کنید؟"
                action={handleReject}
                confirmationModal={rejectModal}
                setConfirmationModal={setRejectModal}
            />
        </View>
    )
}

export default OrderLoopSendSection

const styles = StyleSheet.create({
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
    lockedBox: {
        backgroundColor: themeColor4.bgColor(1),
        padding: 20,
        marginTop: 15,
        width: '100%',
        gap: 10,
    },
    textInput: {
        backgroundColor: themeColor4.bgColor(1),
        paddingHorizontal: 15,
        paddingVertical: 12,
        minHeight: 100,
        fontSize: 14,
        fontFamily: 'VazirLight',
        color: themeColor0.bgColor(1),
        textAlign: 'right',
    },
})
