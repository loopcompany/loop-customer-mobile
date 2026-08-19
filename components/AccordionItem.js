import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useMemo } from 'react'
import { themeColor0, themeColor1, themeColor10, themeColor14, themeColor3, themeColor4, themeColor5 } from '@theme/Color';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next'; 
import { cleanText } from '@helpers/Common';
import { createStyles } from '@styles/NewStyles';
const AccordionItem = ({ item, expandedItems, setExpandedItems, needMap = false, customDescriptionStyle }) => {
  const isExpanded = expandedItems[item.id];
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const styles = useMemo(() => createLocalStyles(NewStyles), [NewStyles]);
  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  return (
    <View key={item.id} style={styles.termItem}>
      <TouchableOpacity
        style={[styles.termHeader, NewStyles.center, NewStyles.border10]}
        onPress={() => toggleExpanded(item.id)}
      >
        <Text style={styles.termTitle}>{item.title}</Text>
        <Ionicons
          name={"chevron-down"}
          size={20}
          color={themeColor1.bgColor(1)}
        />
      </TouchableOpacity>

      {(isExpanded) && (
        <View style={styles.termContent}>
          {item.description &&
            <View style={{ backgroundColor: themeColor14.bgColor(1), padding: 10 }}>
              <Text style={[styles.termDescription,]}>{cleanText(item.description)}</Text>
            </View>
          }
          {needMap &&
            <View style={{ backgroundColor: themeColor4.bgColor(1), marginTop: 10, borderColor: themeColor14.bgColor(1), borderWidth: 3 }}>

              {item?.warranties?.map((warranty, index) => (
                <View key={warranty.id} style={[{ paddingVertical: 10 }, index < item?.warranties?.length - 1 ? { borderBottomColor: themeColor14.bgColor(1), borderBottomWidth: 3, } : null]}>
                  <Text style={[NewStyles.title10, { textAlign: 'center' }]}>{warranty.title}</Text>
                </View>
              ))}
            </View>
          }
        </View>
      )}
    </View>
  );
}

export default AccordionItem

const createLocalStyles = (NewStyles) => StyleSheet.create({
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
    backgroundColor: themeColor4.bgColor(0),
    borderRadius: 10,
    marginBottom: 10,
    gap: 10
  },
  termHeader: {
    padding: 5, 
    backgroundColor: themeColor0.bgColor(1),
  },
  termTitle: {
    flex: 1,
    fontSize: 16,
    ...NewStyles.title4,
  },
  termContent: {
    backgroundColor: themeColor4.bgColor(0),

    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  termDescription: {
    fontSize: 14,
    ...NewStyles.text10,
    marginBottom: 10,
  },


});