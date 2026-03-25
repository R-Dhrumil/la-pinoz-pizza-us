module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-community|react-native-toast-message|react-native-safe-area-context|react-native-screens|react-native-vector-icons|react-native-svg|lucide-react-native|react-native-geolocation-service|react-native-permissions|react-native-keyboard-aware-scroll-view|react-native-webview|react-native-iphone-x-helper)/)',
  ],
};
