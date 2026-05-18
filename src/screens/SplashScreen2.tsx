/**
 * SplashScreen2 — Location-finding animated splash
 *
 * Shows a pulsing map-pin animation while:
 *   1. Fetching all stores
 *   2. Getting GPS (or defaulting to Richmond)
 *   3. Selecting the nearest store
 *   4. Prefetching banners + categories + bestSellers + activeOrders (Promise.all)
 *
 * After data + a minimum 1.2 s animation → navigates to main app.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';


import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

import { storeService } from '../services/storeService';
import { bannerService } from '../services/bannerService';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import getCurrentLocation from '../services/getCurrentLocation';
import { requestLocationPermission } from '../utils/requestLocation';
import { calculateDistance } from '../utils/calculateDistance';
import { Store } from '../types';

const { width, height } = Dimensions.get('window');

// Minimum time to show this splash (so it doesn't flash instantly)
const MIN_SPLASH_MS = 1200;

// ─── Pulse Ring Component ─────────────────────────────────────────────────────

const PulseRing = ({ delay, size }: { delay: number; size: number }) => {
  const scale   = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 0.5, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.8, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(255, 190, 51, 0.25)',
        transform: [{ scale }],
        opacity,
      }}
    />
  );
};

// ─── Status messages cycling ──────────────────────────────────────────────────

const MESSAGES = [
  'Finding your nearest store…',
  'Loading the menu…',
  'Almost there…',
];

// ─── Main Screen ─────────────────────────────────────────────────────────────

const SplashScreen2 = () => {
  const navigation  = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { setSelectedStore } = useStore();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Animations
  const pinScale      = useRef(new Animated.Value(0)).current;
  const pinOpacity    = useRef(new Animated.Value(0)).current;
  const textOpacity   = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  const [statusMsg, setStatusMsg] = useState(MESSAGES[0]);
  const msgIndexRef = useRef(0);

  // Keep refs to latest auth state so the async prefetch closure
  // reads the live value at navigation time, not the stale mounted value
  const isAuthenticatedRef = useRef(isAuthenticated);
  const authLoadingRef     = useRef(authLoading);
  useEffect(() => { isAuthenticatedRef.current = isAuthenticated; }, [isAuthenticated]);
  useEffect(() => { authLoadingRef.current = authLoading; }, [authLoading]);

  // ── Cycle status messages ───────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      msgIndexRef.current = (msgIndexRef.current + 1) % MESSAGES.length;
      setStatusMsg(MESSAGES[msgIndexRef.current]);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  // ── Animations in ──────────────────────────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.spring(pinScale,   { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
      Animated.timing(pinOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(textOpacity,{ toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // Progress bar fills over MIN_SPLASH_MS
    Animated.timing(progressWidth, {
      toValue: width * 0.65,
      duration: MIN_SPLASH_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, []);

  // ── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    const startTime = Date.now();

    const prefetchAll = async () => {
      let resolvedStore: Store | null = null;

      try {
        // 1. Stores + location in parallel
        const [stores, hasPermission] = await Promise.all([
          storeService.getAllStores(),
          requestLocationPermission(),
        ]);

        const findRichmond = (list: Store[]) =>
          list.find(s =>
            (s.name  && s.name.toLowerCase().includes('richmond')) ||
            (s.city  && s.city.toLowerCase().includes('richmond')),
          ) || list[0] || null;

        if (hasPermission && stores.length > 0) {
          const location = await getCurrentLocation().catch(() => null);
          if (location) {
            let nearest: Store | null = null;
            let minDist = Infinity;
            for (const s of stores) {
              if (s.latitude && s.longitude) {
                const d = calculateDistance(location.latitude, location.longitude, s.latitude, s.longitude);
                if (d < minDist) { minDist = d; nearest = s; }
              }
            }
            resolvedStore = (nearest && minDist <= 500) ? nearest : findRichmond(stores);
          } else {
            resolvedStore = findRichmond(stores);
          }
        } else if (stores.length > 0) {
          resolvedStore = findRichmond(stores);
        }

        // Push resolved store into StoreContext so rest of app has it
        if (resolvedStore) {
          setSelectedStore(resolvedStore);
        }

        // 2. Prefetch all screen data in parallel
        const storeId = resolvedStore?.id;

        const [banners, categories, bestSellers] = await Promise.all([
          bannerService.getActiveBanners().catch(() => []),
          storeId ? categoryService.getCategories(storeId).catch(() => []) : Promise.resolve([]),
          storeId ? productService.getBestSellers(storeId).catch(() => []) : Promise.resolve([]),
        ]);

        // Fetch active order count only if user is logged in (ref = live value)
        let activeOrderCount = 0;
        if (isAuthenticatedRef.current) {
          try {
            const orders = await orderService.getMyOrders();
            const ACTIVE = ['placed', 'confirmed', 'preparing', 'outfordelivery', 'pending'];
            activeOrderCount = orders.filter(o =>
              ACTIVE.includes(o.orderStatus?.toLowerCase() ?? ''),
            ).length;
          } catch (_) {}
        }



      } catch (err) {
        console.error('[SplashScreen2] prefetch error:', err);
      }

      // 4. Respect minimum splash duration, then wait for auth to resolve
      const elapsed   = Date.now() - startTime;
      const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);

      setTimeout(() => {
        // Poll until AuthContext finishes loading (usually already done)
        const doNavigate = () => {
          if (authLoadingRef.current) {
            setTimeout(doNavigate, 50);
            return;
          }
          navigation.replace(isAuthenticatedRef.current ? 'MainTabs' : 'Login');
        };
        doNavigate();
      }, remaining);
    };

    prefetchAll();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

      {/* BG waves */}
      <View style={styles.bgWave1} />
      <View style={styles.bgWave2} />

      {/* Pulse rings */}
      <View style={styles.pulseContainer}>
        <PulseRing delay={0}    size={220} />
        <PulseRing delay={350}  size={160} />
        <PulseRing delay={700}  size={100} />

        {/* Center pin */}
        <Animated.View
          style={[
            styles.pinWrapper,
            { opacity: pinOpacity, transform: [{ scale: pinScale }] },
          ]}
        >
          <View style={styles.pinCircle}>
            <Text style={styles.pinEmoji}>📍</Text>
          </View>
        </Animated.View>
      </View>

      {/* Text block */}
      <Animated.View style={[styles.textBlock, { opacity: textOpacity }]}>
        <Text style={styles.heading}>One moment…</Text>
        <Text style={styles.subHeading}>{statusMsg}</Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </Animated.View>

      {/* Bottom branding */}
      <Text style={styles.bottomTag}>La Pino'z USA</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a4d24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgWave1: {
    position: 'absolute',
    bottom: -60,
    left: -80,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(255,190,51,0.06)',
  },
  bgWave2: {
    position: 'absolute',
    top: -40,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  watermark: {
    position: 'absolute',
    top: 52,
    left: 24,
    width: 44,
    height: 44,
    opacity: 0.6,
  },
  pulseContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  pinWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffbe33',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffbe33',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  pinEmoji: {
    fontSize: 32,
  },
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  progressTrack: {
    width: width * 0.65,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffbe33',
    borderRadius: 2,
  },
  bottomTag: {
    position: 'absolute',
    bottom: 44,
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default SplashScreen2;
