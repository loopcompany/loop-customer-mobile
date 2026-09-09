import { View, Text, Modal, StyleSheet, TextInput, TouchableWithoutFeedback } from 'react-native';
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Rating } from '@kolking/react-native-rating';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';

import { uri } from '@services/URL';

import { themeColor0, themeColor3, themeColor4 } from '@theme/Color';
import NewStyles from '@styles/NewStyles';
import { showToastOrAlert } from '@helpers/Common';
import PairButton from './PairButton';
import { fetchOrders } from '@slices/orderSlice';
import { fetchUser } from '@slices/userSlice';

export default function RateModal({ rateModal, setRateModal, orderId, data }) {

    const { t } = useTranslation();
    const dispatch = useDispatch()

    const token = useSelector(state => state?.auth?.token);

    const [rate, setRate] = useState(0);    
    const [comment, setComment] = useState(null);

    const submitReview = async () => {
        try {
            const response = await axios.post(`${uri}/review/submit`, { orderId, rate, comment }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            if (response.status == 201) {
                const message = t('Your review has been submitted successfully!');
                dispatch(fetchUser(token))
                dispatch(fetchOrders(token))
                showToastOrAlert(message);
            }
        } catch (error) {
            const message = error.response ? t('An unexpected error occurred!') : t('Network error!');
            showToastOrAlert(message);
        }
    }

    return (
        <Modal animationType='fade' transparent={true} visible={rateModal} onRequestClose={() => { setRateModal(!rateModal); }}>
            <TouchableWithoutFeedback onPress={() => { setRateModal(false) }}>
                <View style={[styles.container, NewStyles.center]}>
                    <View style={[styles.modalView, NewStyles.border10]}>
                        <Text style={NewStyles.title10}>به تکنسین و سفارش خود امتیاز دهید.</Text>
                        <Rating variant="stars" size={30} baseColor={themeColor3.bgColor(1)} fillColor={themeColor0.bgColor(1)} touchColor={themeColor0.bgColor(1)} rating={Number(data?.rate) || rate} onChange={(value) => setRate(value)} />
                        <Text style={NewStyles.text10}>لطفاً با ثبت امتیاز و نظر خود ما را در ارتقاء کیفیت خدمات یاری فرمایید. بازخورد شما نقش مهمی در بهبود تجربه سایر کاربران و ارزیابی عملکرد تکنسینان دارد.</Text>
                        <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { width: '100%', height: 150 }]} placeholder='دیدگاه خود را با ما به اشتراک بکذارید.' placeholderTextColor={themeColor3.bgColor(1)} verticalAlign='top' textAlignVertical='top' editable={data ? false : true} multiline={true} value={data?.cm || comment} maxLength={350} onChangeText={(text) => { setComment(text) }} />
                        {!data && <PairButton text1={`${t('Submit Review')}`} onPress1={() => { submitReview(); setRateModal(false); setRate(0); setComment(null) }} text2={`${t('Dismiss')}`} onPress2={() => { setRateModal(false); setRate(0); setComment(null) }} />}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColor3.bgColor(0.5),
    },
    modalView: {
        height: '50%',
        minHeight: 400,
        width: '85%',
        padding: '5%',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: themeColor4.bgColor(1),
    },
});