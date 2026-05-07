import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { BASE_URL } from '@env';
import Toast from 'react-native-toast-message';
import { logger } from '../utils/logger';

const apiClient = axios.create({
    // baseURL: BASE_URL,
    baseURL: 'http://localhost:5066/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});


// console.log("=== CURRENT BASE_URL IS: ===", BASE_URL);

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
        // Handle global Network & Timeout Errors
        if (!error.response) {
            logger.error(error, 'apiClient Network Error');
            Toast.show({
                type: 'error',
                text1: 'Network Error',
                text2: 'Please check your internet connection.',
            });
        } 
        else {
            const status = error.response.status;
            
            // Handle Global 401 Unauthorized
            if (status === 401) {
                logger.warn('Unauthorized Access', error.response.data);
                await AsyncStorage.multiRemove(['userToken', 'userInfo']);
                Toast.show({
                    type: 'error',
                    text1: 'Session Expired',
                    text2: 'Please log in again.',
                });
            } 
            // Handle Global 500+ Server Errors
            else if (status >= 500) {
                logger.error(error, 'apiClient Server Error');
                Toast.show({
                    type: 'error',
                    text1: 'Server Error',
                    text2: 'Something went wrong on our end. Try again later.',
                });
            }
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;
