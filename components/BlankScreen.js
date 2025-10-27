import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import NewStyles from '../styles/NewStyles'
import { themeColor0, themeColor4, themeColor10 } from '../theme/Color'
import ScreenHeaders from './ScreenHeaders'
import Footer from '../screens/Footer'

const BlankScreen = ({
    title = "صفحه خالی",
    icon = "document-outline",
    message = "هنوز محتوایی برای نمایش وجود ندارد",
    buttonText = "بازگشت",
    onButtonPress,
}) => {
    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <View style={styles.content}>
                
                <View style={styles.logoContainer}>
                    <Image
                        source={require("../assets/logo.png")}
                        style={styles.logo}
                    />
                </View>

                {/* Icon */}
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={icon}
                        size={80}
                        color={themeColor10.bgColor(0.3)}
                    />
                </View>

                {/* Message */}
                <Text style={[NewStyles.text10, styles.message]}>
                   رکوردی در این صفحه یافت نشد.
                </Text>

               

                {/* Button */}
                {onButtonPress && (
                    <TouchableOpacity
                        style={styles.button}
                        onPress={onButtonPress}
                    >
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    </TouchableOpacity>
                )}
            </View>


        </SafeAreaView>
    )
}

export default BlankScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e0f0ff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    logoContainer: {
        marginBottom: 30,
    },
    logo: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        opacity: 0.7,
    },
    iconContainer: {
        marginBottom: 30,
        padding: 20,
        borderRadius: 50,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    message: {
        fontSize: 18,
        color: '#005b9f',
        textAlign: 'center',
        marginBottom: 15,
        fontFamily: 'VazirBold',
        lineHeight: 28,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
    },
    button: {
        backgroundColor: '#005b9f',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'VazirBold',
        textAlign: 'center',
    },
})