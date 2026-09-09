/**
 * Expo config wrapper around `app.json`.
 *
 * The Firebase config files (`GoogleService-Info.plist`, `google-services.json`)
 * are deliberately not committed — see `docs/FIREBASE_NOTIFICATIONS_APP.md`.
 * When one of them is missing, Expo refuses to parse the config and every
 * `expo start` / `expo run` prints:
 *
 *     Could not parse Expo config: ios.googleServicesFile: "./GoogleService-Info.plist"
 *
 * which is pure noise for anyone working on Android or in Expo Go. Drop the
 * reference when the file is not on disk; a real build for that platform still
 * needs the file and will warn loudly here that it is missing.
 */
const fs = require('fs');
const path = require('path');

module.exports = ({ config }) => {
  ['ios', 'android'].forEach(platform => {
    const relativePath = config[platform]?.googleServicesFile;
    if (!relativePath) return;

    if (!fs.existsSync(path.resolve(__dirname, relativePath))) {
      delete config[platform].googleServicesFile;
      console.warn(
        `[app.config] ${relativePath} not found — push notifications will not work in a ${platform} build. ` +
          'See docs/FIREBASE_NOTIFICATIONS_APP.md.'
      );
    }
  });

  return config;
};
