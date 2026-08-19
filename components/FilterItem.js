import { Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import NewStyles from '@styles/NewStyles';
import { themeColor0, themeColor3, themeColor5 } from '@theme/Color';

export default function FilterItem({ item, index, activeIndex, setActiveIndex }) {

  let isActive = activeIndex == index;
  let color = isActive ? themeColor5.bgColor(1) : themeColor0.bgColor(1);
  let backgroundColor = isActive ? themeColor0.bgColor(1) : themeColor3.bgColor(0.2);

  return (
    <Pressable style={[styles.filterItem, NewStyles.border100, NewStyles.rowWrapper, { backgroundColor, gap: 10 }]} onPress={() => setActiveIndex(index)}>
      {item.icon_name && <Ionicons name={item.icon_name} size={20} color={color} />}
      <Text style={[NewStyles.text4, { color }]}>{item?.title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  filterItem: {
    paddingHorizontal: 15,
    padding: 10,
    gap: 5,
    backgroundColor: themeColor3.bgColor(1),
  },
})