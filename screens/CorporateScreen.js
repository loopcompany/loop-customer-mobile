import React from 'react';
import { useNavigation } from '@react-navigation/native';
import BlankScreen from '../components/BlankScreen';

// نمونه صفحه خالی برای تست
export default function CorporateScreen() {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <BlankScreen
      title="سازمانی / شرکتی"
      icon="business-outline"
      message="بخش خدمات سازمانی به زودی راه‌اندازی می‌شود"
      buttonText="بازگشت"
      onButtonPress={handleGoBack}
      showFooter={true}
      showHeader={true}
    />
  );
}