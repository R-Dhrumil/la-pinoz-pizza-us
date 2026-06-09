import React from 'react';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Trash2, Plus, Minus, MoveRight, ChevronDown, ChevronUp, Pencil, BadgePercent, X, Lock } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ScreenContainer } from '../components/ScreenContainer';
import { DeliveryTeaserModal } from '../components/DeliveryTeaserModal';
import { PRICING } from '../utils/constants';

const CartScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { 
    cartItems, totalAmount, addToCart, removeFromCart, deleteItem, orderMode, setOrderMode,
    availableOffers, appliedOfferCodes, discountAmount, appliedPromos, validationError,
    applyOfferCode, removeOfferCode, isValidatingOffers, taxBreakdown, totalTaxAmount
  } = useCart();
  const { isAuthenticated } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [expandedOffers, setExpandedOffers] = useState<number[]>([]);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  const toggleToppings = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const toggleOfferExpansion = (id: number) => {
    setExpandedOffers(prev => 
      prev.includes(id) 
        ? prev.filter(offerId => offerId !== id)
        : [...prev, id]
    );
  };

  if (cartItems.length === 0) {
    return (
      <ScreenContainer useScrollView={false} containerStyle={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Cart</Text>
            <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
            <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/11329/11329060.png' }} 
                style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyDesc}>Looks like you haven't added any pizza yet.</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Menu' } as any)}>
                <Text style={styles.browseBtnText}> BROWSE OUR MENU</Text>
            </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const deliveryFee = orderMode === 'delivery' ? PRICING.DELIVERY_FEE : 0;
  const finalTotal = totalAmount - discountAmount + totalTaxAmount + deliveryFee;

  return (
    <ScreenContainer useScrollView={false} containerStyle={styles.container}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#3c7d48" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Order Mode Toggle */}
          <View style={styles.modeToggleContainer}>
              <TouchableOpacity 
                  style={[
                      styles.modeToggleButton,
                      orderMode === 'delivery' && styles.modeToggleActive,
                      orderMode !== 'delivery' && { opacity: 0.5, position: 'relative' }
                  ]}
                  onPress={() => setShowDeliveryModal(true)}
              >
                  <Text style={[styles.modeToggleText, orderMode === 'delivery' && styles.modeToggleTextActive]}>Delivery</Text>
                  <View style={styles.soonBadge}>
                      <Text style={styles.soonBadgeText}>{orderMode === 'delivery' ? 'PREVIEW' : 'SOON'}</Text>
                  </View>
              </TouchableOpacity>
              <TouchableOpacity 
                  style={[styles.modeToggleButton, orderMode === 'pickup' && styles.modeToggleActive]}
                  onPress={() => setOrderMode('pickup')}
              >
                  <Text style={[styles.modeToggleText, orderMode === 'pickup' && styles.modeToggleTextActive]}>Pickup</Text>
              </TouchableOpacity>
          </View>

          {/* Delivery Teaser Modal */}
          <DeliveryTeaserModal
            visible={showDeliveryModal}
            onClose={() => setShowDeliveryModal(false)}
            onSelectPickup={() => {
              setOrderMode('pickup');
              setShowDeliveryModal(false);
            }}
          />

          {/* Cart Items */}
          <View style={styles.itemsSection}>
              {cartItems.map((item) => (
                  <View key={item.id} style={styles.cartItem}>
                      <Image source={{ uri: item.image }} style={styles.itemImage} />
                      <View style={styles.itemInfo}>
                          <View style={styles.itemHeader}>
                              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                              <TouchableOpacity onPress={() => deleteItem(item.id)}>
                                  <Trash2 size={16} color="#ef4444" />
                              </TouchableOpacity>
                          </View>
                          
                          <View>
                              <Text style={styles.itemVariant}>
                                  {item.variant?.size ? `${item.variant.size} Size` : 'Regular'} 
                              </Text>

                              <View style={styles.controlsRow}>
                                {item.toppings && item.toppings.length > 0 && (
                                    <TouchableOpacity 
                                        style={styles.toppingsToggle} 
                                        onPress={() => toggleToppings(item.id)}
                                    >
                                        <Text style={styles.toppingsToggleText}>
                                            {item.toppings.length} Toppings
                                        </Text>
                                        {expandedItems.includes(item.id) ? (
                                            <ChevronUp size={12} color="#3c7d48" />
                                        ) : (
                                            <ChevronDown size={12} color="#3c7d48" />
                                        )}
                                    </TouchableOpacity>
                                )}

                                {/* Edit Button */}
                                {item.originalProduct && (
                                    <TouchableOpacity 
                                        style={styles.editButton}
                                        onPress={() => {
                                             navigation.navigate('ProductDetail', {
                                                 item: item.originalProduct,
                                                 categoryId: item.categoryId,
                                                 editMode: true,
                                                 existingCartId: item.id,
                                                 prefill: {
                                                     variant: item.variant,
                                                     toppings: item.toppings,
                                                     quantity: item.quantity
                                                 }
                                             });
                                        }}
                                    >
                                        <Pencil size={14} color="#3c7d48" />
                                        <Text style={styles.editText}>Edit</Text>
                                    </TouchableOpacity>
                                )}
                              </View>

                              {item.toppings && item.toppings.length > 0 && expandedItems.includes(item.id) && (
                                  <View style={styles.toppingsList}>
                                      {item.toppings.map((topping: any, index: number) => (
                                          <Text key={index} style={styles.toppingItemText}>
                                              • {topping.name}
                                          </Text>
                                      ))}
                                  </View>
                              )}
                          </View>
                          
                          <View style={styles.itemFooter}>
                              <View style={styles.itemPriceContainer}>
                                  <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                                  {item.originalPrice && item.originalPrice > item.price && (
                                      <View style={styles.saveBadge}>
                                          <Text style={styles.saveBadgeText}>
                                              Save ${((item.originalPrice - item.price) * item.quantity).toFixed(2)}
                                          </Text>
                                      </View>
                                  )}
                              </View>
                              <View style={styles.qtyControl}>
                                  <TouchableOpacity 
                                    style={styles.qtyBtn}
                                    onPress={() => removeFromCart(item.id)}
                                  >
                                      <Minus size={14} color="#000" />
                                  </TouchableOpacity>
                                  <Text style={styles.qtyText}>{item.quantity}</Text>
                                  <TouchableOpacity 
                                    style={styles.qtyBtn}
                                    onPress={() => addToCart({ ...item })}
                                  >
                                      <Plus size={14} color="#000" />
                                  </TouchableOpacity>
                              </View>
                          </View>
                      </View>
                  </View>
              ))}
          </View>

          {/* Savings Corner Section */}
          <View style={styles.savingsCornerSection}>
              <Text style={styles.savingsCornerTitle}>SAVINGS CORNER</Text>

              {/* Promo Input */}
              <View style={styles.promoInputContainer}>
                  <TextInput 
                      style={styles.promoInput}
                      placeholder="Enter promo code"
                      placeholderTextColor="#9ca3af"
                      value={promoCode}
                      onChangeText={setPromoCode}
                      autoCapitalize="characters"
                  />
                  <TouchableOpacity 
                    style={[styles.applyBtn, !promoCode && { opacity: 0.5 }]}
                    onPress={() => {
                        if (promoCode) {
                            applyOfferCode(promoCode);
                        }
                    }}
                    disabled={!promoCode || isValidatingOffers}
                  >
                      {isValidatingOffers ? (
                          <ActivityIndicator size="small" color="#fff" />
                      ) : (
                          <Text style={styles.applyBtnText}>APPLY</Text>
                      )}
                  </TouchableOpacity>
              </View>

              {/* Error Message */}
              {validationError && (
                  <View style={styles.errorContainer}>
                      <X size={14} color="#ef4444" />
                      <Text style={styles.errorText}>{validationError}</Text>
                  </View>
              )}

              {availableOffers.length > 0 ? (
                  (showAllOffers ? availableOffers : availableOffers.slice(0, 2)).map((offer) => {
                      const isApplied = appliedPromos.some(p => p.code === offer.offerCode);
                      const isSelected = appliedOfferCodes.includes(offer.offerCode) && !isApplied;
                      const isExpanded = expandedOffers.includes(offer.id);

                      // Smart Feedback — works for both FlatOff and PercentageOff min values
                      const minVal = offer.minimumOrderValue ?? offer.minimumPurchase ?? 0;
                      const minOrderMet = minVal === 0 || totalAmount >= minVal;
                      const categoryMet = offer.categoryIds.length === 0 ||
                                         cartItems.some(item => offer.categoryIds.includes(item.categoryId || 0));

                      // Type badge label
                      const typeBadge = offer.offerType === 'BXGY'
                          ? `Buy ${offer.buyX} Get ${offer.getY}`
                          : offer.offerType === 'FlatOff'
                            ? `$${(offer.flatAmount ?? 0).toFixed(2)} Off`
                            : `${offer.percentage ?? 0}% Off`;

                      return (
                          <View key={offer.id} style={[styles.savingsOfferRow, isSelected && styles.selectedOfferRow]}>
                              <View style={styles.savingsOfferIconContainer}>
                                  <BadgePercent size={20} color="#374151" />
                              </View>
                              <View style={styles.savingsOfferContent}>
                                  <TouchableOpacity
                                      style={styles.savingsOfferTitleRow}
                                      onPress={() => toggleOfferExpansion(offer.id)}
                                      activeOpacity={0.7}
                                  >
                                      <Text style={styles.savingsOfferTitle} numberOfLines={isExpanded ? undefined : 2}>
                                          {offer.displayName || `Offer: ${offer.offerCode}`}
                                      </Text>
                                      {isExpanded ? (
                                          <ChevronUp size={16} color="#374151" />
                                      ) : (
                                          <ChevronDown size={16} color="#374151" />
                                      )}
                                  </TouchableOpacity>

                                  {/* Offer type badge + promo code */}
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                      <View style={styles.offerTypeBadge}>
                                          <Text style={styles.offerTypeBadgeText}>{typeBadge}</Text>
                                      </View>
                                      <Text style={styles.savingsOfferSubtitle}>Code: {offer.offerCode}</Text>
                                  </View>

                                  {isSelected && (
                                      <Text style={styles.selectedStatusText}>
                                          {!minOrderMet
                                              ? `• Add $${(minVal - totalAmount).toFixed(2)} more to apply`
                                              : !categoryMet
                                                ? '• Add required items to apply'
                                                : '• Conflicts with another offer'}
                                      </Text>
                                  )}

                                  {isExpanded && offer.description && (
                                      <Text style={styles.savingsOfferDescription}>
                                          {offer.description}
                                      </Text>
                                  )}
                              </View>

                              <View style={styles.savingsOfferAction}>
                                  {isApplied || isSelected ? (
                                      <TouchableOpacity
                                          style={styles.removeOfferBtn}
                                          onPress={() => {
                                              removeOfferCode(offer.offerCode);
                                              if (promoCode === offer.offerCode) {
                                                  setPromoCode('');
                                              }
                                          }}
                                      >
                                          <Text style={styles.removeOfferBtnText}>REMOVE</Text>
                                      </TouchableOpacity>
                                  ) : (
                                      <TouchableOpacity
                                          style={styles.savingsApplyBtn}
                                          onPress={() => {
                                              setPromoCode(offer.offerCode);
                                              applyOfferCode(offer.offerCode);
                                          }}
                                          disabled={isValidatingOffers}
                                      >
                                          {isValidatingOffers && promoCode === offer.offerCode ? (
                                              <ActivityIndicator size="small" color="#3c7d48" />
                                          ) : (
                                              <Text style={styles.savingsApplyBtnText}>APPLY</Text>
                                          )}
                                      </TouchableOpacity>
                                  )}

                                  {(isApplied || isSelected) && (
                                      <View style={[
                                          styles.statusIndicator,
                                          isApplied ? styles.appliedIndicator : styles.selectedIndicator
                                      ]}>
                                          <Text style={[
                                              styles.statusIndicatorText,
                                              isApplied ? styles.appliedIndicatorText : styles.selectedIndicatorText
                                          ]}>
                                              {isApplied ? 'Applied' : 'Selected'}
                                          </Text>
                                      </View>
                                  )}
                              </View>
                          </View>
                      );
                  })
              ) : (
                  <Text style={styles.noOffersText}>No offers available right now.</Text>
              )}

              {availableOffers.length > 2 && (
                  <TouchableOpacity 
                      style={styles.viewAllOffersBtn}
                      onPress={() => setShowAllOffers(!showAllOffers)}
                  >
                      {showAllOffers ? <Minus size={14} color="#374151" /> : <Plus size={14} color="#374151" />}
                      <Text style={styles.viewAllOffersText}>
                          {showAllOffers ? 'View less offers' : 'View all offers'}
                      </Text>
                  </TouchableOpacity>
              )}
          </View>

          {/* Add More Button */}
          <TouchableOpacity 
              style={styles.addMoreBtn} 
              onPress={() => navigation.navigate('MainTabs', { screen: 'Menu' })}
          >
              <Text style={styles.addMoreBtnText}>Add more items</Text>
              <Plus size={16} color="#3c7d48" />
          </TouchableOpacity>

          {/* Order Summary */}
          <View style={styles.billSection}>
              <Text style={styles.billTitle}>Order Summary</Text>

              {/* Per-item lines */}
              {cartItems.map((item) => (
                  <View key={item.id} style={styles.billRow}>
                      <Text style={[styles.billLabel, { flex: 1, marginRight: 8, color: '#4b5563' }]} numberOfLines={1}>
                          {item.quantity}x {item.name}
                      </Text>
                      <Text style={[styles.billValue, { fontWeight: '400', color: '#4b5563' }]}>
                          ${((item.originalPrice || item.price) * item.quantity).toFixed(2)}
                      </Text>
                  </View>
              ))}

              {/* Only show Subtotal and Promo section if an offer is applied */}
              {appliedPromos.length > 0 && (
                  <>
                      <View style={styles.billDividerDashed} />
                      <View style={styles.billRow}>
                          <Text style={[styles.billLabel, { fontWeight: '600', color: '#374151' }]}>Subtotal</Text>
                          <Text style={[styles.billValue, { fontWeight: '600', color: '#374151' }]}>${totalAmount.toFixed(2)}</Text>
                      </View>
                      {appliedPromos.map((promo) => (
                          <View key={promo.code} style={styles.billRow}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                  <BadgePercent size={12} color="#3c7d48" />
                                  <Text style={[styles.billLabel, { color: '#3c7d48', fontWeight: '600' }]}>
                                      Offer Applied ({promo.code})
                                  </Text>
                              </View>
                              <Text style={[styles.billValue, { color: '#3c7d48', fontWeight: '700' }]}>
                                  -{promo.type === 'BXGY' ? 'Buy X Get Y' : `$${promo.discount.toFixed(2)}`}
                              </Text>
                          </View>
                      ))}
                  </>
              )}

              {/* Tax section */}
              {taxBreakdown.length > 0 && (
                  <>
                      <View style={styles.billDividerDashed} />
                      {discountAmount > 0 && (
                          <View style={styles.billRow}>
                              <Text style={[styles.billLabel, { fontWeight: '600', color: '#374151' }]}>Amount Subject to Tax</Text>
                              <Text style={[styles.billValue, { fontWeight: '600', color: '#374151' }]}>
                                  ${Math.max(0, totalAmount - discountAmount).toFixed(2)}
                              </Text>
                          </View>
                      )}
                      {taxBreakdown.map((t, index) => (
                          <View key={index} style={styles.billRow}>
                              <Text style={[styles.billLabel, { color: '#4b5563' }]}>{t.name} ({t.percentage}%)</Text>
                              <Text style={[styles.billValue, { fontWeight: '400', color: '#4b5563' }]}>${t.amount.toFixed(2)}</Text>
                          </View>
                      ))}
                      <View style={styles.billRow}>
                          <Text style={[styles.billLabel, { fontWeight: '600', color: '#374151' }]}>Total Tax</Text>
                          <Text style={[styles.billValue, { fontWeight: '600', color: '#374151' }]}>${totalTaxAmount.toFixed(2)}</Text>
                      </View>
                  </>
              )}

              {/* Delivery Fee Section */}
              <View style={styles.billDividerDashed} />
              <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: '#4b5563' }]}>Delivery Fee</Text>
                  {orderMode === 'pickup' ? (
                      <Text style={[styles.billValue, { color: '#3c7d48', fontWeight: '700' }]}>FREE</Text>
                  ) : (
                      <Text style={[styles.billValue, { fontWeight: '400', color: '#4b5563' }]}>${deliveryFee.toFixed(2)}</Text>
                  )}
              </View>

              <View style={styles.divider} />

              {/* Total */}
              <View style={styles.billRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <View style={{ alignItems: 'flex-end' }}>
                      {discountAmount > 0 && (
                          <Text style={{ fontSize: 11, color: '#9ca3af', textDecorationLine: 'line-through' }}>
                              ${(totalAmount + totalTaxAmount + deliveryFee).toFixed(2)}
                          </Text>
                      )}
                      <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
                  </View>
              </View>

              {discountAmount > 0 && (
                  <View style={styles.savingsSummaryRow}>
                      <Text style={styles.savingsSummaryText}>
                          🎉 You save ${discountAmount.toFixed(2)} on this order!
                      </Text>
                  </View>
              )}
          </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
           <View>
               <Text style={styles.payLabel}>PAYABLE</Text>
               <Text style={styles.payAmount}>${finalTotal.toFixed(2)}</Text>
           </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
                <Text style={styles.checkoutText}>PLACE ORDER</Text>
                <MoveRight size={18} color="#fff" />
            </TouchableOpacity>
      </View>

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
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000',
  },
  backBtn: {
      padding: 4,
  },
  scrollContent: {
      padding: 16,
      paddingBottom: 100,
  },
  emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
  },
  emptyImage: {
      width: 120,
      height: 120,
      marginBottom: 24,
      opacity: 0.5,
  },
  emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 8,
  },
  emptyDesc: {
      fontSize: 14,
      color: '#6b7280',
      textAlign: 'center',
      marginBottom: 32,
  },
  browseBtn: {
      backgroundColor: '#3c7d48',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
  },
  browseBtnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
  },
  itemsSection: {
      marginBottom: 24,
  },
  cartItem: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      padding: 12,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 2,
  },
  itemImage: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: '#f3f4f6',
  },
  itemInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'space-between',
  },
  itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
  },
  itemName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#000',
      flex: 1,
      marginRight: 8,
  },
  itemVariant: {
      fontSize: 12,
      color: '#6b7280',
      marginTop: 2,
  },
  itemFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end', // Align to right
      alignItems: 'center',
      marginTop: 8,
  },
  controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
  },
  itemPrice: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#3c7d48', // Using green for price consistency
  },
  itemPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 10,
  },
  saveBadge: {
    backgroundColor: '#3c7d48',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  qtyControl: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f3f4f6',
      borderRadius: 8,
      padding: 2,
  },
  qtyBtn: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 6,
      backgroundColor: '#fff',
  },
  qtyText: {
      width: 24,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: 'bold',
      color: '#000',
  },
  billSection: {
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 16,
  },
  billTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 16,
  },
  billRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
  },
  billLabel: {
      fontSize: 14,
      color: '#6b7280',
  },
  billValue: {
      fontSize: 14,
      color: '#000',
      fontWeight: '500',
  },
  divider: {
      height: 1,
      backgroundColor: '#f3f4f6',
      marginVertical: 12,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: '#f3f4f6', // Trick for dashed line often requires borderRadius, or just simple line
  },
  totalLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
  },
  totalValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#3c7d48',
  },
  billDividerDashed: {
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      borderStyle: 'dashed',
      marginBottom: 10,
      marginTop: 2,
  },
  savingsSummaryRow: {
      backgroundColor: '#f0fdf4',
      borderRadius: 8,
      padding: 10,
      marginTop: 4,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#bbf7d0',
  },
  savingsSummaryText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#3c7d48',
  },
  bottomBar: {
      backgroundColor: '#fff',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#f3f4f6',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
  },
  payLabel: {
      fontSize: 10,
      color: '#6b7280',
      fontWeight: '600',
      marginBottom: 2,
  },
  payAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000',
  },
  checkoutBtn: {
      backgroundColor: '#3c7d48',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
      shadowColor: '#3c7d48',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
  },
  checkoutText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
      letterSpacing: 0.5,
  },
  addMoreBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 14,
      borderRadius: 12,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#3c7d48',
      borderStyle: 'dashed',
      marginBottom: 24,
      gap: 8,
  },
  addMoreBtnText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#3c7d48',
  },
  toppingsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  toppingsToggleText: {
    fontSize: 12,
    color: '#3c7d48',
    fontWeight: '600',
  },
  toppingsList: {
    marginTop: 4,
    paddingLeft: 4,
    gap: 2,
  },
  toppingItemText: {
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 16,
  },
  editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: '#f0fdf4',
      borderRadius: 6,
  },
  editText: {
      fontSize: 12,
      color: '#3c7d48',
      fontWeight: '600',
  },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  modeToggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeToggleActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeToggleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  modeToggleTextActive: {
    color: '#1f2937',
  },
  savingsCornerSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  savingsCornerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  promoInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  promoInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  applyBtn: {
    backgroundColor: '#3c7d48',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 10,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  savingsOfferRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  savingsOfferIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  savingsOfferContent: {
    flex: 1,
    marginRight: 12,
  },
  savingsOfferTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    paddingRight: 16,
  },
  savingsOfferTitle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    lineHeight: 20,
    flex: 1,
    marginRight: 4,
  },
  savingsOfferSubtitle: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 0,
  },
  offerTypeBadge: {
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  offerTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3c7d48',
  },
  savingsOfferDescription: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 16,
  },
  savingsApplyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  savingsApplyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
    flex: 1,
  },
  savingsAppliedBtn: {
    borderColor: '#3c7d48',
    backgroundColor: '#f0fdf4',
  },
  savingsAppliedBtnText: {
    color: '#3c7d48',
  },
  selectedOfferRow: {
    backgroundColor: '#f8fafc',
  },
  selectedStatusText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  savingsSelectedBtn: {
    backgroundColor: '#f1f5f9',
    borderColor: '#64748b',
  },
  savingsSelectedBtnText: {
    color: '#64748b',
  },
  savingsOfferAction: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  removeOfferBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  removeOfferBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  statusIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusIndicatorText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  appliedIndicator: {
    backgroundColor: '#f0fdf4',
  },
  appliedIndicatorText: {
    color: '#3c7d48',
  },
  selectedIndicator: {
    backgroundColor: '#f1f5f9',
  },
  selectedIndicatorText: {
    color: '#64748b',
  },
  promoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promoRemoveBtn: {
    padding: 2,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
  },
  viewAllOffersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9ca3af',
    marginLeft: 16,
    marginTop: 16,
    gap: 6,
  },
  viewAllOffersText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  noOffersText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  soonBadge: {
    position: 'absolute',
    top: 2,
    right: 6,
    backgroundColor: '#ffbe33',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  soonBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#000',
  },

});

export default CartScreen;
