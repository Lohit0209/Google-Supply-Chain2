import React, { useState, useRef, useEffect } from 'react';
import { useCurrency, CURRENCIES, type CurrencyCode } from '../../hooks/useCurrency';
import { ChevronDown, RefreshCw } from 'lucide-react';

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, lastUpdated, isLoading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFlag = (code: CurrencyCode) => {
    switch (code) {
      case 'USD': return '🇺🇸';
      case 'INR': return '🇮🇳';
      case 'EUR': return '🇪🇺';
      case 'GBP': return '🇬🇧';
      default: return '🌐';
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-dim)',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          height: '36px'
        }}
        className="currency-btn"
      >
        <span style={{ fontSize: 16 }}>{getFlag(currency.code)}</span>
        <span style={{ fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>{currency.code}</span>
        <ChevronDown size={14} color="var(--text-label)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '200px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-dim)',
          borderRadius: '12px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
          zIndex: 1000,
          overflow: 'hidden',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-dim)', fontSize: 8, fontWeight: 900, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Select Base Currency
          </div>
          
          {Object.values(CURRENCIES).map((curr) => (
            <button
              key={curr.code}
              onClick={() => {
                setCurrency(curr.code);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: currency.code === curr.code ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: '0.2s'
              }}
              className="currency-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 16 }}>{getFlag(curr.code)}</span>
                <div>
                   <div style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{curr.code}</div>
                   <div style={{ fontSize: 9, color: 'var(--text-label)' }}>{curr.label}</div>
                </div>
              </div>
              {currency.code === curr.code && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />}
            </button>
          ))}

          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-dim)', background: 'rgba(0,0,0,0.2)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-label)' }}>
                <RefreshCw size={10} className={isLoading ? 'spin' : ''} />
                <span style={{ fontSize: 8, fontWeight: 800 }}>
                  {isLoading ? 'SYNCING_RATES...' : `UPDATED: ${lastUpdated || 'RECENTLY'}`}
                </span>
             </div>
             <div style={{ fontSize: 7, color: 'var(--text-label)', opacity: 0.6, marginTop: 4 }}>
                Real-time conversion active
             </div>
          </div>
        </div>
      )}

      <style>{`
        .currency-btn:hover {
          background: rgba(255,255,255,0.06) !important;
          border-color: var(--accent-primary) !important;
        }
        .currency-item:hover {
          background: rgba(255,255,255,0.05) !important;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 2s linear infinite;
        }
      `}</style>
    </div>
  );
};
