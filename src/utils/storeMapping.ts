export const SKYTAB_URLS: Record<string, string> = {
  '08830': 'https://online.skytab.com/74c90cd0c42039a63cb846894fb4b028',
  '07306': 'https://online.skytab.com/f5d95accce8d11850e35c2c06208e1ab',
  '77407': 'https://online.skytab.com/8c9b4d9c593c4260b24ed8ffa4d7b278',
  '32750': 'https://online.skytab.com/d13818c5a4bfa29b3eeafbc05de5e0ae',
};

export const getSkyTabUrl = (zipCode?: string, city?: string): string | undefined => {
  if (zipCode && SKYTAB_URLS[zipCode]) {
    return SKYTAB_URLS[zipCode];
  }
  return undefined;
};
