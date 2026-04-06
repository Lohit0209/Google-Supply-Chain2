import React from 'react';
import { 
  ShieldAlert, 
  Wind, 
  MapPin, 
  Activity, 
  Globe, 
  Clock, 
  ShieldCheck,
  TrendingUp,
  Triangle,
  Zap,
  Radio
} from 'lucide-react';
import type { Scenario } from '../engine/RouteOptimizer';

interface Props {
  scenarios: Scenario[];
  news: any[];
  globalRisk: number;
}

export const RiskAlertsView: React.FC<Props> = ({ globalRisk }) => {
  const alerts = [
    { type: 'WEATHER', severity: 'HIGH', title: 'Tactical weather disruption in East China Sea', impact: 'Re-vectoring Required', icon: Wind, time: 'LIVE', desc: 'Category 3 weather pattern causing 300km exclusion zones around Shanghai.' },
    { type: 'NETWORK', severity: 'MED', title: 'Port Congestion: Los Angeles Terminal', impact: '48h Latency Buffer', icon: MapPin, time: '14m ago', desc: 'Elevated vessel berthing queues at NJ terminal resulting in tactical re-routing fees.' },
    { type: 'GEO', severity: 'HIGH', title: 'Sanctions / Tariffs: New Verification Protocol', impact: 'Financial Premium Applied', icon: Globe, time: '1h ago', desc: 'Updated trade compliance parameters for industrial components in the target corridor.' },
  ];

  return (
    <div className="grid-gap" style={{ gridTemplateColumns: 'minmax(400px, 1fr) 380px', width: '100%', animation: 'fadeIn 0.4s ease-out' }}>
      {/* Intelligence Command Center */}
      <div className="card" style={{ padding: 40, display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, var(--bg-surface), #0a0a0f)', border: '1px solid var(--border-bright)' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
               <div style={{ background: 'var(--accent-rose)', padding: 12, borderRadius: 12, boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}>
                  <ShieldAlert size={24} color="white" />
               </div>
               <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Mission Safety Intelligence</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>PREEMPTIVE_THREAT_MONITORING: ON</p>
               </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', padding: '12px 24px', borderRadius: 12, border: '1px solid var(--border-dim)' }}>
               <Radio size={14} color="var(--accent-emerald)" className="pulse-slow" />
               <div style={{ fontSize: 11, fontWeight: 800 }}>LIVE_TELEMETRY_SYNC</div>
            </div>
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto', paddingRight: 12 }}>
            {alerts.map((alert, i) => (
              <div key={i} style={{ display: 'flex', gap: 24, padding: 24, borderRadius: 16, background: alert.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)', border: `1px solid ${alert.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`, transition: 'all 0.2s', cursor: 'default' }}>
                 <div style={{ background: 'var(--bg-deep)', padding: 14, borderRadius: 12, alignSelf: 'flex-start', border: '1px solid var(--border-dim)' }}>
                    <alert.icon size={22} color={alert.severity === 'HIGH' ? 'var(--accent-rose)' : 'var(--accent-amber)'} />
                 </div>
                 <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                       <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{alert.title}</div>
                       <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>{alert.time}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                       <div className="badge" style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-dim)', color: '#fff', fontSize: 9, fontWeight: 900 }}>{alert.type}</div>
                       <div style={{ fontSize: 11, fontWeight: 900, color: alert.severity === 'HIGH' ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                         PREEMPTIVE_IMPACT: {alert.impact.toUpperCase()}
                       </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{alert.desc}</p>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Global Vulnerability Analytics */}
      <div className="grid-gap" style={{ gridTemplateRows: 'auto 1fr' }}>
         <div className="card" style={{ padding: 32, background: 'var(--bg-deep)', border: '1px solid var(--border-dim)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
               <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Global Resilience Index</div>
               <Zap size={16} color="var(--accent-cyan)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 24 }}>
               <div style={{ fontSize: 44, fontWeight: 900, color: '#fff' }}>{(globalRisk * 10).toFixed(1)}</div>
               <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: 8 }}>
                  <TrendingUp size={16} /> TR-DELTA: +0.42
               </div>
            </div>
            <div style={{ height: 6, background: 'var(--border-dim)', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
               <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${globalRisk * 10}%`, background: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }} />
            </div>
            <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, fontWeight: 500 }}>
               Aggregated volatility engine detected <strong>extreme fragility</strong> in the South Pacific corridor. Decision confidence adjusted.
            </p>
         </div>

         <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 900, marginBottom: 32, textTransform: 'uppercase', letterSpacing: 1 }}>Decision Integrity Matrix</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
               {[
                 { label: 'Carrier Stability', val: '98.1%', icon: ShieldCheck, col: 'var(--accent-emerald)' },
                 { label: 'Vector Volatility', val: 'MODERATE', icon: Activity, col: 'var(--accent-amber)' },
                 { label: 'Tactical Redundancy', val: 'LEVEL-4', icon: Zap, col: 'var(--accent-cyan)' },
                 { label: 'ETA Variance', val: 'LOW_SIGMA', icon: Clock, col: 'var(--accent-emerald)' }
               ].map(item => (
                 <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-dim)', paddingBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                       <div style={{ background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 10 }}>
                          <item.icon size={18} color={item.col} />
                       </div>
                       <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 900, fontFamily: 'monospace', color: '#fff' }}>{item.val}</span>
                 </div>
               ))}
            </div>
            <div style={{ marginTop: 'auto', background: 'rgba(99, 102, 241, 0.08)', padding: 24, borderRadius: 16, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Triangle size={14} fill="var(--accent-primary)" stroke="none" />
                  <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: 1 }}>RESILIENCE_CORE_STATUS</div>
               </div>
               <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  The network transition architecture is operating in <strong>high-availability</strong> state. Multi-mode contingency buffers have been pre-allocated to all tactical vectors.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};
