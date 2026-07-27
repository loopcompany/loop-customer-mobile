import { Platform } from 'react-native';

let isListening = false;
let pendingOtp = '';
const subscribers = new Set();

const normalizeDigits = value => String(value || '')
  .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
  .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));

export const extractOtp = message => {
  const normalizedMessage = normalizeDigits(message);
  const match = normalizedMessage.match(/(?:^|\D)(\d{6})(?!\d)/);

  return match?.[1] || '';
};

const getOtpVerifyModule = () => {
  if (Platform.OS !== 'android') return null;

  return require('react-native-otp-verify');
};

const publishOtp = otp => {
  if (!otp) return;

  if (subscribers.size === 0) {
    pendingOtp = otp;
    return;
  }

  pendingOtp = '';
  subscribers.forEach(callback => callback(otp));
};

export const startOtpRetriever = async () => {
  if (Platform.OS !== 'android') return false;
  if (isListening) return true;

  const otpVerify = getOtpVerifyModule();

  if (!otpVerify?.startOtpListener) {
    throw new Error('react-native-otp-verify is not available');
  }

  try {
    await otpVerify.startOtpListener(message => {
      isListening = false;

      const otp = extractOtp(message);

      if (otp) publishOtp(otp);

      otpVerify.removeListener?.();
    });

    isListening = true;
    return true;
  } catch (error) {
    isListening = false;
    otpVerify.removeListener?.();
    throw error;
  }
};

export const stopOtpRetriever = ({ clearPending = false } = {}) => {
  if (Platform.OS === 'android') {
    const otpVerify = getOtpVerifyModule();
    otpVerify?.removeListener?.();
  }

  isListening = false;

  if (clearPending) pendingOtp = '';
};

export const restartOtpRetriever = async () => {
  stopOtpRetriever({ clearPending: true });
  return startOtpRetriever();
};

export const subscribeOtp = callback => {
  if (typeof callback !== 'function') return () => {};

  subscribers.add(callback);

  if (pendingOtp) {
    const otp = pendingOtp;
    pendingOtp = '';

    setTimeout(() => callback(otp), 0);
  }

  return () => {
    subscribers.delete(callback);
  };
};
