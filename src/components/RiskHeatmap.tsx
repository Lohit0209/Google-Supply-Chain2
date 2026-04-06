import React from 'react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import type { RiskScore } from '../engine/RiskModeler';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Props {
  risk: RiskScore;
}

export const RiskHeatmap: React.FC<Props> = ({ risk }) => {
  if (!risk) return (
    <div style={{ height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: 24, border: '1.5px solid var(--border-dim)' }}>
      <span style={{ fontSize: 10, color: 'var(--text-label)', fontWeight: 800 }}>CALIBRATING_RISK_GEOMETRY...</span>
    </div>
  );

  const radarData = [
    { subject: 'OPERATIONAL', A: risk.operational, fullMark: 100 },
    { subject: 'ENVIRONMENT', A: risk.environmental, fullMark: 100 },
    { subject: 'GEOPOLITIC', A: risk.geopolitical, fullMark: 100 },
    { subject: 'PRODUCT_SENS', A: risk.cargoSpecific, fullMark: 100 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
      <div style={{ height: 340, background: 'rgba(0,0,0,0.3)', padding: 32, borderRadius: 24, border: '1.5px solid var(--border-dim)' }}>
        <h4 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 32 }}>NETWORK_RISK_GEOMETRY</h4>
        <ResponsiveContainer width="100%" height="85%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-label)', fontSize: 9, fontWeight: 800 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Risk" dataKey="A" stroke="var(--accent-primary)" strokeWidth={3} fill="var(--accent-primary)" fillOpacity={0.15} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: 40 }}>
          <h4 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>COMPOSITE_INDEX</h4>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
             <span style={{ fontSize: 64, fontWeight: 900, color: risk.total > 60 ? 'var(--accent-rose)' : risk.total > 30 ? 'var(--accent-amber)' : 'var(--accent-emerald)', letterSpacing: '-0.06em', lineHeight: 0.8 }}>
               {risk.total}
             </span>
             <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-label)' }}>/100 RISK_WEIGHT</span>
          </div>
        </div>

        <h4 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 20 }}>EXECUTION_ALERTS</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {risk.breakdown.length > 0 ? (
            risk.breakdown.map((b, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="badge"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 14, border: '1.5px solid var(--border-dim)' }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-rose)', boxShadow: '0 0 10px var(--accent-rose)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{b.toUpperCase()}</span>
              </motion.div>
            ))
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 14, background: 'rgba(16, 185, 129, 0.05)', border: '1.5px solid var(--accent-emerald)' }}>
              <Check size={16} color="var(--accent-emerald)" />
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-emerald)' }}>ZERO_ANOMALIES_DETECTED</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
