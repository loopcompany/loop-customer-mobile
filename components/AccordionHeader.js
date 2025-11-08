import { TouchableOpacity, Text } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import NewStyles from '../styles/NewStyles'
import { themeColor0, themeColor4 } from '../theme/Color'

const AccordionHeader = ({
    title,
    isActive,
    isOpen,
    onPress,
    inactiveMessage
}) => {
    return (
        <TouchableOpacity
            style={[
                NewStyles.rowWrapper,
                NewStyles.center,
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
            <Text style={[NewStyles.title4, { flex: 1,textAlign:'right' }]}>{title}</Text>
            <Ionicons name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'} size={20} color={themeColor4.bgColor(1)} />
        </TouchableOpacity>
    )
}

export default AccordionHeader
