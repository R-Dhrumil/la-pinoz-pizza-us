import { Platform } from 'react-native';

export const LAYOUT = {
  TAB_BAR_HEIGHT_BASE_IOS: 55,
  TAB_BAR_HEIGHT_BASE_ANDROID: 60,
  FLOATING_CART_HEIGHT: 70,
};

export const PRICING = {
  TAX_RATE: 0.05,
  DELIVERY_FEE: 2.99,
};

export const getTabHeight = (insetsBottom: number) => {
  return Platform.OS === 'ios' 
    ? LAYOUT.TAB_BAR_HEIGHT_BASE_IOS + insetsBottom 
    : LAYOUT.TAB_BAR_HEIGHT_BASE_ANDROID + Math.max(insetsBottom, 0);
};
