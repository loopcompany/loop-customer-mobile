/**
 * Mounts the push-notification lifecycle (`usePushNotifications`). Render it
 * inside the Redux provider and the NavigationContainer, below `AuthInitializer`
 * so the restored auth token is already in the store on first run.
 *
 * Renders nothing of its own.
 */
import usePushNotifications from '@hooks/usePushNotifications';

export default function PushNotificationProvider({ children }) {
  usePushNotifications();
  return children;
}
