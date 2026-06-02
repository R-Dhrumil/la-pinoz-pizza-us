import apiClient from './apiClient';

export interface ContactFormParams {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export const contactService = {
    submitContactForm: async (data: ContactFormParams) => {
        const response = await apiClient.post('/Contact', data);
        return response.data;
    }
};
