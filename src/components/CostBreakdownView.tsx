import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { Scenario } from '../engine/RouteOptimizer';
import { useCurrency } from '../hooks/useCurrency';
import { TrendingDown, TrendingUp, Info } from 'lucide-react';

interface Props {
  scenarios: Scenario[];
}

export const CostBreakdownView: React.FC<Props> = ({ scenarios }) => {
  const { format, currency } = useCurrency();

  const chartData = scenarios.map(s => {
    const b = s.segments[0].breakdown;
    return {
      name: s.name,
      freight: b.freight,
      fuel: b.fuel,
      duties: b.duties,
      handling: b.handling,
      total: s.totalCost,
      mode: s.modality
    };
  });

  // Calculate the most expensive and cheapest for delta analysis
  const sorted = [...chartData].sort((a, b) => a.total - b.total);
  const cheapest = sorted[0];
  const mid = sorted[1];
  const deltaValue = mid.total - cheapest.total;
  const deltaPercent = (deltaValue / cheapest.total) * 100;

  return (
    <div className="grid-gap" style={{ width: '100%', animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 320px', gap: 24, height: '400px' }}>
        {/* Delta Analysis Panel */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
           <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 32 }}>Scenario Variance Comparison</h4>
           <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: 24, bottom: 24 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis 
                    type="number"
                    stroke="var(--text-muted)" 
                    fontSize={11} 
                    fontWeight={600}
                    tickFormatter={(val) => `${currency.symbol}${val/1000}k`} 
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    stroke="var(--text-muted)" 
                    fontSize={11} 
                    fontWeight={600}
                    width={100}
                    tickFormatter={(val) => val.split(' ')[0]} 
                  />
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: 'none', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                    itemStyle={{ fontSize: 12, fontWeight: 700 }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    formatter={(val: any) => [format(Number(val)), 'Total Cost']}
                    labelStyle={{ color: '#000', fontWeight: 800, marginBottom: 8 }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="freight" stackId="a" fill="var(--accent-primary)" name="Freight" />
                  <Bar dataKey="fuel" stackId="a" fill="var(--accent-cyan)" name="Fuel" />
                  <Bar dataKey="duties" stackId="a" fill="var(--accent-amber)" name="Duties" />
                  <Bar dataKey="handling" stackId="a" fill="var(--accent-emerald)" name="Handling" />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Intelligence Breakdown Summary */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <Info size={16} color="var(--accent-primary)" />
              <div style={{ fontSize: 12, fontWeight: 700 }}>Variance Intelligence</div>
           </div>
           
           <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: 16, borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                 <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-primary)' }}>PRICE_DELTA</div>
                 <div style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>+{format(deltaValue)}</div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                 Option <span style={{ color: '#fff', fontWeight: 700 }}>{mid.name}</span> represents a <span style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>{deltaPercent.toFixed(1)}%</span> premium over the economical base.
              </p>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                 <TrendingDown size={14} color="var(--accent-emerald)" />
                 <div style={{ fontSize: 11, fontWeight: 600 }}>Economical scenario uses <strong>Global Sea Corridors</strong> to maximize fuel efficiency.</div>
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                 <TrendingUp size={14} color="var(--accent-rose)" />
                 <div style={{ fontSize: 11, fontWeight: 600 }}>Advanced routing uses <strong>Air Priority</strong>, which carries a 3.4x premium.</div>
              </div>
           </div>

           <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border-dim)' }}>
              <label style={{ marginBottom: 4 }}>Primary Cost Driver</label>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-cyan)' }}>International Air Freight</div>
           </div>
        </div>
      </div>

      {/* Itemized Cost Map */}
      <div className="card" style={{ padding: 24, background: 'var(--bg-surface)' }}>
         <h4 style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>MISSION_LEDGER_BREAKDOWN</h4>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {scenarios.map((s, i) => (
              <div key={i} style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-dim)' }}>
                 <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                    {s.name}
                    <span style={{ color: 'var(--accent-emerald)' }}>{format(s.totalCost)}</span>
                 </div>
                 {[
                   { l: 'Freight', v: s.segments[0].breakdown.freight, col: 'var(--accent-primary)' },
                   { l: 'Customs', v: s.segments[0].breakdown.duties, col: 'var(--accent-amber)' },
                   { l: 'Energy', v: s.segments[0].breakdown.fuel, col: 'var(--accent-cyan)' }
                 ].map(item => (
                   <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.l}</span>
                      <span style={{ fontWeight: 700 }}>{format(item.v)}</span>
                   </div>
                 ))}
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
