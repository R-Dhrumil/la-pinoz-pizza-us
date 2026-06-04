import apiClient from './apiClient';

export interface StoreTax {
  id: number;
  storeId: number;
  taxName: string;
  percentage: number;
  appliesToDeliveryFee: boolean;
  appliesToPackagingFee: boolean;
  isActive: boolean;
  categoryIds: number[];
}

export const taxService = {
  getActiveStoreTaxes: async (storeId: number): Promise<StoreTax[]> => {
    try {
      const response = await apiClient.get<StoreTax[]>(`/StoreTaxes/${storeId}/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active store taxes:', error);
      return [];
    }
  }
};
