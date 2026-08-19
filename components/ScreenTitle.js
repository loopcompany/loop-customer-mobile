import { Pressable, StyleSheet, Text, View, Platform, StatusBar, Dimensions } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import NewStyles from '../styles/NewStyles'
import { themeColor0 } from '../theme/Color'

const ScreenTitle = ({title, onPress, style, textStyle}) => {
    const insets = useSafeAreaInsets()
    const { width } = Dimensions.get('window')

    return (
        <Pressable
            style={[
                styles.title,
                NewStyles.border10,
                {
                    marginTop: insets.top > 0 ? insets.top + 10 : Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
                    width: width * 0.9,
                    alignSelf: 'center'
                },
                style,
            ]}
            onPress={onPress}
        >
            <Text style={[NewStyles.title4, textStyle]}>{title}</Text>
        </Pressable>
    )
}

export default ScreenTitle

const styles = StyleSheet.create({
    title: {
        backgroundColor: themeColor0.bgColor(1),
        padding: 15,
        marginBottom: 20,
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
})