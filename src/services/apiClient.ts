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
        console.log("Token: ", token);

        console.log(`[API Request] Method: ${config.method?.toUpperCase()} URL: ${config.url}`);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("[API Request] Token present");
        } else {
            console.warn("[API Request] No token found - request might fail if auth required");
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
    (error) => {
        // Handle global errors (e.g., 401 Unauthorized)
        if (error.response && error.response.status === 401) {
            // TODO: dispatch logout action
        }
        return Promise.reject(error);
    }
);

export default apiClient;
