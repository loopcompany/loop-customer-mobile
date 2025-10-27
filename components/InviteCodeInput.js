import React from 'react';
import { View, Text, Platform } from 'react-native';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import NewStyles from '../styles/NewStyles';
import { themeColor10, themeColor3 } from '../theme/Color';

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
    // CodeField hooks
    const ref = useBlurOnFulfill({ value, cellCount });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue: onChangeText,
    });

    const cellStyle = {
        width: 27,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 6,
        fontSize: 18,
        color: '#000',
        fontFamily: 'VazirBold',
        textAlign: 'center',
        lineHeight: 40,
        borderWidth: hasError ? 2 : 1,
        borderColor: hasError ? '#ff4444' : '#ccc',
        marginHorizontal: 2,
    };

    return (
        <View style={[NewStyles.textInput, { width: '100%', borderRadius: 10, marginTop: 6, marginBottom: 6 }, style]}>
            <Text style={{ 
                color: themeColor10.bgColor(1), 
                fontFamily: 'VazirLight', 
                marginBottom: 6, 
                textAlign: 'right' 
            }}>
                کد معرف (اختیاری)
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {/* Prefix Box */}
                <View style={[
                    NewStyles.codePrefixBox, 
                    NewStyles.border5, 
                    { 
                        backgroundColor: '#ffffff', 
                        borderColor: hasError ? '#ff4444' : '#ccc', 
                        width: 36, 
                        height: 40 
                    }
                ]}>
                    <Text style={{ 
                        fontFamily: 'VazirBold', 
                        color: '#000', 
                        fontSize: 25, 
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
                                isFocused && { borderColor: themeColor3.bgColor(1) }
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
                    color: '#ff4444',
                    fontFamily: 'VazirLight',
                    fontSize: 12,
                    textAlign: 'right',
                    marginTop: 5,
                }}>
                    {errorMessage}
                </Text>
            )}
        </View>
    );
}