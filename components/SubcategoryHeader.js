import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor5 } from '../theme/Color';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SubcategoryHeader({ title }) {

    const navigation = useNavigation();

    return (
        <SafeAreaView edges={{top:'additive', bottom:'off'}} style={[styles.headerWrapper, NewStyles.shadow, NewStyles.rowWrapper]}>
            <Text style={NewStyles.title}>{title}</Text>
            <Ionicons name="arrow-back-outline" size={24} color={themeColor0.bgColor(1)} onPress={() => { navigation.goBack() }} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    headerWrapper: {
        // height: 60,
        backgroundColor: themeColor5.bgColor(1),
        paddingHorizontal: '5%',
        paddingBottom:10
    },
})