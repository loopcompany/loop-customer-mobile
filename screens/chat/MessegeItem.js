import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor3 } from '../../theme/Color';

export default function MessegeItem({ messege }) {

    if (messege.is_user == 0) {
        // پیام از طرف مقابل (تکنسین/پشتیبان)
        return (
            <View style={{ width: '80%', marginLeft: 15, marginBottom: 5, }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                    <View style={{ alignSelf: 'flex-end', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: themeColor0.bgColor(0.5) }}>
                        <Text style={NewStyles.text4} selectable={true}>{messege?.msg}</Text>
                    </View>
                </View>
            </View>
        );
    } else {
        // پیام کاربر - با نمایش وضعیت خوانده شدن
        const isRead = messege?.is_read == 1;
        
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <View style={{ width: '80%', marginRight: 15, marginBottom: 5, }}>
                    <View style={{ alignSelf: 'flex-end', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: themeColor3.bgColor(0.1) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Text style={NewStyles.text} selectable={true}>{messege?.msg}</Text>
                            {/* نمایش تیک‌ها */}
                            {isRead ? (
                                // دو تیک برای خوانده شده
                                <View style={{ flexDirection: 'row', marginLeft: 2 }}>
                                    <Ionicons name="checkmark" size={14} color={themeColor0.bgColor(1)} style={{ marginLeft: -6 }} />
                                    <Ionicons name="checkmark" size={14} color={themeColor0.bgColor(1)} />
                                </View>
                            ) : (
                                // یک تیک برای نخوانده شده
                                <Ionicons name="checkmark" size={14} color={themeColor0.bgColor(0.5)} />
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}