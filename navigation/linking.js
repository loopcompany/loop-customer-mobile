import { Platform } from 'react-native';

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
        config: {
          screens: Object.fromEntries(
            routes.filter((route) => route.path != null).map((route) => [route.name, route.path])
          ),
        },
      }
    : undefined;

export default linking;
