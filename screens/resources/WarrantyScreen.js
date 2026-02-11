import React, { useState, useEffect,useMemo } from 'react';
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
import { createStyles } from '../../styles/NewStyles';
export default function WarrantyScreen() {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
    const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
  const [warranties, setWarranties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    loadWarranties();
  }, [isRefreshing]);

  const loadWarranties = async () => {
    try {
      const response = await infoAPI.getWarranty();

      if (response.status === 'success') {
        setWarranties(response.data);
        // Expand first item by default
        if (response.data.length > 0) {
          setExpandedItems({ [response.data[0].id]: true });
        }
      } else {
        console.log('❌ Warranty response not successful:', response);
        showToastOrAlert(t('Error loading warranty'));
      }
    } catch (error) {
      console.error('❌ Error loading warranties:', error);
      console.error('❌ Error response:', error.response);
      showToastOrAlert(t('Error loading warranty'));
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
      <ScreenHeaders title={t("Warranty / Guarantee")} />
      <FlatList
        data={warranties}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true) }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.warrantiesContainer}
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

const createLocalStyles = (NewStyles) => StyleSheet.create({
  warrantiesContainer: {
    padding: 15,
  },
});