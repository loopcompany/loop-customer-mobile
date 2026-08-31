import React, {
    createContext,
    useContext,
    useState,
    useMemo,
    useEffect,
    useRef,
    useCallback,
} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    Modal,
    Linking,
    TouchableWithoutFeedback,
    Dimensions,
    Animated,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { themeColor0, themeColor10, themeColor13, themeColor4, themeColor1, themeColor12, themeColor8, themeColor6, colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { shadow } from '@theme/Shadows';
import { deviceHeight } from '@styles/NewStyles';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import useLogout from '@hooks/useLogout';
import { fetchContacts } from '@slices/contactSlice';
import { fetchUser } from '@slices/userSlice';
import { createStyles } from '@styles/NewStyles';
import { imageUri, mainUri } from '@services/URL';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLanguage } from '@slices/languageSlice';
// Create Context
const MenuContext = createContext();

// account_type های حساب حقیقی (املای غلط 'indiviual' هم از سمت سرور می‌آید)
const INDIVIDUAL_ACCOUNT_TYPES = ['individual', 'indiviual'];
const AnimatedFooterLogoButton = React.memo(({ onPress, logoStyle }) => {
    const idleScaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pressScaleAnim = useRef(new Animated.Value(1)).current;
    const colorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const motionLoop = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(idleScaleAnim, {
                        toValue: 1.08,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(idleScaleAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: 0,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        );

        const colorLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(colorAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: false,
                }),
                Animated.timing(colorAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: false,
                }),
            ])
        );

        motionLoop.start();
        colorLoop.start();

        return () => {
            motionLoop.stop();
            colorLoop.stop();
        };
    }, [idleScaleAnim, rotateAnim, colorAnim]);

    const handlePress = useCallback(() => {
        pressScaleAnim.stopAnimation();

        Animated.sequence([
            Animated.timing(pressScaleAnim, {
                toValue: 0.85,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(pressScaleAnim, {
                toValue: 1,
                friction: 4,
                tension: 120,
                useNativeDriver: true,
            }),
        ]).start();

        onPress?.();
    }, [onPress, pressScaleAnim]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-3deg', '3deg'],
    });

    const backgroundColor = colorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [
            themeColor4.bgColor(1),
            themeColor4.bgColor(0.5),
        ],
    });

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePress}
            style={{
                marginVertical: 5,
                borderRadius: 100,
            }}
        >
            {/* این View فقط برای رنگ است و JS-driven می‌ماند */}
            <Animated.View
                style={{
                    borderRadius: 100,
                    overflow: 'hidden',
                }}
            >
                {/* این View فقط transform دارد و native-driven است */}
                <Animated.View
                    style={{
                        transform: [
                            { scale: idleScaleAnim },
                            { rotate },
                        ],
                    }}
                >
                    {/* این View فقط برای press animation است و native-driven است */}
                    <Animated.View
                        style={{
                            transform: [
                                { scale: pressScaleAnim },
                            ],
                        }}
                    >
                        <Image
                            source={require("@assets/images/start.png")}
                            style={logoStyle}
                        />
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
});

