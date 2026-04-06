import React, { useState } from 'react';
import { Truck, Ship, Plane, Clock, ShieldCheck, ChevronDown, ChevronUp, AlertTriangle, MapPin } from 'lucide-react';
import type { Scenario, RouteSegment } from '../engine/RouteOptimizer';
import { useCurrency } from '../hooks/useCurrency';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  scenario: Scenario;
  index: number;
  onSelect?: () => void;
  isSelected?: boolean;
}

export const RouteCard: React.FC<Props> = ({ scenario, index, onSelect, isSelected }) => {
  const { format, naturalize } = useCurrency();
  const [isExpanded, setIsExpanded] = useState(false);

  const getCarrierIcon = (mode: RouteSegment['mode']) => {
    switch (mode) {
      case 'air': return <Plane size={20} color="var(--accent-cyan)" />;
      case 'sea': return <Ship size={20} color="var(--accent-primary)" />;
      default: return <Truck size={20} color="var(--accent-emerald)" />;
    }
  };

  const tag = scenario.isRecommended ? 'Recommended' : 
              index === 0 ? 'Best Value' : 
              scenario.totalTime < 5 ? 'Fastest' : null;

  return (
    <div 
      className={`route-card ${isExpanded ? 'active' : ''}`} 
      onClick={() => {
        setIsExpanded(!isExpanded);
        onSelect?.();
      }}
      style={{
        border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-dim)',
        background: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-card)',
        position: 'relative'
      }}
    >
      {tag && (
        <div style={{ position: 'absolute', top: 0, right: 24, padding: '6px 16px', background: tag === 'Recommended' ? 'var(--accent-emerald)' : 'var(--accent-primary)', fontSize: 10, fontWeight: 800, color: '#fff', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
          {tag.toUpperCase()}
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px 140px 48px', alignItems: 'center', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getCarrierIcon(scenario.segments[0].mode)}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{scenario.segments[0].carrier.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{scenario.modality} Freight Service</div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Clock size={16} color="var(--text-secondary)" />
            <span style={{ fontSize: 20, fontWeight: 700 }}>{scenario.totalTime}d</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Transit Time</div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{format(scenario.totalCost)}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Est. Total Cost</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'end' }}>
          <div style={{ padding: '6px 12px', borderRadius: 99, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', fontSize: 10, fontWeight: 700 }}>
            {Math.round(scenario.confidence * 100)}% RELIABILITY
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid var(--border-dim)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
               {/* TIMELINE */}
               <div>
                  <h5 style={{ fontSize: 12, fontWeight: 700, marginBottom: 20, color: '#fff' }}>Shipment Timeline</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      { step: scenario.segments[0].from.city + ' Dispatch', time: 'Day 0', icon: MapPin },
                      { step: 'Global Transit', time: 'Day 1-' + (scenario.totalTime - 1), icon: Plane },
                      { step: 'Customs Clearance', time: 'Day ' + (scenario.totalTime - 1), icon: ShieldCheck },
                      { step: scenario.segments[0].to.city + ' Delivery', time: 'Day ' + scenario.totalTime, icon: Truck },
                    ].map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                         <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-dim)', border: '2px solid var(--accent-primary)' }} />
                         <div style={{ fontSize: 13, fontWeight: 500 }}>{step.step}</div>
                         <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{step.time}</div>
                      </div>
                    ))}
                  </div>
               </div>

               {/* COST BREAKDOWN */}
               <div>
                  <h5 style={{ fontSize: 12, fontWeight: 700, marginBottom: 20, color: '#fff' }}>Cost Breakdown</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'Freight Charges', val: scenario.segments[0].breakdown.freight, manifest: scenario.segments[0].breakdown.manifest.freight },
                      { label: 'Fuel & Surcharges', val: scenario.segments[0].breakdown.fuel, manifest: scenario.segments[0].breakdown.manifest.fuel },
                      { label: 'Carrier Handling', val: scenario.segments[0].breakdown.handling, manifest: scenario.segments[0].breakdown.manifest.handling },
                      { label: 'Customs & Duties', val: scenario.segments[0].breakdown.duties, manifest: scenario.segments[0].breakdown.manifest.duties },
                    ].map(item => (
                      <div key={item.label} style={{ borderBottom: '1px solid var(--border-dim)', paddingBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{item.label}</span>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>{format(item.val)}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {item.manifest.map((m, i) => (
                            <div key={i} style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.02em' }}>• {naturalize(m)}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 28 }}>
                    <button className="btn-pill" style={{ width: '100%' }}>SELECT ROUTE</button>
                  </div>
               </div>

               {/* RISK INTELLIGENCE (BLOOMBERG STYLE) */}
               <div style={{ gridColumn: 'span 2' }}>
                  <div className="risk-card risk-high">
                    <AlertTriangle size={24} color="var(--accent-rose)" style={{ marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Potential Routing Delay</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        Observed weather disruption + port congestion will likely add <span style={{ fontWeight: 700, color: 'var(--accent-rose)' }}>+2 days</span> to the expected delivery timeline.
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
