import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Alert
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { ArrowLeft } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { Product } from '../services/categoryService';
import { ScreenContainer } from '../components/ScreenContainer';
import MenuItem from '../components/MenuItem';

type CategoryProductsRouteProp = RouteProp<AuthStackParamList, 'CategoryProducts'>;

const CategoryProductsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<CategoryProductsRouteProp>();
  const { category } = route.params;

  return (
    <ScreenContainer useScrollView={false} containerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category?.name || 'Category'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.listSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{category?.name || 'Category'}</Text>
                <Text style={styles.itemCount}>
                    {category?.products ? category.products.length : 0} ITEMS
                </Text>
            </View>
            
            {category?.products && category.products.map(item => (
                <MenuItem 
                    key={item.id} 
                    item={item} 
                    onTap={() => navigation.navigate('ProductDetail', { item })} 
                />
            ))}
            
            {(!category.products || category.products.length === 0) && (
              <View style={styles.centered}>
                <Text style={styles.messageText}>No items found in this category.</Text>
              </View>
            )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

// Reused MenuItem Component
// MenuItem component removed and replaced with shared component in ../components/MenuItem

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
      padding: 16,
      paddingBottom: 20,
  },
  listSection: {
      marginBottom: 24,
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000',
  },
  itemCount: {
      fontSize: 10,
      color: '#9ca3af',
      fontWeight: '600',
  },
  centered: {
      padding: 20,
      alignItems: 'center',
  },
  messageText: {
      fontSize: 16,
      color: '#6b7280',
      textAlign: 'center',
  },
// MenuItem styles removed as they are now in the shared MenuItem component
});

export default CategoryProductsScreen;
