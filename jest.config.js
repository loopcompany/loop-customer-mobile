/**
 * Jest config for unit tests of non-UI logic (notification routing, device-token
 * API, push orchestration) plus a few render tests that pin down layout rules
 * which are easy to regress (see `components/__tests__/counterBoxDirection`).
 * Uses the `jest-expo` preset so Expo/RN modules resolve, with the `@alias`
 * table mirrored from `babel.config.js`.
 */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/**/__tests__/**/*.test.js'],
  moduleNameMapper: {
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@contexts/(.*)$': '<rootDir>/contexts/$1',
    '^@helpers/(.*)$': '<rootDir>/helpers/$1',
    '^@i18n$': '<rootDir>/i18n/index.js',
    '^@hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@navigation/(.*)$': '<rootDir>/navigation/$1',
    '^@org/(.*)$': '<rootDir>/org/$1',
    '^@screens/(.*)$': '<rootDir>/screens/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@slices/(.*)$': '<rootDir>/slices/$1',
    '^@store$': '<rootDir>/store.js',
    '^@styles/(.*)$': '<rootDir>/styles/$1',
    '^@theme/(.*)$': '<rootDir>/theme/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
  },
  // `immer` (وابسته‌ی Redux Toolkit) فقط ESM می‌فرستد، پس بدون transform هر تستی
  // که یک slice را ایمپورت کند با «Unexpected token 'export'» از کار می‌افتد —
  // و چون سوئیت اصلاً بالا نمی‌آید، در شمارش تست‌ها هم دیده نمی‌شود.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|@react-native-firebase/.*|firebase|@firebase/.*|immer|react-redux))',
  ],
};
