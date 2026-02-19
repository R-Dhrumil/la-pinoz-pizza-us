import apiClient from './apiClient';

interface LoginParams {
    email?: string;
    phone?: string;
    password?: string;
    otp?: string;
}

interface SignupParams {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
}

interface UpdateProfileParams {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    dob?: string;
    gender?: string;
}

export const authService = {
    login: async (credentials: LoginParams) => {
        // Transform the request to match API expectations
        const requestBody = {
            emailOrPhone: credentials.email || credentials.phone,
            password: credentials.password
        };
        const response = await apiClient.post('/Auth/login', requestBody);
        return response.data;
    },

    register: async (userData: SignupParams) => {
        const response = await apiClient.post('/Auth/register', userData);
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },

    getProfile: async () => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },
    
    verifyOtp: async (phone: string, otp: string) => {
        const response = await apiClient.post('/auth/verify-otp', { phone, otp });
        return response.data;
    },

    updateProfile: async (data: UpdateProfileParams) => {
        const response = await apiClient.put('/auth/profile', data);
        return response.data;
    }
};
