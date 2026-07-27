import { View, Text, FlatList, TextInput, StyleSheet, Pressable, Platform, Image } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor3, themeColor4, themeColor6 } from '../theme/Color';
import { setInputValue } from '../slices/stepSlice';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

export default function Input({ step, data }) {

    const dispatch = useDispatch();
    const [show, setShow] = useState(true)
    const { t, i18n } = useTranslation()
    return (
        <View style={NewStyles.seperator1}>
            <Pressable style={[{ backgroundColor: themeColor0.bgColor(1), paddingVertical: 10, ...NewStyles.border10, ...NewStyles.center }]} onPress={() => { setShow(pre => !pre) }}>
                <View style={[NewStyles.row, { gap: 10 }]}>
                    {data?.icon_name &&
                        <Image
                            source={{ uri: `${imageUri}/${data?.icon_name}` }}
                            style={{ height: 70, width: 70, resizeMode: 'contain' }}
                        />
                    }
                    <Text style={NewStyles.title4}> {data?.title} </Text>
                </View>
                <Ionicons name={'chevron-down'} color={themeColor1.bgColor(1)} size={20} />
            </Pressable>
            {(data?.des && show) &&
                <LinearGradient colors={[themeColor4.bgColor(1), themeColor3.bgColor(1)]} style={[{ alignSelf: 'center', backgroundColor: themeColor3.bgColor(1), paddingHorizontal: 40, paddingVertical: 10, borderWidth: 1, borderColor: themeColor4.bgColor(1), gap: 5, maxWidth: '100%' }, NewStyles.border10, NewStyles.row]}>
                    <Ionicons
                        name={'help-circle-outline'}
                        size={20}
                        color={themeColor10.bgColor(1)}
                    />
                    <Text style={[NewStyles.title10, { fontSize: 12 }]}>{data?.des}</Text>
                </LinearGradient>
            }
            {show && <FlatList
                style={{ gap: 20 }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id?.toString()}
                data={data?.field_details}
                contentContainerStyle={[Platform.OS === 'web' && { gap: 20 }]}
                renderItem={({ item }) =>
                    <View style={{ gap: 10 }}>
                        <Text style={[NewStyles.text, { flex: 1 }]}>{item?.title} {item?.is_required == 1 && <Text style={NewStyles.title6}> * </Text>}</Text>

                        <View style={[NewStyles.textInput, NewStyles.row, NewStyles.border10, { gap: 5, paddingVertical: 0, backgroundColor: themeColor4.bgColor(1) }]}>
                            <Ionicons name={item?.icon_name} size={20} color={themeColor0.bgColor(1)} />
                            <TextInput style={[NewStyles.text10, { flex: 1, }]} keyboardType='default' placeholder={item?.des ? `${item?.des}` : ""} placeholderTextColor={themeColor3.bgColor(1)} maxLength={150} value={item?.value} onChangeText={(text) => { dispatch(setInputValue({ fieldId: data?.id, fieldDetailId: item.id, value: text, step })) }} />
                        </View>
                    </View>
                }
            />}
        </View>
    )
}

const styles = StyleSheet.create({
    textInput: {
        width: '100%',
        height: 50,
        backgroundColor: 'transparent',
    },
})