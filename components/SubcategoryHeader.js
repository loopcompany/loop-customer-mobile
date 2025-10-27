import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor5 } from '../theme/Color';

export default function SubcategoryHeader({ title }) {

    const navigation = useNavigation();

    return (
        <View style={[styles.headerWrapper, NewStyles.shadow, NewStyles.rowWrapper]}>
            <Text style={NewStyles.title}>{title}</Text>
            <Ionicons name="arrow-back-outline" size={24} color={themeColor0.bgColor(1)} onPress={() => { navigation.goBack() }} />
        </View>
    )
}

const styles = StyleSheet.create({
    headerWrapper: {
        height: 60,
        backgroundColor: themeColor5.bgColor(1),
        paddingHorizontal: '5%',
    },
})