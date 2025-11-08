import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Animated,
    Pressable,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { themeColor1, themeColor7 } from '../theme/Color';
import NewStyles from '../styles/NewStyles';

const { width } = Dimensions.get('window');

const WinnerModal = ({ visible, onClose, prize, totalGems }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible && prize) {
            // ریست ابتدا
            scaleAnim.setValue(0);
            opacityAnim.setValue(0);
            rotateAnim.setValue(0);

            // انیمیشن باز شدن
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, prize, scaleAnim, opacityAnim, rotateAnim]);

    const handleClose = () => {
        // انیمیشن بسته شدن
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (!prize) return null;

    return (
        <Modal
            visible={visible && prize !== null}
            transparent
            animationType="none"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <Animated.View
                style={[
                    styles.backdrop,
                    { opacity: opacityAnim }
                ]}
            >
                <Animated.View
                    style={[
                        styles.container,
                        {
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* آیکون مدال چرخان */}
                    <Animated.View
                        style={[
                            styles.iconContainer,
                            { transform: [{ rotate: rotation }] },
                        ]}
                    >
                        <View style={styles.iconCircle}>
                            <Text style={styles.iconEmoji}>{prize.name}</Text>
                        </View>
                    </Animated.View>

                    {/* محتوای مدال */}
                    <View style={styles.content}>
                        <Text style={styles.title}>🎉 تبریک! 🎉</Text>

                        <Text style={styles.subtitle}>شما برنده شدید</Text>

                        <View style={styles.gemContainer}>
                            <Text style={styles.gemAmount}>{prize.gems}</Text>
                            <Text style={styles.gemLabel}>امتیاز 💎</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>مجموع امتیازات شما:</Text>
                            <Text style={styles.totalAmount}>{totalGems} 💎</Text>
                        </View>

                        {/* دکمه تایید */}
                        <Pressable
                            style={styles.button}
                            onPress={handleClose}
                        >
                            <Text style={styles.buttonText}>عالی!</Text>
                        </Pressable>
                    </View>

                    {/* دکمه بستن */}
                    <Pressable style={styles.closeButton} onPress={handleClose}>
                        <Ionicons name="close" size={24} color="#666" />
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.85,
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 0,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        marginTop: -40,
        marginBottom: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: themeColor1.bgColor(1),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: themeColor1.bgColor(1),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
    },
    iconEmoji: {
        fontSize: 40,
    },
    content: {
        width: '100%',
        paddingHorizontal: 25,
        paddingBottom: 25,
        alignItems: 'center',
    },
    title: {
        ...NewStyles.title10,
        fontSize: 28,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        ...NewStyles.text10,
        fontSize: 16,
        opacity: 0.7,
        marginBottom: 20,
        textAlign: 'center',
    },
    gemContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    gemAmount: {
        ...NewStyles.title10,
        fontSize: 48,
        
        color: themeColor1.bgColor(1),
    },
    gemLabel: {
        ...NewStyles.title10,
        fontSize: 18,
        marginTop: 5,
        opacity: 0.8,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 15,
    },
    totalContainer: {
        ...NewStyles.row,
        gap: 8,
        marginBottom: 25,
    },
    totalLabel: {
        ...NewStyles.text10,
        fontSize: 14,
    },
    totalAmount: {
        ...NewStyles.title10,
        fontSize: 16,
        color: themeColor1.bgColor(1),
    },
    button: {
        width: '100%',
        backgroundColor: themeColor1.bgColor(1),
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: themeColor1.bgColor(1),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    buttonText: {
        ...NewStyles.title10,
        color: '#fff',
        fontSize: 16,
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default WinnerModal;
