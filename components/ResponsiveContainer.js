import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

/**
 * ResponsiveContainer - Wrapper component for web responsiveness
 * Prevents zoom, horizontal scroll, and ensures proper layout on web
 * 
 * Usage: Wrap screen content with this component
 * <ResponsiveContainer>
 *   {/* Your screen content *\/}
 * </ResponsiveContainer>
 */
const ResponsiveContainer = ({ children, style }) => {
  if (Platform.OS !== 'web') {
    // On native, just render children without wrapper
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: '100vw',
    overflow: 'hidden',
    position: 'relative',
  }
});

export default ResponsiveContainer;
