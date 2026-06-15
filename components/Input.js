import { View, Text, FlatList, TextInput, StyleSheet, Pressable, Platform } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor6 } from '../theme/Color';
import { setInputValue } from '../slices/stepSlice';

export default function Input({ step, data }) {

    const dispatch = useDispatch();
    const [show, setShow] = useState(false)
    return (
        <View style={NewStyles.seperator1}>
            <Pressable style={[{ backgroundColor: themeColor0.bgColor(1), paddingVertical: 10, ...NewStyles.border10, ...NewStyles.center }]} onPress={() => { setShow(pre => !pre) }}>
                <View style={[NewStyles.row, { gap: 10 }]}>
                    {data?.icon_name && <Ionicons name={data?.icon_name} size={24} color={themeColor4.bgColor(1)} />}
                    <Text style={NewStyles.title4}>{data?.title}</Text>
                </View>
                <Ionicons name={'chevron-down'} color={themeColor1.bgColor(1)} size={20} />
            </Pressable>
            {show && data?.des &&
                <View style={{ backgroundColor: themeColor1.bgColor(1), padding: 10, ...NewStyles.border5 }}>
                    <Text style={NewStyles.text10}>{data?.des}</Text>
                </View>
            }
            {show && <FlatList
                style={{ gap: 20 }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id?.toString()}
                data={data?.field_details}
                contentContainerStyle={[Platform.OS==='web' &&{gap:20}]}
                renderItem={({ item }) =>
                    <View style={{ gap: 10 }}>
                        <Text style={NewStyles.text}>{item?.title} {item?.is_required == 1 && <View style={[{ backgroundColor: themeColor6.bgColor(1), paddingHorizontal: 5 }, NewStyles.border5]}><Text style={NewStyles.text4}>الزامی</Text></View>}</Text>
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