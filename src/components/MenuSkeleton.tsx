import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../context/StoreContext';

const { width } = Dimensions.get('window');

const MenuSkeleton = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { selectedStore } = useStore();
  const [imageError, setImageError] = React.useState(false);

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
      {/* Cover Image & Header Info Skeleton */}
      <View style={styles.headerContainer}>
        {(!imageError && selectedStore?.image) ? (
           <View style={{ width: '100%', height: 200, backgroundColor: '#e5e7eb' }}>
              <Image source={{ uri: selectedStore.image }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setImageError(true)} />
              {/* Add a slight dark overlay to match MenuScreen's coverImageOverlay, instead of opaque grey */}
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
           </View>
        ) : (
           <Animated.View style={[styles.coverImage, { opacity }]} />
        )}
        
        {/* Top Icons Skeleton */}
        <View style={[styles.topAbsoluteBar, { top: insets.top + 10 }]}>
          <Animated.View style={[styles.roundIconButton, { opacity }]} />
          <Animated.View style={[styles.roundIconButton, { opacity }]} />
        </View>

        {/* Overlapping Info Card Skeleton */}
        <View style={styles.storeCardWrapper}>
          <View style={styles.storeCard}>
            <View style={styles.storeCardTitleRow}>
              <Animated.View style={[styles.skeletonItem, { width: 140, height: 20, opacity }]} />
              <Animated.View style={[styles.skeletonItem, { width: 24, height: 24, borderRadius: 12, opacity }]} />
            </View>
            <View style={styles.storeCardMetaRow}>
              <Animated.View style={[styles.skeletonItem, { width: 80, height: 14, opacity }]} />
              <Animated.View style={[styles.skeletonItem, { width: 120, height: 14, opacity }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Filter Pills Skeleton */}
      <View style={styles.filtersScroll}>
        <View style={styles.filtersContainer}>
          {[1, 2, 3, 4].map(key => (
            <Animated.View key={`pill-${key}`} style={[styles.filterPill, { opacity }]} />
          ))}
        </View>
      </View>

      {/* Menu List Skeleton */}
      <View style={styles.menuList}>
         {/* Section Header */}
         <View style={styles.sectionHeader}>
            <Animated.View style={[styles.sectionTitle, { opacity }]} />
            <Animated.View style={[styles.itemCount, { opacity }]} />
         </View>

        {[1, 2, 3, 4].map((key) => (
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
    backgroundColor: '#f3f4f6', // Match MenuScreen background
  },
  headerContainer: {
    position: 'relative',
    height: 250,
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  topAbsoluteBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  roundIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  storeCardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
  },
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  storeCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonItem: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  filtersScroll: {
    marginTop: 12,
    marginBottom: 4,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 10,
  },
  filterPill: {
    width: 100,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
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
      marginBottom: 16,
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
