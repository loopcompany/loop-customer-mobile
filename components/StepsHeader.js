import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useDispatch, useSelector } from "react-redux";
import { emptySteps } from '../slices/stepSlice';
import NewStyles from '../styles/NewStyles';
import { emptyAddress } from '../slices/addressSlice';
import { themeColor0, themeColor5 } from '../theme/Color';
import { emptyCategory } from '../slices/categorySlice';

export default function StepsHeader() {

    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const category = useSelector(state => state?.category);

    const navigation = useNavigation();

    return (
        <View style={[styles.headerWrapper, NewStyles.shadow, NewStyles.rowWrapper]}>
            <Pressable style={[NewStyles.rowWrapper, { gap: 5 }]} onPress={() => { navigation.goBack(); dispatch(emptySteps()); dispatch(emptyAddress()); dispatch(emptyCategory()) }}>
                <Ionicons name="arrow-forward-outline" size={24} color={themeColor0.bgColor(1)} />
                <Text style={NewStyles.title}>{(category?.data?.title?.length > 20) ? category?.data?.title?.substr(0, 20) + '...' : category?.data?.title?.substr(0, 20)} - {user?.data?.city?.title}</Text>
            </Pressable>
            <Text style={NewStyles.text} onPress={() => { navigation.goBack(); dispatch(emptySteps()); dispatch(emptyAddress()); dispatch(emptyCategory()); }}>لغو سفارش</Text>
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