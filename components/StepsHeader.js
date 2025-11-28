import { View, Text, Pressable, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useDispatch, useSelector } from "react-redux";
import { emptySteps } from '../slices/stepSlice';
import NewStyles from '../styles/NewStyles';
import { emptyAddress } from '../slices/addressSlice';
import { themeColor0, themeColor4, themeColor5 } from '../theme/Color';
import { emptyCategory } from '../slices/categorySlice';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StepsHeader({ handleNextStep, handlePreStep, showPre }) {

    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const category = useSelector(state => state?.category);

    const navigation = useNavigation();

    return (

        <SafeAreaView edges={{ top: 'additive', bottom: 'off' }} style={[styles.header, NewStyles.rowWrapper, {

        }]}>
            <TouchableOpacity onPress={handleNextStep} style={styles.iconContainer}>
                <Image source={require("../assets/next.png")} style={styles.arrow} />
                <Text style={styles.titleText}>بعدی</Text>
            </TouchableOpacity>
            <View style={styles.titleContainer}>
                <Text style={[NewStyles.title, NewStyles.title]} numberOfLines={1} adjustsFontSizeToFit>{category?.data?.title?.substr(0, 20)}</Text>
            </View>
            {showPre ? <TouchableOpacity onPress={handlePreStep} style={styles.iconContainer}>

                <Image source={require("../assets/back.png")} style={styles.arrow} />
                <Text style={styles.titleText}>قبلی</Text>
            </TouchableOpacity>
                :
                <View style={styles.iconContainer} />
            }
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: themeColor4.bgColor(1),
        // height: 50,
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: 10,
    },
    titleText: {
        ...NewStyles.title10,
        textAlign: "center",
        fontSize: 12,
    },
    iconContainer: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        ...NewStyles.row
    },
    arrow: {
        width: 30,
        height: 30,
        resizeMode: "contain",
    },
    titleContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    
});