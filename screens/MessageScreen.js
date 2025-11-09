import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeaders from '../components/ScreenHeaders'; 
import NewStyles from '../styles/NewStyles'; 
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor7, themeColor10, themeColor8, themeColor2 } from '../theme/Color';
import CustomStatusBar from '../components/CustomStatusBar';
import { getTicketsList, sendTicketMessage } from '../services/Api';
import { formatDate, formatDateTime } from '../helpers/Common';

export default function MessageScreen({ navigation }) {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // دریافت لیست پیام‌ها
  const fetchMessages = async () => {
    try {
      const response = await getTicketsList();

      if (response.success && response.data) {
        // ترتیب معکوس برای نمایش جدیدترین پیام‌ها در پایین
        setMessages(response.data.reverse());

        // محاسبه تعداد پیام‌های خوانده نشده از ادمین
        const unreadAdminMessages = response.data.filter(
          msg => !msg.is_read && !msg.is_mine
        ).length;
        setUnreadCount(unreadAdminMessages);
      }
    } catch (error) {
      console.error('خطا در دریافت پیام‌ها:', error);
      Alert.alert('خطا', 'خطا در دریافت پیام‌ها');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  // ارسال پیام جدید
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert('هشدار', 'لطفاً متن پیام را وارد کنید');
      return;
    }

    if (messageText.length > 5000) {
      Alert.alert('هشدار', 'متن پیام نباید بیشتر از 5000 کاراکتر باشد');
      return;
    }

    try {
      setSending(true);
      const response = await sendTicketMessage(messageText);

      if (response.success) {
        Alert.alert('موفق', 'پیام شما با موفقیت ارسال شد');
        setMessageText('');
        // به‌روزرسانی لیست پیام‌ها
        await fetchMessages();
      }
    } catch (error) {
      Alert.alert('خطا', error.message || 'خطا در ارسال پیام');
    } finally {
      setSending(false);
    }
  };

  // تابع فورمت تاریخ


  return (
    <LinearGradient
      colors={[themeColor8.bgColor(0.7), themeColor0.bgColor(0.8), themeColor2.bgColor(0.9)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <CustomStatusBar />
      <ScreenHeaders
        title={'پیام'}
        onPressLeft={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >

          {/* دکمه پیام های دریافتی از اپ */}


          {/* باکس متن پیام */}
          <View style={styles.messageBox}>
            <Text style={styles.sectionTitle}>متن پیام جدید</Text>
            <TextInput
              style={styles.messageInput}
              multiline={true}
              numberOfLines={4}
              placeholder="پیام خود را اینجا وارد کنید..."
              placeholderTextColor="#999"
              value={messageText}
              onChangeText={setMessageText}
              textAlignVertical="top"
              editable={!sending}
            />
            <Text style={styles.charCount}>
              {messageText.length} / 5000
            </Text>
          </View>

          {/* دکمه ارسال پیام به لوپ */}
          <TouchableOpacity
            style={[
              styles.mainButton,
              { backgroundColor: themeColor7.bgColor(0.8) },
              sending && styles.disabledButton
            ]}
            onPress={handleSendMessage}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.buttonText}>ارسال پیام به لوپ</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* راهنما */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={themeColor7.bgColor(0.7)} />
            <Text style={styles.infoText}>
              پیام های شما به تیم پشتیبانی لوپ ارسال می‌شود و در اسرع وقت پاسخ داده خواهد شد.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: themeColor0.bgColor(0.8) }]}
            onPress={() => {
              setShowMessages(!showMessages);
              // وقتی لیست باز می‌شود، badge را صفر کن (چون پیام‌ها خوانده می‌شوند)
              if (!showMessages) {
                setUnreadCount(0);
              }
            }}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>پیام ها</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadgeButton}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <Ionicons
              name={showMessages ? "chevron-up" : "chevron-down"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          {/* نمایش لیست پیام‌ها */}
          {showMessages && (
            <View style={styles.messagesContainer}>
              {messages.length === 0 ? (
                <View style={styles.emptyMessages}>
                  <Ionicons name="chatbubbles-outline" size={50} color={themeColor10.bgColor(0.3)} />
                  <Text style={styles.emptyText}>هنوز پیامی دریافت نشده است</Text>
                </View>
              ) : (
                messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageItem,
                      msg.is_mine ? styles.myMessage : styles.adminMessage
                    ]}
                  >
                    <View style={styles.messageHeader}>
                      <View style={styles.roleContainer}>
                        <Ionicons
                          name={msg.is_mine ? "person" : "shield-checkmark"}
                          size={16}
                          color={msg.is_mine ? themeColor10.bgColor(1) : themeColor0.bgColor(1)}
                        />
                        <Text style={[
                          styles.roleText,
                          { color: msg.is_mine ? themeColor10.bgColor(1) : themeColor0.bgColor(1) }
                        ]}>
                          {msg.role_label}
                        </Text>
                      </View>
                      <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>{formatDateTime(msg.created_at)}</Text>
                        {/* نمایش تیک فقط برای پیام‌های خود متخصص */}
                        {msg.is_mine && (
                          <Ionicons
                            name={msg.is_read ? "checkmark-done" : "checkmark"}
                            size={16}
                            color={msg.is_read ? themeColor7.bgColor(1) : themeColor10.bgColor(0.5)}
                          />
                        )}
                      </View>
                    </View>
                    <Text style={styles.messageContent}>{msg.message}</Text>
                    {!msg.is_read && !msg.is_mine && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>جدید</Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    ...NewStyles.center,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 100,
    gap: 15,
  },
  mainButton: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    ...NewStyles.rowWrapper,
    ...NewStyles.shadow,
  },
  buttonContent: {
    ...NewStyles.row,
    gap: 10,
  },
  buttonText: {
    ...NewStyles.title4,
    fontSize: 16,
  },
  badgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    ...NewStyles.title4,
    fontSize: 12,
  },
  unreadBadgeButton: {
    backgroundColor: themeColor1.bgColor(1),
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    ...NewStyles.title4,
    color: '#fff',
    fontSize: 12,
  },
  messagesContainer: {
    width: '100%',
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 10,
    padding: 15,
    gap: 10,
  },
  emptyMessages: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: themeColor10.bgColor(0.5),
    textAlign: 'center',
  },
  messageItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  myMessage: {
    borderLeftColor: themeColor7.bgColor(1),
    backgroundColor: themeColor7.bgColor(0.1),
  },
  adminMessage: {
    borderLeftColor: themeColor0.bgColor(1),
    backgroundColor: themeColor3.bgColor(0.1),
  },
  messageHeader: {
    ...NewStyles.rowWrapper,
    marginBottom: 8,
  },
  roleContainer: {
    ...NewStyles.row,
    gap: 5,
  },
  roleText: {
    ...NewStyles.title10,
    fontSize: 12,
  },
  dateContainer: {
    ...NewStyles.row,
    gap: 5,
    alignItems: 'center',
  },
  dateText: {
    ...NewStyles.text,
    fontSize: 10,
  },
  messageContent: {
    ...NewStyles.text,
    fontSize: 14,
    textAlign: 'right',
    lineHeight: 22,
  },
  unreadBadge: {
    position: 'absolute',
    top: -10,
    left: 8,
    backgroundColor: themeColor1.bgColor(1),
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadText: {
    ...NewStyles.text4,
    color: '#fff',
    fontSize: 10,
  },
  messageBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    ...NewStyles.shadow,
  },
  sectionTitle: {
    ...NewStyles.title10,
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'right',
  },
  messageInput: {
    ...NewStyles.text10,
    fontSize: 14,
    textAlign: 'right',
    minHeight: 100,
    borderWidth: 1,
    borderColor: themeColor10.bgColor(0.2),
    borderRadius: 8,
    padding: 10,
    backgroundColor: themeColor4.bgColor(1),
  },
  charCount: {
    fontSize: 11,
    color: themeColor10.bgColor(0.5),
    textAlign: 'left',
    marginTop: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  infoBox: {
    width: '100%',
    ...NewStyles.row,
    gap: 10,
    backgroundColor: themeColor7.bgColor(0.1),
    borderRadius: 10,
    padding: 15,
  },
  infoText: {
    ...NewStyles.text4,
    flex: 1,
    fontSize: 12,
    textAlign: 'right',
  },
});