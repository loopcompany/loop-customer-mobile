import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { themeColor3, themeColor4, themeColor7 } from '../theme/Color';
import NewStyles from '../styles/NewStyles';

const SwitchButton = ({
    isActive = false,
    onChange,
    activeIcon = 'checkmark',
    inactiveIcon = 'close',
    activeColor = themeColor7.bgColor(1),
    inactiveColor = themeColor3.bgColor(0.5),
    thumbColor = themeColor4.bgColor(1),
    size = 50,
}) => {
    const animValue = useRef(new Animated.Value(isActive ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animValue, {
            toValue: isActive ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isActive]);

    const trackHeight = size * 0.6;
    const thumbSize = trackHeight - 4;
    const trackWidth = size;

    const thumbTranslateX = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, trackWidth - thumbSize - 2],
    });

    const trackBackgroundColor = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveColor, activeColor],
    });

    return (
        <Pressable onPress={() => onChange?.(!isActive)}>
            <Animated.View
                style={[
                    styles.container,
                    {
                        width: trackWidth,
                        height: trackHeight,
                        borderRadius: trackHeight / 2,
                        backgroundColor: trackBackgroundColor,
                    },
                ]}
            >
                <Animated.View
                    style={[
                        {
                            width: thumbSize,
                            height: thumbSize,
                            borderRadius: thumbSize / 2,
                            backgroundColor: thumbColor,
                            transform: [{ translateX: thumbTranslateX }],
                        },
                        NewStyles.center,
                    ]}
                >
                    <Ionicons
                        name={isActive ? activeIcon : inactiveIcon}
                        size={thumbSize * 0.6}
                        color={isActive ? activeColor : inactiveColor}
                    />
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
});

export default SwitchButton;