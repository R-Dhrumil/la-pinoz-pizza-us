import apiClient from './apiClient';

// Offer type values match backend exactly: 'BXGY' | 'FlatOff' | 'PercentageOff'
export interface Offer {
    id: number;
    storeId?: number;
    globalOfferId?: number | null;
    offerType: 'BXGY' | 'FlatOff' | 'PercentageOff';
    categoryIds: number[];
    subcategoryIds: number[];
    sizes: string[];
    displayName: string;
    description?: string | null;
    offerCode: string;
    startDate: string;
    endDate: string;
    maxUsesPerOrder: number;
    maxUsesPerUser: number;
    totalRedemptions?: number | null;
    currentRedemptions: number;
    isActive: boolean;
    // BXGY
    buyX?: number | null;
    getY?: number | null;
    // FlatOff
    flatAmount?: number | null;
    minimumOrderValue?: number | null;
    // PercentageOff
    percentage?: number | null;
    minimumPurchase?: number | null;
    maxDiscountCap?: number | null;
    // Computed by backend per-user
    hasReachedMaxLimit?: boolean;
}

export interface CartValidateItem {
    productId: number;
    quantity: number;
    price: number;
    size?: string | null;
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
    /**
     * Fetch active offers for a specific store.
     * Uses /StoreOffers/{storeId}/active — store-specific, time-filtered, auth-aware.
     */
    getStoreOffers: async (storeId: number): Promise<Offer[]> => {
        try {
            const response = await apiClient.get(`/StoreOffers/${storeId}/active`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching store offers:', error);
            return [];
        }
    },

    /**
     * Validate one or more promo codes against current cart and store.
     * Backend handles all business logic: BXGY, FlatOff, PercentageOff, stacking rules.
     */
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

    /**
     * Returns a human-readable description for an offer type.
     */
    getOfferDescription: (offer: Offer): string => {
        if (offer.offerType === 'BXGY') {
            return `Buy ${offer.buyX}, Get ${offer.getY} free`;
        }
        if (offer.offerType === 'FlatOff') {
            let desc = `$${(offer.flatAmount ?? 0).toFixed(2)} off`;
            if (offer.minimumOrderValue) desc += ` (min $${offer.minimumOrderValue.toFixed(2)})`;
            return desc;
        }
        if (offer.offerType === 'PercentageOff') {
            let desc = `${offer.percentage ?? 0}% off`;
            if (offer.maxDiscountCap) desc += ` (up to $${offer.maxDiscountCap.toFixed(2)})`;
            if (offer.minimumPurchase) desc += ` (min $${offer.minimumPurchase.toFixed(2)})`;
            return desc;
        }
        return offer.description ?? '';
    },
};
