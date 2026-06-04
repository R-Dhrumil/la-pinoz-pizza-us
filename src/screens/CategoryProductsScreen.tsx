import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { ArrowLeft } from 'lucide-react-native';
import { useStore } from '../context/StoreContext';
import { categoryService, Category } from '../services/categoryService';
import { ScreenContainer } from '../components/ScreenContainer';
import MenuItem from '../components/MenuItem';

type CategoryProductsRouteProp = RouteProp<AuthStackParamList, 'CategoryProducts'>;

const CategoryProductsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<CategoryProductsRouteProp>();
  const { selectedStore } = useStore();
  const { category } = route.params;
  
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (selectedStore?.id) {
       fetchCategories();
    }
  }, [selectedStore]);

  const fetchCategories = async () => {
    if (!selectedStore?.id) return;
    const data = await categoryService.getCategories(selectedStore.id);
    setAllCategories(data);
  };

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
                    categoryId={category.id}
                    onTap={() => navigation.navigate('ProductDetail', { item, categoryId: category.id })} 
                />
            ))}
            
            {(!category.products || category.products.length === 0) && (
              <View style={styles.centered}>
                <Text style={styles.messageText}>No items found in this category.</Text>
              </View>
            )}
        </View>

        {/* Explore More Categories Section */}
        <View style={styles.exploreSection}>
            <Text style={styles.exploreTitle}>EXPLORE MORE CATEGORIES</Text>
            {allCategories.length > 0 && (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.exploreScrollContent}
                  >
                    {allCategories.filter(c => c.id !== category.id).map(cat => (
                      <TouchableOpacity 
                        key={cat.id} 
                        style={styles.exploreCard}
                        onPress={() => navigation.navigate('CategoryProducts', { category: cat })}
                      >
                        <View style={styles.exploreImageContainer}>
                          <Image 
                            source={cat.imageUrl ? { uri: cat.imageUrl } : require('../assets/images/pizza_placeholder.jpg')} 
                            style={styles.exploreImage}
                          />
                        </View>
                        <Text style={styles.exploreCardText} numberOfLines={2}>{cat.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
            )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

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
      paddingBottom: 40,
  },
  listSection: {
      marginBottom: 32,
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
  exploreSection: {
    marginTop: 10,
    marginBottom: 24,
  },
  exploreTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  exploreScrollContent: {
    gap: 16,
  },
  exploreCard: {
    width: 120,
    alignItems: 'center',
  },
  exploreImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  exploreImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  exploreCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
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
});

export default CategoryProductsScreen;
