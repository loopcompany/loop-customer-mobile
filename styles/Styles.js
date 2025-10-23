import { StyleSheet, Platform, Dimensions } from 'react-native';
import { themeColor1, themeColor0, themeColor4, themeColor3, themeColor2, themeColor6, themeColor5, themeColor10 } from '../theme/Color';

export const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
export const CELL_SIZE = 45;
export const CELL_BORDER_RADIUS = Platform.OS === 'ios' ? 8 : 0;
export const DEFAULT_CELL_BG_COLOR = themeColor1.color;
export const NOT_EMPTY_CELL_BG_COLOR = themeColor0.color;
export const ACTIVE_CELL_BG_COLOR = themeColor1.color;

const Styles = StyleSheet.create({
    codeFieldRoot: {
        height: 45,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    cell: {
        marginHorizontal: 8,
        height: 45,
        width: 45,
        lineHeight: 45 - 5,
        borderBottomColor: themeColor0.bgColor(1),
        borderBottomWidth: StyleSheet.hairlineWidth,
        ...Platform.select({ web: { lineHeight: 65 } }),
        fontSize: 24,
        textAlign: 'center',
        borderRadius: 8,
        borderCurve: 'continuous',
        overflow: 'hidden',
        color: themeColor0.color,
        backgroundColor: '#fff',
        // IOS
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        // Android
        // elevation: 3,
    },
    // General
    messageScreenWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    messageImage: {
        height: 100,
        width: 100,
    },

    textInput: {
        height: 50,
        backgroundColor: themeColor3.bgColor(0.2),
        color: themeColor10.bgColor(1),
        textAlign: 'justify',
        fontFamily: 'VazirLight',
        padding: 15,
    },

    title: {
        fontFamily: 'VazirBold',
        fontSize: 18,
        textAlign: 'auto',
        color: themeColor2.color,
    },

    messageText: {
        fontSize: 11,
        fontFamily: 'VazirLight',
        // color: midgray,
        textAlign: 'center',
    },
    guideWrapper: {
        width: '100%',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 5,
    },

    container: {
        flex: 1,
        backgroundColor: themeColor5.bgColor(1),
    },

    background: {
        position: 'absolute',
        zIndex: 1,
        width: '100%',
        top: 0,
        height: 200,
    },

    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },



    sectionListContainerStyle: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    providerWrapper: {
        width: deviceWidth * 0.95,
        backgroundColor: 'white',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderRadius: 8,
        borderCurve: 'continuous',
        overflow: 'hidden',
        padding: 15,
        marginVertical: 10,
        // IOS
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        // Android
        elevation: 3,
    },

    rowWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    contentContainerStyle: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        gap: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    shadow: {
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.17,
        shadowRadius: 3.05,
        elevation: 4
    },

    border5: {
        borderRadius: 5,
        borderCurve: "continuous",
        overflow: "hidden",
    },

    border10: {
        borderRadius: 10,
        borderCurve: "continuous",
        overflow: "hidden",
    },

    border100: {
        borderRadius: 100,
        borderCurve: "continuous",
        overflow: "hidden",
    },

    // Categories

    circularWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 10,
    },

    circularItemWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        height: deviceWidth * 0.17,
        width: deviceWidth * 0.17,
        backgroundColor: themeColor1.bgColor(1),
        elevation: 3,

        borderRadius: 100,
        borderCurve: 'continuous',
        overflow: 'hidden',
    },

    circularItemImage: {
        height: '50%',
        width: '50%',
        resizeMode: 'center',
    },

    text: {
        fontFamily: 'VazirLight',
        color: themeColor10.color,
        textAlign: 'auto',
    },

    text1: {
        fontFamily: 'VazirLight',
        color: themeColor4.bgColor(1),
        textAlign: 'auto',
    },

    text2: {
        fontFamily: 'VazirLight',
        textAlign: 'left',
        color: themeColor0.bgColor(1),
    },

    discountText: {
        fontFamily: 'VazirLight',
        color: themeColor10.color,
        textAlign: 'auto',
        textDecorationLine: 'line-through',
    },


    text3: {
        fontFamily: 'VazirLight',
        textAlign: 'left',
        color: themeColor1.bgColor(1),
    },

    text4: {
        fontFamily: 'VazirLight',
        color: themeColor3.bgColor(1),
    },

    text5: {
        fontFamily: 'VazirLight',
        color: themeColor6.bgColor(1),
    },

    button: {
        marginVertical: 20,
        padding: 15,
        alignItems: 'center',
        borderRadius: 5,
    },

    status: {
        fontFamily: 'VazirLight',
        textAlign: 'auto',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: themeColor0.bgColor(0.3),
        color: themeColor4.bgColor(1),
    },

});

export default Styles;