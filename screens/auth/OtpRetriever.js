import { NativeModules, Platform } from 'react-native';

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

/**
 * `react-native-otp-verify` is a native module with no Expo Go support: when it
 * isn't linked, its entry point builds a `NativeEventEmitter` over a Proxy that
 * throws on *any* property access ("The package 'react-native-otp-verify'
 * doesn't seem to be linked"). So probe `NativeModules.OtpVerify` first and
 * never require the package unless the native side is actually there — merely
 * importing it is what blew up on startup in Expo Go.
 *
 * SMS auto-fill therefore silently does nothing in Expo Go; the user types the
 * code by hand. It works in a dev-client / release build.
 */
const getOtpVerifyModule = () => {
  if (Platform.OS !== 'android') return null;
  if (!NativeModules.OtpVerify) return null;

  return require('react-native-otp-verify');
};

/** True when SMS auto-fill can actually run on this build. */
export const isOtpRetrieverAvailable = () => getOtpVerifyModule() !== null;

/**
 * The app's SMS Retriever hashes — the backend embeds one in the OTP text so
 * Android hands the message to us. Resolves to `[]` where unavailable rather
 * than throwing, since a missing hash only costs auto-fill.
 */
export const getSmsHash = async () => {
  const otpVerify = getOtpVerifyModule();

  if (!otpVerify?.getHash) return [];

  try {
    return (await otpVerify.getHash()) ?? [];
  } catch (error) {
    console.warn('[otp] could not read the SMS retriever hash', error?.message ?? error);
    return [];
  }
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

  // Not linked (Expo Go): auto-fill is simply off, not an error worth throwing.
  if (!otpVerify?.startOtpListener) return false;

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
