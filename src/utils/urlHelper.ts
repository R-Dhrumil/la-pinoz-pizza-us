/**
 * Generates a SkyTab ordering URL for a store.
 * Currently, this is specifically for the Richmond store as requested.
 * 
 * @param zipCode - The store's zip code
 * @param city - The store's city
 * @returns The SkyTab URL or undefined
 */
export const getSkyTabUrl = (zipCode?: string, city?: string): string | undefined => {
  // Logic for Richmond store (to be provided by user in the future)
  if (city?.toLowerCase() === 'richmond' || city?.toLowerCase().includes('richmond')) {
    // Placeholder URL for now
    return 'https://order.skytab.com/richmond-placeholder';
  }
  
  return undefined;
};
