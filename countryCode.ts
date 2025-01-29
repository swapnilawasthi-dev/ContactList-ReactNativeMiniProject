export interface CountryCode {
    name: string;
    code: string;
    flag: string;
    phoneLength: number;
  }
  
  export const countryCodes: CountryCode[] = [
    { name: 'United States', code: '+1', flag: '🇺🇸', phoneLength: 10 },
    { name: 'India', code: '+91', flag: '🇮🇳', phoneLength: 10 },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧', phoneLength: 10 },
    // You can add more countries as needed
  ];