/* global __dirname */
const { withAndroidManifest, withMainApplication, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withNativeUpdates(config) {
  config = withAndroidManifest(config, (result) => {
    const manifest = result.modResults.manifest;
    manifest['uses-permission'] ||= [];
    if (!manifest['uses-permission'].some((item) => item.$['android:name'] === 'android.permission.REQUEST_INSTALL_PACKAGES')) {
      manifest['uses-permission'].push({ $: { 'android:name': 'android.permission.REQUEST_INSTALL_PACKAGES' } });
    }
    const application = manifest.application[0];
    application.provider ||= [];
    if (!application.provider.some((item) => item.$['android:authorities'] === '${applicationId}.loopupdates')) {
      application.provider.push({
        $: { 'android:name': 'androidx.core.content.FileProvider', 'android:authorities': '${applicationId}.loopupdates', 'android:exported': 'false', 'android:grantUriPermissions': 'true' },
        'meta-data': [{ $: { 'android:name': 'android.support.FILE_PROVIDER_PATHS', 'android:resource': '@xml/loop_update_paths' } }],
      });
    }
    return result;
  });
  config = withMainApplication(config, (result) => {
    if (!result.modResults.contents.includes('add(LoopUpdatesPackage())')) {
      const marker = 'PackageList(this).packages.apply {';
      if (!result.modResults.contents.includes(marker)) throw new Error('Unsupported MainApplication template for LoopUpdates');
      result.modResults.contents = result.modResults.contents.replace(marker, marker + '\n              add(LoopUpdatesPackage())');
    }
    return result;
  });
  return withDangerousMod(config, ['android', (result) => {
    const name = result.android.package;
    const source = fs.readFileSync(path.join(__dirname, 'native-updates/LoopUpdates.kt'), 'utf8').replaceAll('__PACKAGE__', name);
    const javaDir = path.join(result.modRequest.platformProjectRoot, 'app/src/main/java', ...name.split('.'));
    const xmlDir = path.join(result.modRequest.platformProjectRoot, 'app/src/main/res/xml');
    fs.mkdirSync(javaDir, { recursive: true }); fs.mkdirSync(xmlDir, { recursive: true });
    fs.writeFileSync(path.join(javaDir, 'LoopUpdates.kt'), source);
    fs.writeFileSync(path.join(xmlDir, 'loop_update_paths.xml'), '<?xml version="1.0" encoding="utf-8"?><paths xmlns:android="http://schemas.android.com/apk/res/android"><cache-path name="loop-updates" path="loop-updates/" /></paths>');
    return result;
  }]);
};
