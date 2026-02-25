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
    dateOfBirth?: string;
    gender?: string;
    anniversary?: string;
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

    getProfile: async (id: number | string) => {
        const response = await apiClient.get(`/User/profile/${id}`);
        return response.data;
    },
    
    verifyOtp: async (phone: string, otp: string) => {
        const response = await apiClient.post('/auth/verify-otp', { phone, otp });
        return response.data;
    },

    updateProfile: async (data: UpdateProfileParams) => {
        // Convert date strings to full ISO 8601 format (e.g. 2000-01-15T00:00:00.000Z)
        const formatDate = (dateStr?: string): string | null => {
            if (!dateStr) return null;
            try {
                // If already in ISO format, return as-is
                if (dateStr.includes('T')) return dateStr;
                // Convert YYYY-MM-DD to full ISO datetime
                return new Date(dateStr).toISOString();
            } catch {
                return null;
            }
        };

        const payload = {
            fullName: data.fullName || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
            gender: data.gender || '',
            dateOfBirth: formatDate(data.dateOfBirth),
            anniversary: formatDate(data.anniversary),
        };
        const response = await apiClient.post('/User/profile', payload);
        return response.data;
    }
};
