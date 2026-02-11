import React, { useState, useEffect,useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uri } from '../services/URL';
import { showAlert } from '../helpers/Common';
import NewStyles from '../styles/NewStyles';
import { createStyles } from '../styles/NewStyles';

/**
 * LocationPicker Component
 * A reusable component for selecting Province, City, and Region
 * 
 * Props:
 * - selectedProvince: {id, title} - Currently selected province
 * - selectedCity: {id, title} - Currently selected city
 * - selectedRegion: {id, title} - Currently selected region
 * - onProvinceChange: (province) => void - Callback when province changes
 * - onCityChange: (city) => void - Callback when city changes
 * - onRegionChange: (region) => void - Callback when region changes
 * - errors: {province, city, region} - Error messages for each field
 * - required: boolean - Whether fields are required (shows *)
 */
const LocationPicker = ({
  selectedProvince,
  selectedCity,
  selectedRegion,
  onProvinceChange,
  onCityChange,
  onRegionChange,
  errors = {},
  required = true,
  style = {}
}) => {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
    // const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [regions, setRegions] = useState([]);
  
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');

  // Load provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (selectedProvince?.id) {
      fetchCities(selectedProvince.id);
    } else {
      setCities([]);
      setRegions([]);
    }
  }, [selectedProvince?.id]);

  // Load regions when city changes
  useEffect(() => {
    if (selectedCity?.id) {
      fetchRegions(selectedCity.id);
    } else {
      setRegions([]);
    }
  }, [selectedCity?.id]);

  // Fetch all provinces
  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = {
        'Accept': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axios.get(`${uri}/locations/provinces`, { headers });
      if (response.data.success) {
        setProvinces(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
      if (Platform.OS === 'web') {
        window.alert(t('Error fetching province list'));
      } else {
        showAlert(t('Error'), t('Error fetching province list'));
      }
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Fetch cities for a province
  const fetchCities = async (provinceId) => {
    setLoadingCities(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = {
        'Accept': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axios.get(`${uri}/locations/provinces/${provinceId}/cities`, { headers });
      if (response.data.success) {
        setCities(response.data.data.cities);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // Fetch regions for a city
  const fetchRegions = async (cityId) => {
    setLoadingRegions(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const headers = {
        'Accept': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axios.get(`${uri}/locations/cities/${cityId}/regions`, { headers });
      if (response.data.success) {
        setRegions(response.data.data.regions);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
      setRegions([]);
    } finally {
      setLoadingRegions(false);
    }
  };

  // Handle province selection
  const handleProvinceSelect = (province) => {
    onProvinceChange(province);
    // Reset city and region when province changes
    onCityChange(null);
    onRegionChange(null);
    setShowProvinceModal(false);
    setSearchQuery('');
  };

  // Handle city selection
  const handleCitySelect = (city) => {
    onCityChange(city);
    // Reset region when city changes
    onRegionChange(null);
    setShowCityModal(false);
    setSearchQuery('');
  };

  // Handle region selection
  const handleRegionSelect = (region) => {
    onRegionChange(region);
    setShowRegionModal(false);
    setSearchQuery('');
  };

  // Filter items based on search query
  const filterItems = (items) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Render picker button
  const renderPickerButton = (label, selectedItem, onPress, error, disabled = false) => (
    <View style={[{ marginBottom: 8 }, style]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={{
          backgroundColor: disabled ? '#e0e0e0' : '#f5f5f5',
          borderRadius: 8,
          // paddingVertical: 10,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderColor: error ? '#ff0000' : '#ccc',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 40,
          opacity: disabled ? 0.6 : 1
        }}
      >
        <Text style={{
          fontSize: 14,
          fontFamily: 'VazirLight',
          color: selectedItem ? '#000' : '#999',
          textAlign: 'right',
          flex: 1
        }}>
          {selectedItem ? selectedItem.title : `${label}${required ? ' *' : ''}`}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
      {error && (
        <Text style={{
          color: '#ff0000',
          fontSize: 12,
          fontFamily: 'VazirLight',
          marginTop: 4,
          textAlign: 'right'
        }}>
          {error}
        </Text>
      )}
    </View>
  );

  // Render selection modal
  const renderModal = (visible, onClose, items, onSelect, loading, title) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
      }}>
        <View style={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: '70%',
          paddingBottom: Platform.OS === 'ios' ? 20 : 0
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0'
          }}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={{
              fontSize: 16,
              fontFamily: 'VazirBold',
              color: '#333',
              textAlign: 'center',
              flex: 1
            }}>
              {title}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Search box */}
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('Search...')}
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: '#ccc',
                fontSize: 14,
                fontFamily: 'VazirLight',
                ...NewStyles.text10,
                
              }}
            />
          </View>

          {/* List */}
          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#1976d2" />
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 400 }}>
              {filterItems(items).length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 14,
                    fontFamily: 'VazirLight',
                    color: '#999',
                    textAlign: 'center'
                  }}>
                    {t('No results found.')}
                  </Text>
                </View>
              ) : (
                filterItems(items).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => onSelect(item)}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f0f0f0'
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      fontFamily: 'VazirLight',
                      color: '#333',
                      textAlign: 'right'
                    }}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View>
      {/* Province Picker */}
      {renderPickerButton(
        t('Province'),
        selectedProvince,
        () => setShowProvinceModal(true),
        errors.province
      )}
      {renderModal(
        showProvinceModal,
        () => { setShowProvinceModal(false); setSearchQuery(''); },
        provinces,
        handleProvinceSelect,
        loadingProvinces,
        t('Select province')
      )}

      {/* City Picker */}
      {renderPickerButton(
        t('City'),
        selectedCity,
        () => setShowCityModal(true),
        errors.city,
        !selectedProvince
      )}
      {renderModal(
        showCityModal,
        () => { setShowCityModal(false); setSearchQuery(''); },
        cities,
        handleCitySelect,
        loadingCities,
        t('Select city')
      )}

      {/* Region Picker */}
      {renderPickerButton(
        t('Region'),
        selectedRegion,
        () => setShowRegionModal(true),
        errors.region,
        !selectedCity
      )}
      {renderModal(
        showRegionModal,
        () => { setShowRegionModal(false); setSearchQuery(''); },
        regions,
        handleRegionSelect,
        loadingRegions,
        t('Select region')
      )}
    </View>
  );
};

export default LocationPicker;

