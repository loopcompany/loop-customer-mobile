import { View, Text, Pressable, StyleSheet } from 'react-native';
import React from 'react';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor5, themeColor6, themeColor7 } from '../../theme/Color';
import { formatDateTime } from '../../helpers/Common';
import { imageUri } from '../../services/URL';
import { Image } from 'expo-image';

export default function ChatItem({ item, noBorder, navigation }) {
    return (
        <Pressable style={[NewStyles.rowWrapper, styles.chatItemWrapper, !noBorder && styles.chatItemSeperator]} onPress={() => { navigation.navigate('Chat Room', { technicianId: item?.technician_id }) }}>
            {/* <ProfileImage user={item?.technician} size={60} fontSize={20} /> */}
            <View>
                {item?.technician?.profile_photo_path ? (<Image style={[styles.profileImage, NewStyles.center, NewStyles.border100]} source={{ uri: `${imageUri}/${item?.technician?.profile_photo_path}` }} contentFit="cover" />) : (<View style={[styles.profileImage, NewStyles.border100, NewStyles.center]}><Text style={[styles.profileImageThumbnail]}>{item?.technician?.fname?.[0]}{item?.technician?.lname?.[0]}</Text></View>)}
                <View style={[styles.userStatus, NewStyles.border100]} />
            </View>
            <View style={{ flex: 1, gap: 5 }}>
                <View style={NewStyles.rowWrapper}>
                    <View style={[NewStyles.rowWrapper, { gap: 5 }]}>
                        <Text style={NewStyles.text}>{item?.technician?.fname} {item?.technician?.lname}</Text>
                        {item?.is_closed == 1 &&
                            <View style={[styles.chatItemLabel, NewStyles.border5]}>
                                <Text style={NewStyles.text4}>بسته شده</Text>
                            </View>
                        }
                    </View>
                    <Text style={NewStyles.text3}>{formatDateTime(item?.created_at)}</Text>
                </View>
                <View style={NewStyles.rowWrapper}>
                    <Text style={[NewStyles.text10, { flex: 1 }]} numberOfLines={1}>{item.msg}</Text>
                    {(item?.is_read > 0) &&
                        <View style={[styles.chatItemBadge, NewStyles.border100, NewStyles.center]}>
                            <Text style={NewStyles.text4}>{item?.is_read}</Text>
                        </View>
                    }
                </View>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    chatItemWrapper: {
        gap: 10,
        marginHorizontal: '5%',
        paddingVertical: 10,
    },
    chatItemSeperator: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBlockColor: themeColor3.bgColor(1)
    },
    chatItemLabel: {
        backgroundColor: themeColor6.bgColor(1),
        paddingHorizontal: 5
    },
    chatItemBadge: {
        width: 20,
        height: 20,
        backgroundColor: themeColor6.bgColor(1),
    },
    profileImage: {
        height: 60,
        aspectRatio: 1,
        backgroundColor: themeColor0.bgColor(1),
    },
    profileImageThumbnail: {
        fontSize: 20,
        fontFamily: 'iransans',
        color: themeColor5.bgColor(1),
        textTransform: 'uppercase',
    },
    userStatus: {
        position: 'absolute',
        height: 10,
        aspectRatio: 1,
        // width: size,
        bottom: 2.5,
        left: 5,
        backgroundColor: themeColor7.bgColor(1),
        borderWidth: 1,
        borderColor: themeColor5.bgColor(1),
    },
})