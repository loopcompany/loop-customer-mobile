import { View, Text, Pressable, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import React, { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createStyles } from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor3, themeColor4, themeColor6 } from '../theme/Color';
import { removeFile, setFile } from '../slices/stepSlice';
import { imageUri, uri } from '../services/URL';
import { useTranslation } from 'react-i18next';
import { handleError, showToastOrAlert } from '../helpers/Common';
import { LinearGradient } from 'expo-linear-gradient';

export default function FileStep({ step, data }) {

    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const token = useSelector(state => state?.auth?.token);
    const imagePath = useSelector(state => state.step?.imagePath);
    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);

    // به جای imagePath، آرایه فایل‌ها
    const files = useSelector(state => state.step?.files || []);

    const upload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'image/*',
                copyToCacheDirectory: true,
                multiple: true,
            });

            console.log('DocumentPicker result:', result);

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            const formData = new FormData();

            for (let index = 0; index < result.assets.length; index++) {
                const asset = result.assets[index];

                console.log('asset:', asset);

                const fileName =
                    asset.name ||
                    `image-${Date.now()}-${index}.jpg`;

                const fileType =
                    asset.mimeType ||
                    asset.type ||
                    'image/jpeg';

                if (Platform.OS === 'web') {
                    let webFile;

                    if (asset.file instanceof File) {
                        webFile = asset.file;
                    } else {
                        const response = await fetch(asset.uri);
                        const blob = await response.blob();

                        webFile = new File(
                            [blob],
                            fileName,
                            {
                                type: fileType || blob.type || 'image/jpeg',
                            }
                        );
                    }

                    console.log('webFile:', webFile);

                    formData.append('file[]', webFile);
                } else {
                    formData.append('file[]', {
                        uri: asset.uri,
                        name: fileName,
                        type: fileType,
                    });
                }
            }

            // برای تست اینکه واقعاً چیزی داخل FormData هست
            for (let pair of formData.entries()) {
                console.log('FormData item:', pair[0], pair[1]);
            }

            setLoading(true);

            const response = await axios.post(
                `${uri}/orders/uploadMultiple`,
                formData,
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                        // Content-Type نگذار
                    },
                }
            );

            console.log('upload response:', response?.data);

            dispatch(setFile(response?.data));
        } catch (error) {
            console.log('Upload error:', error);
            console.log('Upload error response:', error?.response?.data);
            handleError(error, t);
        } finally {
            setLoading(false);
        }
    };



    return (
        <View style={NewStyles.seperator}>
             
            <View
                style={[NewStyles.center, {
                    backgroundColor: themeColor0.bgColor(1),
                    paddingVertical: 10,
                    ...NewStyles.border10
                }]}

            >
                <View style={[NewStyles.row, { gap: 10 }]}>
                    <Image
                        source={{ uri: `${imageUri}/${data?.icon_name}` }}
                        style={{ height: 50, width: 50, resizeMode: 'contain' }}
                    />
                    <Text style={NewStyles.title4}> {data?.title} {data?.is_required == 1 && <Text style={NewStyles.title6}>*</Text>} </Text>
                </View>
            </View>

            {data?.des &&
                <LinearGradient colors={[themeColor4.bgColor(1), themeColor3.bgColor(1)]} style={[{ alignSelf: 'center', backgroundColor: themeColor3.bgColor(1), paddingHorizontal: 40, paddingVertical: 10, borderWidth: 1, borderColor: themeColor4.bgColor(1), gap: 5, maxWidth: '100%' }, NewStyles.border10, NewStyles.row]}>
                    <Ionicons
                        name={'help-circle-outline'}
                        size={20}
                        color={themeColor10.bgColor(1)}
                    />
                    <Text style={[NewStyles.title10, { fontSize: 12 }]}>{data?.des}</Text>
                </LinearGradient>
            }

            <View
                style={[styles.file, NewStyles.border10, NewStyles.center]}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={themeColor0.bgColor(1)} />
                ) : files.length > 0 ? (
                    <View
                        style={styles.previewContainer}
                    >
                        <Pressable
                            style={[styles.addMoreBox, NewStyles.center]}
                            onPress={upload}
                        >
                            <Ionicons name="add" size={28} color={themeColor0.bgColor(1)} />
                            <Text style={NewStyles.text}>{t("Add")}</Text>
                        </Pressable>
                        {files.map((item, index) => {
                            const imagePath = typeof item === 'string' ? item : item.path;

                            return (
                                <View key={index} style={styles.imageWrapper}>
                                    <Pressable
                                        style={styles.removeButton}
                                        onPress={() => dispatch(removeFile(index))}
                                    >
                                        <Ionicons
                                            name="close-circle"
                                            size={24}
                                            color={themeColor1.bgColor(1)}
                                        />
                                    </Pressable>

                                    <Image
                                        style={styles.image}
                                        contentFit="cover"
                                        source={{ uri: `${imageUri}/${imagePath}` }}
                                    />
                                </View>
                            );
                        })}


                    </View>
                ) : (
                    <Pressable onPress={upload} style={NewStyles.center}>
                        <Ionicons name="images" size={28} color={themeColor0.bgColor(1)} />
                        <Text style={NewStyles.text}>{t("Select multiple images")}</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
    file: {
        minHeight: 120,
        borderWidth: 1,
        borderColor: themeColor0.bgColor(1),
        borderStyle: 'dashed',
        padding: 10,
    },
    previewContainer: {
        ...NewStyles.row,
        gap: 10,
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    imageWrapper: {
        width: 90,
        height: 90,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#eee',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    removeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        zIndex: 2,
    },
    addMoreBox: {
        width: 90,
        height: 90,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: themeColor0.bgColor(1),
    },
    addMoreText: {
        marginTop: 4,
        fontSize: 12,
        color: themeColor0.bgColor(1),
    },
    uploadText: {
        marginTop: 8,
        color: themeColor0.bgColor(1),
    },
});
