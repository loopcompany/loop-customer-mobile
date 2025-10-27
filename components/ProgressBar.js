import { View, Text } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '../styles/NewStyles'
import { themeColor1, themeColor4 } from '../theme/Color'

export default function ProgressBar({ step }) {
    return (
        <View style={step > 0 && {marginBottom: 30}}>
            {(step > 0 || step == 'preview') && <View style={{ paddingHorizontal: 15, paddingVertical: 5 }}>
                <View style={[NewStyles.rowWrapper, { paddingVertical: 10, justifyContent: 'space-between', alignItems: 'center' }]}>
                    <View style={[NewStyles.center, { height: 25, width: 25, borderRadius: 10, backgroundColor: themeColor1.bgColor(1) }]} >
                        <Ionicons name="checkmark" size={15} color={themeColor4.bgColor(1)} />
                    </View>
                    <View style={[{ height: 2, backgroundColor: themeColor1.bgColor(0.5), flex: 1 }, (step > 2 || step == 'preview') && { backgroundColor: themeColor1.bgColor(1) }]} />

                    <View style={[NewStyles.center, { height: 25, width: 25, borderRadius: 10, borderWidth: 1, borderColor: themeColor1.bgColor(1) }, (step > 2 || step == 'preview') && { backgroundColor: themeColor1.bgColor(1) }]} >
                        {(step > 2 || step == 'preview') && <Ionicons name="checkmark" size={15} color={themeColor4.bgColor(1)} />}
                    </View>
                    <View style={{ height: 2, backgroundColor: themeColor1.bgColor(0.5), flex: 1 }} />
                    <View style={[NewStyles.center, { height: 25, width: 25, borderRadius: 10, borderWidth: 1, borderColor: themeColor1.bgColor(1) }, (step == 'preview') && { backgroundColor: themeColor1.bgColor(1) }]}>
                        <Ionicons name="checkmark" size={15} color={themeColor4.bgColor(1)} />
                    </View>
                </View>
                <View style={NewStyles.rowWrapper}>
                    <Text style={NewStyles.text3}>زمان و مکان</Text>
                    <Text style={NewStyles.text3}>جزئیات خدمت</Text>
                    <Text style={NewStyles.text3}>ثبت نهایی</Text>
                </View>
            </View>}
        </View>
    )
}