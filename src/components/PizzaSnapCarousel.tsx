import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { ShoppingCart, Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ─── Carousel Dimensions ───────────────────────────────────────────────────────
const CARD_WIDTH       = width * 0.8;
const SPACING          = 7;
const SIDE_CARD_VISIBLE = (width - CARD_WIDTH) / 2;
const SNAP_INTERVAL    = CARD_WIDTH + SPACING * 2;
const PADDING_H        = SIDE_CARD_VISIBLE - SPACING;

// ─── Infinite Loop Config ─────────────────────────────────────────────────────
// We repeat the real data this many times to create a "virtually infinite" list.
// 100 copies means 600 items total — the user will never scroll to either end.
const LOOP_COUNT = 100;

// ─────────────────────────────────────────────────────────────────────────────

interface PizzaDeal {
  id: number;
  imageUrl: string;
}

const PizzaSnapCarousel = () => {
  const [deals, setDeals]   = useState<PizzaDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef           = useRef<FlatList>(null);
  const scrollIndex           = useRef(0);   // tracks current position in infiniteData
  const intervalRef           = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Build infinite dataset ──────────────────────────────────────────────────
  // infiniteData is the real cards repeated LOOP_COUNT times.
  // We start the FlatList in the dead-centre of this array so there is
  // effectively unlimited runway in BOTH directions.
  const infiniteData = useMemo<PizzaDeal[]>(() => {
    if (deals.length === 0) return [];
    return Array.from({ length: LOOP_COUNT }, () => deals).flat();
  }, [deals]);

  // The index we mount the FlatList at (centre of infiniteData)
  const initialIndex = useMemo(
    () => (deals.length > 0 ? Math.floor(LOOP_COUNT / 2) * deals.length : 0),
    [deals.length],
  );

  // ── Fetch mock pizza data ───────────────────────────────────────────────────
  useEffect(() => { fetchPizzaDeals(); }, []);

  const fetchPizzaDeals = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://api.lapinozusa.com/api/Banners/active',
      );
      const data = await response.json();

      const formatted: PizzaDeal[] = data.map((item: any, i: number) => ({
        id:       item.id,
        imageUrl: item.imageUrl,
      }));

      setDeals(formatted);
    } catch (err) {
      console.error('Error fetching pizza deals:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Jump to initial centre position once data is ready ─────────────────────
  useEffect(() => {
    if (infiniteData.length === 0) return;

    // Set the ref so auto-scroll starts from the correct position
    scrollIndex.current = initialIndex;

    // scrollToIndex needs the list to be rendered first
    const t = setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
    }, 50);

    return () => clearTimeout(t);
  }, [infiniteData.length, initialIndex]);

  // ── Auto-scroll (true infinite — just keep incrementing forever) ────────────
  useEffect(() => {
    if (infiniteData.length === 0) return;

    intervalRef.current = setInterval(() => {
      if (!flatListRef.current) return;

      const nextIndex = scrollIndex.current + 1;
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
      scrollIndex.current = nextIndex;
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [infiniteData.length]);

  // ── Render each card ────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: PizzaDeal }) => (
    <View style={styles.cardContainer}>
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.card}
        imageStyle={styles.cardImage}
      >
       
      </ImageBackground>
    </View>
  );

  // ── getItemLayout — required for scrollToIndex to work on a large list ──────
  const getItemLayout = (_: any, index: number) => ({
    length: SNAP_INTERVAL,
    offset: SNAP_INTERVAL * index,
    index,
  });

  const onScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    // Retry after the list has rendered more items
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
    }, 500);
  };

  // ── Keep scrollIndex.current in sync when user swipes manually ──────────────
  const onMomentumScrollEnd = (event: any) => {
    const rawOffset = event.nativeEvent.contentOffset.x;
    const index     = Math.round(rawOffset / SNAP_INTERVAL);
    scrollIndex.current = index;
  };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3c7d48" />
        <Text style={styles.loaderText}>Baking deals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={infiniteData}
        renderItem={renderItem}
        // Each copy of the same card gets a unique key via its position
        keyExtractor={(item, index) => `${item.id}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="center"
        contentContainerStyle={{
          paddingHorizontal: PADDING_H,
          paddingVertical:   10,
        }}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
        onMomentumScrollEnd={onMomentumScrollEnd}
        // Prevent unnecessary re-renders on a 600-item list
        removeClippedSubviews
        windowSize={5}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    paddingVertical:   10,
    backgroundColor:  '#FBFBFB',
  },
  headerTitle: {
    fontSize:      22,
    fontWeight:    '900',
    color:         '#1A1A1A',
    marginLeft:    20,
    marginBottom:  16,
    letterSpacing: -0.5,
  },
  loaderContainer: {
    height:          250,
    justifyContent:  'center',
    alignItems:      'center',
  },
  loaderText: {
    marginTop:  12,
    fontSize:   14,
    color:      '#666',
    fontWeight: '500',
  },
  cardContainer: {
    width:          CARD_WIDTH,
    marginHorizontal: SPACING,
    height:         220,
    borderRadius:   24,
    backgroundColor: '#FFF',
  },
  card: {
    flex:     1,
    overflow: 'hidden',
    borderRadius: 24,

  },
  cardImage: {
    borderRadius: 24,
  },
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding:         20,
    justifyContent:  'space-between',
  },
  badge: {
    alignSelf:       'flex-start',
    backgroundColor: '#3c7d48',
    paddingHorizontal: 12,
    paddingVertical:   6,
    borderRadius:    12,
  },
  badgeText: {
    color:          '#FFF',
    fontSize:       10,
    fontWeight:     '800',
    textTransform:  'uppercase',
    letterSpacing:  0.5,
  },
  content: {
    gap: 4,
  },
  subtitle: {
    color:           '#FFF',
    fontSize:        22,
    fontWeight:      '900',
    letterSpacing:   -0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  ratingRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            4,
    marginBottom:   8,
  },
  ratingText: {
    color:      '#FFF',
    fontSize:   12,
    fontWeight: '600',
  },
  orderButton: {
    backgroundColor: '#E31837',
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical:   10,
    paddingHorizontal: 20,
    borderRadius:    12,
    alignSelf:       'flex-start',
  },
  orderButtonText: {
    color:      '#FFF',
    fontSize:   14,
    fontWeight: 'bold',
  },
  cartIcon: {
    marginLeft: 8,
  },
});

export default PizzaSnapCarousel;
