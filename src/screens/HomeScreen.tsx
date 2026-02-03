import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
  TextInput,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import {
  Pizza,
  User,
  ShoppingCart,
  MapPin,
  Croissant,
  UtensilsCrossed,
  Utensils,
  Martini,
  Soup,
  ChefHat,
  Leaf,
} from 'lucide-react-native';

import { useCart } from '../context/CartContext';
import PageLayout from '../components/PageLayout';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { totalItems } = useCart();
  const [deliveryMode, setDeliveryMode] = React.useState<'delivery' | 'pickup'>('delivery');

  return (
    <PageLayout style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#3c7d48"
      />
      
      {/* Navbar - Fixed Bottom */}
      {/* Navbar - Handled by TabNavigator now */}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Pizza size={28} color="#3c7d48" />
            </View>
            <Text style={styles.brandName}>LA PINO'Z</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Cart')}>
              <ShoppingCart size={24} color="#374151" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <ImageBackground
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT_fev5pujj6i0YT_eyZYIUHLELxKcfyctsEIE0c6kNS3wvf3BeEcMmJKbF6alICfoXEeGtr0zoxpvAXuKR4oDFKRYApwD7OgJiYEtKFxlR21rwF4B4EkWJ1u1ldPiew5Rc7ShjLIDvev0dbAmvRICE52WyFSZXb7rryWmj5V9k2k9IWKKRzET2IWl7aTWWHT67AfNJbM0UIo3BJ9YKVDYfA8k4wfO1Gryg6UIpB2P441wJoqs4t5jclhbnWbbaCpMXabf1zRpaEVE' }}
          style={styles.hero}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
             <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Serving Over</Text>
                <Text style={[styles.heroTitle, { color: '#3c7d48' }]}>600+ Locations.</Text>
                <TouchableOpacity style={styles.orderButton}>
                  <Text style={styles.orderButtonText}>Order Now</Text>
                </TouchableOpacity>
             </View>
          </View>
        </ImageBackground>

        {/* Search & Toggle Box */}
        <View style={styles.searchSectionWrapper}>
            <View style={styles.searchContainer}>
                <View style={styles.toggleContainer}>
                    <TouchableOpacity 
                        style={[styles.toggleButton, deliveryMode === 'delivery' && styles.toggleActive]}
                        onPress={() => setDeliveryMode('delivery')}
                    >
                        <Text style={[styles.toggleText, deliveryMode === 'delivery' && styles.toggleTextActive]}>Delivery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.toggleButton, deliveryMode === 'pickup' && styles.toggleActive]}
                        onPress={() => setDeliveryMode('pickup')}
                    >
                        <Text style={[styles.toggleText, deliveryMode === 'pickup' && styles.toggleTextActive]}>Pickup</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                    <MapPin size={20} color="#3c7d48" style={styles.inputIcon} />
                    <TextInput 
                        placeholder="Enter your delivery location" 
                        style={styles.input}
                        placeholderTextColor="#9ca3af"
                    />
                </View>
            </View>
        </View>

        {/* Top Categories */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                <CategoryItem icon={<Pizza size={32} color="#3c7d48" />} name="Pizza" active />
                <CategoryItem icon={<Croissant size={32} color="#6b7280" />} name="Breads" />
                <CategoryItem icon={<UtensilsCrossed size={32} color="#6b7280" />} name="Pasta" />
                <CategoryItem icon={<Utensils size={32} color="#6b7280" />} name="Sides" />
                <CategoryItem icon={<Martini size={32} color="#6b7280" />} name="Drinks" />
            </ScrollView>
        </View>

        {/* Best Sellers */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Our Best Sellers</Text>
                <TouchableOpacity>
                     <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bestSellerScroll}>
                <BestSellerCard 
                    image="https://lh3.googleusercontent.com/aida-public/AB6AXuB6pTGSpLBLr94GFO6UieWNSuzx4M7rLNKcSBn9GY-mpw72PfVSI1xJqkh1Lh9tFngkY18Ot8ZUv9SltfMbzFQTJc75L2h3ART5VLGWujpfkZ1RcRxSMVVFAxHnTVnnCceRQ2OGqoAgWQQ2HjshfCN-ElTRLv2aZAuMz4SQV5jW08fS8uGsKX9hZXeOMXQe4ufUolLb7T6T1P8jBi9GMgyPgHSGtkGRL7NpbAZq9EtMjjl7OdD6_3Ft-NKe9st04ypYkaySSSXgAouQ"
                    name="Cheesy-7 Pizza"
                    desc="Signature 7-cheese blend pizza"
                    price="$14.99"
                />
                <BestSellerCard 
                    image="https://lh3.googleusercontent.com/aida-public/AB6AXuD-1D4AbD5Oh2Ct2N9-IL56XKpH6gzhbt99mf9upCAHdWA7hmj0i1JcUHhKasMBJ78ksxKDPNej86mRwnHCpNFrL9Uc2uITcL31T4qmchJcxvr8tb5boock07lyEfUxy-hJm88rxEM8Ehyr3g8Rs8sKt-xwz0EgWV2akQg4a3-OYZR4jLjhx0AiPLSy7b9FissOsbUJqDpKidYnH0KNrKWprZCrT6LOZBgc4zQ7zG-VngP2Hh_BQATTzMpKIcUrhfIeGtOF5sJs_iB6"
                    name="Paneer Tikka Special"
                    desc="Authentic fusion spices"
                    price="$16.99"
                />
            </ScrollView>
        </View>

        {/* Explore Menu */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Explore Our Menu</Text>
            <View style={{ gap: 16 }}>
                <ExplorationCard 
                    image="https://lh3.googleusercontent.com/aida-public/AB6AXuArhpRY-0nyLHzV1F4lzmIvMxXn22ZqY8diImVmQWs2C3EtC6EY9l_KVanQ5d4M-kjWUy_jUIJWl7r956NH2_INqlrBluBwSdWEz2EmIUl4nEvfeWyZsmdbTyI-rT_a2oUQXI1I8zFYp_SOhQyVbRTSkulvF_dk1HjkAoOTJB_PR3WM-jfQ2v3zPgGYrGtezFyONXEi8BhhzCQQhJPYnzjxneE4HDNSHhM72GoEB50kH9NYdKIK0flWFJpTU757cfDsHlisavMj4tDy"
                    title="THE MONSTER PIZZA"
                    subtitle="Feed the whole crew"
                    buttonText="Order Now"
                    btnStyle="primary"
                />
                <ExplorationCard 
                    image="https://lh3.googleusercontent.com/aida-public/AB6AXuCFRPEE383icBhG-V4GYSUUQnMLKDprJWxIofXROC2729fGb6cNkYmxhApOv3eXbEihTl_5eSO8k6-V8EekzrVwjVZO9PHMmNyhyrbaeK3cER7wrGKdufJx6NhS_87BfWpKFbaw3xLdJRqFnSpVrtUI7T5IcLYVOxb7xS3DJtlR0Gzp8w7CTvQvOnBEsh0PswkLa6p81aaMHDkdtwnEA79cKJjY1nqSuu8CeqbC9n80pb98tCvejQYVCWdFKBpIRL1_bco4voFiZ6g3"
                    title="GIANT SLICE"
                    subtitle="Solo hunger pangs fixed"
                    buttonText="Order Now"
                    btnStyle="white"
                />
            </View>
        </View>

        {/* Our Story */}
        <View style={styles.section}>
            <View style={styles.storyContainer}>
                <Text style={styles.eyebrow}>OUR STORY</Text>
                <Text style={styles.storyTitle}>India's Fastest Growing Pizza Chain</Text>
                <Text style={styles.storyText}>
                    Bringing authentic taste and premium quality since 2011. Now conquering the USA.
                </Text>
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>600+</Text>
                        <Text style={styles.statLabel}>OUTLETS</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>10M+</Text>
                        <Text style={styles.statLabel}>CUSTOMERS</Text>
                    </View>
                </View>
            </View>
        </View>
        
        {/* Our Promise */}
        <View style={styles.section}>
             <View style={styles.centerHeader}>
                 <Text style={styles.eyebrow}>OUR PROMISE</Text>
                 <Text style={styles.sectionTitle}>7-Star Quality Every Bite</Text>
             </View>
             <View style={{ gap: 16, marginTop: 16 }}>
                <PromiseItem 
                    icon={<ChefHat size={24} color="#3c7d48" />}
                    title="Freshly Kneaded Dough"
                    desc="Prepared fresh in-store, every single morning."
                />
                <PromiseItem 
                    icon={<Leaf size={24} color="#3c7d48" />}
                    title="Farm Fresh Toppings"
                    desc="Locally sourced vegetables for high taste."
                />
                <PromiseItem 
                    icon={<Soup size={24} color="#3c7d48" />}
                    title="Signature Sauces"
                    desc="Secret blend of herbs and zest."
                />
             </View>
        </View>
        
        {/* App Banner */}
        
      </ScrollView>
    </PageLayout>
  );
};

