import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import CartScreen from '../screens/CartScreen';

import ProductDetailScreen from '../screens/ProductDetailScreen';
import ManageAddressScreen from '../screens/ManageAddressScreen';

import PracticeScreen from '../PracticeScreen';

import AddNewAddressScreen from '../screens/AddNewAddressScreen';


export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined; // Replaces 'Home'
  ProductDetail: { item: any };
  Cart: undefined;
  ManageAddress: undefined;
  AddNewAddress: undefined;
  Practice: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={{ animation: 'slide_from_bottom' }} 
      />
      <Stack.Screen
      name='AddNewAddress'
      component={AddNewAddressScreen}
      options={{ animation: 'slide_from_bottom' }} 
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ animation: 'slide_from_bottom' }} 
      />
      <Stack.Screen 
        name="ManageAddress" 
        component={ManageAddressScreen} 
        options={{ animation: 'slide_from_right' }} 
      />
      <Stack.Screen 
        name="Practice" 
        component={PracticeScreen} 
        options={{ animation: 'slide_from_bottom' }} 
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
