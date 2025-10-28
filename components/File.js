import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import axios from 'axios';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor6 } from '../theme/Color';
import { removeFile, setFile } from '../slices/stepSlice';
import { imageUri, uri } from '../services/URL';
import { useTranslation } from 'react-i18next';

export default function File({ step, data }) {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const token = useSelector(state => state?.auth?.token);
    const imagePath = useSelector(state => state.step?.imagePath);

    const upload = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            quality: 0.5,
        });
        if (result.canceled) {
            return;
        }
        let formData = new FormData();
        let localUri = result.assets[0].uri;
        let filename = localUri.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        formData.append('file[]', { uri: localUri, name: filename, type });
        setLoading(true)
        await axios
            .post(`${uri}/order/upload`, formData, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }, })
            .then(response => {
                dispatch(setFile(response?.data))
            })
            .catch(error => {
                const message = error.response
                    ? error.response.status === 401
                        ? t('Unauthorized access!')
                        : t('An unexpected error occurred!')
                    : t('Network error!');
                showToastOrAlert(message);
            }).finally(() => {
                setLoading(false)
            });
    }

    return (
        <View style={NewStyles.seperator1}>
            <View style={[NewStyles.row, { gap: 5 }]}>
                <Ionicons name={data?.icon_name} size={24} color={themeColor0.bgColor(1)} />
                <Text style={NewStyles.title}>{data?.title} {data?.is_required == 1 && <View style={[{backgroundColor: themeColor6.bgColor(1), paddingHorizontal: 5 }, NewStyles.border5]}><Text style={NewStyles.text4}>الزامی</Text></View>}</Text>
            </View>
            {data?.des && <Text style={NewStyles.text10}>{data?.des}</Text>}
            <Pressable style={[styles.file, NewStyles.border10, NewStyles.center]} onPress={() => upload()} >
                {loading ? (
                    <ActivityIndicator size="small" color={themeColor0.bgColor(1)} />
                ) : imagePath ? (
                    <View style={[NewStyles.center, { height: '100%', width: '100%' }]}>
                        <Pressable style={[{ position: 'absolute', zIndex: 1 }, NewStyles.center]} onPress={() => { dispatch(removeFile()); }}>
                            <Ionicons name="close-circle" size={50} color={themeColor1.bgColor(1)} />
                        </Pressable>
                        <Image style={{ height: 80, width: '100%' }} blurRadius={5} contentFit='cover' source={{ uri: `${imageUri}/${imagePath}` }} />
                    </View>
                ) : (
                    <Ionicons name="image" size={24} color={themeColor0.bgColor(1)} />
                )}
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    file: {
        height: 80,
        borderWidth: 1,
        borderColor: themeColor0.bgColor(1),
        borderStyle: 'dashed',
    },
})