// Helper Components

const CategoryItem = ({icon, name, active}: {icon: React.ReactNode, name: string, active?: boolean}) => (
    <View style={styles.categoryItem}>
        <View style={[styles.categoryIcon, active && styles.categoryIconActive]}>
            {icon}
        </View>
        <Text style={[styles.categoryName, active ? {fontWeight: '700', color: '#000'} : {color: '#6b7280'}]}>{name}</Text>
    </View>
);

const BestSellerCard = ({image, name, desc, price}: {image: string, name: string, desc: string, price: string}) => (
    <View style={styles.bestSellerCard}>
        <Image source={{uri: image}} style={styles.bsImage} />
        <View style={styles.bsContent}>
            <Text style={styles.bsName}>{name}</Text>
            <Text style={styles.bsDesc} numberOfLines={1}>{desc}</Text>
            <View style={styles.bsFooter}>
                <Text style={styles.bsPrice}>{price}</Text>
                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

const ExplorationCard = ({image, title, subtitle, buttonText, btnStyle}: any) => (
    <View style={styles.exploreCard}>
        <ImageBackground source={{uri: image}} style={styles.exploreBg}>
             <View style={styles.exploreOverlay}>
                 <View style={styles.exploreContent}>
                     <Text style={styles.exploreTitle}>{title}</Text>
                     <Text style={styles.exploreSubtitle}>{subtitle}</Text>
                     <TouchableOpacity style={[
                         styles.exploreBtn, 
                         btnStyle === 'white' ? styles.exploreBtnWhite : styles.exploreBtnPrimary
                     ]}>
                         <Text style={[
                             styles.exploreBtnText,
                             btnStyle === 'white' ? {color: '#3c7d48'} : {color: '#fff'}
                         ]}>{buttonText}</Text>
                     </TouchableOpacity>
                 </View>
             </View>
        </ImageBackground>
    </View>
);

const PromiseItem = ({icon, title, desc}: any) => (
    <View style={styles.promiseCard}>
        <View style={styles.promiseIconBox}>
            {icon}
        </View>
        <View>
            <Text style={styles.promiseTitle}>{title}</Text>
            <Text style={styles.promiseDesc}>{desc}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  scrollContent: {
    paddingBottom: 80, // Space for bottom nav
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
  logoContainer: {
    /* No specialized style needed */
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#3c7d48',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  hero: {
    width: '100%',
    height: 320,
    justifyContent: 'center',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroContent: {
      gap: 12,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 44,
  },
  orderButton: {
    backgroundColor: '#3c7d48',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchSectionWrapper: {
      marginTop: -32,
      paddingHorizontal: 16,
      marginBottom: 32,
  },
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#3c7d48',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  categoryScroll: {
    gap: 24,
    paddingBottom: 8,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
    minWidth: 70,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconActive: {
    backgroundColor: 'rgba(60, 125, 72, 0.1)',
    borderWidth: 2,
    borderColor: '#3c7d48',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3c7d48',
  },
  bestSellerScroll: {
    gap: 16,
    paddingBottom: 16,
  },
  bestSellerCard: {
    width: 240,
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
    resizeMode: 'cover',
  },
  bsContent: {
    padding: 12,
  },
  bsName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  bsDesc: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  bsFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
  },
  bsPrice: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#3c7d48',
  },
  addButton: {
      backgroundColor: '#3c7d48',
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 8,
  },
  addButtonText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
  },
  exploreCard: {
      height: 160,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
  },
  exploreBg: {
      flex: 1,
  },
  exploreOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)', // gradient approximation
      justifyContent: 'center',
      padding: 24,
  },
  exploreContent: {
      justifyContent: 'center',
  },
  exploreTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: '#fff',
      textTransform: 'uppercase',
      fontStyle: 'italic',
  },
  exploreSubtitle: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: 12,
  },
  exploreBtn: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignSelf: 'flex-start',
  },
  exploreBtnPrimary: {
      backgroundColor: '#3c7d48',
  },
  exploreBtnWhite: {
      backgroundColor: '#fff',
  },
  exploreBtnText: {
      fontSize: 10,
      fontWeight: 'bold',
  },
  storyContainer: {
      backgroundColor: 'rgba(60, 125, 72, 0.05)',
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: 'rgba(60, 125, 72, 0.1)',
  },
  eyebrow: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#3c7d48',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
  },
  storyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 12,
  },
  storyText: {
      fontSize: 14,
      color: '#4b5563',
      lineHeight: 20,
      marginBottom: 24,
  },
  statsRow: {
      flexDirection: 'row',
      gap: 16,
  },
  statBox: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#f3f4f6',
  },
  statNumber: {
      fontSize: 24,
      fontWeight: '900',
      color: '#3c7d48',
  },
  statLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#6b7280',
      textTransform: 'uppercase',
  },
  centerHeader: {
      alignItems: 'center',
      marginBottom: 8,
  },
  promiseCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#f3f4f6',
      shadowColor: '#000',
      shadowOpacity: 0.02,
      shadowRadius: 4,
  },
  promiseIconBox: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(60, 125, 72, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  promiseTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#000',
  },
  promiseDesc: {
      fontSize: 11,
      color: '#6b7280',
  },
  appBanner: {
      backgroundColor: '#0b1219',
      borderRadius: 24,
      padding: 24,
      overflow: 'hidden',
      position: 'relative',
      minHeight: 200,
  },
  appContent: {
      position: 'relative',
      zIndex: 10,
      width: '60%',
  },
  appTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 8,
  },
  appDesc: {
      fontSize: 12,
      color: '#9ca3af',
      marginBottom: 24,
  },
  appButtons: {
      flexDirection: 'row',
      gap: 12,
  },
  appBtn: {
      backgroundColor: '#fff',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
  },
  appBtnText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#4b5563',
  },
  appImage: {
      position: 'absolute',
      bottom: -40,
      right: -20,
      width: 140,
      height: 180,
      transform: [{rotate: '-5deg'}],
  },
});

export default HomeScreen;
