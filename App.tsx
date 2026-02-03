import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigation/AuthNavigator';
import { CartProvider } from './src/context/CartContext';

const App = () => {
  return (
    <CartProvider>
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    </CartProvider>
  );
};

export default App;
