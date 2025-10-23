import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { themeColor0, themeColor1 } from '../theme/Color'
import NewStyles from '../styles/NewStyles'

const CheckBox = ({ item }) => {
    return (
        <TouchableOpacity style={[styles.button, NewStyles.border10, NewStyles.center, item?.value > 0 && { backgroundColor:themeColor0.bgColor(0.5) }]}>
            <Text style={[NewStyles.title10, item?.value > 0 && NewStyles.text4]}>{item?.title}</Text>
        </TouchableOpacity>
    )
}

export default CheckBox

const styles = StyleSheet.create({
    button: {
        backgroundColor: themeColor1.bgColor(1),
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: "100%",
    },
})