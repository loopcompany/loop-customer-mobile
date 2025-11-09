// components/LuckyWheel.js
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Pressable,
    Dimensions,
    Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { G, Path, Text as SvgText, Circle, Polygon } from 'react-native-svg';

import { themeColor0, themeColor1, themeColor6, themeColor7 } from '../theme/Color';
import NewStyles from '../styles/NewStyles';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.75;
const CENTER = WHEEL_SIZE / 2;

const LuckyWheel = ({ prizes, onSpinStart, spinning, disabled }) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [currentRotation, setCurrentRotation] = useState(0);

    const numberOfSegments = prizes.length;
    const anglePerSegment = 360 / numberOfSegments;

    // رنگ‌های متنوع برای بخش‌های گردونه
    const segmentColors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
        '#F8B739', '#52B788', '#E63946', '#06FFA5'
    ];

    const handleSpin = () => {
        if (spinning || disabled) return;

        // فراخوانی تابع شروع چرخش (برای فراخوانی API)
        if (onSpinStart) {
            onSpinStart();
        }

        // محاسبه چرخش تصادفی (10-15 دور + زاویه تصادفی)
        const randomSpins = Math.floor(Math.random() * 5) + 10;
        const randomDegree = Math.floor(Math.random() * 360);
        const totalRotation = currentRotation + (randomSpins * 360) + randomDegree;

        rotateAnim.setValue(0);

        Animated.timing(rotateAnim, {
            toValue: totalRotation - currentRotation,
            duration: 4000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            setCurrentRotation(totalRotation % 360);
        });
    };    const renderSegments = () => {
        return prizes.map((prize, index) => {
            const startAngle = (anglePerSegment * index - 90) * (Math.PI / 180);
            const endAngle = (anglePerSegment * (index + 1) - 90) * (Math.PI / 180);

            const x1 = CENTER + CENTER * Math.cos(startAngle);
            const y1 = CENTER + CENTER * Math.sin(startAngle);
            const x2 = CENTER + CENTER * Math.cos(endAngle);
            const y2 = CENTER + CENTER * Math.sin(endAngle);

            const pathData = `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${CENTER} ${CENTER} 0 0 1 ${x2} ${y2} Z`;

            // موقعیت متن (ایموجی)
            const textAngle = startAngle + (endAngle - startAngle) / 2;
            const textRadius = CENTER * 0.65;
            const textX = CENTER + textRadius * Math.cos(textAngle);
            const textY = CENTER + textRadius * Math.sin(textAngle);

            return (
                <G key={index}>
                    <Path
                        d={pathData}
                        fill={segmentColors[index % segmentColors.length]}
                        stroke="#fff"
                        strokeWidth="2"
                    />
                    <SvgText
                        x={textX}
                        y={textY}
                        fill="#fff"
                        fontSize="24"
                        fontWeight="bold"
                        textAnchor="middle"
                        transform={`rotate(${(anglePerSegment * index)}, ${textX}, ${textY})`}
                    >
                        {prize.label}
                    </SvgText>
                </G>
            );
        });
    };

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 360],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            {/* نمایش امتیازها بالای گردونه */}


            <View style={styles.wheelContainer}>
                {/* فلش بالای گردونه */}
                <View style={styles.pointerContainer}>
                    <Ionicons name="caret-down" size={40} color={themeColor6.bgColor(1)} />
                </View>

                {/* گردونه */}
                <Animated.View
                    style={[
                        styles.wheel,
                        {
                            transform: [{ rotate: rotation }],
                        },
                    ]}
                >
                    <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
                        {/* دایره مرکزی پس‌زمینه */}
                        <Circle
                            cx={CENTER}
                            cy={CENTER}
                            r={CENTER}
                            fill="#f0f0f0"
                        />

                        {/* بخش‌های گردونه */}
                        {renderSegments()}

                        {/* دایره مرکزی */}
                        <Circle
                            cx={CENTER}
                            cy={CENTER}
                            r={CENTER * 0.15}
                            fill="#fff"
                            stroke={themeColor1.bgColor(1)}
                            strokeWidth="3"
                        />
                    </Svg>
                </Animated.View>

                {/* دکمه چرخش */}
                <Pressable
                    style={[styles.spinButton, (spinning || disabled) && styles.spinButtonDisabled]}
                    onPress={handleSpin}
                    disabled={spinning || disabled}
                >
                    <Ionicons
                        name="play"
                        size={30}
                        color="#fff"
                    />
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    prizesLegend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
        paddingHorizontal: 10,
        gap: 10,
    },
    prizeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 5,
    },
    prizeEmoji: {
        fontSize: 16,
    },
    wheelContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    pointerContainer: {
        position: 'absolute',
        top: -20,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    wheel: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    spinButton: {
        position: 'absolute',
        width: CENTER * 0.3,
        height: CENTER * 0.3,
        borderRadius: CENTER * 0.15,
        backgroundColor: themeColor1.bgColor(1),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    spinButtonDisabled: {
        opacity: 0.5,
    },
});

export default LuckyWheel;
