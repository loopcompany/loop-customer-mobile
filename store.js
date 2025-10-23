import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import contactSlice from './slices/contactSlice';
import authSlice from './slices/authSlice';
import languageSlice from './slices/languageSlice';
import weightSlice from './slices/weightSlice';
import newUserSlice from './slices/newUserSlice';

export default configureStore({
  reducer: {
    auth: authSlice,
    lang: languageSlice,
    user: userSlice,
    contacts: contactSlice,
    weight: weightSlice,
    newUser: newUserSlice,
  }
})