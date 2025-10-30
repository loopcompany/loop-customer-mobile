import { Image, Linking, StyleSheet, Text, View, Modal, TouchableOpacity, Share } from 'react-native'
import React, { useState } from 'react'
import { themeColor0, themeColor1, themeColor4, themeColor5, themeColor6 } from '../theme/Color'
import NewStyles from '../styles/NewStyles'
import { imageUri, mainUri } from '../services/URL'
import { formatDate, showToastOrAlert } from '../helpers/Common'
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

const TechnicianDetailsComponent = ({ data, navigation }) => {
    const [showQRModal, setShowQRModal] = useState(false);
    const handleShare = async () => {
        const message = ` من از عملکرد ${data?.technician?.name}، تکنسین لوپ راضی هستم و به شما هم توصیه می‌کنم از خدمات او استفاده کنید! ${mainUri}/technician/${data?.technician?.id} `;
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
        <View style={[{ backgroundColor: themeColor4.bgColor(1), width: '90%', alignSelf: 'center', paddingVertical: 10, marginBottom:10 }, NewStyles.border10,]}>
            <View style={NewStyles.center}>
                <Image source={{ uri: `${imageUri}/${data?.technician?.profile_photo_path}` }} style={[styles.profileImage, NewStyles.center, NewStyles.border100]} contentFit="cover" />
                <Text style={NewStyles.title10}>{data?.technician?.name}</Text>
                <Text style={NewStyles.text10}>{data?.technician?.technician_type}</Text>
            </View>
            <View style={[{ paddingHorizontal: '5%', paddingBottom: 10, gap: 10 }, NewStyles.rowWrapper]}>
                <View style={[{ flex: 1 }, NewStyles.center]}>
                    <Text style={NewStyles.title10}>کد تکنسین</Text>
                    <Text style={NewStyles.text10}>{data?.technician?.referral_code}</Text>
                </View>
                <View style={[{ flex: 1 }, NewStyles.center]}>
                    <Text style={NewStyles.title10}> شروع فعالیت</Text>
                    <Text style={NewStyles.text10}>{formatDate(data?.technician?.created_at)}</Text>
                </View>

            </View>
            <View style={[{ paddingHorizontal: '10%' }]}>
                <Pressable style={[NewStyles.row, NewStyles.center, NewStyles.whiteButton, NewStyles.shadow, { gap: 5 }]} onPress={() => { Linking.openURL(`tel:${data?.technician?.phone}`) }}>
                    <Ionicons name="call-outline" size={18} color={themeColor0.bgColor(1)} />
                    <Text style={[NewStyles.text, { fontSize: 12 }]}>تماس با تکنسین</Text>
                </Pressable>
                <Pressable style={[NewStyles.row, NewStyles.center, NewStyles.whiteButton, NewStyles.shadow, { gap: 5 }]} onPress={() => { navigation.navigate('Chat Room', { technicianId: data?.technician?.id }) }}>
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={themeColor0.bgColor(1)} />
                    <Text style={[NewStyles.text, { fontSize: 12 }]}>پیام به تکنسین</Text>
                    {(data?.unread > 0) && <Text style={[NewStyles.text4, styles.chatdataBadge, { position: 'absolute', left: 0, top: -5, backgroundColor: themeColor6.bgColor(1) }]}>{data?.unread}</Text>}
                </Pressable>
                <Pressable style={[NewStyles.row, NewStyles.center, NewStyles.whiteButton, NewStyles.shadow, { gap: 5 }]} onPress={() => { handleShare()}}>
                    <Ionicons name={"share-social-outline"} size={18} color={themeColor0.bgColor(1)} />
                    <Text style={[NewStyles.text, { fontSize: 12 }]}>ارسال به دوستان</Text>
                    {(data?.unread > 0) && <Text style={[NewStyles.text4, styles.chatdataBadge, { position: 'absolute', left: 0, top: -5, backgroundColor: themeColor6.bgColor(1) }]}>{data?.unread}</Text>}
                </Pressable>
                <Pressable style={[NewStyles.row, NewStyles.center, NewStyles.whiteButton, NewStyles.shadow, { gap: 5 }]} onPress={() => { setShowQRModal(true); }}>
                    <Ionicons name={"share-social-outline"} size={18} color={themeColor0.bgColor(1)} />
                    <Text style={[NewStyles.text, { fontSize: 12 }]}>اسکن QR کد</Text>
                </Pressable>
            </View>

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

                        <Text style={[NewStyles.title, { marginBottom: 20 }]}>کد QR معرفی متخصص</Text>

                        <View style={styles.qrWrapper}>
                            <QRCode
                                value="http://192.168.21.123:8000/"
                                size={200}
                                color={themeColor0.bgColor(1)}
                                backgroundColor={themeColor4.bgColor(1)}
                            />
                        </View>

                        <Text style={[NewStyles.text10, { marginTop: 20, textAlign: 'center' }]}>
                            برای مشاهده اطلاعات بیشتر متخصص
                        </Text>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default TechnicianDetailsComponent


const styles = StyleSheet.create({
    profileImage: {
        height: 60,
        aspectRatio: 1,
        backgroundColor: themeColor5.bgColor(1),
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