import apiClient from './apiClient';

export interface Offer {
    id: number;
    storeId?: number;
    offerType: 'BXGY' | 'Flat' | 'Percentage';
    categoryIds: number[];
    subcategoryIds: number[];
    sizes: string[];
    displayName: string;
    description: string;
    offerCode: string;
    isActive: boolean;
    buyX?: number;
    getY?: number;
    flatAmount?: number;
    minimumOrderValue?: number;
    percentage?: number;
    maxDiscountCap?: number;
}

export interface CartValidateItem {
    productId: number;
    quantity: number;
    price: number;
    size?: string;
}

export interface ValidateOfferRequest {
    offerCodes: string[];
    storeId: number;
    cartItems: CartValidateItem[];
}

export interface AppliedPromo {
    code: string;
    discount: number;
    type: string;
}

export interface ValidateOfferResponse {
    isValid: boolean;
    errorMessage: string | null;
    discountAmount: number;
    appliedPromos: AppliedPromo[];
}

export const offerService = {
    getOffers: async (): Promise<Offer[]> => {
        try {
            const response = await apiClient.get('/Offers');
            return response.data;
        } catch (error) {
            console.error('Error fetching offers:', error);
            return [];
        }
    },

    validateOffer: async (payload: ValidateOfferRequest): Promise<ValidateOfferResponse> => {
        try {
            const response = await apiClient.post('/Offers/validate', payload);
            return response.data;
        } catch (error) {
            console.error('Error validating offer:', error);
            return {
                isValid: false,
                errorMessage: 'Failed to validate offer',
                discountAmount: 0,
                appliedPromos: []
            };
        }
    },

    getDiscountedPrice: (price: number, offers: Offer[], categoryId?: number, subcategoryId?: number): { discountedPrice: number, appliedOffer: Offer | null } => {
        let bestPrice = price;
        let bestOffer: Offer | null = null;

        offers.forEach(offer => {
            if (!offer.isActive) return;
            
            // Only apply automatic offers (those without a code) on the menu/detail screens
            if (offer.offerCode && offer.offerCode.trim() !== '') return;

            const isApplicable = 
                (categoryId && offer.categoryIds.includes(categoryId)) ||
                (subcategoryId && offer.subcategoryIds.includes(subcategoryId));

            if (isApplicable) {
                let currentPrice = price;
                if (offer.offerType === 'Percentage' && offer.percentage) {
                    currentPrice = price * (1 - offer.percentage / 100);
                } else if (offer.offerType === 'Flat' && offer.flatAmount) {
                    currentPrice = Math.max(0, price - offer.flatAmount);
                }

                if (currentPrice < bestPrice) {
                    bestPrice = currentPrice;
                    bestOffer = offer;
                }
            }
        });

        return { 
            discountedPrice: Number(bestPrice.toFixed(2)), 
            appliedOffer: bestOffer 
        };
    }
};
