export const SUPPORTED_CURRENCIES = [
    // Base currency (Paystack)
    { code: 'NGN', name: 'Nigeria (Naira)', symbol: '₦', flag: '🇳🇬' },

    // International
    { code: 'USD', name: 'United States (Dollar)', symbol: '$', flag: '🇺🇸' },
    { code: 'GBP', name: 'United Kingdom (Pound)', symbol: '£', flag: '🇬🇧' },
    { code: 'EUR', name: 'Europe (Euro)', symbol: '€', flag: '🇪🇺' },

    // African currencies supported by Flutterwave
    { code: 'GHS', name: 'Ghana (Cedi)', symbol: 'GH₵', flag: '🇬🇭' },
    { code: 'KES', name: 'Kenya (Shilling)', symbol: 'KSh', flag: '🇰🇪' },
    { code: 'ZAR', name: 'South Africa (Rand)', symbol: 'R', flag: '🇿🇦' },
    { code: 'UGX', name: 'Uganda (Shilling)', symbol: 'USh', flag: '🇺🇬' },
    { code: 'TZS', name: 'Tanzania (Shilling)', symbol: 'TSh', flag: '🇹🇿' },
    { code: 'RWF', name: 'Rwanda (Franc)', symbol: 'FRw', flag: '🇷🇼' },
    { code: 'XAF', name: 'Central Africa (CFA Franc)', symbol: 'FCFA', flag: '🇨🇲' },
    { code: 'XOF', name: 'West Africa (CFA Franc)', symbol: 'CFA', flag: '🇸🇳' },
    { code: 'ZMW', name: 'Zambia (Kwacha)', symbol: 'ZK', flag: '🇿🇲' },
    { code: 'MWK', name: 'Malawi (Kwacha)', symbol: 'MK', flag: '🇲🇼' },
    { code: 'EGP', name: 'Egypt (Pound)', symbol: 'E£', flag: '🇪🇬' },
];

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];
