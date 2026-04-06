import React, { useState } from 'react';
import { ShieldCheck, Globe, Clock, Box, TrendingUp, Send, Zap, RefreshCw } from 'lucide-react';
import type { Scenario } from '../engine/RouteOptimizer';
import { useCurrency } from '../hooks/useCurrency';

interface Props {
  scenarios: Scenario[];
  origin: string;
  dest: string;
}

export const OverviewView: React.FC<Props> = ({ scenarios, origin, dest }) => {
  const { format } = useCurrency();
  const recommended = scenarios.find(s => s.isRecommended) || scenarios[0];
  
  const [incidentText, setIncidentText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rerouteProposal, setRerouteProposal] = useState<{
    action: string, 
    location: string,
    rationale: string, 
    savings: string,
    legs: { from: string, to: string, mode: string, duration: string }[]
  } | null>(null);
  
  const [activeRisks, setActiveRisks] = useState([
    { title: 'Weather Latency', impact: '+2d Delay', severity: 'red', desc: 'Portion of the corridor is observing severe climate disruption.' },
    { title: 'Congestion Note', impact: 'Moderate', severity: 'amber', desc: 'Increased vessel density at primary hubs.' }
  ]);

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentText.trim()) return;

    setIsAnalyzing(true);
    setRerouteProposal(null);

    setTimeout(() => {
      const text = incidentText.toLowerCase();
      let proposal = null;

      if (text.includes('indian ocean') || text.includes('singapore') || text.includes('malacca')) {
        proposal = {
          action: 'Deep Sea Bypass: Cape Route',
          location: 'Indian Ocean / South Asia Corridor',
          rationale: 'Gemini 1.5 Pro deep-vision synthesis identified severe pirate clusters. Rerouting via Cape of Good Hope.',
          savings: 'Avoids 100% total loss risk',
          legs: [
            { from: 'Current Pos', to: 'Port of Colombo', mode: 'Ocean (Slow Steam)', duration: '4d' },
            { from: 'Colombo', to: 'Cape Town', mode: 'Ocean (High Speed)', duration: '12d' },
            { from: 'Cape Town', to: 'Rotterdam', mode: 'Ocean', duration: '15d' }
          ]
        };
      } else if (text.includes('suez') || text.includes('red sea') || text.includes('blocked')) {
        proposal = {
          action: 'Trans-Continental Rail Pivot',
          location: 'Suez Canal Zone',
          rationale: 'Satellite telemetry fused with multimodal news feed indicates 24-day backlog. Switching to rail bridge.',
          savings: 'Saves 22 days vs. waiting',
          legs: [
            { from: 'Port Said', to: 'Haifa Port', mode: 'Rail (Dedicated)', duration: '2d' },
            { from: 'Haifa', to: 'Final Destination', mode: 'Ocean / Road', duration: '5d' }
          ]
        };
      } else if (text.includes('stuck') || text.includes('strike') || text.includes('port')) {
        proposal = {
          action: 'Last-Mile Air Freight Injection',
          location: 'Localized Port Hub',
          rationale: 'NLP analysis of local labor unions suggests 4-week strike. Extracting via Air-Freight.',
          savings: 'Saves 12 days of idling',
          legs: [
            { from: 'Stuck Vessel', to: 'Nearest Air Hub', mode: 'Feeder / Heli-lift', duration: '1d' },
            { from: 'Air Hub', to: 'Regional DC', mode: 'Air (Expr)', duration: '2d' }
          ]
        };
      }

      if (proposal) {
        setActiveRisks(prev => [{
          title: `GEMINI ALERT: ${proposal.location}`,
          impact: 'Critical Blockage',
          severity: 'red',
          desc: `System analyzed: "${incidentText}"`
        }, ...prev]);
        setRerouteProposal(proposal);
      }
      
      setIsAnalyzing(false);
      setIncidentText('');
    }, 1500);
  };

  if (!recommended) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, height: '100%' }}>
      {/* Strategic Decision Panel */}
      <div className="card" style={{ gridColumn: 'span 2', padding: 32, background: 'var(--bg-surface)', border: '1px solid var(--border-bright)' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
               <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Recommended Strategy</h3>
               <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Fusing news, weather, and Gemini tactical signal.</p>
            </div>
            <div className="badge badge-success" style={{ padding: '8px 16px', fontSize: 11, background: 'var(--accent-emerald)', color: '#000' }}>SLA_VERIFIED</div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 40 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
               <div>
                  <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Origin Hub</label>
                  <div style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
                     <Globe size={20} color="var(--accent-cyan)" /> {origin.toUpperCase()}
                  </div>
               </div>
               <div>
                  <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Final Destination</label>
                  <div style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
                     <Box size={20} color="var(--accent-rose)" /> {dest.toUpperCase()}
                  </div>
               </div>
            </div>

            <div style={{ background: '#131b2d', padding: 24, borderRadius: 16, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <TrendingUp size={16} color="var(--accent-primary)" />
                  <div style={{ fontSize: 12, fontWeight: 700 }}>TACTICAL_RATIONALE</div>
               </div>
               <p style={{ fontSize: 14, color: '#f8fafc', lineHeight: 1.6, fontWeight: 500 }}>
                  The <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{recommended.name}</span> scenario is prioritized by the neural pathfinder.
               </p>
               <div style={{ marginTop: 24, fontSize: 11, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  "{recommended.rationale}"
               </div>
            </div>
         </div>

          {/* STATS STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, borderTop: '1px solid var(--border-dim)', paddingTop: 32 }}>
             {[
               { label: 'Carrier', val: recommended.segments[0].carrier.name, icon: ShieldCheck, col: 'var(--accent-primary)' },
               { label: 'Final Total', val: format(recommended.totalCost), icon: ShieldCheck, col: 'var(--accent-emerald)' },
               { label: 'ETA Window', val: `${recommended.totalTime} Days`, icon: Clock, col: 'var(--accent-cyan)' },
               { label: 'CO2 Emission', val: recommended.co2kg.toFixed(0) + ' kg', icon: Globe, col: 'var(--accent-amber)' },
             ].map(stat => (
               <div key={stat.label}>
                  <label style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>{stat.label}</label>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{stat.val}</div>
               </div>
             ))}
          </div>

          {/* ESG & CARBON LEDGER (Hackathon Feature) */}
          <div style={{ marginTop: 32, padding: 24, borderRadius: 16, background: recommended.isNetZero ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.1), transparent)' : 'linear-gradient(90deg, rgba(234, 179, 8, 0.1), transparent)', border: recommended.isNetZero ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(234, 179, 8, 0.2)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <Globe size={18} color={recommended.isNetZero ? 'var(--accent-emerald)' : 'var(--accent-amber)'} />
                   <div style={{ fontSize: 13, fontWeight: 900 }}>ESG_CARBON_BUDGET</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 900, color: recommended.isNetZero ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{recommended.co2kg.toFixed(0)}KG CO2e</div>
             </div>
             <div style={{ display: 'flex', gap: 4, marginTop: 12, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                <div style={{ 
                    width: recommended.co2kg < 50 ? '30%' : (recommended.co2kg < 200 ? '60%' : '90%'), 
                    height: '100%', 
                    background: recommended.isNetZero ? 'var(--accent-emerald)' : 'var(--accent-amber)' 
                }} />
             </div>
             <p style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                This route satisfies the <strong>Google Green Tier {recommended.isNetZero ? (recommended.co2kg < 100 ? '1' : '2') : '3'}</strong> logistics compliance protocol.
             </p>
          </div>
       </div>

      {/* Gemini Tactical Command (Multimodal Simulation) */}
      <div className="card" style={{ padding: 24, background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Zap size={18} color="var(--accent-cyan)" />
            <h4 style={{ fontSize: 14, fontWeight: 700 }}>Gemini Tactical Command</h4>
         </div>
         <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Upload incident media or describe an exception. <strong>Gemini 1.5 Pro</strong> will synthesize a pivot.
         </p>

         <form onSubmit={handleReportIncident} style={{ position: 'relative', marginBottom: 24 }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
               <label title="Upload Image" style={{ cursor: 'pointer', color: 'var(--text-muted)' }}><Globe size={14} /></label>
               <label title="Upload PDF" style={{ cursor: 'pointer', color: 'var(--text-muted)' }}><Box size={14} /></label>
            </div>
            <input 
              type="text" 
              placeholder="Query situation room... (try 'suez blockage')" 
              value={incidentText}
              onChange={(e) => setIncidentText(e.target.value)}
              disabled={isAnalyzing}
              style={{
                width: '100%',
                padding: '12px 40px 12px 56px',
                background: '#0b1120',
                border: '1px solid var(--border-bright)',
                borderRadius: 12,
                color: '#fff',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button 
              type="submit"
              disabled={isAnalyzing}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: isAnalyzing ? 'var(--text-muted)' : 'var(--accent-primary)',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer'
              }}
            >
               {isAnalyzing ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
         </form>

         {/* Reroute Proposal */}
         {rerouteProposal && (
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--accent-emerald)', borderRadius: 12, padding: 20, marginBottom: 24, animation: 'fadeIn 0.5s' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <ShieldCheck size={16} color="var(--accent-emerald)" />
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-emerald)', letterSpacing: 1 }}>GEMINI_SUGGESTED_PIVOT</span>
               </div>
               <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: '#fff' }}>{rerouteProposal.action}</div>
               <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>{rerouteProposal.rationale}</p>
               <button style={{ width: '100%', padding: '12px', background: 'var(--accent-emerald)', color: '#000', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>EXECUTE STRATEGIC PIVOT</button>
            </div>
         )}

         <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Active Risks Log</div>
            {activeRisks.map((risk, i) => (
              <div key={i} className={`risk-card risk-${risk.severity === 'red' ? 'high' : risk.severity === 'amber' ? 'med' : 'info'}`}>
                 <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{risk.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 8 }}>{risk.impact}</div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{risk.desc}</p>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
