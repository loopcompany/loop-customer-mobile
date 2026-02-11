import { TouchableOpacity, Text } from 'react-native'
import React, { useMemo } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import NewStyles from '../styles/NewStyles'
import { useTranslation } from 'react-i18next';
import { themeColor0, themeColor4 } from '../theme/Color'
import { createStyles } from '../styles/NewStyles';
const AccordionHeader = ({
    title,
    isActive,
    isOpen,
    onPress,
    inactiveMessage
}) => {
    const { t, i18n } = useTranslation();
      const NewStyles = useMemo(
        () => createStyles(i18n.language),
        [i18n.language]
      );
    return (
        <TouchableOpacity
            style={[
                NewStyles.row,
                
                {
                    paddingHorizontal: '5%',
                    paddingVertical: 10,
                    backgroundColor: themeColor0.bgColor(isActive ? 1 : 0.5),
                    marginHorizontal: '5%',
                    marginBottom: 10,
                    gap: 10,
                },
                NewStyles.border10
            ]}
            onPress={onPress}
        >
            {isActive && <Ionicons name="checkmark" size={20} color={themeColor4.bgColor(1)} />}
            <Text style={[NewStyles.title4, { flex: 1}]}>{title}</Text>
            <Ionicons name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'} size={20} color={themeColor4.bgColor(1)} />
        </TouchableOpacity>
    )
}

export default AccordionHeader
