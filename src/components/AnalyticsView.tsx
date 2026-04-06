import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ScatterChart, 
  Scatter, 
  ZAxis,
  LabelList
} from 'recharts';
import type { Scenario } from '../engine/RouteOptimizer';
import { useCurrency } from '../hooks/useCurrency';
import { Brain, DollarSign, Clock, TrendingUp } from 'lucide-react';

interface Props {
  scenarios: Scenario[];
}

export const AnalyticsView: React.FC<Props> = ({ scenarios }) => {
  const { format, currency } = useCurrency();

  const chartData = scenarios.map(s => ({
    name: s.name,
    cost: s.totalCost,
    time: s.totalTime,
    risk: s.totalRisk,
    confidence: s.confidence * 100
  }));

  // Sort by cost for the bar chart
  const sortedByCost = [...chartData].sort((a, b) => a.cost - b.cost);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, width: '100%', animation: 'fadeIn 0.4s ease-out' }}>
      {/* Insight Panel */}
      <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.02) 100%)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ background: 'var(--accent-primary)', padding: 10, borderRadius: 12 }}>
               <Brain size={24} color="white" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>Intelligent Strategic Analysis</h3>
         </div>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { icon: TrendingUp, label: 'Optimization Vector', val: 'Efficiency Focus', desc: 'Favoring routes that balance transit security with fuel economy.' },
              { icon: DollarSign, label: 'Cost Sensitivity', val: 'Variable (Moderate)', desc: 'Higher transit speeds correlate with a ~35% premium on freight rates.' },
              { icon: Clock, label: 'Time Tradeoff', val: 'Preemptive Load-balancing', desc: 'Slower routes currently exhibit higher stability in the Pacific corridor.' }
            ].map((insight, i) => (
              <div key={i} style={{ display: 'flex', gap: 16 }}>
                 <insight.icon size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: 4 }} />
                 <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{insight.label}: {insight.val}</div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{insight.desc}</p>
                 </div>
              </div>
            ))}
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, height: '480px' }}>
        {/* Cost Comparison Bar Chart */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
           <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 32, textTransform: 'uppercase', letterSpacing: 1 }}>Cost Efficiency Matrix</h4>
           <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedByCost} margin={{ top: 20, right: 30, left: 24, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-muted)" 
                    fontSize={11} 
                    fontWeight={600}
                    tickFormatter={(val) => val.split(' ')[0]} 
                    dy={12}
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    fontSize={11} 
                    fontWeight={600}
                    tickFormatter={(val) => `${currency.symbol}${val/1000}k`} 
                  />
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: 'none', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                    itemStyle={{ color: '#000', fontSize: 12, fontWeight: 700 }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    formatter={(val: any) => [format(Number(val)), 'Estimated Cost']}
                  />
                  <Bar dataKey="cost" radius={[6, 6, 0, 0]} name="Total Estimated Cost">
                    {sortedByCost.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-emerald)' : 'var(--accent-primary)'} />
                    ))}
                    <LabelList dataKey="cost" position="top" fill="var(--text-secondary)" fontSize={11} fontWeight={700} formatter={(val: any) => `${currency.symbol}${(Number(val)/1000).toFixed(1)}k`} dy={-10} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Time-Cost Scatter Tradeoff */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
           <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 32, textTransform: 'uppercase', letterSpacing: 1 }}>Transit Strategy: Time vs Cost</h4>
           <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 30, right: 120, left: 32, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    type="number" 
                    dataKey="time" 
                    name="Transit Days" 
                    unit="days" 
                    stroke="var(--text-muted)" 
                    fontSize={11} 
                    fontWeight={700}
                    domain={['auto', 'auto']}
                    dy={12}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="cost" 
                    name="Estimated Cost" 
                    stroke="var(--text-muted)" 
                    fontSize={11} 
                    fontWeight={700}
                    tickFormatter={(val) => `${currency.symbol}${(val / 1000).toFixed(0)}k`}
                    dx={-8}
                  />
                  <ZAxis dataKey="confidence" type="number" range={[150, 600]} name="Confidence Rating" unit="%" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3', stroke: 'var(--accent-primary)', strokeWidth: 1 }} 
                    contentStyle={{ 
                      background: '#0f172a', 
                      border: '1px solid var(--border-bright)', 
                      borderRadius: 12, 
                      boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                      padding: '12px 16px' 
                    }}
                    itemStyle={{ color: '#fff', fontSize: 12, fontWeight: 700 }}
                    formatter={(val: any, name: any) => name === 'Estimated Cost' ? [format(Number(val)), name] : [`${val}%`, name]}
                  />
                  <Scatter name="Transit Scenarios" data={chartData}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.time < 5 ? 'var(--accent-rose)' : 'var(--accent-cyan)'} fillOpacity={0.8} stroke="#fff" strokeWidth={1} />
                    ))}
                    <LabelList 
                      dataKey="name" 
                      position="right" 
                      offset={15}
                      fill="#fff" 
                      fontSize={11} 
                      fontWeight={800} 
                      style={{ 
                        textShadow: '0 0 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)',
                        pointerEvents: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }} 
                    />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};
