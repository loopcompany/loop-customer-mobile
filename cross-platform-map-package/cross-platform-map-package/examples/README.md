# Example Components

This directory contains ready-to-use example components demonstrating various features of the cross-platform MapView package.

## 📁 Available Examples

### 1. BasicMapExample.js
**Difficulty:** Beginner  
**Demonstrates:**
- Simple MapView setup
- Single marker placement
- Region state management
- Basic styling

**Use when:** You need a simple map with one location marker.

### 2. RouteNavigationExample.js
**Difficulty:** Beginner-Intermediate  
**Demonstrates:**
- Origin and destination markers
- Polyline (route) between points
- Automatic region calculation
- Toggle controls
- Centered map view

**Use when:** You need to show a route or connection between two points.

### 3. MultipleMarkersExample.js
**Difficulty:** Intermediate  
**Demonstrates:**
- Rendering many markers efficiently
- Marker selection/highlighting
- Coordinating map with list view
- FlatList integration
- Info card display
- Z-index for marker layering

**Use when:** You need to display multiple locations with list coordination.

### 4. GeographicBoundsExample.js
**Difficulty:** Intermediate-Advanced  
**Demonstrates:**
- Geographic bounds validation
- Coordinate sanitization
- Circle overlay visualization
- Testing different locations
- User feedback for invalid coordinates
- Platform-specific alerts

**Use when:** You need to restrict map usage to specific geographic areas.

## 🚀 How to Use Examples

### Copy to Your Project

```bash
# Copy individual example
cp cross-platform-map-package/examples/BasicMapExample.js your-app/screens/

# Copy all examples
cp cross-platform-map-package/examples/*.js your-app/screens/
```

### Import and Use

```javascript
import BasicMapExample from './screens/BasicMapExample';

// In your navigation or component
<BasicMapExample />
```

### Customize

Each example is self-contained and can be customized:

1. **Change coordinates:** Update latitude/longitude values
2. **Modify styling:** Edit the StyleSheet at the bottom
3. **Add features:** Build upon the example code
4. **Adapt logic:** Modify handlers and state management

## 📚 Learning Path

**Recommended order:**

1. Start with `BasicMapExample.js` - Learn fundamentals
2. Try `RouteNavigationExample.js` - Add polylines
3. Explore `MultipleMarkersExample.js` - Handle collections
4. Master `GeographicBoundsExample.js` - Add validation

## 🎯 Common Modifications

### Change Default Location

```javascript
// Replace Tehran coordinates with your location
const [region, setRegion] = useState({
  latitude: YOUR_LAT,    // Change this
  longitude: YOUR_LNG,   // Change this
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
});
```

### Add More Markers

```javascript
// In MultipleMarkersExample.js
const [locations] = useState([
  // Add your locations here
  { id: '1', name: 'My Place', lat: 35.7219, lng: 51.3347, type: 'custom' },
  // ... more locations
]);
```

### Customize Colors

```javascript
// Change polyline color
<Polyline
  coordinates={routeCoordinates}
  strokeColor="#FF0000"  // Red instead of blue
  strokeWidth={4}
/>

// Change circle color
<Circle
  center={center}
  radius={500}
  strokeColor="rgba(255,0,0,0.5)"    // Red
  fillColor="rgba(255,0,0,0.1)"      // Light red
/>
```

## 🔧 Integration Tips

### With React Navigation

```javascript
import { createStackNavigator } from '@react-navigation/stack';
import BasicMapExample from './examples/BasicMapExample';

const Stack = createStackNavigator();

function MapStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Map" 
        component={BasicMapExample}
        options={{ title: 'Location Map' }}
      />
    </Stack.Navigator>
  );
}
```

### With Tab Navigation

```javascript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RouteNavigationExample from './examples/RouteNavigationExample';

const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Route" 
        component={RouteNavigationExample}
        options={{ tabBarLabel: 'Navigation' }}
      />
    </Tab.Navigator>
  );
}
```

### With Props

```javascript
// Modify examples to accept props
const BasicMapExample = ({ initialLocation, onLocationSelect }) => {
  // Use props instead of hardcoded values
  const [region, setRegion] = useState(initialLocation);
  
  // Call prop function when needed
  const handleMarkerPress = () => {
    onLocationSelect?.(markerPosition);
  };
  
  // ... rest of component
};

// Use with props
<BasicMapExample 
  initialLocation={{ latitude: 35.7, longitude: 51.3 }}
  onLocationSelect={(location) => console.log('Selected:', location)}
/>
```

## 🎨 Styling Examples

### Full Screen Map

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,  // Full screen
  },
});
```

### Card Style Map

```javascript
const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  map: {
    height: 300,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
  },
});
```

## 🐛 Troubleshooting Examples

### Example not rendering?

1. Check that MapView components are imported correctly
2. Verify utils/tehranBounds.js path is correct
3. Ensure dependencies are installed

### Markers not showing?

1. Check coordinate values are valid numbers
2. Verify coordinates are within visible region
3. Check that markers are children of MapView

### Performance issues?

1. Use `useMemo` for marker arrays
2. Limit number of visible markers
3. Implement clustering for many markers

## 📱 Testing Examples

### On iOS Simulator

```bash
npx expo start --ios
# Navigate to the example screen
```

### On Android Emulator

```bash
npx expo start --android
# Navigate to the example screen
```

### On Web

```bash
npx expo start --web
# Navigate to http://localhost:19006
```

## 🔄 Updates

When the main MapView package is updated:

1. Test all examples still work
2. Update examples to showcase new features
3. Add new examples for major features
4. Update this README

## 💡 Contributing Examples

To add a new example:

1. Create `YourFeatureExample.js`
2. Follow the existing structure
3. Add comprehensive comments
4. Include usage instructions
5. Update this README
6. Test on all platforms

---

**Need help?** Check the main [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md) for detailed documentation.
