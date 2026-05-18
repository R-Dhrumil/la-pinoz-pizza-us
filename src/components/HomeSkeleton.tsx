import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, ScrollView, Image, Text } from 'react-native';
import { MapPin, ChevronDown } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 240;

// Banner dimensions copied from PizzaSnapCarousel to match layout perfectly
const BANNER_WIDTH = width * 0.8;
const BANNER_SPACING = 7;

const HomeSkeleton = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimation();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.75],
  });

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent} 
      showsVerticalScrollIndicator={false}
    >
      {/* ── GREEN TOP BAR SKELETON ── */}
      {/* Renders the actual static logo and title to eliminate flicker; shimmers only the address field */}
      <View style={styles.topBar}>
        <Image source={require('../assets/images/logo.png')} style={styles.topBarLogo} />

        <View style={styles.topBarRight}>
          <Text style={styles.topBarBrand}>La Pino'z Pizza</Text>
          <View style={styles.topBarAddressRow}>
            <MapPin size={13} color="rgba(255,255,255,0.85)" />
            <Animated.View style={[styles.topBarAddressPlaceholder, { opacity }]} />
            <ChevronDown size={13} color="rgba(255,255,255,0.85)" />
          </View>
        </View>
      </View>

      {/* ── GREEN WELCOME + TOGGLE SECTION SKELETON ── */}
      <View style={styles.greenSection}>
        <Animated.View style={[styles.greenWelcomePlaceholder, { opacity }]} />
        
        {/* Exact match of delivery/pickup toggle layout */}
        <View style={styles.greenToggleWrapper}>
          <View style={[styles.greenToggleBtn, styles.greenToggleActive]}>
            <Animated.View style={[styles.toggleTextPlaceholder, { opacity }]} />
          </View>
          <View style={styles.greenToggleBtn}>
            <Animated.View style={[styles.toggleTextPlaceholder, { opacity }]} />
          </View>
        </View>
      </View>

      {/* ── SNAP CAROUSEL BANNER SKELETON ── */}
      {/* Occupies the exact size of PizzaSnapCarousel to prevent sudden visual jumping */}
      <View style={styles.carouselSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselScrollContent}
          decelerationRate="fast"
          snapToInterval={BANNER_WIDTH + BANNER_SPACING * 2}
        >
          {[1, 2].map((key) => (
            <Animated.View key={key} style={[styles.carouselCard, { opacity }]} />
          ))}
        </ScrollView>
      </View>

      {/* ── BEST SELLERS SKELETON ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Animated.View style={[styles.sectionTitlePlaceholder, { opacity }]} />
          <Animated.View style={[styles.viewAllPlaceholder, { opacity }]} />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bestSellerScrollContent}
        >
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
        </ScrollView>
      </View>

      {/* ── EXPLORE MENU GRID SKELETON ── */}
      {/* 3-column category grid placeholders matching the loaded layout exactly */}
      <View style={styles.section}>
        <Animated.View style={[styles.gridTitlePlaceholder, { opacity }]} />
        
        <View style={styles.exploreGrid}>
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <View key={key} style={styles.exploreGridCard}>
              <View style={styles.exploreGridImageContainer}>
                <Animated.View style={[styles.exploreGridImage, { opacity }]} />
              </View>
              <View style={styles.exploreGridFooter}>
                <Animated.View style={[styles.exploreGridTitlePlaceholder, { opacity }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // ── GREEN TOP BAR ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#3c7d48',
    gap: 12,
    paddingVertical: 12,
  },
  topBarLogo: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
    flexShrink: 0,
  },
  topBarRight: {
    flex: 1,
    gap: 2,
  },
  topBarBrand: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.2,
  },
  topBarAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  topBarAddressPlaceholder: {
    width: 130,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 4,
  },

  // ── GREEN SECTION ──
  greenSection: {
    backgroundColor: '#3c7d48',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 14,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greenWelcomePlaceholder: {
    width: 160,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 6,
  },
  greenToggleWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 50,
    padding: 5,
  },
  greenToggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 45,
  },
  greenToggleActive: {
    backgroundColor: '#285c34',
  },
  toggleTextPlaceholder: {
    width: 55,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },

  // ── SNAP CAROUSEL BANNER SKELETON ──
  carouselSection: {
    paddingVertical: 10,
    backgroundColor: '#fbfbfb',
  },
  carouselScrollContent: {
    paddingHorizontal: (width - BANNER_WIDTH) / 2 - BANNER_SPACING,
    gap: BANNER_SPACING * 2,
    paddingVertical: 10,
  },
  carouselCard: {
    width: BANNER_WIDTH,
    height: 220,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
  },

  // ── GENERAL SECTIONS ──
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitlePlaceholder: {
    width: 140,
    height: 18,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  viewAllPlaceholder: {
    width: 50,
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },

  // ── BEST SELLERS ──
  bestSellerScrollContent: {
    gap: 16,
    paddingBottom: 16,
  },
  bestSellerCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    width: '60%',
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
    marginTop: 12,
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

  // ── EXPLORE MENU GRID ──
  gridTitlePlaceholder: {
    width: 160,
    height: 18,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    alignSelf: 'center',
    marginVertical: 8,
  },
  exploreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  exploreGridCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    minHeight: 140,
  },
  exploreGridImageContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 4,
  },
  exploreGridImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  exploreGridFooter: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  exploreGridTitlePlaceholder: {
    width: '70%',
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
});

export default HomeSkeleton;
