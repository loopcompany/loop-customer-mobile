import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import NewStyles from '../../styles/NewStyles';
import ScreenHeaders from '../../components/ScreenHeaders';
import { themeColor0, themeColor1, themeColor4, themeColor10 } from '../../theme/Color';
import { infoAPI } from '../../services/Api';
import { showToastOrAlert } from '../../helpers/Common';
import BlankScreen from '../../components/BlankScreen';
import { RefreshControl } from 'react-native';
import Loader from '../../components/Loader';
import AccardeonComponent from '../../components/AccardeonComponent';
import { useTranslation } from 'react-i18next';

export default function OrganizationTermsScreen() {
  const { t } = useTranslation();
  const [terms, setTerms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    loadTerms();
  }, [isRefreshing]);

  const loadTerms = async () => {
    try {
      const response = await infoAPI.getOrganizationTerms();

      if (response.status === 'success') {
        setTerms(response.data);
        // Expand first item by default
        if (response.data.length > 0) {
          setExpandedItems({ [response.data[0].id]: true });
        }
      } else {
        showToastOrAlert(t('Error loading organization terms and conditions'));
      }
    } catch (error) {
      console.error('Error loading organization terms:', error);
      showToastOrAlert(t('Error loading organization terms and conditions'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  const renderTermItem = ({ item }) => {
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
      <ScreenHeaders title={t('Organization Terms and Conditions')} />
      <FlatList
        data={terms}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true) }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.termsContainer}
        renderItem={renderTermItem}
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
  termsContainer: {
    padding: 15,
  },
});
