import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const MyOrdersSkeleton = () => {
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
      {[1, 2, 3, 4].map((key) => (
        <View key={key} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.orderIdRow}>
                    <Animated.View style={[styles.iconCircle, { opacity }]} />
                    <Animated.View style={[styles.orderNumber, { opacity }]} />
                </View>
                <Animated.View style={[styles.statusBadge, { opacity }]} />
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Animated.View style={[styles.iconSmall, { opacity }]} />
                    <Animated.View style={[styles.infoText, { opacity }]} />
                </View>
                
                <View style={styles.infoRow}>
                    <Animated.View style={[styles.iconSmall, { opacity }]} />
                    <Animated.View style={[styles.infoTextStore, { opacity }]} />
                </View>

                <Animated.View style={[styles.itemsPreview, { opacity }]} />
            </View>

            <View style={styles.optionRow}>
                <Animated.View style={[styles.itemCount, { opacity }]} />
                <Animated.View style={[styles.totalAmount, { opacity }]} />
            </View>
            
            <View style={styles.cardFooter}>
                 <Animated.View style={[styles.footerBtn, { opacity }]} />
                 <Animated.View style={[styles.footerBtn, { opacity }]} />
            </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
      backgroundColor: '#fff',
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#f3f4f6',
      overflow: 'hidden',
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
  },
  orderIdRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  iconCircle: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#e5e7eb',
  },
  orderNumber: {
      width: 80,
      height: 14,
      borderRadius: 4,
      backgroundColor: '#e5e7eb',
  },
  statusBadge: {
      width: 60,
      height: 20,
      borderRadius: 12,
      backgroundColor: '#e5e7eb',
  },
  divider: {
      height: 1,
      backgroundColor: '#f3f4f6',
  },
  cardBody: {
      padding: 16,
      gap: 12,
  },
  infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  iconSmall: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#e5e7eb',
  },
  infoText: {
      width: 120,
      height: 12,
      borderRadius: 4,
      backgroundColor: '#e5e7eb',
  },
  infoTextStore: {
      width: 180,
      height: 12,
      borderRadius: 4,
      backgroundColor: '#e5e7eb',
  },
  itemsPreview: {
      marginTop: 4,
      width: '100%',
      height: 36,
      backgroundColor: '#f9fafb',
      borderRadius: 8,
  },
  optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
  },
  itemCount: {
      width: 50,
      height: 12,
      borderRadius: 4,
      backgroundColor: '#e5e7eb',
  },
  totalAmount: {
      width: 70,
      height: 20,
      borderRadius: 4,
      backgroundColor: '#e5e7eb',
  },
  cardFooter: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: '#f3f4f6',
      height: 48,
  },
  footerBtn: {
      flex: 1,
      margin: 12,
      borderRadius: 8,
      backgroundColor: '#e5e7eb',
  }
});

export default MyOrdersSkeleton;
