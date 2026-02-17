export interface Store {
  id: number;
  storeId: string;
  name: string;
  city: string;
  state: string;
  image?: string;
  address?: string;
  zipCode?: string;
  phone?: string;
  status?: string;
  operatingHours?: any[];
  latitude?: number;
  longitude?: number;
}
