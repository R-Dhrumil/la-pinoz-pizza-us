import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const BASE_URL = 'https://api.lapinozusa.com/api';
const BASE_URL = 'https://api.nsenterprise.net/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request Interceptor
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle global errors (e.g., 401 Unauthorized)
        if (error.response && error.response.status === 401) {
            // Clear stored user data
            await AsyncStorage.multiRemove(['userToken', 'userInfo']);
            // The app state will react to AuthContext changes if appropriately handled there
            // or we could use a navigation ref to jump to Login
        }
        return Promise.reject(error);
    }
);

export default apiClient;
