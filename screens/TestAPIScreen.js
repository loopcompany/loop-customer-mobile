import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { useOrganizationAccess } from '../hooks/useOrganizationAccess';
import Button from '../components/Button';
import CustomStatusBar from '../components/CustomStatusBar';
import { themeColor0, themeColor1, themeColor4 } from '../theme/Color';

const TestAPIScreen = ({ navigation }) => {
  const { refetch, profileStatus, contractStatus } = useOrganizationAccess();
  const organizationState = useSelector(state => state.organization);

  const handleRefetch = async () => {
    console.log('🔄 Manual refetch started...');
    await refetch();
    console.log('✅ Manual refetch finished');
  };

  return (
    <View style={styles.container}>
      <CustomStatusBar backgroundColor={themeColor4.bgColor(1)} barStyle="dark-content" />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>تست وضعیت API</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>وضعیت فعلی از Redux:</Text>
          <Text style={styles.statusText}>Profile Status: {profileStatus || 'null'}</Text>
          <Text style={styles.statusText}>Contract Status: {contractStatus || 'null'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>کل Redux State:</Text>
          <Text style={styles.statusText}>{JSON.stringify(organizationState, null, 2)}</Text>
        </View>

        <Button
          title="رفرش دستی وضعیت"
          onPress={handleRefetch}
          backgroundColor={themeColor1.bgColor(1)}
          textColor={themeColor4.bgColor(1)}
          style={styles.button}
        />

        <Button
          title="بازگشت"
          onPress={() => navigation.goBack()}
          backgroundColor={themeColor0.bgColor(1)}
          textColor={themeColor4.bgColor(1)}
          style={styles.button}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColor4.bgColor(1),
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Vazir-Bold',
    color: themeColor0.color,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: themeColor1.bgColor(0.1),
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Vazir-Bold',
    color: themeColor0.color,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Vazir',
    color: themeColor0.color,
    marginBottom: 5,
  },
  button: {
    marginBottom: 10,
  }
});

export default TestAPIScreen;