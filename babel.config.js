/** @type {import('react-native-worklets/plugin').PluginOptions} */

module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    'nativewind/babel',
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['react-native-worklets-core/plugin'],
    '@babel/plugin-proposal-export-namespace-from',
    'react-native-reanimated/plugin',
  ],
};
