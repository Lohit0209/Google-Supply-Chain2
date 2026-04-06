import { Filter, DollarSign, Clock, Shield, Box, Calculator } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';
import type { ShipmentParams } from '../engine/RiskModeler';

interface Props {
  budget: [number, number];
  setBudget: (range: [number, number]) => void;
  filters: any;
  setFilters: (f: any) => void;
  params: ShipmentParams;
  setParams: (p: ShipmentParams) => void;
  onRecalculate: () => void;
}

export const FilterSidebar: React.FC<Props> = ({ budget, setBudget, filters, setFilters, params, setParams, onRecalculate }) => {
  const { format, currency, convert } = useCurrency();

  // Local amount in the selected currency for the input field
  const localValue = Math.round(convert(params.cargoValue, 'USD', currency.code));

  return (
    <div className="filter-sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
        <Filter size={18} color="var(--accent-primary)" />
        <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Filters</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {/* Mode Segmented Control */}
        <div>
          <label>Transport Mode</label>
          <div className="segmented-control mt-1">
            {['Air', 'Ocean', 'Road'].map(mode => (
              <button 
                key={mode}
                onClick={() => {
                  const m = mode.toUpperCase();
                  const newModes = filters.modes.includes(m) ? filters.modes.filter((x: any) => x !== m) : [...filters.modes, m];
                  setFilters({ ...filters, modes: newModes });
                }}
                className={`segment-item ${filters.modes.includes(mode.toUpperCase()) ? 'active' : ''}`}
                style={{ flex: 1 }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Speed Segmented Control */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={12} /> Delivery Speed</label>
          <div className="segmented-control mt-1">
            {[
              { id: 'fast', label: '< 5d' },
              { id: 'mid', label: '5-15d' },
              { id: 'all', label: 'All' }
            ].map(s => (
              <button 
                key={s.id}
                onClick={() => setFilters({ ...filters, speed: s.id })}
                className={`segment-item ${filters.speed === s.id ? 'active' : ''}`}
                style={{ flex: 1 }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Slider */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <DollarSign size={12} color="var(--accent-emerald)" /> Budget Range: 
            <span style={{ color: '#fff', marginLeft: 'auto', fontWeight: 700 }}>{format(budget[1])}</span>
          </label>
          <div style={{ padding: '0 4px' }}>
            <input 
              type="range" 
              min="100" 
              max="50000" 
              step="500"
              value={budget[1]} 
              onChange={(e) => setBudget([100, Number(e.target.value)])}
              style={{ 
                width: '100%', 
                accentColor: 'var(--accent-primary)',
                background: 'var(--border-dim)',
                height: 4,
                borderRadius: 2,
                appearance: 'none',
                cursor: 'pointer'
              }} 
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 12, fontWeight: 600 }}>
              <span>{format(100)}</span>
              <span>{format(50000)}</span>
            </div>
          </div>
        </div>

        {/* Risk Level / Strategic Protocol */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={12} color="var(--accent-amber)" /> Strategic Risk Profile</label>
          <div className="segmented-control mt-1">
            {[
              { id: 'risk', label: 'Safety+' },
              { id: 'balanced', label: 'Stable' },
              { id: 'cost', label: 'Aggressive' }
            ].map(l => (
              <button 
                key={l.id}
                onClick={() => {
                  setParams({ ...params, priority: l.id as any });
                  setTimeout(onRecalculate, 0);
                }}
                className={`segment-item ${params.priority === l.id ? 'active' : ''}`}
                style={{ flex: 1 }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-dim)' }} />

        {/* Cargo Custom Profile is moved or weight-only */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Box size={14} color="var(--accent-cyan)" /> 
            Advanced Cargo Profile
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Total Weight</label>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>KG</span>
                 </div>
                 <input 
                   type="number" 
                   value={params.weight === 0 ? '' : params.weight} 
                   onChange={(e) => setParams({ ...params, weight: e.target.value === '' ? 0 : Number(e.target.value) })}
                   onBlur={onRecalculate}
                   className="search-input"
                   style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box' }}
                 />
              </div>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Cargo Value ({currency.code})</label>
                 </div>
                 <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>
                      {currency.symbol}
                    </div>
                    <input 
                      type="number" 
                      value={localValue === 0 ? '' : localValue} 
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        // Convert back to USD for the engine
                        const usdValue = convert(val, currency.code, 'USD');
                        setParams({ ...params, cargoValue: usdValue });
                      }}
                      onBlur={onRecalculate}
                      className="search-input"
                      style={{ width: '100%', padding: '8px 12px 8px 32px', boxSizing: 'border-box' }}
                    />
                 </div>
              </div>
              <button 
                onClick={onRecalculate} 
                className="btn-premium" 
                style={{ width: '100%', padding: '10px 0', fontSize: 12, marginTop: 8 }}
              >
                <Calculator size={14} /> Update Logistics Model
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};
