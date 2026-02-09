import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from './Button';
import CustomStatusBar from './CustomStatusBar';
import {
  themeColor0, themeColor1, themeColor2, themeColor3, themeColor4,
  themeColor6, themeColor7, themeColor8, themeColor10, themeColor11,
  themeColor5
} from '../theme/Color';
import NewStyles from '../styles/NewStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const AccessRestrictedScreen = ({
  type = 'access_denied',
  title = null,
  message = null,
  nextSteps = [],
  profileStatus = null,
  contractStatus = null,
  onRetry = null,
  showRetryButton = false,
  profileRejectionReason = null,
  contractRejectionReason = null,
}) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const resolvedTitle = title || t('Restricted access');
  const resolvedMessage = message || t('You do not have permission to access this section.');

  const contacts = useSelector(state => state.contacts?.data)


  const getIconConfig = () => {
    switch (type) {
      case 'error':
        return { name: 'error-outline', color: themeColor6.color, size: 80 };
      case 'not_allowed':
        return { name: 'block', color: themeColor6.color, size: 80 };
      case 'incomplete_access':
        return { name: 'hourglass-empty', color: themeColor11.color, size: 80 };
      case 'login_required':
        return { name: 'login', color: themeColor2.color, size: 80 };
      case 'custom':
        return { name: 'info-outline', color: themeColor2.color, size: 80 };
      default:
        return { name: 'lock-outline', color: themeColor3.color, size: 80 };
    }
  };

  /**
   * ?????? ?????????? ???? ???????? ????????
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return themeColor7.color;
      case 'pending': return themeColor11.color;
      case 'rejected': return themeColor6.color;
      case 'not_uploaded': return themeColor3.color;
      case 'unknown': return themeColor2.color;
      default: return themeColor3.color;
    }
  };

  /**
   * ?????? ?????????? ???? ??????????
   */
  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return t('Approved');
      case 'pending': return t('Pending');
      case 'rejected': return t('Rejected');
      case 'not_uploaded': return t('Not uploaded');
      default: return t('Unknown');
    }
  };

  /**
   * ?????????????? ???? ???????? ????????????
   */
  const handleNavigation = (action) => {
    console.log(' AccessRestrictedScreen navigation:', action);

    switch (action) {
      case 'edit_profile':
        console.log(' Navigating to OrganizationProfile');
        navigation.navigate('OrganizationProfile');
        break;
      case 'upload_contract':
        console.log(' Navigating to OrganizationContract');
        navigation.navigate('OrganizationContract');
        break;
      case 'edit_account':
        console.log(' Navigating to Profile');
        navigation.navigate('Profile');
        break;
      case 'go_back':
        console.log(' Going back');
        if (Platform.OS == 'web') {
          window.history.back()
        } else {
          navigation.goBack()
        }
        break;
      case 'go_home':
        console.log(' Navigating to Home');
        navigation.navigate('Home');
        break;
      case 'login':
        console.log(' Navigating to Login');
        navigation.navigate('MainSignIn');
        break;
      default:
        console.log(' Unknown navigation action:', action);
        break;
    }
  };

  const iconConfig = getIconConfig();

  console.log(' AccessRestrictedScreen rendered with:', {
    profileStatus,
    contractStatus,
    showRetryButton,
    hasRetryFunction: !!onRetry
  });


  const shouldShowEditProfile = (profileStatus === 'rejected' || profileStatus === 'not_uploaded' || profileStatus === null);
  const shouldShowUploadContract = (contractStatus === 'rejected' || contractStatus === 'not_uploaded' || contractStatus === null);
  const shouldShowViewContract = (contractStatus === 'pending' || contractStatus === 'approved');

  console.log(' Button visibility:', {
    shouldShowEditProfile,
    shouldShowUploadContract,
    shouldShowViewContract,
    profileStatus,
    contractStatus
  });

  return (
    <SafeAreaView edges={{ top: 'additive', bottom: 'off' }} style={styles.container}>
      <CustomStatusBar backgroundColor={themeColor4.bgColor(1)} barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.iconContainer}>
          <Icon
            name={iconConfig.name}
            size={iconConfig.size}
            color={iconConfig.color}
          />
        </View>

      
        <Text style={styles.title}>{resolvedTitle}</Text>

       
        <Text style={styles.message}>{resolvedMessage}</Text>

        
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>{t('Current status:')}</Text>

          <View style={styles.statusItem}>
            <View style={styles.statusRow}>
              <Icon name="person-outline" size={24} color={themeColor3.color} />
              <Text style={styles.statusLabel}>{t('Profile information:')}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(profileStatus || 'unknown') }]}>
                <Text style={styles.statusBadgeText}>
                  {profileStatus ? getStatusText(profileStatus) : t('Under review...')}
                </Text>
              </View>
            </View>
            {profileRejectionReason && profileStatus === 'rejected' && (
              <Text style={styles.rejectionReason} numberOfLines={3}>
                {t('Rejection reason:')} {profileRejectionReason}
              </Text>
            )}
          </View>

          <View style={styles.statusItem}>
            <View style={styles.statusRow}>
              <Icon name="description" size={24} color={themeColor3.color} />
              <Text style={styles.statusLabel}>{t('Contract')}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contractStatus || 'unknown') }]}>
                <Text style={styles.statusBadgeText}>
                  {contractStatus ? getStatusText(contractStatus) : t('Under review...')}
                </Text>
              </View>
            </View>
            {contractRejectionReason && contractStatus === 'rejected' && (
              <Text style={styles.rejectionReason} numberOfLines={3}>
                {t('Rejection reason:')} {contractRejectionReason}
              </Text>
            )}
          </View>
        </View>


        {nextSteps && nextSteps.length > 0 && (
          <View style={styles.nextStepsContainer}>
            <Text style={styles.nextStepsTitle}>{t('Next steps:')}</Text>
            {nextSteps.map((step, index) => (
              <TouchableOpacity
                key={index}
                style={styles.stepItem}
                onPress={() => step.action && handleNavigation(step.action)}
              >
                <Icon name="chevron-left" size={20} color={themeColor0.color} />
                <Text style={styles.stepText}>
                  {typeof step === 'string' ? step : step.text || step}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        
        <View style={styles.actionsContainer}>
         
          <TouchableOpacity
            style={[styles.actionButtonCustom, { backgroundColor: themeColor0.bgColor(1) }]}
            onPress={() => handleNavigation('edit_account')}
          >
            <Icon name="account-circle" size={24} color={themeColor4.color} />
            <Text style={[styles.actionButtonText, { color: themeColor4.color }]}>{t('Edit account information')}</Text>
          </TouchableOpacity>
          {(profileStatus === 'rejected' || profileStatus === 'not_uploaded' || profileStatus === null) && (
            <Button
              title={t('Edit profile information')}
              onPress={() => handleNavigation('edit_profile')}
              backgroundColor={themeColor0.bgColor(1)}
              textColor={themeColor4.bgColor(1)}
              style={styles.actionButton}
            />
          )}


          {(contractStatus === 'rejected' || contractStatus === 'not_uploaded' || contractStatus === null) && (
            <Button
              title={contractStatus === 'rejected' ? t('Re-upload contract') : t('Upload contract')}
              onPress={() => handleNavigation('upload_contract')}
              backgroundColor={themeColor1.bgColor(1)}
              textColor={themeColor4.bgColor(1)}
              style={styles.actionButton}
            />
          )}


          {(contractStatus === 'pending' || contractStatus === 'approved') && (
            <Button
              title={t('View contract')}
              onPress={() => handleNavigation('upload_contract')}
              backgroundColor={themeColor11.bgColor(1)}
              textColor={themeColor4.bgColor(1)}
              style={styles.actionButton}
            />
          )}


          {showRetryButton && onRetry && (
            <Button
              title={t('Check status')}
              onPress={onRetry}
              backgroundColor={themeColor2.bgColor(1)}
              textColor={themeColor4.bgColor(1)}
              style={styles.actionButton}
            />
          )}


        </View>

        
        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>{t('Need help?')}</Text>
          <Text style={styles.helpText}>
            {t('If you have questions or issues, you can contact support.')}
          </Text>
          <TouchableOpacity style={styles.helpButton} onPress={() => { Linking.openURL(contacts?.data?.link) }}>
            <Icon name="support-agent" size={20} color={themeColor0.color} />
            <Text style={styles.helpButtonText}>{t('Contact support')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColor4.bgColor(1),
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height - 100,
  },
  iconContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 50,
    backgroundColor: themeColor5.bgColor(1),
  },
  title: {
    ...NewStyles.title10,
    fontSize: 24,
    color: themeColor10.color,
    textAlign: 'center',
    marginBottom: 15,
  },
  message: {
    ...NewStyles.text3,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  statusContainer: {
    width: '100%',
    backgroundColor: themeColor5.bgColor(1),
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  statusTitle: {
    ...NewStyles.title10,
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  statusItem: {
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  statusLabel: {
    ...NewStyles.text10,
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusBadgeText: {
    ...NewStyles.title4,
    fontSize: 12,
    color: themeColor4.color,
  },
  rejectionReason: {
    ...NewStyles.text6,
    fontSize: 14,
    marginTop: 8,
    marginRight: 35,
    textAlign: 'right',
    lineHeight: 20,
  },
  nextStepsContainer: {
    width: '100%',
    backgroundColor: themeColor8.bgColor(1),
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  nextStepsTitle: {
    ...NewStyles.title,
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  stepItem: {
    ...NewStyles.row,
    paddingVertical: 8,
  },
  stepText: {
    ...NewStyles.text10,
    fontSize: 16,
    marginRight: 10,
    textAlign: 'right',
    flex: 1,
  },
  actionsContainer: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  actionButton: {
    marginBottom: 15,
  },
  actionButtonCustom: {
    ...NewStyles.row,
    ...NewStyles.center,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    gap: 10,
    ...NewStyles.shadow,
    maxWidth: 400,
    width: '100%'
  },
  actionButtonText: {
    ...NewStyles.title10,
    fontSize: 16,
  },
  backButton: {
    ...NewStyles.row,
    ...NewStyles.center,
    paddingVertical: 15,
    marginTop: 10,
  },
  backButtonText: {
    ...NewStyles.text,
    fontSize: 16,
    marginRight: 10,
  },
  helpContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: themeColor5.bgColor(1),
    paddingTop: 20,
    alignItems: 'center',
  },
  helpTitle: {
    ...NewStyles.title,
    fontSize: 16,
    marginBottom: 10,
  },
  helpText: {
    ...NewStyles.text3,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  helpButton: {
    ...NewStyles.row,
    ...NewStyles.center,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColor0.color,
  },
  helpButtonText: {
    ...NewStyles.text,
    fontSize: 14,
    marginRight: 10,
  },
});

export default AccessRestrictedScreen;
