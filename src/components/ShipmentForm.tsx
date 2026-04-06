import React from 'react';
import { Package, Zap, AlertTriangle, ChevronRight, MapPin, Clock } from 'lucide-react';
import type { ShipmentParams } from '../engine/RiskModeler';
import { LocationSearch } from './common/LocationSearch';
import { useCurrency } from '../hooks/useCurrency';

interface Props {
  params: ShipmentParams;
  setParams: (p: ShipmentParams) => void;
  onOptimize: () => void;
}

export const ShipmentForm: React.FC<Props> = ({ params, setParams, onOptimize }) => {
  const { currency } = useCurrency();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;
    
    if (type === 'number') {
      val = value === '' ? 0 : Number(value);
    } else if ((e.target as HTMLInputElement).type === 'checkbox') {
      val = (e.target as HTMLInputElement).checked;
    }
    
    setParams({ ...params, [name]: val });
  };

  const setSensitivity = (val: number) => setParams({ ...params, sensitivity: val });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      <div className="card" style={{ padding: 24, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ background: 'var(--accent-primary)', padding: 8, borderRadius: 8 }}>
            <Zap size={16} color="white" />
          </div>
          <h2 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mission Setup</h2>
        </div>

        {/* LOGISTICS VECTOR */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-cyan)' }}><MapPin size={10} /> Logistics Terminal Pairs</label>
          
          <LocationSearch 
            label="Origin Terminal"
            placeholder="Search City, Airport or Port (e.g. Chennai)"
            initialValue={params.originCity}
            onSelect={(hub) => setParams({ 
              ...params, 
              originHub: hub, 
              originCity: hub.city, 
              originCountry: hub.country 
            })}
          />

          <LocationSearch 
            label="Destination Terminal"
            placeholder="Search City, Airport or Port (e.g. LAX)"
            initialValue={params.destCity}
            onSelect={(hub) => setParams({ 
              ...params, 
              destHub: hub, 
              destCity: hub.city, 
              destCountry: hub.country 
            })}
          />
        </section>

        {/* MISSION CONSTRAINTS */}
        <section>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-amber)' }}><Clock size={10} /> Strategic Constraints</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
            <div>
              <label>Delivery Deadline</label>
              <input type="date" name="deliveryDeadline" value={params.deliveryDeadline} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label>Strategic Drive Protocol</label>
              <select name="priority" value={params.priority} onChange={handleChange} className="input-field">
                <option value="balanced">Balanced Efficiency</option>
                <option value="time">Expedited Delivery</option>
                <option value="cost">Maximum Savings</option>
                <option value="risk">Enhanced Safety</option>
              </select>
            </div>
          </div>
        </section>

        {/* INVENTORY PROFILE */}
        <section>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-emerald)' }}>
            <Package size={10} /> Inventory Classification
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
             <div>
                <label title="Select the category that best matches your cargo type">Cargo Classification</label>
                <select name="itemType" value={params.itemType} onChange={handleChange} className="input-field">
                   <option value="electronics">Premium Electronics</option>
                   <option value="perishable">Cold Chain Perishables</option>
                   <option value="industrial">Heavy Equipment</option>
                   <option value="hazardous">Regulated Materials</option>
                </select>
             </div>

             <div>
                <label style={{ fontSize: 9, color: 'var(--text-label)', marginBottom: 8, display: 'block' }} title="Used for calculating duties, insurance, and risk exposure">Estimated Cargo Value ({currency.code})</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="number" 
                    name="cargoValue" 
                    value={params.cargoValue === 0 ? '' : params.cargoValue} 
                    onChange={handleChange} 
                    className="input-field" 
                    placeholder="e.g. 50000" 
                    style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, flexGrow: 1 }}
                  />
                  <div style={{ background: 'var(--border-dim)', padding: '12px 14px', borderRadius: '0 8px 8px 0', border: '1px solid var(--border-dim)', borderLeft: 'none', fontSize: 9, fontWeight: 900, color: 'var(--text-label)', minWidth: 50, textAlign: 'center' }}>
                    {currency.code}
                  </div>
                </div>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ fontSize: 9, color: 'var(--text-label)', marginBottom: 8, display: 'block' }} title="Total gross weight of the shipment">Weight (KG)</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      name="weight" 
                      value={params.weight === 0 ? '' : params.weight} 
                      onChange={handleChange} 
                      className="input-field" 
                      placeholder="Wt"
                      style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, flexGrow: 1 }}
                    />
                    <div style={{ background: 'var(--border-dim)', padding: '12px 10px', borderRadius: '0 8px 8px 0', border: '1px solid var(--border-dim)', borderLeft: 'none', fontSize: 9, fontWeight: 900, color: 'var(--text-label)', minWidth: 40, textAlign: 'center' }}>
                      KG
                    </div>
                  </div>
                </div>
             </div>

             <div style={{ paddingTop: 8 }}>
               <label style={{ fontSize: 9, marginBottom: 12, display: 'block', color: 'var(--text-label)' }} title="Sensitivity to handling shocks and environmental variance">Sensitivity Threshold</label>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                 {['LOW', 'MED', 'HIGH'].map((label, i) => {
                   const val = [0.2, 0.6, 0.9][i];
                   const isActive = params.sensitivity === val;
                   return (
                     <button key={label} onClick={() => setSensitivity(val)} className={`badge ${isActive ? 'badge-primary' : ''}`} style={{ cursor: 'pointer', border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-dim)', background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent', padding: '8px 0', opacity: isActive ? 1 : 0.6, fontSize: 8, fontWeight: 900 }}>
                       {label}
                     </button>
                   );
                 })}
               </div>
             </div>

             <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.05)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0, color: 'white', textTransform: 'none' }}>
                  <input type="checkbox" name="isHazardous" checked={params.isHazardous} onChange={handleChange} style={{ width: 12, height: 12, accentColor: 'var(--accent-rose)' }} />
                   <div>
                    <div style={{ fontSize: 10, fontWeight: 700 }}>Hazardous Cargo (IMO)</div>
                    <div style={{ fontSize: 7, color: 'var(--accent-rose)', fontWeight: 800 }}>REGULATORY ACTION REQUIRED</div>
                  </div>
                  <AlertTriangle size={12} color="var(--accent-rose)" style={{ marginLeft: 'auto' }} />
                </label>
              </div>
          </div>
        </section>
      </div>

      <button onClick={onOptimize} className="btn-premium" style={{ width: '100%', height: 48, flexShrink: 0 }}>
        Run Tactical Optimization
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