// دکمه‌ی جمع‌وجمع شیشه‌ای داخل داک پایین — آیکون + برچسب کوتاه
function DockAction({ icon, label, onPress, lang, accessibilityLabel }) {
    return (
        <TouchableOpacity
            activeOpacity={0.75}
            onPress={onPress}
            style={dockStyles.action}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || label}
        >
            <Ionicons name={icon} size={19} color={colors.primary.color} />
            {!!label && (
                <Text
                    style={[dockStyles.actionLabel, { fontFamily: getFontFamily('bold', lang) }]}
                    numberOfLines={1}
                >
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const dockStyles = StyleSheet.create({
    action: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minWidth: 54,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.xs,
        borderRadius: radius.md,
        backgroundColor: colors.white.bgColor(0.45),
        borderWidth: 1,
        borderColor: colors.white.bgColor(0.7),
    },
    actionLabel: {
        color: colors.primary.color,
        fontSize: fontSize.xs,
    },
});


// Menu Provider Component
export const MenuProvider = ({ children }) => {
    const { t, i18n } = useTranslation();
    const userData = useSelector((state) => state.user?.data);
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );



    const styles = useMemo(() => createLocalStyles(NewStyles, i18n.language), [NewStyles, i18n.language]);
    const navigation = useNavigation();
    const { logoutWithConfirmation, isLoggingOut } = useLogout();
    const [menuVisible, setMenuVisible] = useState(false);
    const [currentRouteName, setCurrentRouteName] = useState('');
    const [showCodeHint, setShowCodeHint] = useState(false);
    // ارتفاع واقعی نوار پایین که با onLayout اندازه‌گیری می‌شود تا محتوای صفحه
    // زیر آن پنهان نشود (نوار position: absolute/fixed است و روی محتوا شناور می‌ماند)
    const [footerHeight, setFooterHeight] = useState(0);
    const insets = useSafeAreaInsets();
    // Get user type and auth token from Redux
    const userType = useSelector(state => state.auth.userType);
    const token = useSelector(state => state.auth.token);
    const user = useSelector(state => state.user?.data);
    const isLoggedIn = !!token; // کاربر لاگین کرده است اگر token داشته باشد

    // نوع حساب کاربر برای نمایش در بالای منو
    // (سازمان دولتی / سازمان نیمه‌دولتی / شرکت خصوصی / کاربر حقیقی)
    const accountTypeLabel = useMemo(() => {
        switch (userData?.account_type) {
            case 'g_organization':
                return t('Government organization');
            case 's_g_organization':
                return t('Semi-governmental organization');
            case 'company':
                return t('Private company');
            case 'individual':
            case 'indiviual':
                return t('Individual user');
            default:
                // اگر account_type از سرور نیامده باشد، از نوع کاربر در auth استفاده می‌کنیم
                return userType === 'organization' ? t('Organization') : t('Individual user');
        }
    }, [userData?.account_type, userType, t]);

    const accountDisplayName = useMemo(() => {
        const isOrganizationAccount =
            userType === 'organization' ||
            (!!userData?.account_type && !INDIVIDUAL_ACCOUNT_TYPES.includes(userData.account_type));

        return isOrganizationAccount
            ? userData?.organization_name
            : userData?.name;
    }, [userType, userData?.account_type, userData?.organization_name, userData?.name]);


    // صفحاتی که نباید Footer و Menu نمایش داده شود
    const screensWithoutMenu = [
        'Landing',
        'Welcome',
        'SignInLanding',
        'MainSignIn',
        'RegistrationVerificationScreen',
        'LoginScreen',
        'Login',
        'Register',
        'OTPVerification',
        'TestConnection',
        'OrganizationForgotPassword',
        'OrganizationResetPassword',
        'OrgPrivacy',
        'Grouping',
        'Method',
        'ForgotPassword',
        'ResetPasswordScreen',
        'AccessRestrictedScreen',
        'OrderMenuScreen',
    ];

    // Track current route
    useEffect(() => {
        const unsubscribe = navigation.addListener('state', () => {
            const currentRoute = navigation.getCurrentRoute();
            setCurrentRouteName(currentRoute?.name || '');
        });

        // Set initial route
        const currentRoute = navigation.getCurrentRoute();
        setCurrentRouteName(currentRoute?.name || '');

        return unsubscribe;
    }, [navigation]);

    // Check if current screen should show menu
    const shouldShowMenu = useMemo(() => {
        // اگر در لیست صفحات بدون منو باشد، منو نشان نده
        if (screensWithoutMenu.includes(currentRouteName)) {
            return false;
        }

        // اگر در صفحه قوانین سازمانی هستیم و کاربر لاگین نکرده، منو نشان نده
        if (currentRouteName === 'OrganizationTermsScreen' && !isLoggedIn) {
            return false;
        }

        // در غیر این صورت منو را نشان بده
        return true;
    }, [currentRouteName, isLoggedIn]);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchContacts());
        loadLanguage()
    }, [])
    useEffect(() => {
        if (!user && token) {
            dispatch(fetchUser(token))
        }
    }, [token])

    // Generate menu items dynamically based on user type
    const menuItems = useMemo(() => {

        const baseMenuItems = [
            // { id: 24, title: t("Delete Account"), screen: null, action: () => { Linking.openURL(`${mainUri}/delete-account-request`) } },
            // { id: 23, title: t("Submit order"), screen: "FolderScreen" },
            // { id: 12, title: t("Lucky Wheel"), screen: "Club", apple_check: userData?.apple_check, image:`${imageUri}/userfolder/gift.png` },
            // { id: 11, title: t("Think and Play"), screen: "GameMenu" },
            // { id: 7, title: t("User Account"), screen: "Profile", image:`${imageUri}/userfolder/Profile.png` },
            
            
            { id: 3, title: t("Orders"), screen: "OrdersScreen", image: `${imageUri}/userfolder/Orders.png` },
            { id: 4, title: t("Transactions"), screen: "TransactionsScreen", apple_check: userData?.apple_check, image: `${imageUri}/userfolder/TransactionsScreen.png` },
            { id: 5, title: t("Canceled Orders"), screen: "CanceledOrdersScreen", apple_check: userData?.apple_check, image: `${imageUri}/userfolder/CanceledOrdersScreen.png` },
            { id: 6, title: t("Messages"), screen: "MessageScreen", image: `${imageUri}/userfolder/MessageScreen.png` },
            { id: 8, title: t("Contract"), screen: "OrganizationContract", organizationOnly: true, image: `${imageUri}/userfolder/OrganizationContract.png` },
            { id: 9, title: t("Selected Addresses"), screen: "AddressScreen", image: `${imageUri}/userfolder/AddressScreen.png` },
            { id: 10, title: t("Training Course Registration"), screen: "TrainingRegistrationScreen", image: `${imageUri}/userfolder/TrainingRegistrationScreen.png` },
            { id: 23, title: t("Promotional codes"), screen: "UserDiscounts", apple_check: userData?.apple_check, image: `${imageUri}/userfolder/Club.png` },
            { id: 13, title: t("Service / Product Faults"), screen: "ProductIssueScreen", apple_check: userData?.apple_check, image: `${imageUri}/userfolder/ProductIssueScreen.png` },
            { id: 14, title: t("Rate List"), screen: "RateCategory", apple_check: userData?.apple_check, image: `${imageUri}/userfolder/RateCategory.png` },
            { id: 15, title: t("Report/Track Violation"), screen: "ViolationReportScreen", apple_check: userData?.apple_check, image: `${imageUri}/userfolder/ViolationReportScreen.png` },
            { id: 16, title: t("Feedback and Suggestions"), screen: "FeedbackSurveyScreen", image: `${imageUri}/userfolder/FeedbackSurveyScreen.png` },
            { id: 17, title: t("Warranty / Guarantee"), screen: "WarrantyScreen", apple_check: userData?.apple_check, image: `${imageUri}/userfolder/WarrantyScreen.png` },
            { id: 18, title: t("Note"), screen: "NotesScreen", image: `${imageUri}/userfolder/NotesScreen.png` },
            { id: 19, title: t("FAQ"), screen: "LearnMoreScreen", apple_check: userData?.apple_check, image: `${imageUri}/userfolder/LearnMoreScreen.png` },
            {
                id: 20,
                title: userType === 'organization' ? t("Organization Terms and Conditions") : t("Terms / About Loop"),
                screen: userType === 'organization' ? "OrganizationTermsScreen" : "AboutScreen", apple_check: userData?.apple_check, image: `${imageUri}/userfolder/AboutScreen.png`
            },
            { id: 21, title: t("Privacy"), screen: "PrivacyScreen", apple_check: userData?.apple_check, image: `${imageUri}/userfolder/PrivacyScreen.png` },
            { id: 22, title: t("Loop Wallet"), screen: "Increase", apple_check: userData?.apple_check, image: `${imageUri}/userfolder/Increase.png` },
        ];

        if (userType === 'organization') {
            // Show all items including organization-only items
            return baseMenuItems;
        } else {
            // Filter out organization-only items
            return baseMenuItems.filter(item => !item.organizationOnly);
        }
    }, [userType, t, userData?.apple_check]);


    const openMenu = useCallback(() => {
        setMenuVisible(true);
    }, []);

    const closeMenu = useCallback(() => {
        setMenuVisible(false);
    }, []);
    const navigateToScreen = useCallback((screenName) => {
        navigation.navigate(screenName);
        closeMenu();
    }, [navigation, closeMenu]);

    const callSupport = useCallback(() => {
        Linking.openURL(`tel:02191693909`);
    }, []);

    const handleCodePress = useCallback(() => {
        setShowCodeHint(true);
        setTimeout(() => setShowCodeHint(false), 1800);
    }, []);

    const handleFooterLayout = useCallback((e) => {
        const h = e?.nativeEvent?.layout?.height ?? 0;
        setFooterHeight((prev) => (Math.abs(prev - h) > 1 ? h : prev));
    }, []);

    // فضایی که باید زیر محتوای صفحه رزرو شود تا پشت داک پایین نرود
    const contentBottomInset = shouldShowMenu
        ? footerHeight + (insets?.bottom || 0) + spacing.sm + spacing.xs
        : 0;


    const renderMenuItem = useCallback(({ item }) => (
        <TouchableOpacity
            style={[styles.item, NewStyles.row]}
            onPress={() => {
                if (item?.screen) {
                    navigateToScreen(item.screen);
                } else if (item?.action) {
                    item.action();
                }
            }}
        >
            <Image
                source={{ uri: `${item?.image}` }}
                style={[{ height: 50, width: 50 }]}


            />
            <Text style={[NewStyles.text10, {}]}>
                {item.title}
            </Text>
        </TouchableOpacity>
    ), [styles.item, NewStyles.title10, navigateToScreen]);
    //   const MenuItems = token ? menuItemsLoggedIn?.filter(item => !item.apple_check || item.apple_check != 1) : menuItemsLoggedOut;
    const filteredMenuItems = useMemo(() => {
        // اگر لاگین نیست، همون menuItems رو بده
        if (!token) return menuItems;

        // اگر apple_check == 1 بود، آیتم‌هایی که apple_check دارن رو حذف کن
        return menuItems.filter(item => !(Number(item.apple_check) === 1));
    }, [menuItems, token]);
    const contextValue = useMemo(() => ({
        menuVisible,
        openMenu,
        closeMenu,
        navigateToScreen,
        callSupport,
        menuItems: filteredMenuItems,
        // فاصله‌ای که یک صفحه باید ته محتوای اسکرول‌شونده‌اش بگذارد تا زیر داک شناور نرود
        footerSpace: contentBottomInset,
    }), [
        menuVisible,
        openMenu,
        closeMenu,
        navigateToScreen,
        callSupport,
        filteredMenuItems,
        contentBottomInset,
    ]);
    const changeLanguage = async (lng) => {
        await i18n.changeLanguage(lng);
        await AsyncStorage.setItem('language', lng);
        dispatch(setLanguage(lng))
    };
    const loadLanguage = async () => {

        try {
            const language = await AsyncStorage.getItem('language');
            if (language) {
                dispatch(setLanguage(language));
                i18n.changeLanguage(language);
            } else {
                i18n.changeLanguage('fa');
            }
        } catch (error) {
            console.error('Error loading language', error);
        }
    };
    return (
        <MenuContext.Provider value={contextValue}>
            <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={{ flex: 1 }}>
                {children}

                {shouldShowMenu && (
                    <View
                        pointerEvents="box-none"
                        style={[styles.footerWrap, { bottom: (insets?.bottom || 0) + spacing.sm }]}
                    >
                        {showCodeHint && !!user?.code && (
                            <View style={styles.codeTooltip}>
                                <Text style={styles.codeTooltipText} numberOfLines={1}>
                                    {userType === 'organization' ? t('Organization code') : t('User code')}
                                </Text>
                            </View>
                        )}

                        <View onLayout={handleFooterLayout} style={styles.dockShadow}>
                            {/* اپ فارسی‌محور است: لوگو همیشه سمت راست، کد سمت چپ */}
                            <View style={styles.dock}>
                                <BlurView
                                    intensity={30}
                                    tint="light"
                                    style={StyleSheet.absoluteFill}
                                    pointerEvents="none"
                                />
                                <LinearGradient
                                    colors={[colors.white.bgColor(0.22), colors.white.bgColor(0.04)]}
                                    style={StyleSheet.absoluteFill}
                                    pointerEvents="none"
                                />
                                <View style={styles.dockTopEdge} pointerEvents="none" />

                                <View style={styles.menuButton}>
                                    <AnimatedFooterLogoButton
                                        onPress={openMenu}
                                        logoStyle={styles.footerLogo}
                                    />
                                </View>

                                <DockAction
                                    icon="globe-outline"
                                    label={t(i18n.language)}
                                    lang={i18n.language}
                                    accessibilityLabel={t('Language')}
                                    onPress={() =>
                                        changeLanguage(i18n.language === 'en' ? 'fa' : 'en')
                                    }
                                />

                                <DockAction
                                    icon="headset-outline"
                                    label={t('Support')}
                                    lang={i18n.language}
                                    onPress={() => navigation.navigate('MessageScreen')}
                                />

                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    onPress={handleCodePress}
                                    style={styles.codeChip}
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        userType === 'organization'
                                            ? t('Organization code')
                                            : t('User code')
                                    }
                                >
                                    <Ionicons
                                        name="qr-code-outline"
                                        size={15}
                                        color={colors.primary.color}
                                    />
                                    <Text style={styles.codeChipText}>
                                        {user?.code ?? '—'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
                <Modal
                    transparent={true}
                    visible={menuVisible}
                    onRequestClose={closeMenu}
                    animationType="fade"
                >

                    <View style={{ flex: 1, alignSelf: 'flex-start' }}>
                        <FlatList
                            ListHeaderComponent={() => {
                                return (
                                    <View style={[{ backgroundColor: themeColor4.bgColor(1), padding: 15 }, NewStyles.center]}>
                                        {!!accountDisplayName && (
                                            <Text style={[NewStyles.title, styles.accountName]}>{accountDisplayName}</Text>
                                        )}
                                        <Text style={styles.accountTypeBadge}>{accountTypeLabel}</Text>
                                        <View style={[{ paddingVertical: 10, width: '90%', backgroundColor: themeColor8.bgColor(0.2), }, NewStyles.center, NewStyles.border10]}>
                                            <Text style={NewStyles.title}>{t("Your Points:")} {userData?.user_gems ?? '0'}</Text>
                                        </View>
                                    </View>
                                )
                            }}
                            // inverted={true}
                            data={filteredMenuItems}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderMenuItem}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                        />
                        {/* دکمه خروج */}
                        <View style={[styles.logoutContainer, NewStyles.rowWrapper]}>
                            <TouchableOpacity style={{ padding: 10 }} onPress={() => {
                                closeMenu()
                            }}>
                                <Ionicons
                                    name={'close'}
                                    size={20}
                                    color={themeColor4.bgColor(1)}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.logoutBtn, isLoggingOut && styles.logoutBtnDisabled]}
                                onPress={() => logoutWithConfirmation({ onSuccess: closeMenu })}
                                disabled={isLoggingOut}
                            >
                                <Ionicons name="power" size={20} color="#fff" />
                                <Text style={styles.logoutText}>
                                    {isLoggingOut ? t('Logging out...') : t('Log out of account')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </Modal>
            </SafeAreaView>

        </MenuContext.Provider>
    );
};

