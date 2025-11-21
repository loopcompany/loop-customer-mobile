import { configureStore } from '@reduxjs/toolkit';
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
import organizationUserSlice from './slices/organizationUserSlice';

export default configureStore({
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
    organizationUser: organizationUserSlice,
  }
})