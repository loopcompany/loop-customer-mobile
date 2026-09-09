// Neshan (نشان) map platform — keys and REST helpers.
//
// Neshan issues two *different* kinds of key and they are not interchangeable:
//
//   web.*      — the Leaflet/Web SDK key. Renders tiles. This is the one already
//                embedded in the app and it is safe to ship in the client.
//   service.*  — the REST key for /v1/search and /v5/reverse (geocoding).
//
// Only the web key exists in this repo, so search and reverse-geocoding are
// *optional*: every helper below resolves to null when no service key is
// configured, and the picker degrades to "drop a pin, type the address" instead
// of breaking. Set EXPO_PUBLIC_NESHAN_SERVICE_KEY to switch them on.
import axios from 'axios';

const env = typeof process !== 'undefined' && process.env ? process.env : {};

/** Web SDK key — renders the map tiles. */
export const NESHAN_WEB_KEY =
  env.EXPO_PUBLIC_NESHAN_API_KEY || 'web.1152adf3d8884734af16cc9e8f83e649';

/** REST key — search + reverse geocoding. Optional. */
export const NESHAN_SERVICE_KEY = env.EXPO_PUBLIC_NESHAN_SERVICE_KEY || '';

export const hasNeshanServiceKey = () => Boolean(NESHAN_SERVICE_KEY);

/** Tehran's Azadi Square — the fallback centre when nothing else is known. */
export const DEFAULT_CENTER = { latitude: 35.6892, longitude: 51.389 };

// A dedicated client: the app-wide instance in axiosConfig injects the Loop
// bearer token and pops global error alerts, neither of which belongs on a
// third-party request.
const neshanClient = axios.create({
  baseURL: 'https://api.neshan.org',
  timeout: 8000,
});

const withKey = () => ({ headers: { 'Api-Key': NESHAN_SERVICE_KEY } });

/**
 * Turn coordinates into a human address.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{formatted: string, city: string, neighbourhood: string, region: string} | null>}
 *   null when no service key is configured or the lookup fails.
 */
export const reverseGeocode = async (latitude, longitude) => {
  if (!hasNeshanServiceKey()) return null;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  try {
    const { data } = await neshanClient.get('/v5/reverse', {
      ...withKey(),
      params: { lat: latitude, lng: longitude },
    });

    if (!data || data.status !== 'OK') return null;

    return {
      formatted: data.formatted_address || data.route_name || '',
      city: data.city || '',
      neighbourhood: data.neighbourhood || '',
      // «منطقه» شهرداری — دقیقاً همان چیزی که فرم آدرس می‌خواهد.
      region: extractZoneNumber(data.municipality_zone),
    };
  } catch (error) {
    console.warn('[neshan] reverse geocode failed:', error?.message);
    return null;
  }
};

/**
 * Search Neshan's POI/address index, biased towards a location.
 *
 * @param {string} term
 * @param {{latitude: number, longitude: number}} near
 * @returns {Promise<Array<{id: string, title: string, subtitle: string, latitude: number, longitude: number}>>}
 */
export const searchPlaces = async (term, near = DEFAULT_CENTER) => {
  if (!hasNeshanServiceKey()) return [];
  const query = String(term || '').trim();
  if (query.length < 2) return [];

  try {
    const { data } = await neshanClient.get('/v1/search', {
      ...withKey(),
      params: { term: query, lat: near.latitude, lng: near.longitude },
    });

    const items = Array.isArray(data?.items) ? data.items : [];
    return items
      .filter((item) => Number.isFinite(item?.location?.y) && Number.isFinite(item?.location?.x))
      .slice(0, 8)
      .map((item, index) => ({
        id: `${item.title || 'result'}-${index}`,
        title: item.title || '',
        subtitle: item.address || item.region || '',
        latitude: item.location.y,
        longitude: item.location.x,
      }));
  } catch (error) {
    console.warn('[neshan] search failed:', error?.message);
    return [];
  }
};

/**
 * `municipality_zone` arrives as things like "منطقه ۶" or "6". The address form
 * stores a bare number, so pull one out when there is one.
 */
function extractZoneNumber(zone) {
  if (!zone) return '';
  const latin = String(zone).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  const match = latin.match(/\d+/);
  return match ? match[0] : '';
}

/** Great-circle distance in metres (Haversine). */
export const distanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default {
  NESHAN_WEB_KEY,
  NESHAN_SERVICE_KEY,
  hasNeshanServiceKey,
  reverseGeocode,
  searchPlaces,
  distanceInMeters,
  DEFAULT_CENTER,
};