// Hook to use Menu Context
export const useMenu = () => {
    const context = useContext(MenuContext);
    if (!context) {
        throw new Error('useMenu must be used within a MenuProvider');
    }
    return context;
};

// Styles
const createLocalStyles = (NewStyles, language) => StyleSheet.create({


    // داک شیشه‌ای شناور پایین صفحه
    footerWrap: {
        position: Platform.OS === 'web' ? 'fixed' : 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: spacing.md,
        zIndex: 10,
    },
    dockShadow: {
        borderRadius: radius.lg,
        // شفاف — بلور داک، پس‌زمینه‌ی واقعی صفحه را نشان می‌دهد نه یک لایه‌ی سفید
        backgroundColor: colors.white.bgColor(0.06),
        ...shadow.lg,
    },
    dock: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.white.bgColor(0.6),
    },
    dockTopEdge: {
        position: 'absolute',
        top: 0,
        left: spacing.lg,
        right: spacing.lg,
        height: 1,
        backgroundColor: colors.white.bgColor(0.85),
    },
    menuButton: {
        width: 52,
        height: 52,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary.bgColor(0.1),
        borderWidth: 1,
        borderColor: colors.primary.bgColor(0.22),
    },
    codeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.pill,
        backgroundColor: colors.primary.bgColor(0.1),
        borderWidth: 1,
        borderColor: colors.primary.bgColor(0.22),
        flexShrink: 0,
    },
    codeChipText: {
        color: colors.primary.color,
        fontSize: fontSize.sm,
        fontFamily: getFontFamily('bold', language),
    },
    codeTooltip: {
        alignSelf: 'center',
        marginBottom: spacing.xs,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radius.sm,
        backgroundColor: colors.primary.bgColor(0.96),
        ...shadow.md,
    },
    codeTooltipText: {
        color: colors.white.color,
        fontSize: fontSize.xs,
        fontFamily: getFontFamily('bold', language),
    },
    accountName: {
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    accountTypeBadge: {
        marginBottom: spacing.md,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: colors.primary.bgColor(0.12),
        color: colors.primary.color,
        fontSize: fontSize.xs,
        fontFamily: getFontFamily('bold', language),
        textAlign: 'center',
    },
    footerLogo: {
        width: 34,
        height: 34,
        resizeMode: "contain",
    },
    list: {
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: themeColor0.bgColor(1)
    },
    item: {
        backgroundColor: themeColor4.bgColor(1),
        paddingVertical: 2,
        paddingHorizontal: 20,
        width: "100%",
        gap: 5
    },
    logoutContainer: {
        padding: 10,
        backgroundColor: themeColor0.bgColor(1),
    },
    logoutBtn: {
        ...NewStyles.row,
        ...NewStyles.center,
        backgroundColor: themeColor6.bgColor(1),
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    logoutBtnDisabled: {
        backgroundColor: '#999',
    },
    logoutText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'VazirBold',
    },
});