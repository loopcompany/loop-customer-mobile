import { View, Text, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { themeColor0, themeColor3, themeColor4, themeColor6 } from '../theme/Color';
import { setDescription } from '../slices/stepSlice';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { createStyles } from '../styles/NewStyles';
import { imageUri } from '../services/URL';

export default function Note({ step, data }) {

    const dispatch = useDispatch();
    const description = useSelector(state => state?.step?.des);
    const { t, i18n } = useTranslation();
    const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
    );
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    return (
        <View style={[NewStyles.seperator1, { alignItems: 'center' }]}>
            <View style={{ width: '100%' }}>
                <View
                    style={[NewStyles.center, {
                        backgroundColor: themeColor0.bgColor(1),
                        paddingVertical: 10,
                        marginBottom:10,
                        ...NewStyles.border10
                    }]}

                >
                    <View style={[NewStyles.row, { gap: 10 }]}>
                        {data?.icon_name && <Image
                            source={{ uri: `${imageUri}/${data?.icon_name}` }}
                            style={{ height: 50, width: 50, resizeMode: 'contain' }}
                        />}
                        <Text style={NewStyles.title4}> {data?.title} {data?.is_required == 1 && <Text style={NewStyles.title6}>*</Text>} </Text>
                    </View>
                </View>
                <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text10, { minHeight: 150, paddingTop: 10, backgroundColor: themeColor4.bgColor(1) }]} keyboardType='default' placeholder={`${data?.des}`} placeholderTextColor={themeColor3.bgColor(1)} verticalAlign='top' textAlignVertical='top' multiline={true} value={description} maxLength={150} onChangeText={(text) => { dispatch(setDescription(text)) }} />
            </View>
        </View>
    )
}