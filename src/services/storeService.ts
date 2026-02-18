import apiClient from './apiClient';
import { Store } from '../types';

const DUMMY_STORES: Store[] = [
   {
    id: 101,
    storeId: 'LP-AKSHAR',
    name: "La Pino'z Pizza - Akshar Chowk",
    city: "Vadodara",
    state: "Gujarat",
    // @ts-ignore
    address: "Gf 108/109, The Park, Near Akshar Chowk, Madhav Nagar, Akota",
    zipCode: "390020",
    phone: "+91-9876543210",
    image: "https://b.zmtcdn.com/data/pictures/chains/1/18602631/1e9386343e9366db5e1176540d5e9f4a.jpg",
    status: "Open",
    operatingHours: [],
    latitude: 22.2885,
    longitude: 73.1610,
  },
  {
    id: 102,
    storeId: 'LP-BHAYLI',
    name: "La Pino'z Pizza - Bhayli",
    city: "Vadodara",
    state: "Gujarat",
    // @ts-ignore
    address: "Shop 1-4, Ground Floor, Gangotri Icon, Near Nilamber Char Rasta, Vasna Bhayli Road, Bhayli",
    zipCode: "391410",
    phone: "+91-9876543211",
    image: "https://b.zmtcdn.com/data/pictures/chains/1/18602631/1e9386343e9366db5e1176540d5e9f4a.jpg",
    status: "Open",
    operatingHours: [],
    latitude: 22.2850,
    longitude: 73.1360
  },
  {
    id: 103,
    storeId: 'LP-MANJALPUR',
    name: "La Pino'z Pizza - Manjalpur",
    city: "Vadodara",
    state: "Gujarat",
    // @ts-ignore
    address: "Shop 1, 2 Ground Floor, Platinum Hub, Near Tulsidham Char Rasta, Manjalpur",
    zipCode: "390011",
    phone: "+91-9876543212",
    image: "https://b.zmtcdn.com/data/pictures/chains/1/18602631/1e9386343e9366db5e1176540d5e9f4a.jpg",
    status: "Open",
    operatingHours: [],
    latitude: 22.2740,
    longitude: 73.1815
  },
  {
    id: 104,
    storeId: 'LP-ISELIN',
    name: "La Pino'z Pizza - Iselin",
    city: "Iselin",
    state: "NJ",
    // @ts-ignore
    address: "123 Green Street, Iselin, NJ 08830",
    zipCode: "08830",
    phone: "+1-732-555-0199",
    image: "https://b.zmtcdn.com/data/pictures/chains/1/18602631/1e9386343e9366db5e1176540d5e9f4a.jpg",
    status: "Open",
    operatingHours: [],
    latitude: 40.5754,
    longitude: -74.3213
  }
];

 
export const storeService = {
  getAllStores: async (): Promise<Store[]> => {
    try {
      const response = await apiClient.get('/storelocations');
      return [...response.data, ...DUMMY_STORES];
    } catch (error) {
      console.error('Error fetching stores:', error);
      return DUMMY_STORES;
    }
  },
};
