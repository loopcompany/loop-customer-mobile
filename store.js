import { configureStore } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import userSlice from './slices/userSlice';
import contactSlice from './slices/contactSlice';
import authSlice from './slices/authSlice';
import languageSlice from './slices/languageSlice';
import weightSlice from './slices/weightSlice';
import newUserSlice from './slices/newUserSlice';
import addressSlice from './slices/addressSlice';
import categorySlice from './slices/categorySlice';
import stepSlice from './slices/stepSlice';
import orderSlice from './slices/orderSlice';
import ordersSlice from './slices/ordersSlice';
import organizationSlice from './slices/organizationSlice';
import radiusSlice from './slices/radiusSlice';
import pdfSlice from './slices/pdfDocumentSlice';
import minPriceSlice from './slices/minPriceSlice';
import hashAppSlice from './slices/hashAppSlice';

// Redux state persistence functions for web platform
const loadState = () => {
  if (Platform.OS !== 'web') {
    return undefined;
  }

  try {
    const serializedState = localStorage.getItem('reduxState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return undefined;
  }
};

const saveState = (state) => {
  if (Platform.OS !== 'web') {
    return;
  }

  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('reduxState', serializedState);
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
  }
};

// Load persisted state before store creation
const preloadedState = loadState();

const store = configureStore({
  reducer: {
    auth: authSlice,
    lang: languageSlice,
    user: userSlice,
    contacts: contactSlice,
    weight: weightSlice,
    newUser: newUserSlice,
    address: addressSlice,
    step: stepSlice,
    category: categorySlice,
    order: orderSlice,
    orders: ordersSlice,
    organization: organizationSlice,
    radius: radiusSlice,
    pdf: pdfSlice,
    minPrice: minPriceSlice,
    hashApp: hashAppSlice,
  },
  preloadedState
});

// Subscribe to store changes and save state automatically on web
if (Platform.OS === 'web') {
  store.subscribe(() => {
    saveState(store.getState());
  });
}

export default store;