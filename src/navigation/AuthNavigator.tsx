import React from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import CartScreen from '../screens/CartScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';

import ProductDetailScreen from '../screens/ProductDetailScreen';
import ManageAddressScreen from '../screens/ManageAddressScreen';

import PracticeScreen from '../PracticeScreen';
import TrackOrderScreen from '../screens/TrackOrderScreen';

import AddNewAddressScreen from '../screens/AddNewAddressScreen';
import StoreLocationScreen from '../screens/StoreLocationScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import PaymentWebViewScreen from '../screens/PaymentWebViewScreen';
import { Product, ProductVariant } from '../services/categoryService';
import { PendingOrderData } from '../services/paymentService';
import { Category } from '../services/categoryService';
import { Address } from '../services/addressService';
import { useAuth } from '../context/AuthContext';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined; // Replaces 'Home'
  CategoryProducts: { category: Category };
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
  AddNewAddress: { editAddress?: Address } | undefined;
  StoreLocation: undefined;
  Checkout: undefined;
  PaymentWebView: { url: string; transactionId: string; orderData: PendingOrderData };
  Practice: undefined;
  EditProfile: undefined;
  TrackOrder: { orderId: number };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Splash screen shown while AsyncStorage session is being restored
const SplashScreen = () => (
  <View style={splashStyles.container}>
    <Image
      source={require('../assets/images/logo.png')}
      style={splashStyles.logo}
      resizeMode="contain"
    />
    <ActivityIndicator size="large" color="#3c7d48" style={splashStyles.spinner} />
  </View>
);

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  spinner: {
    marginTop: 8,
  },
});

const AuthNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  // While AsyncStorage session is being restored, show a splash screen.
  // This prevents the Login screen from flashing before the session is known.
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      // Dynamically choose initial route based on restored session
      initialRouteName={isAuthenticated ? 'MainTabs' : 'Login'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen 
        name="CategoryProducts" 
        component={require('../screens/CategoryProductsScreen').default} 
        options={{ animation: 'slide_from_right' }}
      />
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
        name="PaymentWebView" 
        component={PaymentWebViewScreen} 
        options={{ animation: 'slide_from_bottom' }} 
      />
      <Stack.Screen 
        name="Practice" 
        component={PracticeScreen} 
        options={{ animation: 'slide_from_bottom' }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={require('../screens/EditProfileScreen').default} 
        options={{ animation: 'slide_from_right' }} 
      />
      <Stack.Screen 
        name="TrackOrder" 
        component={TrackOrderScreen} 
        options={{ animation: 'slide_from_bottom' }} 
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
