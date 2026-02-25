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
const MenuItem = ({ item, onTap }: { item: Product, onTap: () => void }) => {
    const navigation = useNavigation<any>();
    const { cartItems, addToCart, removeFromCart } = useCart();
    const { selectedStore } = useStore();
    
    // Check if this specific item ID is in the cart
    const cartItem = cartItems.find(i => i.id === item.id.toString());
    const quantity = cartItem ? cartItem.quantity : 0;
    
    // External link check
    const isExternal = item.externalLink;

    const handleAdd = () => {
        if (isExternal) {
             const link = item.externalLink || 'https://lapinozpizza.us/order-online/';
             Linking.openURL(link).catch(err => Alert.alert("Error", "Could not open link"));
             return;
        }
        navigation.navigate('ProductDetail', { item });
    };

    const handleRemove = () => {
        removeFromCart(item.id.toString());
    };

    return (
        <TouchableOpacity style={styles.menuItem} onPress={onTap} activeOpacity={0.9}>
             <View style={styles.itemContent}>
                 {item.isVeg !== null && item.isVeg !== undefined && (
                     <Image 
                        source={{ uri: item.isVeg 
                            ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Veg_symbol.svg/1200px-Veg_symbol.svg.png' 
                            : 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Non_veg_symbol.svg/1024px-Non_veg_symbol.svg.png' 
                        }} 
                        style={styles.vegIcon} 
                     />
                 )}
                 <Text style={styles.itemName}>{item.name}</Text>
                 <Text style={styles.itemPrice}>${item.basePrice}</Text>
                 <Text style={styles.itemDesc} numberOfLines={2}>
                     {item.description}
                 </Text>
             </View>
             
             <View style={styles.imageContainer}>
                 <Image source={item?.imageUrl ? { uri: item.imageUrl } : require('../assets/images/pizza_placeholder.jpg')} style={[styles.itemImage, !item?.imageUrl && { resizeMode: 'contain' }]} />
                 <View style={styles.addButtonContainer}>
                     {quantity > 0 && !isExternal ? (
                        <View style={styles.qtyContainer}>
                            <TouchableOpacity style={styles.qtyBtnSmall} onPress={handleRemove}>
                                <Text style={styles.qtyBtnText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyTextSmall}>{quantity}</Text>
                            <TouchableOpacity style={styles.qtyBtnSmall} onPress={handleAdd}>
                                <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                     ) : (
                        <TouchableOpacity 
                            style={[styles.addButton, isExternal && { backgroundColor: '#ea580c', borderColor: '#ea580c' }]} 
                            onPress={handleAdd}
                        >
                            <Text style={[styles.addButtonText, isExternal && { color: '#fff' }]}>{isExternal ? 'ORDER' : 'ADD'}</Text>
                            {!isExternal && <Text style={styles.addButtonPlus}> +</Text>}
                        </TouchableOpacity>
                     )}
                 </View>
             </View>
        </TouchableOpacity>
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
  menuItem: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 10,
      paddingBottom: 15,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#f3f4f6',
      justifyContent: 'space-between',
  },
  itemContent: {
      flex: 1,
      marginRight: 12,
      justifyContent: 'flex-start',
  },
  imageContainer: {
      width: 110,
      alignItems: 'center',
      justifyContent: 'flex-start',
      position: 'relative',
  },
  itemImage: {
      width: 110,
      height: 105,
      borderRadius: 12,
      backgroundColor: '#f3f4f6',
  },
  addButtonContainer: {
      position: 'absolute',
      bottom: -15,
      alignSelf: 'center',
      zIndex: 10,
  },
  vegIcon: {
      width: 14,
      height: 14,
      resizeMode: 'contain',
      marginBottom: 4,
  },
  itemName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 2,
  },
  itemPrice: {
      fontSize: 13,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 4,
  },
  itemDesc: {
      fontSize: 11,
      color: '#6b7280',
      lineHeight: 14,
  },
  addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#3c7d48',
      minWidth: 80,
  },
  addButtonText: {
      color: '#3c7d48',
      fontSize: 12,
      fontWeight: 'bold',
  },
  addButtonPlus: {
      color: '#3c7d48',
      fontSize: 12,
      fontWeight: 'bold',
      marginLeft: 4,
  },
  qtyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#3c7d48',
      height: 32,
      minWidth: 80,
  },
  qtyBtnSmall: {
      width: 32,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
  },
  qtyBtnText: {
      color: '#3c7d48',
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: -2,
  },
  qtyTextSmall: {
      color: '#3c7d48',
      fontSize: 14,
      fontWeight: 'bold',
      marginHorizontal: 2,
      minWidth: 16,
      textAlign: 'center',
  },
});

export default CategoryProductsScreen;
