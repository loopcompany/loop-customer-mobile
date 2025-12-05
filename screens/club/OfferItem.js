import { Text, StyleSheet, Pressable, View } from 'react-native';
import { Image } from 'expo-image';

import { imageUri } from '../../services/URL';
import NewStyles, { deviceWidth } from '../../styles/NewStyles';
import { themeColor5 } from '../../theme/Color';

export default function OfferItem({ item, navigation }) {
    return (
        <Pressable style={styles.wrapper} onPress={() => navigation.navigate('DiscountDetail', { discountId: item.id })}>
            <View style={[NewStyles.center, NewStyles.border100, { backgroundColor: themeColor5.bgColor(1), width: '90%', aspectRatio: 1 }]}>
                <Image style={[NewStyles.center, { aspectRatio: 1, width: '100%' }]} contentFit="cover" source={{ uri: `${imageUri}/${item?.image_path}` }} />
            </View>
            <Text style={[NewStyles.text10, { textAlign: 'center' }]} numberOfLines={2}>{item?.title}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        height: deviceWidth * 0.35,
        width: deviceWidth * 0.25,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
})