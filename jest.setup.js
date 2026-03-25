jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 390, height: 844 };
  return {
    SafeAreaProvider: jest.fn(({ children }) => React.createElement(React.Fragment, null, children)),
    SafeAreaConsumer: jest.fn(({ children }) => children(inset)),
    useSafeAreaInsets: jest.fn(() => inset),
    useSafeAreaFrame: jest.fn(() => frame),
    SafeAreaContext: React.createContext(inset),
    SafeAreaInsetsContext: React.createContext(inset),
    SafeAreaFrameContext: React.createContext(frame),
    initialWindowMetrics: {
      frame,
      insets: inset,
    },
  };
});

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  ScreenContainer: jest.fn(({ children }) => children),
  Screen: jest.fn(({ children }) => children),
  NativeScreen: jest.fn(({ children }) => children),
  NativeScreenContainer: jest.fn(({ children }) => children),
  ScreenStack: jest.fn(({ children }) => children),
  ScreenStackItem: jest.fn(({ children }) => children),
  ScreenStackHeaderConfig: jest.fn(({ children }) => children),
  ScreenStackHeaderSubview: jest.fn(({ children }) => children),
  SearchBar: jest.fn(({ children }) => children),
  compatibilityFlags: {
    usesNewAndroidHeaderHeightImplementation: false,
  },
}));
jest.mock('react-native-toast-message', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockToast = (props) => React.createElement(View, props);
  MockToast.show = jest.fn();
  MockToast.hide = jest.fn();
  return MockToast;
});

jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
  requestAuthorization: jest.fn(),
  setConfiguration: jest.fn(),
}));

jest.mock('react-native-permissions', () => require('react-native-permissions/mock'));

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    WebView: (props) => React.createElement(View, props),
    default: (props) => React.createElement(View, props),
  };
});

jest.mock('./src/services/storeService', () => ({
  storeService: {
    getAllStores: jest.fn(() => Promise.resolve([])),
    getStoreById: jest.fn(() => Promise.resolve(null)),
  },
}));

jest.mock('./src/services/getCurrentLocation', () => jest.fn(() => Promise.resolve({ latitude: 0, longitude: 0 })));

jest.mock('./src/utils/requestLocation', () => ({
  requestLocationPermission: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));
