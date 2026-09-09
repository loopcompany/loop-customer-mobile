/**
 * Metro configuration.
 *
 * The only deviation from the Expo default is `inlineRequires`. Expo ships it
 * disabled (`@expo/metro-config` -> `inlineRequires: false`), which means every
 * one of the ~85 screens registered on the root navigator is imported and
 * evaluated during startup even though the user only ever sees one of them.
 * Turning it on defers each module's evaluation to first use, which is the
 * single largest time-to-interactive win available in this app.
 *
 * Trade-off: modules that rely on import *order* for their side effects can
 * behave differently under inline requires. Everything in this repo initialises
 * explicitly (i18n in `navigation/i18n.js`, the store in `store.js`), so there
 * is nothing depending on evaluation order today — but keep that in mind before
 * adding a module whose top level does real work.
 */
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
