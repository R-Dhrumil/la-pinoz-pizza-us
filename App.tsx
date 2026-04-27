import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './src/context/AuthContext';
import { StoreProvider } from './src/context/StoreContext';
import { AddressProvider } from './src/context/AddressContext';
import { CartProvider } from './src/context/CartContext';
import AuthNavigator from './src/navigation/AuthNavigator';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/ErrorBoundary';

const App = () => {
  return (
    <>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AuthProvider>
            <StoreProvider>
            <AddressProvider>
              <CartProvider>
                <NavigationContainer>
                  <AuthNavigator />
                </NavigationContainer>
              </CartProvider>
            </AddressProvider>
            </StoreProvider>
          </AuthProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
      <Toast />
    </>
  );
};

export default App;
