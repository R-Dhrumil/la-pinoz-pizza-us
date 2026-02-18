import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './src/context/AuthContext';
import { StoreProvider } from './src/context/StoreContext';
import { AddressProvider } from './src/context/AddressContext';
import { CartProvider } from './src/context/CartContext';
import AuthNavigator from './src/navigation/AuthNavigator';

const App = () => {
  return (
    <>
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
      <Toast />
    </>
  );
};

export default App;
