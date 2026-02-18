import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import CartScreen from '../screens/CartScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';

import ProductDetailScreen from '../screens/ProductDetailScreen';
import ManageAddressScreen from '../screens/ManageAddressScreen';

import PracticeScreen from '../PracticeScreen';

import AddNewAddressScreen from '../screens/AddNewAddressScreen';
import StoreLocationScreen from '../screens/StoreLocationScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import { Product, ProductVariant } from '../services/categoryService';


export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined; // Replaces 'Home'
  ProductDetail: { 
    item: Product;
    editMode?: boolean;
    existingCartId?: string;
    prefill?: {
      variant?: ProductVariant;
      toppings?: { modifierGroupId: number; modifierOptionId: number }[];
      quantity: number;
    };
  };
  Cart: undefined;
  MyOrders: undefined;
  ManageAddress: undefined;
  AddNewAddress: undefined;
  StoreLocation: undefined;
  Checkout: undefined;
  Practice: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
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
        name="StoreLocation" 
        component={StoreLocationScreen} 
        options={{ animation: 'slide_from_bottom' }} 
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ animation: 'slide_from_bottom' }} 
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen} 
        options={{ animation: 'slide_from_right' }} 
      />
      <Stack.Screen 
        name="MyOrders" 
        component={MyOrdersScreen} 
        options={{ animation: 'slide_from_right' }} 
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
