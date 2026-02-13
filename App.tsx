import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigation/AuthNavigator';
import { CartProvider } from './src/context/CartContext';
import { AddressProvider } from './src/context/AddressContext';
import { AuthProvider } from './src/context/AuthContext';
import { StoreProvider } from './src/context/StoreContext';

const App = () => {
  return (
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
  );
};

export default App;
