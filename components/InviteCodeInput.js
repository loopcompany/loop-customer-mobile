import React from 'react';
import { View, Text, Platform } from 'react-native';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import NewStyles from '@styles/NewStyles';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { useTranslation } from 'react-i18next';
import { langIsRTL } from '@helpers/Common';

/**
 * Reusable Invite Code Input Component
 *
 * @param {string} value - Current invite code value
 * @param {function} onChangeText - Function to handle text change
 * @param {string} prefix - Prefix letter (default: 'L')
 * @param {number} cellCount - Number of input cells (default: 5)
 * @param {boolean} hasError - Whether component has validation error
 * @param {string} errorMessage - Error message to display
 * @param {object} style - Additional container styles
 */
export default function InviteCodeInput({
    value,
    onChangeText,
    prefix = 'L',
    cellCount = 5,
    hasError = false,
    errorMessage = '',
    style = {},
}) {
    const { t, i18n } = useTranslation();
    const isRTL = langIsRTL(i18n.language);

    // CodeField hooks
    const ref = useBlurOnFulfill({ value, cellCount });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue: onChangeText,
    });

    const cellStyle = {
        width: 40,
        height: 52,
        backgroundColor: colors.white.bgColor(1),
        borderRadius: radius.sm,
        fontSize: fontSize.xl,
        color: colors.black.bgColor(1),
        fontFamily: getFontFamily('bold', i18n.language),
        textAlign: 'center',
        lineHeight: 52,
        borderWidth: hasError ? 2 : 1,
        borderColor: hasError ? colors.error.bgColor(1) : colors.border.bgColor(1),
        marginHorizontal: 3,
    };

    return (
        <View style={[NewStyles.textInput, { width: '100%', borderRadius: radius.sm, marginTop: spacing.xs + 2, marginBottom: spacing.xs + 2 }, style]}>
            <Text style={{
                color: colors.black.bgColor(1),
                fontFamily: getFontFamily('light', i18n.language),
                marginBottom: spacing.xs + 2,
                textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr'
            }}>
                {t('Referral code (optional)')}
            </Text>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                // Pin this row to LTR so the prefix box never flips to the right
                // when the surrounding form renders RTL: on web the parent's
                // `writingDirection: 'rtl'` becomes CSS `direction: rtl`, which
                // reverses flex rows. The code itself (L-XXXXX) always reads LTR.
                writingDirection: 'ltr',
                width: '100%',
                justifyContent: 'center',
            }}>
                {/* Prefix Box */}
                <View style={{
                    backgroundColor: colors.white.bgColor(1),
                    borderWidth: hasError ? 2 : 1,
                    borderColor: hasError ? colors.error.bgColor(1) : colors.border.bgColor(1),
                    borderRadius: radius.sm,
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    width: 52,
                    height: 52,
                }}>
                    <Text style={{
                        fontFamily: getFontFamily('bold', i18n.language),
                        color: colors.black.bgColor(1),
                        fontSize: fontSize.xxl,
                        textAlign: "center"
                    }}>
                        {prefix}-
                    </Text>
                </View>

                {/* Code Input Field */}
                <CodeField
                    ref={ref}
                    {...props}
                    value={value}
                    onChangeText={onChangeText}
                    cellCount={cellCount}
                    keyboardType="default"
                    textContentType="none"
                    autoComplete={Platform.select({
                        android: "off",
                        default: "off",
                    })}
                    renderCell={({ index, symbol, isFocused }) => (
                        <Text
                            key={index}
                            style={[
                                cellStyle,
                                isFocused && { borderColor: colors.primaryLight.bgColor(1) }
                            ]}
                            onLayout={getCellOnLayoutHandler(index)}
                        >
                            {symbol || (isFocused ? <Cursor /> : null)}
                        </Text>
                    )}
                />
            </View>

            {/* Error Message */}
            {hasError && errorMessage && (
                <Text style={{
                    color: colors.error.bgColor(1),
                    fontFamily: getFontFamily('light', i18n.language),
                    fontSize: fontSize.xs,
                    textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr',
                    marginTop: spacing.xs + 1,
                }}>
                    {errorMessage}
                </Text>
            )}
        </View>
    );
}
