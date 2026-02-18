import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 240;

const HomeSkeleton = () => {
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
      {/* Header Skeleton */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
           <Animated.View style={[styles.logo, { opacity }]} />
           <View>
             <Animated.View style={[styles.storeName, { opacity }]} />
             <Animated.View style={[styles.storeCity, { opacity }]} />
           </View>
        </View>
        <View style={styles.headerRight}>
             <Animated.View style={[styles.iconButton, { opacity }]} />
             <Animated.View style={[styles.iconButton, { opacity }]} />
        </View>
      </View>

      {/* Hero Skeleton */}
      <Animated.View style={[styles.hero, { opacity }]} />

      {/* Search/Toggle Skeleton */}
      <View style={styles.searchSectionWrapper}>
          <Animated.View style={[styles.searchContainer, { opacity }]} />
      </View>

      {/* Categories Skeleton */}
      <View style={styles.section}>
          <Animated.View style={[styles.sectionTitle, { opacity }]} />
          <View style={styles.categoryScroll}>
            {[1, 2, 3, 4, 5].map((key) => (
                <View key={key} style={styles.categoryItem}>
                    <Animated.View style={[styles.categoryCircle, { opacity }]} />
                    <Animated.View style={[styles.categoryText, { opacity }]} />
                </View>
            ))}
          </View>
      </View>

      {/* Best Sellers Skeleton */}
      <View style={styles.section}>
           <View style={styles.sectionHeader}>
               <Animated.View style={[styles.sectionTitle, { opacity }]} />
               <Animated.View style={[styles.viewAll, { opacity }]} />
           </View>
           <View style={styles.bestSellerScroll}>
                {[1, 2].map((key) => (
                    <View key={key} style={styles.bestSellerCard}>
                         <Animated.View style={[styles.bsImage, { opacity }]} />
                         <View style={styles.bsContent}>
                             <Animated.View style={[styles.bsName, { opacity }]} />
                             <Animated.View style={[styles.bsDesc, { opacity }]} />
                             <View style={styles.bsFooter}>
                                 <Animated.View style={[styles.bsPrice, { opacity }]} />
                                 <Animated.View style={[styles.addButton, { opacity }]} />
                             </View>
                         </View>
                    </View>
                ))}
           </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  logo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#e5e7eb',
  },
  storeName: {
      width: 100,
      height: 14,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
      marginBottom: 4,
  },
  storeCity: {
      width: 80,
      height: 12,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
  },
  headerRight: {
      flexDirection: 'row',
      gap: 16,
  },
  iconButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#e5e7eb',
  },
  hero: {
      width: '100%',
      height: 320,
      backgroundColor: '#e5e7eb',
  },
  searchSectionWrapper: {
      marginTop: -32,
      paddingHorizontal: 16,
      marginBottom: 32,
  },
  searchContainer: {
    height: 100,
    backgroundColor: '#fff', // Or slightly darker since it's skeleton
    borderRadius: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
      width: 150,
      height: 20,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
      marginBottom: 16,
  },
  categoryScroll: {
      flexDirection: 'row',
      gap: 24,
  },
  categoryItem: {
      alignItems: 'center',
      gap: 8,
  },
  categoryCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#e5e7eb',
  },
  categoryText: {
      width: 50,
      height: 10,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAll: {
      width: 60,
      height: 12,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
  },
  bestSellerScroll: {
      flexDirection: 'row',
      gap: 16,
  },
  bestSellerCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden',
  },
  bsImage: {
      width: '100%',
      height: 128,
      backgroundColor: '#e5e7eb',
  },
  bsContent: {
      padding: 12,
  },
  bsName: {
      width: '80%',
      height: 14,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
      marginBottom: 8,
  },
  bsDesc: {
      width: '90%',
      height: 10,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
      marginBottom: 16,
  },
  bsFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  bsPrice: {
      width: 50,
      height: 14,
      backgroundColor: '#e5e7eb',
      borderRadius: 4,
  },
  addButton: {
      width: 60,
      height: 24,
      backgroundColor: '#e5e7eb',
      borderRadius: 8,
  },
});

export default HomeSkeleton;
