import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { themeColor10, themeColor3, themeColor4 } from '../theme/Color';
import { Ionicons } from '@expo/vector-icons';
import NewStyles from '../styles/NewStyles';
import { cleanText } from '../helpers/Common';

const AccardeonComponent = ({ item, expandedItems, setExpandedItems }) => {
  const isExpanded = expandedItems[item.id];

  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  return (
    <View key={item.id} style={styles.termItem}>
      <TouchableOpacity
        style={styles.termHeader}
        onPress={() => toggleExpanded(item.id)}
      >
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={themeColor10.bgColor(1)}
        />
        <Text style={styles.termTitle}>{item.title}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.termContent}>
          <Text style={styles.termDescription}>{cleanText(item.description)}</Text>
        </View>
      )}
    </View>
  );
}

export default AccardeonComponent

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColor4.bgColor(1),
  },
  header: {
    padding: 20,
    backgroundColor: themeColor4.bgColor(1),
    alignItems: 'center',
  },
  
 
  termItem: {
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 10,
    marginBottom: 10,
    ...NewStyles.shadow,
  },
  termHeader: {
    ...NewStyles.row,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: themeColor3.bgColor(0.1),
    backgroundColor: themeColor3.bgColor(0.05),
  },
  termTitle: {
    flex: 1,
    fontSize: 16,
    ...NewStyles.title10,
  },
  termContent: {
    padding: 15,
    backgroundColor: themeColor4.bgColor(1),
    
    borderBottomLeftRadius:10,
    borderBottomRightRadius:10,
  },
  termDescription: {
    fontSize: 14,
    ...NewStyles.text3,
    marginBottom: 10,
  },


});