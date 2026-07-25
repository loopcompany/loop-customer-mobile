import { View, Text, Pressable, Image } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor4, themeColor6 } from '../theme/Color';
import { setMaleCount, setFemaleCount, setUnspecifiedCount, setGeneralData } from '../slices/stepSlice';
import { imageUri } from '../services/URL';

export default function Gender({ step, data }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const femaleCount = useSelector(state => state.step?.femaleCount);
    const maleCount = useSelector(state => state.step?.maleCount);
    const unspecifiedCount = useSelector(state => state.step?.unspecifiedCount);

    return (
        <View style={NewStyles.seperator1}>
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
                    <Text style={NewStyles.title4}>{data?.title} {data?.is_required == '1' && <Text style={NewStyles.title6}>*</Text>}</Text>
                </View>
            </View>
            {data?.des && <View style={{ backgroundColor: themeColor1.bgColor(1), padding: 10, ...NewStyles.border5 }}><Text style={NewStyles.text10}>{data?.des}</Text></View>}

            {data?.is_required == 1 && <Pressable
                onPress={() => {
                    dispatch(setMaleCount(1));
                    dispatch(setFemaleCount(0));
                    dispatch(setUnspecifiedCount(0));
                    dispatch(setGeneralData({ fieldId: data?.id, value: 1, step }));
                }}
                style={[NewStyles.border5, {
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: maleCount === 1 ? themeColor0.bgColor(0.1) : themeColor4.bgColor(1),
                    marginBottom: 10
                }]}
            >
                <Text style={[NewStyles.text3, { color: maleCount === 1 ? themeColor0.bgColor(1) : themeColor0.bgColor(1) }]}>{t('Male Technician')}</Text>
            </Pressable>
            }
            {data?.is_required == 1 && <Pressable
                onPress={() => {
                    dispatch(setFemaleCount(1));
                    dispatch(setMaleCount(0));
                    dispatch(setUnspecifiedCount(0));
                    dispatch(setGeneralData({ fieldId: data?.id, value: 1, step }));
                }}
                style={[NewStyles.border5, {
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: femaleCount === 1 ? themeColor0.bgColor(0.1) : themeColor4.bgColor(1)
                }]}
            >
                <Text style={[NewStyles.text3, { color: femaleCount === 1 ? themeColor0.bgColor(1) : themeColor0.bgColor(1) }]}>{t('Female Technician')}</Text>
            </Pressable>}
        </View>
    )
}