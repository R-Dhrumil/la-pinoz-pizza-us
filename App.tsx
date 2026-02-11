import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigation/AuthNavigator';
import { CartProvider } from './src/context/CartContext';
import { AddressProvider } from './src/context/AddressContext';

const App = () => {
  return (
    <AddressProvider>
      <CartProvider>
        <NavigationContainer>
          <AuthNavigator />
        </NavigationContainer>
      </CartProvider>
    </AddressProvider>
  );
};

export default App;
