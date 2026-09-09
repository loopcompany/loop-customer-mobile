/**
 * Babel configuration.
 *
 * `babel-preset-expo` already supplies the React Native / Reanimated plugins,
 * so the only thing added here is `module-resolver`, which powers the `@alias`
 * import paths. Keep the alias table in sync with `jsconfig.json` (editor
 * intellisense) and `eslint.config.js` (import resolution) — all three read the
 * same set of names and they must not drift.
 */
module.exports = function (api) {
  // 185 `console.*` calls currently ship in the bundle. Rather than deleting
  // them (they are genuinely useful in development), strip them at build time
  // for production only. `warn` and `error` are kept so real problems still
  // surface in crash reporting.
  //
  // `api.env()` also configures Babel's cache key, so there is deliberately no
  // `api.cache(true)` here — that would pin the first-seen env's config.
  const isProduction = api.env('production');

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          // Platform variants (`.web.js`, `.native.js`) are resolved by Metro
          // after this plugin rewrites the specifier, so they keep working.
          extensions: ['.js', '.jsx', '.json', '.web.js', '.native.js'],
          alias: {
            '@assets': './assets',
            '@components': './components',
            '@contexts': './contexts',
            '@helpers': './helpers',
            '@i18n': './i18n',
            '@hooks': './hooks',
            '@navigation': './navigation',
            '@org': './org',
            '@screens': './screens',
            '@services': './services',
            '@slices': './slices',
            '@store': './store',
            '@styles': './styles',
            '@theme': './theme',
            '@utils': './utils',
          },
        },
      ],
      isProduction && ['transform-remove-console', { exclude: ['error', 'warn'] }],
    ].filter(Boolean),
  };
};
