import { View, Text, FlatList, Pressable, ImageBackground, Platform, TextInput } from 'react-native';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { Image } from 'expo-image';

import { createStyles } from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor2, themeColor3, themeColor4, themeColor5, themeColor6, themeColor8 } from '../theme/Color';
import { decrement, increment, setCounterInputValue } from '../slices/stepSlice';
import { formatPrice, langIsRTL } from '../helpers/Common';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { imageUri } from '../services/URL';
import { useTranslation } from 'react-i18next';

const pad2 = value => String(value).padStart(2, '0');

const getCountdownParts = milliseconds => {
    const safeMs = Math.max(0, milliseconds);

    const totalSeconds = Math.floor(safeMs / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
        days,
        hours,
        minutes,
        seconds,
        isFinished: safeMs <= 0,
    };
};

const PackageCountdown = memo(function PackageCountdown({
    nowServer,
    endAt,
    styles,
    NewStyles,
}) {
    const initialRemainingRef = useRef(0);
    const clientStartTimeRef = useRef(Date.now());

    const [remainingMs, setRemainingMs] = useState(0);

    useEffect(() => {
        if (!nowServer || !endAt) return;

        const serverNowTime = new Date(nowServer).getTime();
        const endTime = new Date(endAt).getTime();

        if (Number.isNaN(serverNowTime) || Number.isNaN(endTime)) {
            setRemainingMs(0);
            return;
        }

        const initialRemaining = Math.max(0, endTime - serverNowTime);

        initialRemainingRef.current = initialRemaining;
        clientStartTimeRef.current = Date.now();

        setRemainingMs(initialRemaining);

        const interval = setInterval(() => {
            const elapsedFromClient = Date.now() - clientStartTimeRef.current;
            const nextRemaining = Math.max(
                0,
                initialRemainingRef.current - elapsedFromClient
            );

            setRemainingMs(nextRemaining);

            if (nextRemaining <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [nowServer, endAt]);

    const countdown = useMemo(
        () => getCountdownParts(remainingMs),
        [remainingMs]
    );
    const { t } = useTranslation()

    if (!nowServer || !endAt) return null;
    if (countdown.isFinished) return null;
    return (
        <ImageBackground source={require('../assets/images/backtimer.png')} style={styles.timerContainer}>
            {countdown.isFinished ? (
                <Text style={[NewStyles.title1,]}>زمان این پکیج تمام شده</Text>
            ) : (
                <>

                    <View style={styles.timerRow}>
                        <View style={styles.timerBox}>
                            <Text style={styles.timerNumber}>
                                {pad2(countdown.days)}
                            </Text>
                            <Text style={styles.timerLabel}>{t("Day")}</Text>
                        </View>

                        <View style={styles.timerBox}>
                            <Text style={styles.timerNumber}>
                                {pad2(countdown.hours)}
                            </Text>
                            <Text style={styles.timerLabel}>{t("Houre")}</Text>
                        </View>

                        <View style={styles.timerBox}>
                            <Text style={styles.timerNumber}>
                                {pad2(countdown.minutes)}
                            </Text>
                            <Text style={styles.timerLabel}>{t("Minute")}</Text>
                        </View>

                        <View style={styles.timerBox}>
                            <Text style={styles.timerNumber}>
                                {pad2(countdown.seconds)}
                            </Text>
                            <Text style={styles.timerLabel}>{t("Second")}</Text>
                        </View>
                    </View>
                </>
            )}
        </ImageBackground>
    );
});

export default function Counter({ step, data }) {

    const dispatch = useDispatch();
    const is_package = data?.is_package == '1' ? true : false
    const [show, setShow] = useState(true);
    const { t, i18n } = useTranslation();
    const lang = i18n.language
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
    const renderPrice = (item) => {
        if (item.price > 0 && item.show_price == 1 && item?.value) {
            const total = item.price * item.value;
            return (
                <Text style={[NewStyles.text, is_package && NewStyles.title4, is_package && { textAlign: langIsRTL(lang) ? 'right' : 'left' }]}>+ {formatPrice(total)} تومان</Text>
            );
        }
        return null;
    };

    return (
        <View style={NewStyles.seperator1}>
            <Pressable style={[{ backgroundColor: themeColor0.bgColor(1), paddingVertical: 10, ...NewStyles.border10, ...NewStyles.center }]} onPress={() => { setShow(pre => !pre) }}>
                <View style={[NewStyles.row, { gap: 10 }]}>
                    {data?.icon_name &&
                        <Image
                            source={{ uri: `${imageUri}/${data?.icon_name}` }}
                            style={{ height: 70, width: 70, resizeMode:'contain' }}
                        />
                    }
                    <Text style={NewStyles.title4}> {data?.title} {data?.is_required == 1 && <Text style={NewStyles.title6}>*</Text>}</Text>
                </View>
                <Ionicons name={'chevron-down'} color={themeColor1.bgColor(1)} size={20} />
            </Pressable>
            {(data?.des && show) &&
                <LinearGradient colors={[themeColor4.bgColor(1), themeColor3.bgColor(1)]} style={[{ alignSelf: 'center', backgroundColor: themeColor3.bgColor(1), paddingHorizontal: 40, paddingVertical: 10, borderWidth: 1, borderColor: themeColor4.bgColor(1) }, NewStyles.border10]}>
                    <Text style={NewStyles.title10}>{data?.des}</Text>
                </LinearGradient>
            }
            {show && <FlatList
                style={{ gap: 20 }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id?.toString()}
                data={data?.field_details}
                contentContainerStyle={[Platform.OS === 'web' && { gap: 20 }]}
                renderItem={({ item }) => {
                    if (is_package) {

                        return (
                            <View style={[{ width: '100%', backgroundColor: themeColor10.bgColor(1) }, NewStyles.border10]}>

                                {item?.image_path && <Image source={{ uri: `${imageUri}/${item?.image_path}` }} style={[{ width: '100%', aspectRatio: 0.67 }, NewStyles.border10]} resizeMode='contain' />}
                                {item?.now_server && item?.end_at ? (
                                    <PackageCountdown
                                        nowServer={item.now_server}
                                        endAt={item.end_at}
                                        styles={styles}
                                        NewStyles={NewStyles}
                                    />
                                ) : null}
                                <View style={[{ paddingHorizontal: 10, }]}>
                                    <View style={[NewStyles.rowWrapper, { width: 120 }]}>
                                        <Pressable onPress={() => { dispatch(increment({ fieldId: data?.id, fieldDetailId: item.id, step })) }}
                                            style={NewStyles.add}>
                                            <Ionicons name='add' size={24} color={themeColor4.bgColor(1)} />
                                        </Pressable>
                                        <View style={[styles.valueContainer]}>
                                            <Text style={[NewStyles.text3, NewStyles.text4, { textAlign: 'center' }]}>{item.value}</Text>
                                        </View>
                                        <Pressable onPress={() => { if (item.value > 0) { dispatch(decrement({ fieldId: data?.id, fieldDetailId: item.id, step })) } }} style={NewStyles.remove}>
                                            <Ionicons name='remove' size={24} color={themeColor4.bgColor(1)} />
                                        </Pressable>
                                    </View>
                                </View>
                                <View style={{ width: '100%', paddingHorizontal: 15, paddingBottom: 10 }}>
                                    {renderPrice(item)}
                                </View>
                            </View>

                        )
                    }
                    return (
                        <View style={[{ backgroundColor: themeColor4.bgColor(1), width: '100%' }, NewStyles.border10, NewStyles.shadow]}>

                            <LinearGradient colors={[themeColor4.bgColor(1), themeColor8.bgColor(0.5)]} style={[{ gap: 10, padding: 10, width: '100%' }, NewStyles.border10]}>

                                <View style={[{ width: '100%', gap: 20 }, NewStyles.row]}>
                                    {
                                        item?.image_path &&
                                        <Image
                                            source={{ uri: `${imageUri}/${item?.image_path}` }}
                                            style={{ height: 100, width: 100 }}
                                        />}
                                    <View style={[{ flex: 1 }, NewStyles.center]}>
                                        <Text style={[NewStyles.title10, { fontSize: 14, marginBottom: 10 }]}>{item.title}</Text>
                                        {item?.des ? <View style={[{ backgroundColor: themeColor1.bgColor(1), padding: 10, marginBottom: 10 }, NewStyles.border5]}><Text style={NewStyles.text10}>{item?.des}</Text></View> : null}

                                        <View style={[NewStyles.rowWrapper, { width: 120, borderWidth: 1, borderColor: themeColor0.bgColor(1), padding: 5 }, NewStyles.border5]}>
                                            <Pressable onPress={() => { dispatch(increment({ fieldId: data?.id, fieldDetailId: item.id, step })) }}
                                                style={NewStyles.add}>
                                                <Ionicons name='add' size={24} color={themeColor4.bgColor(1)} />
                                            </Pressable>
                                            <View style={[{ borderWidth: 1, borderColor: themeColor0.bgColor(1), paddingHorizontal: 10 }, NewStyles.border5]}>
                                                <Text style={[NewStyles.title10, { textAlign: 'center' }]}>{item.value}</Text>
                                            </View>
                                            <Pressable onPress={() => { if (item.value > 0) { dispatch(decrement({ fieldId: data?.id, fieldDetailId: item.id, step })) } }} style={NewStyles.remove}>
                                                <Ionicons name='remove' size={24} color={themeColor0.bgColor(1)} />
                                            </Pressable>
                                        </View>

                                    </View>
                                </View>

                                {
                                    data?.has_user_descriptions == 1 &&
                                    <View style={{  }}>
                                        <View style={[NewStyles.row]}>
                                            <Text style={[NewStyles.text, { flex: 1 }]}>توضیحات </Text>
                                        </View>
                                        <View style={[NewStyles.textInput, NewStyles.row, NewStyles.border10, { gap: 5, paddingVertical: 0, backgroundColor: themeColor4.bgColor(1), borderWidth:2, borderColor: themeColor8.bgColor(1), borderStyle:'dotted' }]}>
                                            <TextInput style={[NewStyles.text10, { flex: 1, }]} multiline textAlignVertical='top' verticalAlign='top' keyboardType='default' maxLength={191} value={item?.user_descriptions} onChangeText={(text) => { dispatch(setCounterInputValue({ fieldId: data?.id, fieldDetailId: item.id, value: text, step })) }} />
                                        </View>
                                    </View>
                                }
                                {renderPrice(item)}

                            </LinearGradient>
                        </View>
                    )
                }
                }
            />}
        </View>
    )
}
const createLocalStyles = (NewStyles) => StyleSheet.create({
    package: {
        backgroundColor: themeColor1.bgColor(1),
        padding: 15,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: themeColor10.bgColor(1),
    },

    packageImageContainer: {
        width: '100%',
        gap: 12,
    },

    packageCounterWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },

    valueContainer: {
        borderWidth: 1,
        borderColor: themeColor0.bgColor(1),
        height: 40,
        width: 40,
        ...NewStyles.border5,
        ...NewStyles.center,
    },

    timerContainer: {
        paddingVertical: 23,
        paddingHorizontal: 10,
        gap: 10,
        ...NewStyles.border10,
        alignItems: 'flex-end',
        justifyContent: 'flex-end'
    },

    timerRow: {
        flexDirection: 'row',
        ...NewStyles.center,
        gap: 8,
        marginTop: 10,
        paddingHorizontal: 10,
    },

    timerBox: {
        width: 45,
        height: 45,
        backgroundColor: themeColor4.bgColor(0),
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    timerNumber: {
        fontSize: 17,
        color: themeColor4.bgColor(1),
        textAlign: 'center',
    },

    timerLabel: {
        ...NewStyles.text4,
        fontSize: 11,
        marginTop: 3,
        textAlign: 'center',
    },

    precentageContainer: {

    },
});