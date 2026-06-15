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
import { useTranslation } from 'react-i18next';
import { themeColor0, themeColor10, themeColor13, themeColor4, themeColor1, themeColor12, themeColor8, themeColor6 } from '../theme/Color';
import { deviceHeight } from '../styles/NewStyles';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import useLogout from '../hooks/useLogout';
import { fetchContacts } from '../slices/contactSlice';
import { fetchUser } from '../slices/userSlice';
import { createStyles } from '../styles/NewStyles';
import { imageUri, mainUri } from '../services/URL';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLanguage } from '../slices/languageSlice';
import { langIsRTL } from '../helpers/Common';
// Create Context
const MenuContext = createContext();
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
                            source={require("../assets/images/start.png")}
                            style={logoStyle}
                        />
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
});


// Menu Provider Component
export const MenuProvider = ({ children }) => {
    const { t, i18n } = useTranslation();
    const userData = useSelector((state) => state.user?.data);
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );



    const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
    const navigation = useNavigation();
    const { logoutWithConfirmation, isLoggingOut } = useLogout();
    const [menuVisible, setMenuVisible] = useState(false);
    const [currentRouteName, setCurrentRouteName] = useState('');
    const insets = useSafeAreaInsets();
    // Get user type and auth token from Redux
    const userType = useSelector(state => state.auth.userType);
    const token = useSelector(state => state.auth.token);
    const user = useSelector(state => state.user?.data);
    const isLoggedIn = !!token; // کاربر لاگین کرده است اگر token داشته باشد


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
            { id: 22, title: t("Loop Wallet"), screen: "Increase", apple_check: userData?.apple_check, image:`${imageUri}/userfolder/Increase.png` },
            { id: 21, title: t("Privacy"), screen: "PrivacyScreen", apple_check: userData?.apple_check, image:`${imageUri}/userfolder/PrivacyScreen.png` },
            {
                id: 20,
                title: userType === 'organization' ? t("Organization Terms and Conditions") : t("Terms / About Loop"),
                screen: userType === 'organization' ? "OrganizationTermsScreen" : "AboutScreen", apple_check: userData?.apple_check, image: `${imageUri}/userfolder/AboutScreen.png` 
            },
            { id: 19, title: t("FAQ"), screen: "LearnMoreScreen", apple_check: userData?.apple_check, image:`${imageUri}/userfolder/LearnMoreScreen.png` },
            { id: 18, title: t("Note"), screen: "NotesScreen", image:`${imageUri}/userfolder/NotesScreen.png` },
            { id: 17, title: t("Warranty / Guarantee"), screen: "WarrantyScreen", apple_check: userData?.apple_check, image:`${imageUri}/userfolder/WarrantyScreen.png` },
            { id: 16, title: t("Feedback and Suggestions"), screen: "FeedbackSurveyScreen", image:`${imageUri}/userfolder/FeedbackSurveyScreen.png` },
            { id: 15, title: t("Report/Track Violation"), screen: "ViolationReportScreen", apple_check: userData?.apple_check, image:`${imageUri}/userfolder/ViolationReportScreen.png` },
            { id: 14, title: t("Rate List"), screen: "RateCategory", apple_check: userData?.apple_check, image:`${imageUri}/userfolder/RateCategory.png` },
            { id: 13, title: t("Service / Product Faults"), screen: "ProductIssueScreen", apple_check: userData?.apple_check, image:`${imageUri}/userfolder/ProductIssueScreen.png` },
            { id: 23, title: t("Promotional codes"), screen: "UserDiscounts", apple_check: userData?.apple_check, image:`${imageUri}/userfolder/Club.png` },
            { id: 12, title: t("Lucky Wheel"), screen: "Club", apple_check: userData?.apple_check, image:`${imageUri}/userfolder/gift.png` },
            // { id: 11, title: t("Think and Play"), screen: "GameMenu" },
            { id: 10, title: t("Training Course Registration"), screen: "TrainingRegistrationScreen", image:`${imageUri}/userfolder/TrainingRegistrationScreen.png` },
            { id: 9, title: t("Selected Addresses"), screen: "AddressScreen", image:`${imageUri}/userfolder/AddressScreen.png` },
            { id: 8, title: t("Contract"), screen: "OrganizationContract", organizationOnly: true, image:`${imageUri}/userfolder/OrganizationContract.png` },
            { id: 7, title: t("User Account"), screen: "Profile", image:`${imageUri}/userfolder/Profile.png` },
            { id: 6, title: t("Messages"), screen: "MessageScreen", image:`${imageUri}/userfolder/MessageScreen.png` },
            { id: 5, title: t("Canceled Orders"), screen: "CanceledOrdersScreen", apple_check: userData?.apple_check, image: `${imageUri}/userfolder/CanceledOrdersScreen.png`  },
            { id: 4, title: t("Transactions"), screen: "TransactionsScreen", apple_check: userData?.apple_check, image:`${imageUri}/userfolder/TransactionsScreen.png` },
            { id: 3, title: t("Orders"), screen: "OrdersScreen" , image:`${imageUri}/userfolder/Orders.png`},
        ]; 

        if (userType === 'organization') {
            console.log('✅ [MenuContext] Showing organization menu items');
            // Show all items including organization-only items
            return baseMenuItems;
        } else {
            console.log('ℹ️ [MenuContext] Filtering out organization-only items');
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
        Linking.openURL(`tel:02121164552`);
    }, []);


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
            source={{uri:`${item?.image}`}}
            style={[{height:50, width:50}]}

            
            />
            <Text style={[NewStyles.text10, {  }]}>
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
    }), [
        menuVisible,
        openMenu,
        closeMenu,
        navigateToScreen,
        callSupport,
        filteredMenuItems,
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
                    <View style={[styles.footer, NewStyles.rowWrapper, { bottom: insets?.bottom }]}>
                        <AnimatedFooterLogoButton
                            onPress={openMenu}
                            logoStyle={styles.footerLogo}
                        />



                        <TouchableOpacity
                            style={{ padding: 5 }}
                            onPress={() => {
                                if (i18n.language == 'en') {
                                    changeLanguage('fa');
                                } else {
                                    changeLanguage('en');
                                }
                            }}
                        >
                            <Text style={NewStyles.text4}>{t(i18n.language)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.supportButton}
                            onPress={() => {
                                navigation.navigate('MessageScreen');
                            }}
                        >
                            <Image
                                source={require('../assets/images/support.png')}
                                style={{ height: 40, width: 60, resizeMode: 'contain', }}
                            />
                        </TouchableOpacity>
                        <View>
                            <Text style={NewStyles.text4}>
                                {user?.code}
                            </Text>
                        </View>

                    </View>
                )}
                <Modal
                    transparent={true}
                    visible={menuVisible}
                    onRequestClose={closeMenu}
                    animationType="fade"
                >

                    <View style={{ flex: 1, alignSelf: langIsRTL(i18n.language) ? 'flex-end' : 'flex-start' }}>
                        <FlatList
                            ListFooterComponent={() => {
                                return (
                                    <View style={[{ backgroundColor: themeColor4.bgColor(1), padding: 15 }, NewStyles.center]}>
                                        <View style={[{ paddingVertical: 10, width: '90%', backgroundColor: themeColor8.bgColor(0.2), }, NewStyles.center, NewStyles.border10]}>
                                            <Text style={NewStyles.title}>{t("Your Points:")} {userData?.user_gems ?? '0'}</Text>
                                        </View>
                                    </View>
                                )
                            }}
                            inverted={true}
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
const createLocalStyles = (NewStyles) => StyleSheet.create({


    footer: {
        backgroundColor: themeColor12.bgColor(0.2),
        width: "100%",
        paddingHorizontal: 15,
        position: 'absolute',
        bottom: 0
    },
    footerLogo: {
        width: 50,
        height: 50,
        resizeMode: "contain",
    },
    supportButton: {
        paddingVertical: 5,
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
        gap:5
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