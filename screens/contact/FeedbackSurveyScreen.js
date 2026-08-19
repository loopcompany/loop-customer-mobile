// FeedbackSurveyScreen.js
import React, { useState, useEffect,useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  I18nManager,
  Image,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import ScreenHeaders from '@components/ScreenHeaders';
import { createStyles } from '@styles/NewStyles';
import { themeColor1, themeColor0, themeColor10, themeColor7, themeColor3, themeColor4 } from '@theme/Color';
import Button from '@components/Button';
import pollAPI from '@services/PollApi';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

 // راست‌چین

export default function FeedbackSurveyScreen() {
const { t, i18n } = useTranslation();
  const NewStyles = useMemo(
    () => createStyles(i18n.language),
    [i18n.language]
  );
  const [scores, setScores] = useState({
    app: '',
    technician: '',
    support: '',
  });
  const styles = useMemo(()=> createLocalStyles(NewStyles), [NewStyles]);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [canParticipate, setCanParticipate] = useState(false);
  const [alreadyPoll, setAlreadyPoll] = useState(null); // poll data if already submitted
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const token = useSelector(state => state.auth.token);

  // Helper function to translate rating values from backend
  const translateRating = (rating) => {
    const ratingMap = {
      'خوب': t('Good'),
      'متوسط': t('Average'),
      'ضعیف': t('Poor')
    };

    return ratingMap[rating] || rating;
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    
    // Check if user is authenticated
    if (!token) {
      if (mounted) {
        setError(t('Please log in to your account first'));
        setLoading(false);
      }
      return;
    }
    
    pollAPI.canParticipate()
      .then((res) => {
        if (!mounted) return;
        if (res.data && res.data.can_participate) {
          setCanParticipate(true);
        } else {
          setCanParticipate(false);
          // Fetch poll result if already participated
          pollAPI.getMyPoll().then((poll) => {
            if (mounted) setAlreadyPoll(poll.data);
          }).catch(() => { });
        }
      })
      .catch((e) => {
        if (mounted) setError(e.message || t('Error communicating with server'));
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [token]);

  const setRating = (key, value) => {
    setScores({ ...scores, [key]: value });
  };

  const handleSubmit = async () => {
    // Check authentication before submitting
    if (!token) {
      setError(t('Please log in to your account first'));
      return;
    }

    setSubmitLoading(true);
    setSubmitSuccess(null);
    setError(null);
    try {
      const pollData = {
        app_rate: scores.app,
        tech_rate: scores.technician,
        support_rate: scores.support,
        description: desc,
      };
      
      console.log('Submitting poll with data:', pollData);
      console.log('User token exists:', !!token);
      
      const res = await pollAPI.submitPoll(pollData);
      setSubmitSuccess(res.message || t('Survey submitted successfully.'));
      setCanParticipate(false);
      // Optionally fetch poll result
      pollAPI.getMyPoll().then((poll) => setAlreadyPoll(poll.data)).catch(() => { });
    } catch (e) {
      console.error('Poll submission error:', e);
      setError(e.message || t('Error submitting survey'));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
        <ScreenHeaders title={t("Survey / Performance")} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor1.bgColor(1)} />
          <Text style={styles.loadingText}>{t("Loading...")}</Text>
          <Text style={styles.loadingSubText}>{t("Please wait")}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
        <ScreenHeaders title={t("Survey / Performance")} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#ff4444" />
          <Text style={styles.errorTitle}>{t("Error")}</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          {error.includes('وارد حساب') || error.includes('log in') ? (
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={() => {
                // Navigate to login screen
                // navigation.navigate('LoginScreen');
              }}
            >
              <Text style={styles.loginButtonText}>{t("Login to account")}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => {
                setError(null);
                setLoading(true);
                pollAPI.canParticipate()
                  .then((res) => {
                    if (res.data && res.data.can_participate) {
                      setCanParticipate(true);
                    } else {
                      setCanParticipate(false);
                      pollAPI.getMyPoll().then((poll) => setAlreadyPoll(poll.data)).catch(() => {});
                    }
                  })
                  .catch((e) => setError(e.message || t('Error communicating with server')))
                  .finally(() => setLoading(false));
              }}
            >
              <Text style={styles.retryButtonText}>{t("Try again")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }
  
  if (!canParticipate && alreadyPoll) {
    return (
      <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
        <ScreenHeaders title={t("Survey / Performance")} />
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <Ionicons name="checkmark-done-circle-outline" size={80} color={themeColor7.bgColor(1)} />
          <Text style={styles.resultTitle}>{t("You have already participated in the survey")}</Text>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>{t("Your survey results:")}</Text>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultItemLabel}>{t("Application score:")}</Text>
              <Text style={styles.resultItemValue}>{translateRating(alreadyPoll.app_rate)}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultItemLabel}>{t("Technician score:")}</Text>
              <Text style={styles.resultItemValue}>{translateRating(alreadyPoll.tech_rate)}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultItemLabel}>{t("Support score:")}</Text>
              <Text style={styles.resultItemValue}>{translateRating(alreadyPoll.support_rate)}</Text>
            </View>
            
            {alreadyPoll.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.resultItemLabel}>{t("Your opinion:")}</Text>
                <Text style={styles.descriptionText}>{alreadyPoll.description}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  

  if (!canParticipate) {
    return (
      <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
        <ScreenHeaders title={t("Survey / Performance")} />
        <View style={styles.notAllowedContainer}>
          <Ionicons name="ban-outline" size={80} color="#ff9800" />
          <Text style={styles.notAllowedTitle}>{t("You are not allowed to participate")}</Text>
          <Text style={styles.notAllowedMessage}>
            {t("You have already participated in the survey or do not have access.")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
     
  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
      <ScreenHeaders title={t("Survey / Performance")} />
      <KeyboardAvoidingView behavior="padding">
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
              <Text style={[NewStyles.text10, { textAlign: 'center' }]}>
                {t("Dear user, thank you for your trust, please select your satisfaction level with Loop's performance.")}
              </Text>

            {/* اپلیکیشن لوپ */}
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>{t("Loop Application")}</Text>
            </View>
            <View style={styles.rateRow}>
              {[{ value: 'خوب', label: t('Good') }, { value: 'متوسط', label: t('Average') }, { value: 'ضعیف', label: t('Poor') }].map(({ value, label }) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.rateButton,
                    scores.app === value && styles.activeButton,
                  ]}
                  onPress={() => setRating('app', value)}
                >
                  <Text style={styles.rateText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* تکنسین لوپ */}
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>{t("Loop Technician")}</Text>
            </View>
            <View style={styles.rateRow}>
              {[{ value: 'خوب', label: t('Good') }, { value: 'متوسط', label: t('Average') }, { value: 'ضعیف', label: t('Poor') }].map(({ value, label }) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.rateButton,
                    scores.technician === value && styles.activeButton,
                  ]}
                  onPress={() => setRating('technician', value)}
                >
                  <Text style={styles.rateText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* پشتیبانی لوپ */}
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>{t("Loop Support")}</Text>
            </View>

            <View style={styles.rateRow}>
              {[{ value: 'خوب', label: t('Good') }, { value: 'متوسط', label: t('Average') }, { value: 'ضعیف', label: t('Poor') }].map(({ value, label }) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.rateButton,
                    scores.support === value && styles.activeButton,
                  ]}
                  onPress={() => setRating('support', value)}
                >
                  <Text style={styles.rateText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* توضیح بیشتر */}
            <Text style={styles.commentLabel}>{t("Do you have more details? Write:")}</Text>
            <TextInput
              placeholder={t("Details...")}
              style={styles.commentInput}
              multiline
              value={desc}
              onChangeText={setDesc}
            />
          </View>

          <View style={styles.spacer} />

          <View style={styles.buttonContainer}>
            <Button
              title={submitLoading ? t('Submitting...') : t('Submit Survey')}
              onPress={handleSubmit}
              disabled={submitLoading || !scores.app || !scores.technician || !scores.support}
              loading={submitLoading}
            />
            {submitSuccess && (
              <Text style={{ color: 'green', textAlign: 'center', marginTop: 10 }}>{submitSuccess}</Text>
            )}
            {error && (
              <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{error}</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createLocalStyles = (NewStyles) =>  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e0f0ff',
  },
  container: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: '#e0f0ff',
  },
  title: {
    backgroundColor: '#005b9f',
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  subTitle: {
    backgroundColor: '#007bff',
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  category: {
    ...NewStyles.title10,
    textAlign: 'center',
  },
  categoryContainer: {
    backgroundColor: themeColor1.bgColor(1),
    ...NewStyles.border10,
    padding: 10,
    marginVertical: 10,
    ...NewStyles.center
  },
  rateRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  rateButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#2196f3',
  },
  rateText: {
    ...NewStyles.text10,
    textAlign: 'center',
  },
  commentLabel: {
    marginTop: 10,
    marginBottom: 6,
    ...NewStyles.text10
  },
  commentInput: {
    ...NewStyles.textInput,
    backgroundColor: '#fff',
    height: 100,
    ...NewStyles.border10,
    padding: 10,
    textAlignVertical: 'top',
    ...NewStyles.text10
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  buttonContainer: {
    paddingBottom: 50,
  },
  submitButton: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    ...NewStyles.title10,
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubText: {
    ...NewStyles.text10,
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.7,
  },
  
  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    ...NewStyles.title10,
    marginTop: 20,
    textAlign: 'center',
    color: '#ff4444',
  },
  errorMessage: {
    ...NewStyles.text10,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: themeColor1.bgColor(1),
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    ...NewStyles.text10,
    color: '#fff',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  loginButtonText: {
    ...NewStyles.text10,
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Result styles
  resultContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultTitle: {
    ...NewStyles.title7,
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  resultCard: {
    width: '100%',
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 15,
    padding: 20,
    ...NewStyles.shadow
  },
  resultLabel: {
    ...NewStyles.title10,
    marginBottom: 15,
    textAlign: 'center',
  },
  resultRow: {
    ...NewStyles.rowWrapper,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: themeColor3.bgColor(0.1),
  },
  resultItemLabel: {
    ...NewStyles.text10,
    flex: 1,
  },
  resultItemValue: {
    ...NewStyles.text10,
    color: themeColor0.bgColor(1),
  },
  descriptionContainer: {
    marginTop: 15,
    paddingTop: 15,
  },
  descriptionText: {
    ...NewStyles.text10,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  
  // Not allowed styles
  notAllowedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notAllowedTitle: {
    ...NewStyles.title10,
    marginTop: 20,
    textAlign: 'center',
    color: '#ff9800',
  },
  notAllowedMessage: {
    ...NewStyles.text10,
    marginTop: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
});
