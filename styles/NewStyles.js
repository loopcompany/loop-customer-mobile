import { StyleSheet, Platform, Dimensions } from "react-native";
import {
  themeColor0,
  themeColor1,
  themeColor2,
  themeColor3,
  themeColor4,
  themeColor5,
  themeColor6,
  themeColor7,
  themeColor8,
  themeColor9,
  themeColor10,
  themeColor11,
  themeColor14,
} from "../theme/Color";

export const { width: deviceWidth, height: deviceHeight } =
  Dimensions.get("window");
export const CELL_SIZE = 45;
export const CELL_BORDER_RADIUS = Platform.OS === "ios" ? 8 : 0;
export const DEFAULT_CELL_BG_COLOR = themeColor1.bgColor(1);
export const NOT_EMPTY_CELL_BG_COLOR = themeColor0.bgColor(1);
export const ACTIVE_CELL_BG_COLOR = themeColor1.bgColor(1);

export const gradientColors = [
  themeColor0.bgColor(1),
  themeColor0.bgColor(0.7),
  themeColor0.bgColor(0.5),
  themeColor0.bgColor(0.2),
  themeColor1.bgColor(0.2),
  themeColor1.bgColor(0.5),
  themeColor1.bgColor(0.8),
  themeColor1.bgColor(1),
];
const RTL_LANGS = new Set(['fa', 'ar', 'he', 'ur', 'ps', 'ckb']);

const langIsRTL = (lang) => (lang || '').toLowerCase().split('-')[0] && RTL_LANGS.has((lang || '').toLowerCase().split('-')[0]);


