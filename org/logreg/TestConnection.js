import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { uri } from '../../services/URL';
import CustomStatusBar from '../../components/CustomStatusBar';
import { showAlert } from '../../helpers/Common';

const TestConnection = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (test, success, message, details = null) => {
    setResults(prev => [...prev, { test, success, message, details, time: new Date().toLocaleTimeString() }]);
  };

  // تست 1: اتصال ساده GET
  const testBasicConnection = async () => {
    setLoading(true);
    addResult('Basic GET', null, 'در حال بررسی...');
    
    try {
      const response = await axios.get(uri.replace('/api', ''), { timeout: 5000 });
      addResult(
        'Basic GET',
        true,
        'اتصال موفق!',
        `Status: ${response.status}\nURL: ${uri}`
      );
    } catch (error) {
      addResult(
        'Basic GET',
        false,
        'اتصال ناموفق!',
        `Error: ${error.message}\nURL: ${uri}\n${error.code || ''}`
      );
    }
    setLoading(false);
  };

  // تست 2: API Endpoint
  const testApiEndpoint = async () => {
    setLoading(true);
    addResult('API Endpoint', null, 'در حال بررسی...');
    
    try {
      const response = await axios.get(`${uri}`, {
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });
      addResult(
        'API Endpoint',
        true,
        'API در دسترس است',
        `Status: ${response.status}\nData: ${JSON.stringify(response.data).substring(0, 100)}`
      );
    } catch (error) {
      if (error.response) {
        addResult(
          'API Endpoint',
          false,
          'سرور پاسخ داد اما با خطا',
          `Status: ${error.response.status}\nData: ${JSON.stringify(error.response.data).substring(0, 100)}`
        );
      } else {
        addResult(
          'API Endpoint',
          false,
          'سرور پاسخ نداد',
          `Error: ${error.message}\n${error.code || ''}`
        );
      }
    }
    setLoading(false);
  };

  // تست 3: Registration Endpoint
  const testRegistrationEndpoint = async () => {
    setLoading(true);
    addResult('Registration Endpoint', null, 'در حال بررسی...');
    
    try {
      // فقط یک درخواست خالی برای چک کردن دسترسی
      const response = await axios.post(
        `${uri}/organization/register`,
        {},
        {
          timeout: 5000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      addResult(
        'Registration Endpoint',
        true,
        'Endpoint در دسترس است (validation error انتظار می‌رود)',
        `Status: ${response.status}`
      );
    } catch (error) {
      if (error.response) {
        // اگر 422 یا 400 است یعنی endpoint کار می‌کند
        if ([400, 422].includes(error.response.status)) {
          addResult(
            'Registration Endpoint',
            true,
            'Endpoint کار می‌کند! (Validation error انتظار می‌رفت)',
            `Status: ${error.response.status}\nErrors: ${JSON.stringify(error.response.data).substring(0, 150)}`
          );
        } else {
          addResult(
            'Registration Endpoint',
            false,
            'مشکل در Endpoint',
            `Status: ${error.response.status}\nData: ${JSON.stringify(error.response.data).substring(0, 100)}`
          );
        }
      } else if (error.request) {
        addResult(
          'Registration Endpoint',
          false,
          'درخواست ارسال شد اما پاسخی دریافت نشد',
          `Error: ${error.message}\n${error.code || ''}`
        );
      } else {
        addResult(
          'Registration Endpoint',
          false,
          'خطا در ساخت درخواست',
          `Error: ${error.message}`
        );
      }
    }
    setLoading(false);
  };

  // تست 4: MultiPart Form Data
  const testMultipartEndpoint = async () => {
    setLoading(true);
    addResult('MultiPart Upload', null, 'در حال بررسی...');
    
    try {
      const formData = new FormData();
      formData.append('test', 'test_value');
      
      const response = await axios.post(
        `${uri}/organization/register`,
        formData,
        {
          timeout: 5000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      addResult(
        'MultiPart Upload',
        true,
        'سرور multipart را می‌پذیرد',
        `Status: ${response.status}`
      );
    } catch (error) {
      if (error.response && [400, 422].includes(error.response.status)) {
        addResult(
          'MultiPart Upload',
          true,
          'سرور multipart را می‌پذیرد (validation error)',
          `Status: ${error.response.status}`
        );
      } else if (error.response) {
        addResult(
          'MultiPart Upload',
          false,
          'مشکل در پردازش multipart',
          `Status: ${error.response.status}\n${JSON.stringify(error.response.data).substring(0, 100)}`
        );
      } else {
        addResult(
          'MultiPart Upload',
          false,
          'خطا در ارسال',
          `Error: ${error.message}\n${error.code || ''}`
        );
      }
    }
    setLoading(false);
  };

  // اجرای همه تست‌ها
  const runAllTests = async () => {
    setResults([]);
    await testBasicConnection();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testApiEndpoint();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testRegistrationEndpoint();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testMultipartEndpoint();
    
    showAlert('تست‌ها تمام شد', 'نتایج را بررسی کنید و اسکرین‌شات بگیرید.');
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <CustomStatusBar />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← بازگشت</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تست اتصال سرور</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>آدرس سرور:</Text>
        <Text style={styles.infoText}>{uri}</Text>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <View
            key={index}
            style={[
              styles.resultCard,
              result.success === true && styles.successCard,
              result.success === false && styles.errorCard,
              result.success === null && styles.loadingCard,
            ]}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>{result.test}</Text>
              <Text style={styles.resultTime}>{result.time}</Text>
            </View>
            <Text style={styles.resultMessage}>{result.message}</Text>
            {result.details && (
              <Text style={styles.resultDetails}>{result.details}</Text>
            )}
            <View style={styles.resultIndicator}>
              {result.success === true && <Text style={styles.successIcon}>✅</Text>}
              {result.success === false && <Text style={styles.errorIcon}>❌</Text>}
              {result.success === null && <ActivityIndicator size="small" color="#007AFF" />}
            </View>
          </View>
        ))}

        {results.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>هنوز تستی اجرا نشده است</Text>
            <Text style={styles.emptySubtext}>یکی از دکمه‌های بالا را بزنید</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={runAllTests}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🚀 اجرای همه تست‌ها</Text>
          )}
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, styles.halfButton]}
            onPress={testBasicConnection}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>تست ۱: GET</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, styles.halfButton]}
            onPress={testApiEndpoint}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>تست ۲: API</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, styles.halfButton]}
            onPress={testRegistrationEndpoint}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>تست ۳: Register</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, styles.halfButton]}
            onPress={testMultipartEndpoint}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>تست ۴: Upload</Text>
          </TouchableOpacity>
        </View>

        {results.length > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearResults}
            disabled={loading}
          >
            <Text style={styles.clearButtonText}>🗑️ پاک کردن نتایج</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Compensate for back button
  },
  infoBox: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ccc',
  },
  successCard: {
    borderLeftColor: '#4CAF50',
  },
  errorCard: {
    borderLeftColor: '#F44336',
  },
  loadingCard: {
    borderLeftColor: '#FF9800',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultTime: {
    fontSize: 12,
    color: '#999',
  },
  resultMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  resultDetails: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
  },
  resultIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  successIcon: {
    fontSize: 24,
  },
  errorIcon: {
    fontSize: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  buttonsContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  clearButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default TestConnection;

