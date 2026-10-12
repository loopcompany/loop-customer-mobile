// عکس پروفایل گرد + منوی «دوربین / گالری / آواتار / نمایش / حذف» (بند ۱۲).
//
// مشترک بین پروفایل کاربر عادی و سازمانی. این کامپوننت فقط انتخاب را انجام
// می‌دهد و نتیجه را به صفحه می‌دهد؛ ذخیره روی سرور (با «ذخیره») کار خود صفحه است:
//   onChange({ uri, source: 'camera'|'gallery'|'avatar' })  عکس تازه (URI محلی)
//   onRemove()                                               حذف عکس
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { langIsRTL, showAlert, showToastOrAlert } from '@helpers/Common';
import { colors } from '@theme/Color';
import { spacing } from '@theme/Spacing';
import { radius } from '@theme/Radius';
import { fontSize, getFontFamily } from '@theme/Typography';
import { shadow } from '@theme/Shadows';
import CircularCropper from './CircularCropper';
import PhotoViewer from './PhotoViewer';
import { avatarsFor } from './avatarPresets';
import { resolvePresetUri } from './photoFile';

const SheetRow = ({ icon, label, onPress, danger, font, rtl }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={{
      flexDirection: rtl ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider.bgColor(1),
    }}
  >
    <Ionicons name={icon} size={22} color={danger ? colors.error.color : colors.primary.color} />
    <Text
      style={{
        flex: 1,
        textAlign: rtl ? 'right' : 'left',
        fontFamily: font,
        fontSize: fontSize.md,
        color: danger ? colors.error.color : colors.textPrimary.color,
      }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

/**
 * @param {{
 *   uri: string|null,            عکس فعلی (URL سرور یا URI محلی)
 *   editable?: boolean,          نمایش دکمه‌ی دوربین و منو
 *   variant?: 'person'|'organization',
 *   size?: number,
 *   onChange: (photo: { uri: string, source: string }) => void,
 *   onRemove?: () => void,
 *   placeholderIcon?: string,
 * }} props
 */
const ProfilePhotoEditor = ({
  uri,
  editable = true,
  variant = 'person',
  size = 120,
  onChange,
  onRemove,
  placeholderIcon,
}) => {
  const { t, i18n } = useTranslation();
  const bold = getFontFamily('bold', i18n.language);
  const regular = getFontFamily('regular', i18n.language);
  const rtl = langIsRTL(i18n.language);

  const [sheet, setSheet] = useState(null); // null | 'menu' | 'avatars'
  const [cropImage, setCropImage] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(null);

  const closeSheet = () => setSheet(null);

  const pickFrom = async (source) => {
    closeSheet();
    try {
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
      const options = { mediaTypes: ['images'], allowsEditing: false, quality: 1 };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      setCropImage({ uri: asset.uri, width: asset.width, height: asset.height, source });
    } catch (error) {
      console.warn('[ProfilePhotoEditor] pick failed', error?.message);
      showToastOrAlert(t('Error selecting image'));
    }
  };

  const chooseAvatar = async (avatar) => {
    setLoadingAvatar(avatar.id);
    try {
      const localUri = await resolvePresetUri(avatar.source);
      closeSheet();
      onChange({ uri: localUri, source: 'avatar' });
    } catch (error) {
      console.warn('[ProfilePhotoEditor] avatar failed', error?.message);
      showToastOrAlert(t('Error selecting image'));
    } finally {
      setLoadingAvatar(null);
    }
  };

  const confirmRemove = () => {
    closeSheet();
    showAlert(t('Delete photo'), t('Remove your profile photo?'), [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Delete'), style: 'destructive', onPress: () => onRemove?.() },
    ]);
  };

  const openAvatar = () => {
    if (uri) setViewerOpen(true);
    else if (editable) setSheet('menu');
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size }}>
        <TouchableOpacity
          onPress={openAvatar}
          activeOpacity={0.85}
          accessibilityRole="imagebutton"
          accessibilityLabel={uri ? t('View profile photo') : t('Choose profile photo')}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: 'hidden',
            borderWidth: 3,
            borderColor: colors.white.color,
            backgroundColor: colors.background.bgColor(1),
            alignItems: 'center',
            justifyContent: 'center',
            ...shadow.sm,
          }}
        >
          {uri ? (
            <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Ionicons
              name={placeholderIcon || (variant === 'organization' ? 'business' : 'person')}
              size={size * 0.42}
              color={colors.textMuted.color}
            />
          )}
        </TouchableOpacity>
        {editable ? (
          <TouchableOpacity
            onPress={() => setSheet('menu')}
            accessibilityLabel={t('Change profile photo')}
            hitSlop={8}
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
              backgroundColor: colors.primary.bgColor(1),
              borderWidth: 2,
              borderColor: colors.white.color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="camera" size={size * 0.15} color={colors.white.color} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* منوی پایین صفحه */}
      <Modal visible={sheet !== null} transparent animationType="slide" onRequestClose={closeSheet}>
        <Pressable
          onPress={closeSheet}
          style={{ flex: 1, backgroundColor: colors.overlay.bgColor(0.45) }}
        />
        <View
          style={{
            backgroundColor: colors.surface.bgColor(1),
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: spacing.xxxl,
            maxHeight: '80%',
          }}
        >
          <Text
            style={{
              fontFamily: bold,
              fontSize: fontSize.lg,
              color: colors.textPrimary.color,
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}
          >
            {sheet === 'avatars' ? t('Choose an avatar') : t('Profile photo')}
          </Text>

          {sheet === 'menu' ? (
            <View>
              <SheetRow
                icon="camera-outline"
                label={t('Take a photo')}
                onPress={() => pickFrom('camera')}
                font={regular}
                rtl={rtl}
              />
              <SheetRow
                icon="images-outline"
                label={t('Choose from gallery')}
                onPress={() => pickFrom('gallery')}
                font={regular}
                rtl={rtl}
              />
              <SheetRow
                icon="happy-outline"
                label={t('Choose an avatar')}
                onPress={() => setSheet('avatars')}
                font={regular}
                rtl={rtl}
              />
              {uri ? (
                <SheetRow
                  icon="expand-outline"
                  label={t('View photo')}
                  onPress={() => {
                    closeSheet();
                    setViewerOpen(true);
                  }}
                  font={regular}
                  rtl={rtl}
                />
              ) : null}
              {uri && onRemove ? (
                <SheetRow
                  icon="trash-outline"
                  label={t('Delete photo')}
                  onPress={confirmRemove}
                  danger
                  font={regular}
                  rtl={rtl}
                />
              ) : null}
            </View>
          ) : null}

          {sheet === 'avatars' ? (
            <ScrollView
              contentContainerStyle={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: spacing.md,
                paddingVertical: spacing.sm,
              }}
            >
              {avatarsFor(variant).map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  onPress={() => chooseAvatar(avatar)}
                  disabled={Boolean(loadingAvatar)}
                  accessibilityLabel={t(avatar.label)}
                  style={{ alignItems: 'center', width: 84 }}
                >
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      overflow: 'hidden',
                      borderWidth: 2,
                      borderColor: colors.border.bgColor(1),
                    }}
                  >
                    <Image source={avatar.source} style={{ width: '100%', height: '100%' }} />
                    {loadingAvatar === avatar.id ? (
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: colors.white.bgColor(0.6),
                        }}
                      >
                        <ActivityIndicator color={colors.primary.color} />
                      </View>
                    ) : null}
                  </View>
                  <Text
                    style={{
                      fontFamily: regular,
                      fontSize: fontSize.xs,
                      color: colors.textSecondary.color,
                      marginTop: spacing.xs,
                      textAlign: 'center',
                    }}
                  >
                    {t(avatar.label)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}

          {sheet === 'avatars' ? (
            <TouchableOpacity
              onPress={() => setSheet('menu')}
              style={{ alignSelf: 'center', marginTop: spacing.md }}
            >
              <Text
                style={{ fontFamily: bold, fontSize: fontSize.sm, color: colors.primary.color }}
              >
                {t('Back')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </Modal>

      {cropImage ? (
        <CircularCropper
          visible
          image={cropImage}
          onCancel={() => setCropImage(null)}
          onDone={(result) => {
            const source = cropImage?.source || 'gallery';
            setCropImage(null);
            onChange({ uri: result.uri, source });
          }}
        />
      ) : null}

      {viewerOpen ? <PhotoViewer visible uri={uri} onClose={() => setViewerOpen(false)} /> : null}
    </View>
  );
};

export default ProfilePhotoEditor;
