import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import NewStyles from '../../styles/NewStyles';
import ScreenHeaders from '../../components/ScreenHeaders';
import Footer from '../Footer';
import { themeColor0, themeColor1, themeColor4, themeColor10 } from '../../theme/Color';
import { infoAPI } from '../../services/Api';
import { showToastOrAlert } from '../../helpers/Common';
import BlankScreen from '../../components/BlankScreen';
import { RefreshControl } from 'react-native';
import Loader from '../../components/Loader';

export default function PrivacyScreen() {
  const [privacies, setPrivacies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    loadPrivacies();
  }, [isRefreshing]);

  const loadPrivacies = async () => {
    try {
      const response = await infoAPI.getPrivacy();

      if (response.status === 'success') {
        setPrivacies(response.data);
        // Expand first item by default
        if (response.data.length > 0) {
          setExpandedItems({ [response.data[0].id]: true });
        }
      } else {
        showToastOrAlert('خطا در بارگذاری حریم خصوصی');
      }
    } catch (error) {
      console.error('Error loading privacies:', error);
      showToastOrAlert('خطا در بارگذاری حریم خصوصی');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderTermItem = ({ item }) => {
    const isExpanded = expandedItems[item.id];

    return (
      <View key={item.id} style={styles.privacyItem}>
        <TouchableOpacity
          style={styles.privacyHeader}
          onPress={() => toggleExpanded(item.id)}
        >
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={themeColor4.bgColor(1)}
          />
          <Text style={styles.privacyTitle}>{item.title}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.privacyContent}>
            <Text style={styles.privacyDescription}>{item.description}</Text>
          </View>
        )}
      </View>
    );
  };
  if (isLoading) {
    return (
      <Loader />
    )
  }
  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title="حریم خصوصی" />
      <FlatList
        data={privacies}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true) }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.privaciesContainer}
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
  container: {
    flex: 1,
    backgroundColor: '#e0f0ff',
  },
  header: {
    padding: 20,
    backgroundColor: themeColor4.bgColor(1),
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'VazirBold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'VazirLight',
    color: themeColor10.bgColor(0.7),
  },
  privaciesContainer: {
    padding: 15,
  },
  privacyItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  privacyHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  privacyTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'VazirBold',
    color: '#333',
    textAlign: 'right',
    marginRight: 10,
  },
  privacyContent: {
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  privacyDescription: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#666',
    textAlign: 'right',
    lineHeight: 22,
    marginBottom: 10,
  },
  privacyDate: {
    fontSize: 12,
    fontFamily: 'VazirLight',
    color: themeColor10.bgColor(0.6),
    textAlign: 'right',
    fontStyle: 'italic',
  },
  aboutSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  aboutTitle: {
    fontSize: 18,
    fontFamily: 'VazirBold',
    color: themeColor4.bgColor(1),
    textAlign: 'center',
    marginBottom: 15,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#666',
    textAlign: 'right',
    lineHeight: 22,
    marginBottom: 20,
  },
  contactInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: 'VazirBold',
    color: '#333',
    textAlign: 'right',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'VazirLight',
    color: '#666',
    textAlign: 'right',
    marginBottom: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'VazirLight',
    color: themeColor10.bgColor(0.7),
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: themeColor4.bgColor(1),
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'VazirBold',
  },
});