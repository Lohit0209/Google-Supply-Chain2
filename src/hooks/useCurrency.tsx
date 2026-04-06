import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP';

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', label: 'US Dollar' },
  INR: { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound' },
};

interface CurrencyContextType {
  currency: CurrencyInfo;
  setCurrency: (code: CurrencyCode) => void;
  rates: Record<string, number>;
  convert: (amount: number, from?: string, to?: string) => number;
  format: (amount: number, options?: { showBase?: boolean; precision?: number }) => string;
  naturalize: (text: string) => string; // New helper for inline prices in strings
  isLoading: boolean;
  lastUpdated: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD');
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1, INR: 83.3, EUR: 0.92, GBP: 0.79 });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    // Detect default currency based on timezone/locale
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('Asia/Kolkata') || tz.includes('India')) {
      setCurrencyCode('INR');
    } else if (tz.includes('Europe')) {
      if (tz.includes('London')) setCurrencyCode('GBP');
      else setCurrencyCode('EUR');
    }

    const fetchRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data.rates) {
          setRates(data.rates);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 3600000); // Update every hour
    return () => clearInterval(interval);
  }, []);

  const currency = CURRENCIES[currencyCode];

  const convert = (amount: number, from: string = 'USD', to: string = currencyCode) => {
    if (from === to) return amount;
    const usdAmount = from === 'USD' ? amount : amount / (rates[from] || 1);
    return usdAmount * (rates[to] || 1);
  };

  const format = (amount: number, options: { showBase?: boolean; precision?: number } = {}) => {
    const { showBase = false, precision = 0 } = options;
    const converted = convert(amount);
    
    const formatted = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(converted);

    if (showBase && currencyCode !== 'USD') {
      const usdFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
      return `${formatted} (~${usdFormatted})`;
    }

    return formatted;
  };

  const naturalize = (text: string) => {
    return text.replace(/\$([0-9.,]+)/g, (match, p1) => {
      const val = parseFloat(p1.replace(/,/g, ''));
      if (isNaN(val)) return match;
      const converted = convert(val);
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(converted);
    });
  };

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency: setCurrencyCode, 
        rates, 
        convert, 
        format, 
        naturalize,
        isLoading, 
        lastUpdated 
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
