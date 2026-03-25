import { storeService } from '../src/services/storeService';
import apiClient from '../src/services/apiClient';

jest.unmock('../src/services/storeService');
jest.mock('../src/services/apiClient', () => ({
  get: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
}));

describe('storeService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStores', () => {
    it('should return stores on successful API call', async () => {
      const mockStores = [
        { id: '1', name: 'Store A', latitude: 23, longitude: 72 },
        { id: '2', name: 'Store B', latitude: 19, longitude: 73 },
      ];
      
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockStores });

      const stores = await storeService.getAllStores();

      expect(apiClient.get).toHaveBeenCalledWith('/storelocations');
      expect(stores).toEqual(mockStores);
    });

    it('should return empty array and log error on API failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

      const stores = await storeService.getAllStores();

      expect(apiClient.get).toHaveBeenCalledWith('/storelocations');
      expect(stores).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching stores:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
});
