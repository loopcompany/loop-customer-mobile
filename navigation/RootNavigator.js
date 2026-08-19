import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ScreenHeaders from '@components/ScreenHeaders';

import { INITIAL_ROUTE, routes } from './routes';

const Stack = createNativeStackNavigator();

/**
 * Every screen hides the native header and renders its own `ScreenHeaders`,
 * so that is the navigator-wide default instead of being repeated per screen.
 */
const DEFAULT_SCREEN_OPTIONS = { headerShown: false };

/**
 * Turns a route's declarative `header` title into real navigator options.
 *
 * @param {import('./routes').RouteDefinition} route
 * @returns {object|undefined}
 */
function screenOptionsFor(route) {
  if (!route.header) return route.options;
  return {
    ...route.options,
    headerShown: true,
    header: () => <ScreenHeaders title={route.header} />,
  };
}

/**
 * The app's only navigator. Its contents come entirely from `routes.js` —
 * add a screen there, not here.
 */
export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName={INITIAL_ROUTE} screenOptions={DEFAULT_SCREEN_OPTIONS}>
      {routes.map((route) => (
        <Stack.Screen
          key={route.name}
          name={route.name}
          getComponent={route.getComponent}
          options={screenOptionsFor(route)}
        />
      ))}
    </Stack.Navigator>
  );
}

export default RootNavigator;
