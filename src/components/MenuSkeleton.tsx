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
      {/* Categories Skeleton */}
      <View style={styles.categoriesContainer}>
        {[1, 2, 3, 4, 5].map((key) => (
            <View key={key} style={styles.categoryWrap}>
                 <Animated.View style={[styles.categoryCircle, { opacity }]} />
                 <Animated.View style={[styles.categoryText, { opacity }]} />
            </View>
        ))}
      </View>

      {/* Menu List Skeleton */}
      <View style={styles.menuList}>
         {/* Section Header */}
        <Animated.View style={[styles.sectionTitle, { opacity }]} />
        <Animated.View style={[styles.itemCount, { opacity }]} />

        {[1, 2, 3].map((key) => (
            <View key={key} style={styles.menuItem}>
                <Animated.View style={[styles.itemImage, { opacity }]} />
                <View style={styles.itemContent}>
                    <View style={styles.textLineWait}>
                        <Animated.View style={[styles.vegIcon, { opacity }]} />
                        <Animated.View style={[styles.itemTitle, { opacity }]} />
                    </View>
                    <Animated.View style={[styles.itemDesc, { opacity }]} />
                    <Animated.View style={[styles.itemDescShort, { opacity }]} />
                    
                    <View style={styles.itemFooter}>
                        <Animated.View style={[styles.itemPrice, { opacity }]} />
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
    backgroundColor: '#f9f9f9',
  },
  categoriesContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  categoryWrap: {
      alignItems: 'center',
      gap: 8,
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e5e7eb',
  },
  categoryText: {
    width: 40,
    height: 10,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  menuList: {
    padding: 16,
    flex: 1,
  },
  sectionTitle: {
      width: 100,
      height: 20,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
      marginBottom: 8,
  },
  itemCount: {
      width: 50,
      height: 10,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
      marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  textLineWait: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
  },
  vegIcon: {
      width: 12,
      height: 12,
      borderRadius: 2,
      backgroundColor: '#e5e7eb',
  },
  itemTitle: {
    width: '60%',
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  itemDesc: {
    width: '90%',
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  itemDescShort: {
    width: '50%',
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 12,
  },
  itemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
  },
  itemPrice: {
      width: 40,
      height: 14,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
  },
  addButton: {
      width: 60,
      height: 24,
      backgroundColor: '#e5e7eb',
      borderRadius: 8,
  }
});

export default MenuSkeleton;
