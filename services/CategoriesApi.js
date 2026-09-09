// Category catalog.
//
// `/api/categories` and `/api/categories/{id}` are authenticated endpoints — the
// server answers `401 {"message":"Unauthenticated."}` to a request without a
// valid session, whether the Authorization header is missing or malformed.
//
// This module used to build its own `Authorization: Bearer ${token}` header from
// a token the *caller* passed in, taken from `state.auth.token`. That token is
// restored asynchronously by `components/AuthInitializer.js`, and child effects
// run before the parent's, so on a page load (and on every web deep-link
// straight into a category screen) the first call went out as
// `Authorization: Bearer null` and came back 401.
//
// Going through the shared `axiosConfig` instance fixes that at the root: its
// request interceptor reads the token from AsyncStorage at request time — the
// same storage `AuthInitializer` restores *from* — so there is no window where
// the header is stale, and no header at all is sent when there is no session.
import axios from './axiosConfig';
import { uri } from './URL';
import i18next from 'i18next';

// The shared instance fixes Accept-Language at module init; category titles are
// localized, so send the *current* language per request.
const localeHeaders = () => ({ 'Accept-Language': i18next.language || 'en' });

const categoriesAPI = {
  getCategories: async () => {
    try {
      const response = await axios.get(`${uri}/categories`, { headers: localeHeaders() });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getSubCategories: async (categoryId) => {
    try {
      const response = await axios.get(`${uri}/categories/${categoryId}`, {
        headers: localeHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  },
};

export default categoriesAPI;
