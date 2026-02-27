import React, { ReactNode } from 'react';
import FocusAwareStatusBar from './FocusAwareStatusBar';
import { View, StyleSheet, SafeAreaView, StatusBar, ViewStyle } from 'react-native';
import FloatingCart from './FloatingCart';
import { useCart } from '../context/CartContext';

interface PageLayoutProps {
  children: ReactNode;
  style?: ViewStyle;
  showCart?: boolean;
}

const PageLayout = ({ children, style, showCart = true }: PageLayoutProps) => {
  return (
    <View style={[styles.container, style]}>
        <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.content}>
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
