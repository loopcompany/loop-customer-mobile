import { registerRootComponent } from 'expo';

import App from './App';
import { registerPushBackgroundHandler } from '@services/notifications/backgroundHandler';

// Must run before the React tree mounts (RNFirebase requirement).
registerPushBackgroundHandler();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
