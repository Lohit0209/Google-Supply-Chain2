import React, { useState, useRef, useEffect } from 'react';
import { Package, Calendar, ChevronDown, MapPin, Search } from 'lucide-react';
import { LocationSearch } from './common/LocationSearch';
import type { ShipmentParams } from '../engine/RiskModeler';
import { CurrencySelector } from './common/CurrencySelector';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  params: ShipmentParams;
  setParams: (p: ShipmentParams) => void;
  onSearch: () => void;
}

export const TopSearchBar: React.FC<Props> = ({ params, setParams, onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // CLICK OUTSIDE HANDLER
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  return (
    <div className="top-search-header">
      <div className="search-container">
        <div style={{ padding: '0 8px' }}>
          <CurrencySelector />
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border-dim)' }} />
        
        {/* ORIGIN */}
        <div className="search-input-wrapper">
          <LocationSearch 
            label="" 
            placeholder="From" 
            icon={<MapPin size={16} />}
            initialValue={params.originCity} 
            onSelect={(hub) => setParams({ ...params, originHub: hub, originCity: hub.city, originCountry: hub.country })} 
          />
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border-dim)' }} />

        {/* DESTINATION */}
        <div className="search-input-wrapper">
          <LocationSearch 
            label="" 
            placeholder="To" 
            icon={<MapPin size={16} />}
            initialValue={params.destCity} 
            onSelect={(hub) => setParams({ ...params, destHub: hub, destCity: hub.city, destCountry: hub.country })} 
          />
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border-dim)' }} />

        {/* SHIPMENT SIZE PRESETS (Quick Select) */}
        <div className="search-input-wrapper" ref={dropdownRef}>
          <Package size={16} />
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="search-input"
            style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span style={{ fontWeight: 600 }}>PRESET: {params.weight < 200 ? 'SMALL' : params.weight < 1000 ? 'MEDIUM' : 'LARGE'}</span>
            <ChevronDown size={14} style={{ marginLeft: 'auto' }} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div 
                className="dropdown-panel"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                {[
                  { id: 'small', label: 'SMALL (100kg)', w: 100 },
                  { id: 'medium', label: 'MEDIUM (500kg)', w: 500 },
                  { id: 'large', label: 'LARGE (2000kg)', w: 2000 }
                ].map((s) => (
                  <button 
                    key={s.id}
                    onClick={() => {
                      setParams({ ...params, weight: s.w });
                      setIsOpen(false);
                    }}
                    className={`dropdown-item ${params.weight === s.w ? 'active' : ''}`}
                  >
                    {s.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border-dim)' }} />

        {/* DATE PICKER */}
        <div className="search-input-wrapper">
          <Calendar size={16} />
          <input 
            type="date" 
            value={params.deliveryDeadline}
            onChange={(e) => setParams({ ...params, deliveryDeadline: e.target.value })}
            className="search-input"
          />
        </div>

        <button className="btn-search" onClick={onSearch}>
          <Search size={16} />
        </button>
      </div>

    </div>
  );
};
