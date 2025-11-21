import { View, Text, StyleSheet, Pressable, ActivityIndicator, Modal, TouchableWithoutFeedback } from 'react-native'
import { useState } from 'react'
import * as Clipboard from 'expo-clipboard';
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10, themeColor3, themeColor4, } from '../../theme/Color';
import { showToastOrAlert } from '../../helpers/Common';
import { Image } from 'expo-image';

export default function DiscountModal({ discountModal, setDiscountModal, code }) {

    const [pending, setPending] = useState(false);

    const copyToClipboard = async () => {
        setPending(true);
        await Clipboard.setStringAsync(code);
        showToastOrAlert('کد با موفقیت کپی شد.');
        setPending(false);
    }

    return (
        <Modal animationType='slide' transparent={true} visible={discountModal}
            onRequestClose={() => { setDiscountModal(!discountModal); }}
        >
            <TouchableWithoutFeedback onPress={() => { setDiscountModal(false) }} >
                <View style={styles.container}>
                    <View style={[styles.modalView, NewStyles.shadow]}>
                        <View style={NewStyles.center}>
                            <Text style={NewStyles.title}>جایزه با موفقیت دریافت شد.</Text>
                        </View>
                        <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(1) }} />
                        <View style={NewStyles.center}>
                            <Image style={{ aspectRatio: 1, width: '50%' }} contentFit="contain" source={require('../../assets/images/emojies/Party.png')} />
                        </View>
                        <Text style={NewStyles.text10}>برای مشاهده این کد تشویقی به قسمت جایزه‌های دریافتی بروید.</Text>

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
                                <Ionicons name={'ticket-outline'} size={20} color={themeColor0.bgColor(1)} />
                                <Text style={NewStyles.text10}>{code}</Text>
                            </View>
                            <Pressable
                                style={[
                                    { gap: 5, flex: 1, backgroundColor: themeColor0.bgColor(1), height: 50 },
                                    NewStyles.border10,
                                    NewStyles.center
                                ]}
                                onPress={() => { copyToClipboard() }}>
                                {!pending && <Text style={[NewStyles.text4, {textAlign: 'center', fontSize: 16}]}>کپی کردن</Text>}
                                {pending && <ActivityIndicator color={themeColor4.bgColor(1)} size='small' />}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        gap: 10,
    },
    container: {
        backgroundColor: themeColor10.bgColor(0.3),
        height: '100%', width: '100%',
    },
    modalView: {
        height: '40%',
        minHeight: 400,
        width: '100%',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: themeColor4.bgColor(1),

        position: 'absolute',
        bottom: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
});