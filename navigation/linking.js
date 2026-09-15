import { Platform } from 'react-native';
import { getStateFromPath as getStateFromPathDefault } from '@react-navigation/native';

import { routes } from './routes';

/**
 * Deep-link prefixes the web build answers to.
 * Add new deployment origins here rather than in the linking object below.
 */
const PREFIXES = [
  'https://user-panel.khayyamtech.com',
  'http://localhost:8081',
  'http://localhost:8082',
];

/**
 * URLs that no longer exist, mapped to the path that replaced them.
 *
 * `/folder` was a second home page next to `/list`; `/list` is now the only
 * one. Bookmarks and old links still point at the retired path, so rewrite it
 * here rather than leaving the visitor on React Navigation's fallback route.
 *
 * Keys are compared without the leading slash and without the query string.
 */
const LEGACY_PATHS = {
  folder: '/list',
};

/**
 * Path → screen map, derived from the route registry.
 *
 * Exported so the rewrite below can be exercised without standing up the whole
 * (web-only) linking object.
 *
 * @type {{ screens: Record<string, string> }}
 */
export const linkingConfig = {
  screens: Object.fromEntries(
    routes.filter((route) => route.path != null).map((route) => [route.name, route.path])
  ),
};

/**
 * Rewrites retired paths before React Navigation resolves them.
 *
 * @param {string} path - Incoming path, e.g. `/folder?x=1`
 * @param {object} config - Linking config passed through untouched
 */
export function getStateFromPath(path, config) {
  const [pathname, query] = String(path ?? '').split('?');
  const replacement = LEGACY_PATHS[pathname.replace(/^\/+|\/+$/g, '')];

  if (replacement) {
    return getStateFromPathDefault(query ? `${replacement}?${query}` : replacement, config);
  }

  return getStateFromPathDefault(path, config);
}

/**
 * React Navigation linking config, derived from the route registry.
 *
 * Native builds return `undefined`: the app has no custom URL scheme handling
 * beyond the web panel, and passing a linking config on native would make
 * React Navigation try to restore state from a URL that is never present.
 *
 * @type {import('@react-navigation/native').LinkingOptions<ReactNavigation.RootParamList> | undefined}
 */
export const linking =
  Platform.OS === 'web'
    ? {
        prefixes: PREFIXES,
        config: linkingConfig,
        getStateFromPath,
      }
    : undefined;

export default linking;
