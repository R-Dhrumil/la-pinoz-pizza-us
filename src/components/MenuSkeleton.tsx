import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const MenuSkeleton = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimation();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      {/* Menu List Skeleton */}
      <View style={styles.menuList}>
         {/* Section Header */}
         <View style={styles.sectionHeader}>
            <Animated.View style={[styles.sectionTitle, { opacity }]} />
            <Animated.View style={[styles.itemCount, { opacity }]} />
         </View>

        {[1, 2, 3, 4, 5].map((key) => (
            <View key={key} style={styles.menuItem}>
                <View style={styles.itemContent}>
                    <Animated.View style={[styles.vegIcon, { opacity }]} />
                    <Animated.View style={[styles.itemTitle, { opacity }]} />
                    <Animated.View style={[styles.itemPrice, { opacity }]} />
                    <Animated.View style={[styles.itemDesc, { opacity }]} />
                    <Animated.View style={[styles.itemDescShort, { opacity }]} />
                </View>

                <View style={styles.imageContainer}>
                    <Animated.View style={[styles.itemImage, { opacity }]} />
                    <View style={styles.addButtonContainer}>
                        <Animated.View style={[styles.addButton, { opacity }]} />
                    </View>
                </View>
            </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Match MenuScreen background
  },
  menuList: {
    padding: 16,
    flex: 1,
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
  },
  sectionTitle: {
      width: 120,
      height: 20,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
  },
  itemCount: {
      width: 50,
      height: 12,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
  },
  menuItem: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 10,
      paddingBottom: 15,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#f3f4f6',
      justifyContent: 'space-between',
  },
  itemContent: {
      flex: 1,
      marginRight: 12,
      justifyContent: 'flex-start',
  },
  vegIcon: {
      width: 14,
      height: 14,
      borderRadius: 2,
      backgroundColor: '#e5e7eb',
      marginBottom: 8,
  },
  itemTitle: {
    width: '80%',
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  itemPrice: {
      width: 40,
      height: 14,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
      marginBottom: 8,
  },
  itemDesc: {
    width: '100%',
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  itemDescShort: {
    width: '70%',
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  imageContainer: {
      width: 110,
      alignItems: 'center',
      justifyContent: 'flex-start',
      position: 'relative',
  },
  itemImage: {
    width: 110,
    height: 105,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  addButtonContainer: {
      position: 'absolute',
      bottom: -15,
      alignSelf: 'center',
      zIndex: 10,
  },
  addButton: {
      width: 80,
      height: 32,
      backgroundColor: '#fff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e5e7eb',
  }
});

export default MenuSkeleton;
