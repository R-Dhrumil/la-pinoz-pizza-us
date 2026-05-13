/**
 * SplashScreen1 — Branded logo splash
 *
 * Shows the LaPino'z logo with a smooth fade + scale animation.
 * Duration: ~1 second visible, then navigates to SplashScreen2.
 *
 * Behind the scenes: kicks off storeService.getAllStores() immediately so
 * SplashScreen2 doesn't have to wait for it.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { storeService } from '../services/storeService';

const { width, height } = Dimensions.get('window');

const SplashScreen1 = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.75)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ── Pre-fetch stores in background immediately ──────────────────────────
    // Result is discarded here; SplashScreen2 will fetch again (fast, may be
    // served from OS-level HTTP cache). The real benefit is warming the connection.
    storeService.getAllStores().catch(() => {});

    // ── Animation sequence ──────────────────────────────────────────────────
    Animated.sequence([
      // 1. Logo fades + scales in
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // 2. Tagline fades in
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // 3. Dots pulse in
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // 4. Hold for a moment
      Animated.delay(400),
    ]).start(() => {
      // Navigate to location-finding splash
      navigation.replace('Splash2' as any);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

      {/* Background gradient-like overlay */}
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <View style={styles.logoRing}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* Brand name */}
      <Animated.View style={{ opacity: tagOpacity, alignItems: 'center', marginTop: 24 }}>
        <Text style={styles.brandName}>La Pino'z</Text>
        <Text style={styles.brandSub}>PIZZA</Text>
      </Animated.View>

      {/* Tagline dots */}
      <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
        <View style={[styles.dot, { backgroundColor: '#ffbe33' }]} />
        <View style={[styles.dot, { backgroundColor: '#fff', marginHorizontal: 6 }]} />
        <View style={[styles.dot, { backgroundColor: '#ffbe33' }]} />
      </Animated.View>

      {/* Bottom tag */}
      <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
        Fresh. Fast. Delicious.
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a4d24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
    backgroundColor: '#2d7a3a',
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
    transform: [{ scaleX: 1.5 }],
  },
  bgBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.15,
    backgroundColor: '#1a4d24',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -60,
    right: -80,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 80,
    left: -60,
    borderColor: 'rgba(255,190,51,0.12)',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
  logo: {
    width: 110,
    height: 110,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  brandSub: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffbe33',
    letterSpacing: 8,
    marginTop: -4,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagline: {
    position: 'absolute',
    bottom: 52,
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1,
    fontWeight: '500',
  },
});

export default SplashScreen1;
