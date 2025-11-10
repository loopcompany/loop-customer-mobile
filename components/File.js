import { View, Text, Pressable, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor6 } from '../theme/Color';
import { removeFile, setFile } from '../slices/stepSlice';
import { imageUri, uri } from '../services/URL';
import { useTranslation } from 'react-i18next';
import { showToastOrAlert } from '../helpers/Common';

export default function File({ step, data }) {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const token = useSelector(state => state?.auth?.token);
    const imagePath = useSelector(state => state.step?.imagePath);

    console.log('🔐 [File] توکن از Redux:', token ? 'موجود' : 'خالی');

    const upload = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images', 'videos'],
                allowsEditing: true,
                quality: 0.5,
            });
            
            if (result.canceled) {
                return;
            }

            console.log('📤 [File] شروع آپلود فایل...');
            console.log('📤 [File] Platform:', Platform.OS);
            
            setLoading(true);

            let formData = new FormData();
            let localUri = result.assets[0].uri;
            let filename = localUri.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;

            if (Platform.OS === 'web') {
                // در وب، باید فایل رو به صورت Blob آپلود کنیم
                console.log('🌐 [File] آپلود در حالت وب...');
                
                const response = await fetch(localUri);
                const blob = await response.blob();
                formData.append('file[]', blob, filename);
                
                console.log('🌐 [File] Blob آماده شد:', { size: blob.size, type: blob.type });
            } else {
                // در Native
                console.log('📱 [File] آپلود در حالت Native...');
                formData.append('file[]', { 
                    uri: localUri, 
                    name: filename, 
                    type 
                });
            }

            // اگر توکن در Redux نیست، از AsyncStorage بخونیم
            let authToken = token;
            if (!authToken) {
                console.log('⚠️ [File] توکن در Redux نیست، از AsyncStorage می‌خونیم...');
                authToken = await AsyncStorage.getItem('userToken');
                console.log('🔑 [File] توکن از AsyncStorage:', authToken ? 'پیدا شد' : 'پیدا نشد');
            }

            if (!authToken) {
                showToastOrAlert('لطفاً ابتدا وارد حساب کاربری خود شوید');
                return;
            }

            // در وب، نباید Content-Type رو دستی ست کنیم
            // مرورگر خودش boundary رو اضافه می‌کنه
            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            };

            // فقط در Native باید Content-Type رو ست کنیم
            if (Platform.OS !== 'web') {
                headers['Content-Type'] = 'multipart/form-data';
            }

            console.log('📤 [File] ارسال درخواست به سرور...');
            console.log('🔑 [File] توکن:', authToken ? `${authToken.substring(0, 20)}...` : 'خالی یا undefined');
            console.log('🌐 [File] URL:', `${uri}/orders/upload`);
            console.log('📋 [File] Headers:', JSON.stringify(headers, null, 2));

            const uploadResponse = await axios.post(
                `${uri}/orders/upload`, 
                formData, 
                { headers }
            );

            console.log('✅ [File] آپلود موفق:', uploadResponse?.data?.data);
            dispatch(setFile(uploadResponse?.data?.data));
            showToastOrAlert('فایل با موفقیت آپلود شد');

        } catch (error) {
            console.error('❌ [File] خطا در آپلود:', error);
            console.error('❌ [File] جزئیات خطا:', error.response?.data);
            
            const message = error.response
                ? error.response.status === 401
                    ? t('Unauthorized access!')
                    : error.response.data?.message || t('An unexpected error occurred!')
                : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={[NewStyles.seperator1, { alignItems: 'center' }]}>
            <View style={{width:'100%'}}>
                <View style={[NewStyles.row, { gap: 5 }]}>
                    <Ionicons name={data?.icon_name} size={24} color={themeColor0.bgColor(1)} />
                    <Text style={NewStyles.title}>{data?.title} {data?.is_required == 1 && <View style={[{ backgroundColor: themeColor6.bgColor(1), paddingHorizontal: 5 }, NewStyles.border5]}><Text style={NewStyles.text4}>الزامی</Text></View>}</Text>
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
        </View>
    )
}

const styles = StyleSheet.create({
    file: {
        height: 80,
        borderWidth: 1,
        borderColor: themeColor0.bgColor(1),
        borderStyle: 'dashed',
        // maxWidth: 800,
        width: '100%'
    },
})