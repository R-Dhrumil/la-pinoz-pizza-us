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
    isVeg: boolean | null;
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


let cachedCategories: Record<number, Category[]> = {};
let categoryPromises: Record<number, Promise<Category[]> | undefined> = {};

export const categoryService = {
  getCategories: async (storeId: number): Promise<Category[]> => {
    if (cachedCategories[storeId]) return cachedCategories[storeId];
    if (categoryPromises[storeId]) return categoryPromises[storeId];

    categoryPromises[storeId] = apiClient.get('/Categories', {
      params: { storeId },
    })
      .then(response => {
        cachedCategories[storeId] = response.data;
        return response.data;
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        delete categoryPromises[storeId]; // allow retry on error
        return [];
      });

    return categoryPromises[storeId];
  },
  clearCache: () => {
    cachedCategories = {};
    categoryPromises = {};
  }
};
