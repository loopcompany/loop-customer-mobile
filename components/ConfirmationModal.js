import { View, Modal, StyleSheet, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import NewStyles, { deviceHeight } from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4 } from '../theme/Color';

export default function ConfirmationModal({ title, message, action, confirmationModal, setConfirmationModal }) {

    const { t } = useTranslation();

    return (
        <Modal animationType='fade' transparent={true} visible={confirmationModal} onRequestClose={() => { setConfirmationModal(!confirmationModal) }}>
            {/* <TouchableWithoutFeedback onPress={() => { setConfirmationModal(false) }}> */}
            <View style={[styles.container, NewStyles.center]}>
                <View style={[styles.modalView, NewStyles.border10]}>
                    <Text style={NewStyles.title10}>{title}</Text>
                    <Text style={NewStyles.text10}>{message}</Text>
                    <View style={[NewStyles.row, { justifyContent: 'flex-end', gap: 20 }]}>
                        <Pressable style={[NewStyles.border10, NewStyles.shadow, { backgroundColor: themeColor0.bgColor(1), paddingVertical: 10, paddingHorizontal: 20 }]} onPress={() => { action(); setConfirmationModal(false) }}>
                            <Text style={NewStyles.text4}>بله</Text>
                        </Pressable>
                        <Pressable style={[NewStyles.border10, NewStyles.shadow, { backgroundColor: themeColor1.bgColor(1), paddingVertical: 10, paddingHorizontal: 20 }]} onPress={() => { setConfirmationModal(false) }}>
                            <Text style={NewStyles.text4}>خیر</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
            {/* </TouchableWithoutFeedback> */}
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColor3.bgColor(0.5),
    },
    modalView: {
        height: deviceHeight * 0.17,
        width: '90%',
        backgroundColor: themeColor4.bgColor(1),
        paddingHorizontal: 20,
        justifyContent: 'space-evenly',
    },
});