import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { Scenario } from '../engine/RouteOptimizer';
import { motion } from 'framer-motion';
import { useCurrency } from '../hooks/useCurrency';

interface Props {
  scenarios: Scenario[];
  onSelect: (s: Scenario) => void;
  selectedId: string | null;
}

export const ScenarioComparison: React.FC<Props> = ({ scenarios, onSelect, selectedId }) => {
  const { format } = useCurrency();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
      {scenarios.map((s, idx) => (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
          key={idx}
          onClick={() => onSelect(s)}
          className={`card ${selectedId === s.name ? 'card-active' : ''}`}
          style={{ 
            cursor: 'pointer', 
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            position: 'relative',
            height: '140px',
            padding: '16px',
            border: selectedId === s.name ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-dim)',
            background: selectedId === s.name ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {s.isRecommended && (
            <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-primary)', color: 'white', padding: '2px 10px', borderRadius: 4, fontSize: 8, fontWeight: 900, whiteSpace: 'nowrap', border: '1px solid var(--bg-deep)', zIndex: 10, letterSpacing: '0.05em' }}>
              RECOMMENDED
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: 9, fontWeight: 900, margin: 0, textTransform: 'uppercase', color: selectedId === s.name ? 'var(--accent-primary)' : 'var(--text-label)', letterSpacing: '0.05em' }}>
                  {s.name}
                </h3>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 8, fontWeight: 900, color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: 2 }}>{s.segments[0].carrier.name}</span>
                <span className="badge badge-primary" style={{ fontSize: 7, padding: '1px 6px', opacity: 0.8 }}>{s.modality}</span>
             </div>
             <div style={{ fontSize: 9, color: 'var(--text-label)', lineHeight: 1.3, marginTop: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
               {s.rationale}
             </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-label)', fontSize: 8, fontWeight: 800 }}>TRANSIT_ETA</span>
              <span style={{ fontWeight: 900, fontSize: 11, fontFamily: 'monospace' }}>{s.totalTime}D</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-label)', fontSize: 8, fontWeight: 800 }}>MISSION_COST_RANGE</span>
              <span style={{ fontWeight: 900, fontSize: 10, color: 'var(--accent-emerald)', fontFamily: 'monospace' }}>
                {format(s.totalCostRange[0])} – {format(s.totalCostRange[1])}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={10} color="var(--accent-emerald)" />
                  <span style={{ color: 'var(--text-label)', fontSize: 7, fontWeight: 900 }}>CONFIDENCE</span>
               </div>
               <span style={{ fontWeight: 900, fontSize: 8, color: s.confidence > 0.9 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                 {Math.round(s.confidence * 100)}%
               </span>
            </div>
          </div>

          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ height: 2, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${s.totalRisk}%`, 
                  background: s.totalRisk < 40 ? 'var(--accent-emerald)' : s.totalRisk < 70 ? 'var(--accent-amber)' : 'var(--accent-rose)',
                  boxShadow: `0 0 8px ${s.totalRisk < 40 ? 'var(--accent-emerald)' : 'var(--accent-amber)'}`
                }} />
             </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
