import { Image, Linking, StyleSheet, Text, View, Modal, TouchableOpacity, Share, Platform } from 'react-native'
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
        const url = `${mainUri}/technician/${data?.technician?.id}`;
        
        try {
            if (Platform.OS === 'web') {
                // برای وب - استفاده از Web Share API یا کپی به کلیپبورد
                if (navigator.share) {
                    await navigator.share({
                        title: 'معرفی تکنسین لوپ',
                        text: message,
                        url: url
                    });
                    showToastOrAlert('با موفقیت به اشتراک گذاشته شد');
                } else {
                    // Fallback: کپی لینک به کلیپبورد
                    await navigator.clipboard.writeText(url);
                    showToastOrAlert('لینک کپی شد! می‌توانید آن را برای دوستان خود ارسال کنید');
                }
            } else {
                // برای موبایل - استفاده از Share API ری‌اکت نیتیو
                const result = await Share.share({ message });
                if (result.action == Share.sharedAction) {
                    showToastOrAlert('با موفقیت به اشتراک گذاشته شد');
                }
            }
        } catch (error) {
            console.error('Share error:', error);
            showToastOrAlert('خطا در به اشتراک‌گذاری!');
        }
    };
    return (
        <View style={[{ backgroundColor: themeColor4.bgColor(1), width: '90%', alignSelf: 'center', paddingVertical: 10, marginBottom: 10 }, NewStyles.border10,]}>
            <View style={NewStyles.center}>
                {data?.technician?.profile_photo_path ? <Image source={{ uri: `${imageUri}/${data?.technician?.profile_photo_path}` }} style={[styles.profileImage, NewStyles.center, NewStyles.border100]} contentFit="cover" /> : <View style={[styles.profileImage, NewStyles.border100, NewStyles.center]}><Text style={styles.profileImageThumbnail}>{data?.technician?.name?.[0]}</Text></View>}
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
                <Pressable style={[NewStyles.row, NewStyles.center, NewStyles.whiteButton, NewStyles.shadow, { gap: 5 }]} onPress={() => {
                    if(data?.status==0 || data?.status==1){
                         Linking.openURL(`tel:${data?.technician?.phone}`)
                    }else{
                        showToastOrAlert('به علت لغو یا اتمام سفارش امکان تماس با تکنسین وجود ندارد.')
                    }
                 }}>
                    <Ionicons name="call-outline" size={18} color={themeColor0.bgColor(1)} />
                    <Text style={[NewStyles.text, { fontSize: 12 }]}>تماس با تکنسین</Text>
                </Pressable>
                <Pressable style={[NewStyles.row, NewStyles.center, NewStyles.whiteButton, NewStyles.shadow, { gap: 5 }]} onPress={() => { navigation.navigate('ChatRoom', { technicianId: data?.technician?.id }) }}>
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={themeColor0.bgColor(1)} />
                    <Text style={[NewStyles.text, { fontSize: 12 }]}>پیام به تکنسین</Text>
                    {(data?.unread_messages_count > 0) && <Text style={[NewStyles.text4, styles.chatItemBadge, { position: 'absolute', left: 0, top: -5, backgroundColor: themeColor6.bgColor(1) }]}>{data?.unread_messages_count}</Text>}
                </Pressable>
                <Pressable style={[NewStyles.row, NewStyles.center, NewStyles.whiteButton, NewStyles.shadow, { gap: 5 }]} onPress={() => { handleShare() }}>
                    <Ionicons name={"share-social-outline"} size={18} color={themeColor0.bgColor(1)} />
                    <Text style={[NewStyles.text, { fontSize: 12 }]}>ارسال به دوستان</Text>
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

                        <Text style={[NewStyles.title, { marginBottom: 20 }]}>کد QR معرفی تکنسین</Text>

                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={`${mainUri}/technician/${data?.technician?.id}`}
                                size={200}
                                color={themeColor0.bgColor(1)}
                                backgroundColor={themeColor4.bgColor(1)}
                            />
                        </View>

                        <Text style={[NewStyles.text10, { marginTop: 20, textAlign: 'center' }]}>
                            برای مشاهده اطلاعات بیشتر تکنسین
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