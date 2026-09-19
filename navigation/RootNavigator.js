import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RequireAuth from '@components/RequireAuth';
import ScreenHeaders from '@components/ScreenHeaders';

import { INITIAL_ROUTE, requiresAuth, routes } from './routes';

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
 * Wraps a route's component in the auth guard, preserving lazy evaluation.
 *
 * `getComponent` is what keeps a screen's module out of the startup path, so
 * the guard has to be applied *inside* it rather than around the import. The
 * result is memoised because React Navigation may call `getComponent` more than
 * once, and handing back a new component type each time would remount the
 * screen and throw away its state.
 *
 * @param {import('./routes').RouteDefinition} route
 * @returns {() => import('react').ComponentType<any>}
 */
function guardedComponentFor(route) {
  if (!requiresAuth(route.name)) return route.getComponent;

  let Guarded;

  return () => {
    if (!Guarded) {
      const Screen = route.getComponent();

      // A named function declaration rather than an arrow, so the component has
      // a real name in React DevTools and in error boundaries.
      function GuardedScreen(props) {
        return (
          <RequireAuth navigation={props.navigation}>
            <Screen {...props} />
          </RequireAuth>
        );
      }

      GuardedScreen.displayName = `Guarded(${route.name})`;
      Guarded = GuardedScreen;
    }

    return Guarded;
  };
}

/**
 * Resolved once at module scope, not per render: `routes` is static, and a
 * fresh `getComponent` identity on every render would defeat the memoisation
 * in `guardedComponentFor`.
 */
const SCREENS = routes.map((route) => ({
  name: route.name,
  getComponent: guardedComponentFor(route),
  options: screenOptionsFor(route),
}));

/**
 * The app's only navigator. Its contents come entirely from `routes.js` —
 * add a screen there, not here.
 */
export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName={INITIAL_ROUTE} screenOptions={DEFAULT_SCREEN_OPTIONS}>
      {SCREENS.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          getComponent={screen.getComponent}
          options={screen.options}
        />
      ))}
    </Stack.Navigator>
  );
}

export default RootNavigator;