export const createStyles = (lang) => {

  return (
    StyleSheet.create({
      selectBox: {
        height: 50,
        alignItems: "center",
        justifyContent: "center",
      },
      spacing: {
        paddingVertical: '5%',
        paddingHorizontal: '5%',
      },
      strip: {
        minHeight: 50,
        width: '100%',
        marginVertical: 10,
        backgroundColor: themeColor0.bgColor(0.5),
      },
      seperator: {
        paddingBottom: '5%',
        paddingHorizontal: '5%',
        gap: 20,
        borderBottomWidth: 5,
        borderBottomColor: themeColor3.bgColor(0.2),
      },
      whiteButton: {
        backgroundColor: themeColor4.bgColor(1),
        borderRadius: 100,
        margin: 5,
        padding: 10,
      },
      title6: {
        fontSize: 14,
        fontFamily: 'VazirBold',
        color: themeColor6.bgColor(1),
        textAlign: langIsRTL(lang) ? "right" : "left",
      },
      add: {
        padding: 3,
        backgroundColor: themeColor0.bgColor(1),
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center'
      },

      remove: {
        padding: 3,
        borderRadius: 100,
        borderColor: themeColor0.bgColor(1),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
      },
      seperator1: {
        paddingBottom: '5%',
        paddingHorizontal: '5%',
        gap: 20,
        // borderBottomWidth: 5,
        // borderBottomColor: themeColor3.bgColor(0.2),
      },
      nav: {
        gap: 50,
        paddingHorizontal: '5%',
        backgroundColor: themeColor4.bgColor(0),

      },
      categoriesWrapper: {
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 10,
      },
      wrapper: {
        paddingHorizontal: "5%",
        gap: 10,
        paddingVertical: 20,
      },
      formGroup: {
        marginVertical: 5,
        gap: 10,
      },
      codeFieldRoot: {
        height: 45,
        paddingHorizontal: 20,
        justifyContent: "center",
      },
      button: {
        marginVertical: 20,
        // padding: 15,
        alignItems: "center",
        borderRadius: 5,
      },
      circularWrapper: {
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 10,
      },
      contentContainerStyle: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        gap: 10,
        alignItems: "center",
        justifyContent: "center",
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
        textAlign: "center",
        borderRadius: 8,
        borderCurve: "continuous",
        overflow: "hidden",
        color: themeColor0.bgColor(1),
        backgroundColor: "#fff",
      },
      status: {
        fontFamily: "VazirLight",
        // backgroundColor: themeColor0.bgColor(1),
        color: themeColor3.bgColor(1),
        paddingHorizontal: 15,
        paddingVertical: 5,
      },
      logo: {
        width: 200,
        height: 100,
      },
      container: {
        flex: 1,
        backgroundColor: themeColor14.bgColor(1),
        ...(Platform.OS === 'web' && {
          width: '100%',
          maxWidth: '100vw',
          overflow: 'hidden',
        }),
      },

      center: {
        alignItems: "center",
        justifyContent: "center",
      },

      rowWrapper: {
        flexDirection: langIsRTL(lang) ? "row-reverse" : "row",
        alignItems: "center",
        justifyContent: "space-between",
      },

      row: {
        flexDirection: langIsRTL(lang) ? "row" : "row",
        alignItems: "center",
      },

      shadow: {
        shadowColor: themeColor0.bgColor(1),
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.9,
        shadowRadius: 10,
        elevation: 5,
      },

      border5: {
        borderRadius: 5,
        borderCurve: "continuous",
        overflow: "hidden",
      },

      border10: {
        borderRadius: 10,
        borderCurve: "continuous",
        // overflow: "hidden",
      },

      border100: {
        borderRadius: 100,
        borderCurve: "continuous",
        overflow: "hidden",
      },

      text: {
        fontFamily: "VazirLight",
        color: themeColor0.bgColor(1),
        textAlign: langIsRTL(lang) ? "right" : "left",
      },

      text1: {
        fontFamily: "VazirLight",
        color: themeColor1.bgColor(1),
        textAlign: langIsRTL(lang) ? "right" : "left",
      },

      text2: {
        fontFamily: "VazirLight",
        color: themeColor2.bgColor(1),
        textAlign: langIsRTL(lang) ? "right" : "left",
      },

      text3: {
        fontFamily: "VazirLight",
        color: themeColor3.bgColor(1),
        textAlign: langIsRTL(lang) ? "right" : "left",
      },

      text4: {
        fontFamily: "VazirLight",
        color: themeColor4.bgColor(1),
        textAlign: langIsRTL(lang) ? "right" : "left",
      },

      text6: {
        fontFamily: "VazirLight",
        color: themeColor6.bgColor(1),
        textAlign: langIsRTL(lang) ? "right" : "left",
      },

      text7: {
        fontFamily: "VazirLight",
        color: themeColor7.bgColor(1),
        textAlign: langIsRTL(lang) ? "right" : "left",
      },

      text10: {
        fontFamily: "VazirLight",
        color: themeColor10.bgColor(1),
        textAlign: langIsRTL(lang) ? "right" : "left",
      },
      text11: {
        fontFamily: "VazirLight",
        color: themeColor11.bgColor(1),
        textAlign: langIsRTL(lang) ? "right" : "left",
      },

      title: {
        fontSize: 16,
        fontFamily: "VazirBold",
        color: themeColor0.bgColor(1),
        textAlign: langIsRTL(lang) ? "right" : "left",
      },
      title1: {
        fontSize: 16,
        fontFamily: "VazirBold",
        color: themeColor1.bgColor(1),
        textAlign: langIsRTL(lang) ? "right" : "left",
      },
      title3: {
        fontSize: 16,
        fontFamily: "VazirBold",
        color: themeColor3.bgColor(1),
        textAlign: langIsRTL(lang) ? "right" : "left",
      },

      title4: {
        fontSize: 15,
        fontFamily: "VazirBold",
        color: themeColor4.bgColor(1),
        textAlign: "center",
      },
      title7: {
        fontSize: 15,
        fontFamily: "VazirBold",
        color: themeColor7.bgColor(1),
        textAlign: "center",
      },

      title10: {
        fontSize: 16,
        fontFamily: "VazirBold",
        color: themeColor10.bgColor(1),
        textAlign: langIsRTL(lang) ? "right" : "left",
      },
      background: {
        position: "absolute",
        zIndex: 1,
        width: "100%",
        top: 0,
        height: 200,
      },
      discountText: {
        fontFamily: "VazirLight",
        color: themeColor3.bgColor(1),
        textDecorationLine: "line-through",
        textAlign: langIsRTL(lang) ? "right" : "left",
      },

      textInput: {
        backgroundColor: themeColor4.bgColor(0.7),
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: "100%",
        // maxWidth: 800,
      },

      profileImage: {
        height: 70,
        wiidth: 70,
        backgroundColor: themeColor4.bgColor(1),
      },

      more: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderColor: themeColor4.bgColor(1),
        borderWidth: 0.2,
      },
    })
  );
}



export const NewStyles = createStyles('fa');

export default NewStyles;
