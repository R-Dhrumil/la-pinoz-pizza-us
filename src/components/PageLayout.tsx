import React, { ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ViewStyle } from 'react-native';
import FloatingCart from './FloatingCart';
import { useCart } from '../context/CartContext';

interface PageLayoutProps {
  children: ReactNode;
  style?: ViewStyle;
  showCart?: boolean;
}

const PageLayout = ({ children, style, showCart = true }: PageLayoutProps) => {
  const { totalItems } = useCart();
  
  // Adjusted padding bottom if cart is visible to prevent overlap
  const paddingBottom = (showCart && totalItems > 0) ? 90 : 0;

  return (
    <View style={[styles.container, style]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={[styles.content, { paddingBottom }]}>
            {children}
        </View>
        
        {showCart && <FloatingCart />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
      flex: 1,
  }
});

export default PageLayout;
