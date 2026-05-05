import apiClient from './apiClient';

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  isActive: boolean;
  displayOrder: number;
}

export const bannerService = {
  getActiveBanners: async (): Promise<Banner[]> => {
    const response = await apiClient.get('/Banners/active');
    return response.data;
  }
};
