import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const AddressSkeleton = () => {
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
    <View style={styles.card}>
      <View style={styles.header}>
        <Animated.View style={[styles.icon, { opacity }]} />
        <View style={styles.content}>
          <Animated.View style={[styles.typeLine, { opacity }]} />
          <Animated.View style={[styles.detailLine, { opacity }]} />
          <Animated.View style={[styles.detailLineShort, { opacity }]} />
        </View>
        <Animated.View style={[styles.deleteBtn, { opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
    gap: 8,
  },
  typeLine: {
    width: 80,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginBottom: 4,
  },
  detailLine: {
    width: '90%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  detailLineShort: {
    width: '60%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  deleteBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
});

export default AddressSkeleton;
