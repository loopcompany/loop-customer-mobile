import React from 'react';
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import NewStyles from '@styles/NewStyles';

export default function TechnicianQrCamera({ onRead }) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  if (!permission) return <ActivityIndicator />;
  if (!permission.granted) return <View style={NewStyles.center}>
    <Text style={NewStyles.title4}>{t('برای اسکن کارت تکنسین، دسترسی به دوربین لازم است.')}</Text>
    <Pressable accessibilityRole="button" onPress={() => permission.canAskAgain ? requestPermission() : Linking.openSettings()}><Text style={NewStyles.title4}>{t('اجازهٔ دسترسی به دوربین')}</Text></Pressable>
  </View>;
  return <CameraView style={{ flex: 1 }} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => onRead(data)} />;
}
