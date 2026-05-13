import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import CartScreen from '../screens/CartScreen';
import SplashScreen1 from '../screens/SplashScreen1';
import SplashScreen2 from '../screens/SplashScreen2';
import MyOrdersScreen from '../screens/MyOrdersScreen';

import ProductDetailScreen from '../screens/ProductDetailScreen';
import ManageAddressScreen from '../screens/ManageAddressScreen';

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
  Splash1: undefined;
  Splash2: undefined;
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined; // Replaces 'Home'
  CategoryProducts: { category: Category };
  ProductDetail: { 
    item: Product;
    categoryId?: number;
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

const AuthNavigator = () => {
  // Auth loading is handled inside Splash2 which reads isAuthenticated after
  // the splash animation completes — no flash of wrong screen.

  return (

    <Stack.Navigator
      // Always start at Splash1; the splash sequence decides where to go next
      initialRouteName="Splash1"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash1" component={SplashScreen1} options={{ animation: 'none' }} />
      <Stack.Screen name="Splash2" component={SplashScreen2} options={{ animation: 'fade' }} />
      <Stack.Screen name="Login"   component={LoginScreen}  options={{ animation: 'fade' }} />
      <Stack.Screen name="Signup"  component={SignupScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ animation: 'fade' }} />
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
