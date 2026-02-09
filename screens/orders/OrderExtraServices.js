import { StyleSheet, Text, View, ActivityIndicator, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTranslation } from 'react-i18next'

import { uri } from '../../services/URL'
import NewStyles from '../../styles/NewStyles'
import { formatPrice, showToastOrAlert } from '../../helpers/Common'
import { themeColor0, themeColor3, themeColor4, themeColor5 } from '../../theme/Color'
import Button from '../../components/Button'

const OrderExtraServices = ({ orderId, navigation }) => {
    const { t } = useTranslation()
    const token = useSelector((state) => state?.auth?.token)
    const [loading, setLoading] = useState(true)
    const [extraServices, setExtraServices] = useState([])

    useEffect(() => {
        if (orderId) {
            fetchExtraServices()
        }
    }, [orderId])

    const fetchExtraServices = async () => {
        setLoading(true)
        try {
            const response = await axios.post(
                `${uri}/orders/extra-services`,
                { order_id: orderId },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (response.status === 200 && response.data?.success) {
                setExtraServices(response.data?.data?.extra_services || [])
            }
        } catch (error) {
            const message = error?.response?.data?.message || t('Error fetching extra costs')
            showToastOrAlert(message)
            setExtraServices([])
        } finally {
            setLoading(false)
        }
    }

    const renderExtraServiceItem = ({ item }) => (
        <View style={[styles.itemWrapper, NewStyles.border10]}>
            <View style={{}}>
                <View style={[NewStyles.row, { gap: 5, flex: 1 ,}]}>
                    <Ionicons name="ellipse" size={10} color={themeColor0.bgColor(0.5)} />
                    <View>
                        <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.title ?? item?.extra_service?.title}</Text>
                        <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.extra_service?.des}</Text>
                    </View>
                </View>
                <Text style={[NewStyles.title, { fontSize: 14, textAlign:'left' }]}>
                    {formatPrice(item?.price)} {t('Toman')}
                </Text>
            </View>
            {item?.extra_service?.description && (
                <Text style={[NewStyles.text10, { color: themeColor0.bgColor(0.6), paddingRight: 15 }]}>
                    {item?.extra_service?.description}
                </Text>
            )}
        </View>
    )

    if (loading) {
        return (
            <View style={[styles.container, NewStyles.center]}>
                <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
                <Text style={[NewStyles.text10, { marginTop: 10 }]}>{t('Loading...')}</Text>
            </View>
        )
    }

    if (extraServices.length === 0) {
        return (
            <View style={[styles.container, NewStyles.center]}>
                <Ionicons name="file-tray-outline" size={50} color={themeColor0.bgColor(0.3)} />
                <Text style={[NewStyles.text10, { marginTop: 10, color: themeColor0.bgColor(0.6) }]}>
                    {t('No extra costs recorded')}
                </Text>
            </View>
        )
    }

    // محاسبه مجموع هزینه‌های اضافی
    const totalExtraPrice = extraServices.reduce((sum, item) => sum + Number(item?.price || 0), 0)

    return (
        <View style={[styles.container]}>
            <View style={[{ backgroundColor: themeColor4.bgColor(1), width: '90%', alignSelf: 'center', paddingVertical: 15 }, NewStyles.border10]}>
                {/* Header */}
                <View style={[styles.headerWrapper]}>
                    <View style={[NewStyles.row, { gap: 5 }]}>
                        <Ionicons name="cash-outline" size={24} color={themeColor0.bgColor(1)} />
                        <Text style={NewStyles.title}>{t('Extra Costs')}</Text>
                    </View>
                </View>

                {/* List */}
                <FlatList
                    data={extraServices}
                    renderItem={renderExtraServiceItem}
                    keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                    contentContainerStyle={{ gap: 10, paddingHorizontal: '5%' }}
                    scrollEnabled={false}
                />

                {/* Total */}
                <View style={[styles.totalWrapper, { marginTop: 15 }]}>
                    <Text style={NewStyles.title}>{t('Total Extra Costs:')}</Text>
                    <Text style={[NewStyles.title, { color: themeColor0.bgColor(1) }]}>
                        {formatPrice(totalExtraPrice)} {t('Toman')}
                    </Text>
            
                </View>
                <View style={{paddingHorizontal:'5%', width:'100%', alignItems:'center'}}>
                    <Button title={t('Quote')} onPress={()=>{navigation.navigate('Invoice', { orderId: orderId })}} />
                </View>
            </View>
        </View>
    )
}

export default OrderExtraServices

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
    },
    headerWrapper: {
        paddingHorizontal: '5%',
        paddingBottom: 15,
    },
    itemWrapper: {
        backgroundColor: themeColor5.bgColor(1),
        paddingVertical: 12,
        paddingHorizontal: 15,
        gap: 8,
    },
    totalWrapper: {
        backgroundColor: themeColor3.bgColor(0.2),
        paddingVertical: 12,
        paddingHorizontal: '5%',
        marginHorizontal: '5%',
        borderRadius: 10,
        ...NewStyles.rowWrapper,
        alignItems: 'center',
    },
})