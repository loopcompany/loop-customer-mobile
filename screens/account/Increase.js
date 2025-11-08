import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as Linking from "expo-linking";
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor6 } from '../../theme/Color';
import Button from '../../components/Button';
import { uri } from '../../services/URL';
import { formatPrice, showToastOrAlert } from '../../helpers/Common';
import { fetchUser } from '../../slices/userSlice';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Increase({ navigation }) {

    const dispatch = useDispatch();
    const token = useSelector((state) => state?.auth?.token);
    const user = useSelector((state) => state.user?.data);
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState(null)
    const [paymentUrl, setPaymentUrl] = useState(null)
    const subscriptionRef = useRef(null);

    const redirectUrl = Linking.createURL("/?");

    // Cleanup listener on unmount
    useEffect(() => {
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
                subscriptionRef.current = null;
            }
        };
    }, []);

    const _addLinkingListenerWallet = () => {
        // Remove existing listener if any
        if (subscriptionRef.current) {
            subscriptionRef.current.remove();
        }

        subscriptionRef.current = Linking.addEventListener("url", ({ url }) => {
            const { queryParams } = Linking.parse(url);
            if (queryParams?.status == 'OK') {
                dispatch(fetchUser(token))
                showToastOrAlert('کیف پول شما با موفقیت شارژ شد.')
                setLoading(false);
                // Cleanup listener after handling
                if (subscriptionRef.current) {
                    subscriptionRef.current.remove();
                    subscriptionRef.current = null;
                }
                navigation.goBack();
            } else if (queryParams?.status == 'NOK') {
                showToastOrAlert('تراکنش ناموفق بود.')
                setLoading(false);
                // Cleanup listener after handling
                if (subscriptionRef.current) {
                    subscriptionRef.current.remove();
                    subscriptionRef.current = null;
                }
            }
        });
    }

    const increaseWallet = async () => {
        if (!amount || amount < 10000) {
            showToastOrAlert('حداقل مبلغ برای شارژ کیف پول ۱۰.۰۰۰ تومان می باشد.');
            return;
        }

        if (amount > 50000000) {
            showToastOrAlert('حداکثر مبلغ برای شارژ کیف پول ۵۰.۰۰۰.۰۰۰ تومان می باشد.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${uri}/wallet/charge`,
                {
                    amount: Number(amount),
                    linking_url: redirectUrl
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status == 200 && response.data?.data?.payment_url) {
                _addLinkingListenerWallet();
                await Linking.openURL(response.data.data.payment_url);
            } else {

                showToastOrAlert('خطا در اتصال به درگاه پرداخت');
                setLoading(false);
            }
        } catch (error) {
            console.log(error?.response?.data);

            const message = error?.response ? (error?.response?.data?.message || 'خطا در اتصال به درگاه پرداخت') : 'خطای شبکه!';
            showToastOrAlert(message);
            setLoading(false);
        } finally {
            setLoading(false);

        }
    }

    return (
        <SafeAreaView style={[NewStyles.container, { padding: 10 }]}>
            <ScrollView contentContainerStyle={styles.contentContainerStyle} showsVerticalScrollIndicator={false}>
                <Text style={NewStyles.text}>مبلغ مورد نظر خود را به تومان وارد کنید. <Text style={[NewStyles.title6]}>*</Text></Text>
                <Text style={NewStyles.text10}>موجودی فعلی کیف پول شما: <Text style={NewStyles.title}>{formatPrice(user?.wallet ?? 0)}</Text> تومان</Text>
                <View style={[{ backgroundColor: themeColor3.bgColor(0.2), }, NewStyles.row, NewStyles.border10]}>
                    <View
                        style={[
                            {
                                gap: 5, flex: 2, minHeight: 50,
                                paddingHorizontal: '5%',
                            },
                            NewStyles.row
                        ]}
                    >
                        <Ionicons name={'cash-outline'} size={20} color={themeColor0.bgColor(1)} />
                        <TextInput style={[styles.textInput, NewStyles.text10, NewStyles.border10, { flex: 1 }]} keyboardType='number-pad' placeholder='مبلغ به تومان' placeholderTextColor={themeColor3.bgColor(1)} maxLength={10} value={amount?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChangeText={(text) => { setAmount(text?.replace(/,/g, "")) }} />
                    </View>
                    <View
                        style={[
                            { gap: 5, flex: 1, backgroundColor: themeColor1.bgColor(1), height: 50 },
                            NewStyles.border10,
                            NewStyles.center
                        ]} >
                        <Text style={NewStyles.title}>تومان</Text>
                    </View>
                </View>
                <Button title={'پرداخت'}
                    loading={loading}
                    onPress={increaseWallet}
                />
            </ScrollView>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        gap: 10,
    },
});