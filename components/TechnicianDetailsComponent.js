import { Image, Linking, StyleSheet, Text, View, Modal, TouchableOpacity, Share } from 'react-native'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { themeColor0, themeColor1, themeColor4, themeColor5, themeColor6 } from '../theme/Color'
import { imageUri, mainUri } from '../services/URL'
import { formatDate, showToastOrAlert } from '../helpers/Common'
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { useDispatch, useSelector } from 'react-redux';
import { createStyles } from '../styles/NewStyles'
const TechnicianDetailsComponent = ({ data, navigation }) => {
    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);

    const [showQRModal, setShowQRModal] = useState(false);
    const token = useSelector((state) => state?.auth?.token)
    const user = useSelector((state) => state?.user?.data)
    const handleShare = async () => {
        const message = t('I am satisfied with the performance of {{name}}, Loop technician and I recommend you to use his services too! {{url}}', { name: data?.technician?.name, url: `${mainUri}/technician/${data?.technician?.id}` });
        try {
            const result = await Share.share({ message });
            if (result.action == Share.sharedAction) {

            } else if (result.action == Share.dismissedAction) {
                //
            }
        } catch {
            const message = t('An unexpected error occurred!');
            showToastOrAlert(message);
        }
    };
    return (
        <View style={[{ backgroundColor: themeColor4.bgColor(1), width: '90%', alignSelf: 'center', paddingVertical: 10, marginBottom: 10 }, NewStyles.border10,]}>
            <View style={NewStyles.center}>
                {data?.technician?.profile_photo_path ? <Image source={{ uri: `${imageUri}/${data?.technician?.profile_photo_path}` }} style={[styles.profileImage, NewStyles.center, NewStyles.border100]} contentFit="cover" /> : <View style={[styles.profileImage, NewStyles.border100, NewStyles.center]}><Text style={styles.profileImageThumbnail}>{data?.technician?.name?.[0]}</Text></View>}
                <Text style={NewStyles.title10}>{data?.technician?.name}</Text>
                <Text style={NewStyles.text10}>{t(data?.technician?.technician_type)}</Text>
            </View>
            <View style={[{ paddingHorizontal: '5%', paddingBottom: 10, gap: 10 }, NewStyles.rowWrapper]}>
                <View style={[{ flex: 1 }, NewStyles.center]}>
                    <Text style={NewStyles.title10}>{t('Technician Code')}</Text>
                    <Text style={NewStyles.text10}>{data?.technician?.referral_code}</Text>
                </View>
                <View style={[{ flex: 1 }, NewStyles.center]}>
                    <Text style={NewStyles.title10}>{t('Start of activity')}</Text>
                    <Text style={NewStyles.text10}>{formatDate(data?.technician?.created_at)}</Text>
                </View>

            </View>
            {(data?.user_initial_accept && (data?.status == 0 || data?.status == 1)) && <View style={[{ paddingHorizontal: '10%' }]}>
                <Pressable style={[NewStyles.row, NewStyles.center, NewStyles.whiteButton, NewStyles.shadow, { gap: 5 }]} onPress={() => {
                    if (data?.status == 0 || data?.status == 1) {
                        Linking.openURL(`tel:${data?.technician?.phone}`)
                    } else {
                        showToastOrAlert(t('Due to order cancellation or completion, contacting the technician is not possible.'))
                    }
                }}>
                    <Ionicons name="call-outline" size={18} color={themeColor0.bgColor(1)} />
                    <Text style={[NewStyles.text, { fontSize: 12 }]}>{t('Call technician')}</Text>
                </Pressable>
                <Pressable style={[NewStyles.row, NewStyles.center, NewStyles.whiteButton, NewStyles.shadow, { gap: 5 }]} onPress={() => { navigation.navigate('ChatRoom', { technicianId: data?.technician?.id }) }}>
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={themeColor0.bgColor(1)} />
                    <Text style={[NewStyles.text, { fontSize: 12 }]}>{t('Message to technician')}</Text>
                    {(data?.unread_messages_count > 0) && <Text style={[NewStyles.text4, styles.chatItemBadge, { position: 'absolute', left: 0, top: -5, backgroundColor: themeColor6.bgColor(1) }]}>{data?.unread_messages_count}</Text>}
                </Pressable>
                {user?.apple_check == 0 && <Pressable style={[NewStyles.row, NewStyles.center, NewStyles.whiteButton, NewStyles.shadow, { gap: 5 }]} onPress={() => { handleShare() }}>
                    <Ionicons name={"share-social-outline"} size={18} color={themeColor0.bgColor(1)} />
                    <Text style={[NewStyles.text, { fontSize: 12 }]}>{t('Send to friends')}</Text>
                </Pressable>}
                {user?.apple_check == 0 && <Pressable style={[NewStyles.row, NewStyles.center, NewStyles.whiteButton, NewStyles.shadow, { gap: 5 }]} onPress={() => { setShowQRModal(true); }}>
                    <Ionicons name={"share-social-outline"} size={18} color={themeColor0.bgColor(1)} />
                    <Text style={[NewStyles.text, { fontSize: 12 }]}>{t('Scan QR code')}</Text>
                </Pressable>}
            </View>}

            {/* QR Code Modal */}
            <Modal
                visible={showQRModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowQRModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowQRModal(false)}
                >
                    <View style={[styles.qrContainer, NewStyles.border10]}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowQRModal(false)}
                        >
                            <Ionicons name="close-circle" size={30} color={themeColor0.bgColor(1)} />
                        </TouchableOpacity>

                        <Text style={[NewStyles.title, { marginBottom: 20 }]}>{t('QR code for technician referral')}</Text>

                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={`${mainUri}/technician/${data?.technician?.id}`}
                                size={200}
                                color={themeColor0.bgColor(1)}
                                backgroundColor={themeColor4.bgColor(1)}
                            />
                        </View>

                        <Text style={[NewStyles.text10, { marginTop: 20, textAlign: 'center' }]}>
                            {t('To view more technician information')}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default TechnicianDetailsComponent


const createLocalStyles = (NewStyles) => StyleSheet.create({
    profileImage: {
        height: 60,
        aspectRatio: 1,
        backgroundColor: themeColor5.bgColor(1),
    },
    profileImageThumbnail: {
        fontSize: 20,
        fontFamily: 'VazirBold',
        color: themeColor0.bgColor(1),
    },
    chatItemBadge: {
        width: 20,
        height: 20,
        backgroundColor: themeColor0.bgColor(0.5),
        borderRadius: 100,
        textAlign: 'center'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrContainer: {
        backgroundColor: themeColor4.bgColor(1),
        padding: 30,
        alignItems: 'center',
        width: '80%',
        maxWidth: 350,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    qrWrapper: {
        padding: 20,
        backgroundColor: themeColor4.bgColor(1),
        borderRadius: 10,
    },
})