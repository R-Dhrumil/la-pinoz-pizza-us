import apiClient from './apiClient';

export interface ProductVariant {
    id: number;
    size: string;
    crust: string;
    price: number;
    productId: number;
}

export interface ModifierOptionPrice {
    id: number;
    size: string;
    price: number;
    modifierOptionId: number;
}

export interface ModifierOption {
    id: number;
    name: string;
    price: number;
    isDefault: boolean;
    modifierGroupId: number;
    priceOverrides?: ModifierOptionPrice[];
}

export interface ModifierGroup {
    id: number;
    name: string;
    description?: string;
    selectionType?: string; // e.g., "Single", "Multiple"
    minSelection: number;
    maxSelection: number;
    productId: number;
    modifierOptions: ModifierOption[];
}

export interface Product {
    id: number;
    name: string;
    description: string;
    basePrice: number;
    imageUrl: string;
    isVeg: boolean;
    isBestseller: boolean;
    subcategoryId?: number;
    variants?: ProductVariant[];
    modifierGroups?: ModifierGroup[];
    externalLink?: string
}

export interface Subcategory {
    id: number;
    name: string;
}

export interface Category {
  id: number;
  name: string;
  imageUrl: string;
  products: Product[];
  subcategories: Subcategory[];
}


export const categoryService = {
  getCategories: async (storeId: number): Promise<Category[]> => {
    try {
      const response = await apiClient.get('/Categories', {
        params: { storeId },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },
};
