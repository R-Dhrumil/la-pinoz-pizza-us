import apiClient from './apiClient';

export interface Product {
    id: number;
    name: string;
    description: string;
    basePrice: number;
    imageUrl: string;
    isVeg: boolean;
    isBestseller: boolean;
    subcategoryId?: number;
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
