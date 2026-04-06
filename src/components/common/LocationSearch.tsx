import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plane, Ship, Loader2 } from 'lucide-react';
import { Geocoder } from '../../utils/geocoder';
import type { Hub } from '../../data/logisticsData';

interface Props {
  label: string;
  placeholder: string;
  initialValue: string;
  onSelect: (hub: Hub) => void;
  icon?: React.ReactNode;
}

export const LocationSearch: React.FC<Props> = ({ label, placeholder, initialValue, onSelect, icon }) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Hub[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2 && isOpen) {
        setIsLoading(true);
        const results = await Geocoder.fetchSuggestions(query);
        setSuggestions(results);
        setIsLoading(false);
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (hub: Hub) => {
    setQuery(hub.city);
    setIsOpen(false);
    onSelect(hub);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <label style={{ fontSize: 9, color: 'var(--text-label)', marginBottom: 8, display: 'block' }}>{label.toUpperCase()}</label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="search-input"
          style={{ paddingLeft: 48 }}
          placeholder={placeholder}
        />
        <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5, display: 'flex', alignItems: 'center' }}>
          {isLoading ? <Loader2 size={14} className="pulse" /> : icon}
        </div>
      </div>

      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div className="card" style={{ 
          position: 'absolute', 
          top: 'calc(100% + 4px)', 
          left: 0, 
          right: 0, 
          zIndex: 1000, 
          padding: 4, 
          maxHeight: 240, 
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-dim)'
        }}>
          {isLoading && suggestions.length === 0 && (
            <div style={{ padding: 12, fontSize: 10, color: 'var(--text-label)', textAlign: 'center' }}>
              SEARCHING_GLOBAL_HUBS...
            </div>
          )}
          {suggestions.map((hub) => (
            <button
              key={hub.id}
              onClick={() => handleSelect(hub)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'none',
                border: 'none',
                borderRadius: 4,
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'background 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <div style={{ 
                width: 24, 
                height: 24, 
                borderRadius: 4, 
                background: 'rgba(255,255,255,0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0 
              }}>
                {hub.type === 'air' ? <Plane size={12} color="var(--accent-cyan)" /> : 
                 hub.type === 'sea' ? <Ship size={12} color="var(--accent-primary)" /> : 
                 <MapPin size={12} color="var(--text-label)" />}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hub.city}</div>
                <div style={{ fontSize: 8, color: 'var(--text-label)', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hub.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
