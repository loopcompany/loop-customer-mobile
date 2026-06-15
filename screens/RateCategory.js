// RateListScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  I18nManager,
  FlatList,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../styles/NewStyles';
import ScreenHeaders from '../components/ScreenHeaders';
import Footer from './Footer';
import { formatJalaaliDate } from '../helpers/Common';
import { themeColor0, themeColor1, themeColor4 } from '../theme/Color';
import { RefreshControl } from 'react-native';
import letterRatesCategoryAPI from '../services/LetterRatesService';
import { useNavigation } from '@react-navigation/native';
import { createStyles } from '../styles/NewStyles';
import { Ionicons } from '@expo/vector-icons';


export default function RateCategory() {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );

  const [show, setShow] = useState(null)
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const [rates, setRates] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  useEffect(() => {
    fetchLetterRates();
  }, [refreshing]);

  const fetchLetterRates = async () => {
    try {
      const response = await letterRatesCategoryAPI.getLetterRatesCategory();

      if (response.status === 'success') {
        const allRates = response.data;
        setRates(allRates);

      }
    } catch (error) {
      console.error('Error fetching letter rates:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }) => {

    return (
      <View>
        <Pressable style={[styles.rateRow, NewStyles.center]} onPress={() => {
          setShow(item?.id)
        }}>
          <Text style={[NewStyles.title4, { fontSize: 14 }]}>{item.title}</Text>
          <Ionicons name={'chevron-down'} size={20} color={themeColor1.bgColor(1)} />
        </Pressable>
        {
          (item?.letter_rates_count > 0 && show == item?.id) &&
          <View style={[{ backgroundColor: themeColor4.bgColor(1), marginBottom: 10 }, NewStyles.border10]}>

            {
              item?.letter_rates?.map((subItem, index) => {
                return (
                  <View style={[NewStyles.rowWrapper, { paddingHorizontal: 20, paddingVertical: 10 }]} key={index}>
                    <Text style={[NewStyles.text10, { flex: 1, paddingLeft: 10, fontSize: 12 }]}>{subItem?.title}</Text>
                    <Text style={[NewStyles.title10, { fontSize: 12 }]} >{subItem?.amount}</Text>
                  </View>
                )
              })
            }
          </View>
        }
      </View>
    )
  };

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={t('Rate List')} />
      <View style={[{ padding: 10, backgroundColor: themeColor1.bgColor(1), marginHorizontal:'5%', marginTop:15 }, NewStyles.border10]}>
        <Text style={[NewStyles.title10, {textAlign:'center', fontSize:14}]}>{t("Dear Loop, the total receipt is more than 800 thousand tomans, you are a guest of Loop (travel and examination expenses are covered)")}</Text>
      </View>
      <View style={[{ flex: 1 }]}>
        <FlatList
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
          showsVerticalScrollIndicator={false}
          data={rates}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.container}
        />
      </View>

    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#005b9f',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  titleContainer: {
    backgroundColor: themeColor0.bgColor(1),
    padding: 10,
    ...NewStyles.border10,
    marginVertical: 10,
    marginHorizontal: 15
  },
  subTitle: {
    backgroundColor: '#007bff',
    color: '#fff',
    textAlign: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  rateRow: {
    backgroundColor: themeColor0.bgColor(1),
    paddingHorizontal: 15,
    marginBottom: 8,
    borderRadius: 10,
    paddingVertical: 5
  },
  rateTitle: {
    ...NewStyles.text3,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rateText: {
    ...NewStyles.text3,
    color: '#666',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  phone: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
