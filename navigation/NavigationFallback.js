import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@theme/Color';

/**
 * Shown while React Navigation restores state from the URL on web. It is on
 * screen for a frame or two at most, so it deliberately renders nothing but a
 * spinner on the app background — anything more would flash.
 */
export function NavigationFallback() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.bgColor(1),
  },
});

export default NavigationFallback;
