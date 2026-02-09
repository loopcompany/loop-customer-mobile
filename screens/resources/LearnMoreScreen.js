import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import NewStyles from '../../styles/NewStyles';
import ScreenHeaders from '../../components/ScreenHeaders';
import Footer from '../Footer';
import { themeColor0, themeColor1, themeColor4, themeColor10 } from '../../theme/Color';
import { infoAPI } from '../../services/Api';
import { showToastOrAlert } from '../../helpers/Common';
import BlankScreen from '../../components/BlankScreen';
import { RefreshControl } from 'react-native';
import Loader from '../../components/Loader';
import AccardeonComponent from '../../components/AccardeonComponent';

export default function LearnMoreScreen() {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    loadFaqs();
  }, [isRefreshing]);

  const loadFaqs = async () => {
    try {
      const response = await infoAPI.getFAQs();

      if (response.status === 'success') {
        setFaqs(response.data);
        // Expand first item by default
        if (response.data.length > 0) {
          setExpandedItems({ [response.data[0].id]: true });
        }
      } else {
        showToastOrAlert(t('Error loading FAQs'));
      }
    } catch (error) {
      console.error('Error loading faqs:', error);
      showToastOrAlert(t('Error loading FAQs'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

 
  const renderFaqItem = ({ item }) => {

    return (
      <AccardeonComponent item={item} expandedItems={expandedItems} setExpandedItems={setExpandedItems} />
    );
  };
  if (isLoading) {
    return (
      <Loader />
    )
  }
  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={t("FAQ")} />
      <FlatList
        data={faqs}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true) }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.faqsContainer}
        renderItem={renderFaqItem}
        ListEmptyComponent={() => {
          return (
            <BlankScreen />
          )
        }}

      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 
  faqsContainer:{
    paddingHorizontal:15,
    paddingVertical:10
  }
});