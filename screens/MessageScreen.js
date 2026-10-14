import React, { useState, useCallback,useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ScreenHeaders from '@components/ScreenHeaders';
import NewStyles from '@styles/NewStyles';
import { colors, themeColor0, themeColor1, themeColor3, themeColor4, themeColor7, themeColor10, themeColor8, themeColor2 } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize } from '@theme/Typography';
import CustomStatusBar from '@components/CustomStatusBar';
import { getTicketsList, sendTicketMessage } from '@services/Api';
import { formatDate, formatDateTime, showAlert, showToastOrAlert } from '@helpers/Common';
import Button from '@components/Button';
import { useSelector } from 'react-redux';
import { createStyles } from '@styles/NewStyles';
import FooterSpacer from '@components/FooterSpacer';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import EmojiPicker from '@components/chat/EmojiPicker';
import AttachmentChips from '@components/chat/AttachmentChips';
import PhotoViewer from '@components/avatar/PhotoViewer';
import {
  ALLOWED_DOCUMENT_TYPES,
  insertAtSelection,
  isImageAttachment,
  validateAttachment,
} from '@components/chat/composerUtils';
export default function MessageScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
    const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  // نوار نوشتن پیام: ایموجی (در محل نشانگر) و پیوست فایل/تصویر.
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [panel, setPanel] = useState(null); // null | 'emoji' | 'attach'
  const [attachments, setAttachments] = useState([]);
  const [attachmentsSupported, setAttachmentsSupported] = useState(false);
  const [viewerUri, setViewerUri] = useState(null);
  const contact = useSelector(state => state.contacts?.data?.data?.contact);
  // شماره‌ی قابل نمایش روی دکمه (فقط وقتی لینک از نوع tel: است).
  const supportLink = String(contact?.link || `tel:${DEFAULT_SUPPORT_PHONE}`);
  const supportPhone = supportLink.startsWith('tel:')
    ? supportLink.replace('tel:', '').replace('+98', '0')
    : null;

  // دریافت لیست پیام‌ها
  const fetchMessages = async () => {
    try {
      const response = await getTicketsList();

      setAttachmentsSupported(Boolean(response.attachmentsSupported));
      if (response.success && response.data) {
        // ترتیب معکوس برای نمایش جدیدترین پیام‌ها در پایین
        setMessages(response.data);

        // محاسبه تعداد پیام‌های خوانده نشده از ادمین
        const unreadAdminMessages = response.data.filter(
          msg => !msg.is_read && !msg.is_mine
        ).length;
        setUnreadCount(unreadAdminMessages);
      }
    } catch (error) {
      console.error(t('Error retrieving messages'), error);
      showAlert(t('Error'), t('Error retrieving messages'));
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
    if (!messageText.trim() && attachments.length === 0) {
      showAlert(t('Warning'), t('Please enter the message text'));
      return;
    }

    if (messageText.length > 5000) {
      showAlert(t('Warning'), t('Message text should not exceed 5000 characters'));
      return;
    }

    try {
      setSending(true);
      const response = await sendTicketMessage(messageText, attachments);

      if (response.success) {
        showAlert(t('Successful'), t('Your message was sent successfully'));
        setMessageText('');
        setAttachments([]);
        setPanel(null);
        // به‌روزرسانی لیست پیام‌ها
        await fetchMessages();
      }
    } catch (error) {
      showAlert(t('Error'), error.message || t('Error sending message'));
    } finally {
      setSending(false);
    }
  };

  const insertEmoji = (emoji) => {
    const next = insertAtSelection(messageText, selection, emoji);
    if (next.text.length > 5000) return;
    setMessageText(next.text);
    setSelection({ start: next.caret, end: next.caret });
  };

  const addAttachment = (asset) => {
    const error = validateAttachment(asset, attachments.length);
    if (error) {
      showToastOrAlert(t(error));
      return;
    }
    setAttachments((prev) => [
      ...prev,
      {
        key: `${Date.now()}-${prev.length}`,
        uri: asset.uri,
        name: asset.name || asset.fileName || asset.uri.split('/').pop(),
        size: asset.size ?? asset.fileSize,
        mimeType: asset.mimeType || (asset.type === 'image' ? 'image/jpeg' : undefined),
        file: asset.file,
      },
    ]);
  };

  const pickAttachment = async (source) => {
    setPanel(null);
    try {
      if (source === 'document') {
        const result = await DocumentPicker.getDocumentAsync({
          type: ALLOWED_DOCUMENT_TYPES,
          copyToCacheDirectory: true,
          multiple: false,
        });
        if (!result.canceled && result.assets?.length) addAttachment(result.assets[0]);
        return;
      }
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToastOrAlert(
          source === 'camera'
            ? t('Camera access is required to take a photo')
            : t('Gallery access is required to select a photo')
        );
        return;
      }
      const options = { mediaTypes: ['images'], quality: 0.8 };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      if (!result.canceled && result.assets?.length) addAttachment(result.assets[0]);
    } catch (error) {
      console.warn('[MessageScreen] attachment pick failed', error?.message);
      showToastOrAlert(t('Error selecting image'));
    }
  };

  const toggleAttachPanel = () => {
    // تا سرور پیوست را نپذیرد، فایل‌ها دور ریخته می‌شدند - پس دکمه فعال نمی‌شود.
    if (!attachmentsSupported) {
      showToastOrAlert(t('Sending files will be available soon.'));
      return;
    }
    setPanel((current) => (current === 'attach' ? null : 'attach'));
  };

  const openAttachment = (item) => {
    if (isImageAttachment(item)) setViewerUri(item.uri);
    else if (item.uri) Linking.openURL(item.uri);
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
        title={t('Message')}
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

          {/* «ارتباط با پشتیبانی» - تیتر و متن طبق سند کارفرما، با دکمه‌ی تماس */}
          <View style={styles.supportCard}>
            <View style={styles.supportIcon}>
              <Ionicons name="headset-outline" size={30} color={colors.white.color} />
            </View>
            <Text style={styles.supportTitle}>{t('Support contact title')}</Text>
            <Text style={styles.supportText}>{t('For guidance, contact the Loop support team.')}</Text>
            <Button
              title={supportPhone ? `${t('Call')} ${supportPhone}` : t('Call')}
              onPress={() => {
                Linking.openURL(supportLink);
              }}
            />
          </View>
          {/* باکس متن پیام */}
          <View style={styles.messageBox}>
            <Text style={styles.sectionTitle}>{t('New message text')}</Text>
            <TextInput
              style={styles.messageInput}
              multiline={true}
              numberOfLines={4}
              placeholder={t('Enter your message here...')}
              placeholderTextColor="#999"
              value={messageText}
              onChangeText={setMessageText}
              // محل نشانگر فقط خوانده می‌شود (کنترل‌کردنش روی اندروید نشانگر را جابه‌جا می‌کند).
              onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
              textAlignVertical="top"
              editable={!sending}
            />
            {/* ایموجی و سنجاق (پیوست) */}
            <View style={styles.composerBar}>
              <View style={styles.composerTools}>
                <TouchableOpacity
                  onPress={() => setPanel((current) => (current === 'emoji' ? null : 'emoji'))}
                  accessibilityLabel={t('Emoji')}
                  style={[styles.toolButton, panel === 'emoji' && styles.toolButtonActive]}
                >
                  <Ionicons name="happy-outline" size={22} color={themeColor10.bgColor(0.8)} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggleAttachPanel}
                  accessibilityLabel={t('Attach file')}
                  style={[
                    styles.toolButton,
                    panel === 'attach' && styles.toolButtonActive,
                    !attachmentsSupported && styles.toolButtonDisabled,
                  ]}
                >
                  <Ionicons name="attach-outline" size={22} color={themeColor10.bgColor(0.8)} />
                </TouchableOpacity>
              </View>
              <Text style={styles.charCount}>
                {messageText.length} / 5000
              </Text>
            </View>
            {panel === 'emoji' ? <EmojiPicker onPick={insertEmoji} /> : null}
            {panel === 'attach' ? (
              <View style={styles.attachMenu}>
                {[
                  { source: 'gallery', icon: 'images-outline', label: t('Choose from gallery') },
                  { source: 'camera', icon: 'camera-outline', label: t('Take a photo') },
                  { source: 'document', icon: 'document-attach-outline', label: t('PDF or image file') },
                ].map((option) => (
                  <TouchableOpacity key={option.source} onPress={() => pickAttachment(option.source)} style={styles.attachOption}>
                    <Ionicons name={option.icon} size={22} color={colors.primary.color} />
                    <Text style={styles.attachOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            <AttachmentChips
              items={attachments}
              onRemove={(key) => setAttachments((prev) => prev.filter((item) => item.key !== key))}
            />
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
                <Text style={styles.buttonText}>{t('Send message to Loop')}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* راهنما */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={themeColor7.bgColor(0.7)} />
            <Text style={styles.infoText}>
              {t('Your messages will be sent to Loop support team and will be answered as soon as possible.')}
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
              <Text style={styles.buttonText}>{t('Messages')}</Text>
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
                  <Text style={styles.emptyText}>{t('No messages received yet')}</Text>
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
                    {msg.message ? <Text style={styles.messageContent}>{msg.message}</Text> : null}
                    {Array.isArray(msg.attachments) && msg.attachments.length > 0 ? (
                      <AttachmentChips
                        items={msg.attachments.map((file, index) => ({
                          key: String(file.id ?? index),
                          uri: file.url,
                          name: file.name,
                          size: file.size,
                          mimeType: file.mime_type,
                        }))}
                        onOpen={openAttachment}
                      />
                    ) : null}
                    {!msg.is_read && !msg.is_mine && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{t('New')}</Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          )}
          <FooterSpacer />
        </ScrollView>
      )}

      {viewerUri ? <PhotoViewer visible uri={viewerUri} onClose={() => setViewerUri(null)} /> : null}
    </LinearGradient>
  );
}

// همان شماره‌ی پشتیبانی که منوی اصلی (MenuContext.callSupport) می‌گیرد.
const DEFAULT_SUPPORT_PHONE = '02191693909';

const createLocalStyles = (NewStyles) => StyleSheet.create({
  composerBar: {
    ...NewStyles.rowWrapper,
    marginTop: spacing.xs,
  },
  composerTools: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  toolButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.bgColor(1),
  },
  toolButtonActive: {
    backgroundColor: colors.primary.bgColor(0.15),
  },
  toolButtonDisabled: {
    opacity: 0.45,
  },
  attachMenu: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.bgColor(1),
    backgroundColor: colors.surface.bgColor(1),
    paddingHorizontal: spacing.md,
  },
  attachOption: {
    ...NewStyles.row,
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider.bgColor(1),
  },
  attachOptionText: {
    ...NewStyles.text10,
    fontSize: fontSize.sm,
  },
  supportCard: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.white.bgColor(0.12),
    borderWidth: 1,
    borderColor: colors.white.bgColor(0.25),
  },
  supportIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.bgColor(0.6),
    borderWidth: 2,
    borderColor: colors.white.bgColor(0.6),
  },
  supportTitle: {
    ...NewStyles.title4,
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  supportText: {
    ...NewStyles.text4,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
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

  },
  messageInput: {
    ...NewStyles.text10,
    fontSize: 14,

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
   
  },
});