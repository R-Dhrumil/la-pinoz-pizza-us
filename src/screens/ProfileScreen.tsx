import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import {
  User,
  Receipt,
  MapPin,
  Gift,
  BadgeDollarSign,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  LogOut,
  ChevronLeft,
  ShieldCheck,
  FileText,
  Share2
} from 'lucide-react-native';

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { user, logout } = useAuth();
  const [activeCount, setActiveCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const fetchActiveOrders = async () => {
        try {
          const orders = await orderService.getMyOrders();
          console.log(orders);
          
          const active = orders.filter(o => 
            ['placed', 'confirmed', 'preparing', 'outfordelivery', 'pending'].includes(o.orderStatus?.toLowerCase() ?? '')
          );
          setActiveCount(active.length);
        } catch (error) {
          console.error("Error fetching active orders count:", error);
        }
      };

      if (user) {
        fetchActiveOrders();
      }
    }, [user])
  );
  

  // Default user data if not logged in
  const displayUser = {
    name: user?.fullName || 'Guest User',
    phone: user?.phoneNumber || 'Not provided',
    image: user?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT_fev5pujj6i0YT_eyZYIUHLELxKcfyctsEIE0c6kNS3wvf3BeEcMmJKbF6alICfoXEeGtr0zoxpvAXuKR4oDFKRYApwD7OgJiYEtKFxlR21rwF4B4EkWJ1u1ldPiew5Rc7ShjLIDvev0dbAmvRICE52WyFSZXb7rryWmj5V9k2k9IWKKRzET2IWl7aTWWHT67AfNJbM0UIo3BJ9YKVDYfA8k4wfO1Gryg6UIpB2P441wJoqs4t5jclhbnWbbaCpMXabf1zRpaEVE',
  };

  type MenuItem = {
    id: string;
    label: string;
    icon: any;
    badge: string | null;
    badgeColor?: string;
    hideBadge?: boolean;
  };

  const menuItems: MenuItem[] = [
    { 
      id: 'orders', 
      label: 'My Orders', 
      icon: Receipt, 
      badge: activeCount > 0 ? `${activeCount} Active` : null, 
      badgeColor: '#3c7d48' 
    },
    { id: 'address', label: 'Manage Address', icon: MapPin, badge: null },
    { id: 'refund', label: 'Track My Refund', icon: BadgeDollarSign, badge: null },
    { id: 'concern', label: 'Raise a Concern', icon: MessageCircle, badge: null },
    { id: 'share', label: 'Share this app', icon: Share2, badge: null },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle, badge: null },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck, badge: null },
    { id: 'terms', label: 'Terms and Conditions', icon: FileText, badge: null },
  ];

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3c7d48" />
      
      {/* Header Card */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
        </View>
        
        <View style={styles.profileSection}>
            <Image source={{ uri: displayUser.image }} style={styles.avatar} />
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{displayUser.name}</Text>
                <Text style={styles.userPhone}>{displayUser.phone}</Text>
            </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuList}>
            {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                    <TouchableOpacity 
                        key={item.id} 
                        style={[styles.menuItem, index !== menuItems.length - 1 && styles.menuItemBorder]}
                        onPress={() => {
                            if (item.id === 'address') {
                                navigation.navigate('ManageAddress');
                            } else if (item.id === 'orders') {
                                navigation.navigate('MyOrders');
                            } else if (item.id === 'privacy') {
                                Linking.openURL('https://www.lapinozusa.com/privacy');
                            } else if (item.id === 'terms') {
                                Linking.openURL('https://www.lapinozusa.com/terms');
                            }
                            // Add other navigation cases here if needed
                        }}
                    >
                        <View style={styles.menuLeft}>
                            <View style={styles.iconBox}>
                                <Icon size={20} color="#3c7d48" />
                            </View>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                        </View>
                        
                        <View style={styles.menuRight}>
                            {item.badge && !item.hideBadge && (
                                <View style={[styles.badgeContainer, { backgroundColor: item.badgeColor }]}>
                                    <Text style={styles.badgeText}>{item.badge}</Text>
                                </View>
                            )}
                            <ChevronRight size={20} color="#9ca3af" />
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#3c7d48', // Green header
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editBtnText: {
    color: '#3c7d48',
    fontWeight: 'bold',
    fontSize: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollContent: {
    padding: 20,
  },
  menuList: {
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdf4', // Light green bg for icons
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2', // Light red bg
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
});

export default ProfileScreen;
