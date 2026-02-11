import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigation/AuthNavigator';
import { CartProvider } from './src/context/CartContext';
import { AddressProvider } from './src/context/AddressContext';
import { AuthProvider } from './src/context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <AddressProvider>
        <CartProvider>
          <NavigationContainer>
            <AuthNavigator />
          </NavigationContainer>
        </CartProvider>
      </AddressProvider>
    </AuthProvider>
  );
};

export default App;
