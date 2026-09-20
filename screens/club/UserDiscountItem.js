import { View, Text, Pressable, Image, StyleSheet, Platform } from 'react-native';
import React, { useMemo } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { createStyles } from '@styles/NewStyles';
import NewStyles, { deviceWidth } from '@styles/NewStyles';
import { imageUri } from '@services/URL';
import { themeColor0, themeColor3, themeColor4, themeColor5, colors } from '@theme/Color';
import { formatPrice, formatDate, showToastOrAlert } from '@helpers/Common';
import {langIsRTL} from'@helpers/Common';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { getCodeState } from '@services/DiscountApi';
export default function UserDiscountItem({ item, navigation }) {

  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(()=> createLocalStyles(NewStyles, i18n.language), [NewStyles, i18n.language]);
  const isRtl = langIsRTL(i18n.language)

    // usable / used_up / expired — همان سه حالتی که قرارداد توصیه کرده. قبلاً
    // فقط «تمام شد» بر اساس count نمایش داده می‌شد و کدِ منقضی‌شده همچنان
    // «قابل استفاده تا ...» به نظر می‌رسید.
    const state = getCodeState(item);
    const stateStyle = {
        usable: { label: t('Usable'), color: colors.success.bgColor(1) },
        used_up: { label: t('Finished'), color: colors.textMuted.bgColor(1) },
        expired: { label: t('Expired'), color: colors.error.bgColor(1) },
    }[state];

    const copyToClipboard = () => {
        if (!item?.code) return;
        Clipboard.setStringAsync(item.code);
        showToastOrAlert(t('The code was successfully copied.'))
    };

    const openPlan = () => {
        // بدون شناسه‌ی طرح، صفحه‌ی جزئیات چیزی برای بارگذاری ندارد.
        if (item?.club?.id == null) return;
        navigation.navigate('DiscountDetail', { discountId: item.club.id });
    };

    return (
        <Pressable style={[styles.discountItem, NewStyles.border10, NewStyles.shadow, state !== 'usable' && styles.inactive]} onPress={openPlan}>
            <View style={[styles.discountWrapper, NewStyles.row]}>
                <Image style={[styles.discountImage, NewStyles.border100]} source={{ uri: `${imageUri}/${item?.club?.image_path}` }} blurRadius={1} />
                <View style={styles.discountTextWrapper}>
                    <Text style={NewStyles.text10}>{item?.club?.title}</Text>
                    {item?.count > 0 ? <Text style={NewStyles.text}>{t("For {{num}} more uses", {num: item?.count})}</Text> : <Text style={NewStyles.text}>{t('Finished')}</Text>}
                </View>
                <View style={[styles.badge, { backgroundColor: stateStyle.color }]}>
                    <Text style={styles.badgeText}>{stateStyle.label}</Text>
                </View>
            </View>
            <Pressable style={[NewStyles.textInput, NewStyles.border10, NewStyles.row, { gap: 5 }]} onPress={copyToClipboard}>
                <Ionicons name={'copy-outline'} size={20} color={themeColor0.bgColor(1)} />
                <Text style={NewStyles.text10}>{item?.code}</Text>
            </Pressable>
            
            <View style={[NewStyles.rowWrapper, { width: '100%', paddingHorizontal: '5%' }]}>
                <Text style={NewStyles.text3}>{item?.discount_percent} {t('percent discount')}</Text>
                <View style={NewStyles.row}>
                    <Text style={NewStyles.text}>{t('Usable until')} {formatDate(item?.expiry_date)}</Text>
                    <Ionicons   name={isRtl ? 'chevron-back' : 'chevron-forward'} size={15} color={themeColor0.bgColor(1)} />
                </View>
            </View>

            {/* سقف تخفیف اگر تعیین شده باشد. بدون این، کاربر «۱۰٪» می‌بیند و
                انتظار تخفیف نامحدود دارد. */}
            {Number(item?.club?.max_price) > 0 && (
                <Text style={styles.maxPrice}>
                    {t('Up to {{amount}} Tomans', { amount: formatPrice(item.club.max_price) })}
                </Text>
            )}
        </Pressable>
    )
}

const createLocalStyles = (NewStyles, lang) => StyleSheet.create({
    inactive: {
        opacity: 0.55,
    },
    badge: {
        marginStart: 'auto',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.pill,
    },
    badgeText: {
        fontSize: fontSize.xs,
        fontFamily: getFontFamily('bold', lang),
        color: colors.textInverse.color,
    },
    maxPrice: {
        width: '100%',
        paddingHorizontal: '5%',
        fontSize: fontSize.xs,
        color: colors.textSecondary.color,
    },
    discountItem: {
        backgroundColor: themeColor4.bgColor(1),
        width: deviceWidth * 0.9,
        alignItems: 'center',
        margin: 10,
        paddingBottom: 10,
    },
    discountImage: {
        height: 65,
        width: 65,
    },
    discountWrapper: {
        width: '100%',
        paddingHorizontal: 15,
        paddingTop: 10,
        gap: 5
    },
    discountTextWrapper: {
        // flex: 1,
        paddingRight: 20,
    },
    punch: {
        height: 25,
        width: 25,
        backgroundColor: themeColor5.bgColor(1),
    },
    perforage: {
        alignSelf: 'center',
        width: '95%',
        borderBottomWidth: 1,
        borderBottomColor: Platform.OS == 'android' ? themeColor3.bgColor(1) : themeColor3.bgColor(0.5),
        borderStyle: Platform.OS == 'android' ? 'dashed' : 'solid',
    },
})