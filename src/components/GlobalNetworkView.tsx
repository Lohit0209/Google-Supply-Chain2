import React, { useState, useEffect, useMemo } from 'react';
import { HUBS } from '../data/logisticsData';
import { DisruptionEngine } from '../engine/DisruptionEngine';
import { ShieldAlert, Radio, Zap, Globe, Zap as ChaosIcon } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  chaosLevel: number;
  setChaosLevel: (val: number) => void;
}

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

export const GlobalNetworkView: React.FC<Props> = ({ chaosLevel, setChaosLevel }) => {
  const disruptions = DisruptionEngine.getLiveDisruptions();

  // Create network connections between hubs (simulating flight paths/sea routes)
  const networkConnections = useMemo(() => {
    const lines: [number, number][][] = [];
    const mainHub = HUBS.find(h => h.city === 'Dubai') || HUBS[0];
    
    // Connect everything to the main hub for a star-topology look, plus some sequential connections
    for (let i = 0; i < HUBS.length; i++) {
        if (HUBS[i].id !== mainHub.id) {
            lines.push([mainHub.coordinates, HUBS[i].coordinates]);
        }
        if (i < HUBS.length - 1) {
            lines.push([HUBS[i].coordinates, HUBS[i+1].coordinates]);
        }
    }
    return lines;
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, width: '100%', animation: 'fadeIn 0.4s ease-out', paddingBottom: 60 }}>
      {/* MAP CANVAS (LEAFLET HIGH-DENSITY MAP) */}
      <div className="card" style={{ position: 'relative', overflow: 'hidden', padding: 0, background: '#05070a', border: '1px solid var(--border-bright)', borderRadius: 24, height: 740, minHeight: 600 }}>
        
        {/* TOP OVERLAYS */}
        <div style={{ position: 'absolute', top: 32, left: 32, zIndex: 1000, display: 'flex', gap: 16 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.85)', padding: '12px 20px', borderRadius: 12, border: '1px solid var(--border-bright)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <Radio size={16} color="var(--accent-emerald)" className="pulse-slow" />
              <div style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent-emerald)' }}>Live Cartography Server</div>
           </div>
           
           {chaosLevel > 0.5 && (
             <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239, 68, 68, 0.8)', padding: '12px 20px', borderRadius: 12, border: '1px solid var(--accent-rose)', backdropFilter: 'blur(12px)', animation: 'pulse-slow 1s infinite' }}>
                <ChaosIcon size={16} color="white" />
                <div style={{ fontSize: 13, fontWeight: 900, color: 'white', letterSpacing: 1 }}>CRITICAL_FAIL_STATE</div>
             </div>
           )}
        </div>

        {/* RIGHT OVERLAY: CHAOS CONTROL */}
        <div style={{ position: 'absolute', top: 32, right: 32, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 12 }}>
           <div className="card" style={{ background: 'rgba(0,0,0,0.9)', padding: 20, border: '1px solid var(--border-bright)', width: 220 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                 <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>NETWORK STRESS</span>
                 <span style={{ fontSize: 11, fontWeight: 900, color: chaosLevel > 0.7 ? 'var(--accent-rose)' : 'var(--accent-cyan)' }}>{(chaosLevel * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.1" 
                value={chaosLevel} 
                onChange={(e) => setChaosLevel(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-rose)', cursor: 'pointer' }}
              />
              <button 
                onClick={() => setChaosLevel(chaosLevel === 1 ? 0 : 1)}
                style={{ 
                  marginTop: 20, width: '100%', padding: '10px', 
                  background: chaosLevel > 0.1 ? 'var(--accent-rose)' : 'rgba(255,255,255,0.05)', 
                  border: 'none', borderRadius: 8, color: chaosLevel > 0.1 ? 'white' : 'var(--text-muted)',
                  fontSize: 10, fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {chaosLevel > 0.1 ? 'DISENGAGE STRESS TEST' : 'TRIGGER GLOBAL CHAOS'}
              </button>
           </div>
        </div>
        
        {/* LEAFLET MAP LAYER */}
        <div style={{ position: 'absolute', inset: 0, padding: 0, zIndex: 1 }}>
           <MapContainer 
             center={[20, 0]} 
             zoom={2.5} 
             style={{ height: '100%', width: '100%', background: '#05070a' }}
             zoomControl={false}
             scrollWheelZoom={true}
           >
             <MapResizer />
             <TileLayer
               attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
               url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
             />

             {/* Network Connections (Red Lines) */}
             {networkConnections.map((positions, idx) => (
                <Polyline 
                  key={idx}
                  positions={positions} 
                  pathOptions={{ 
                    color: '#ef4444', 
                    weight: chaosLevel > 0.3 ? 2 : 1.5, 
                    dashArray: '5, 10',
                    opacity: chaosLevel > 0.3 ? 0.8 : 0.4
                  }} 
                />
             ))}

             {/* Hub Nodes */}
             {HUBS.map(hub => (
                <CircleMarker 
                  key={hub.id}
                  center={hub.coordinates}
                  radius={5}
                  pathOptions={{
                     fillColor: 'var(--accent-cyan)',
                     fillOpacity: 1,
                     color: '#fff',
                     weight: 1
                  }}
                  eventHandlers={{
                    mouseover: (e) => e.target.openPopup(),
                  }}
                >
                  <Popup>
                    <div style={{ color: '#000', fontSize: '11px' }}>
                      <div style={{ fontWeight: 900, color: 'var(--accent-cyan)', marginBottom: 2 }}>LOGISTICS_HUB</div>
                      <strong>{hub.name}</strong><br/>
                      {hub.city}, {hub.country}
                    </div>
                  </Popup>
                </CircleMarker>
             ))}

             {/* Disruption Pulsars */}
             {disruptions.map(d => (
                <React.Fragment key={d.id}>
                    <CircleMarker 
                      center={d.location.coordinates}
                      radius={d.severity * (15 + chaosLevel * 10)}
                      pathOptions={{
                         fillColor: 'var(--accent-rose)',
                         fillOpacity: 0.3,
                         color: 'var(--accent-rose)',
                         weight: 1,
                      }}
                    />
                    <CircleMarker 
                      center={d.location.coordinates}
                      radius={6}
                      pathOptions={{
                         fillColor: 'var(--accent-rose)',
                         fillOpacity: 1,
                         color: '#fff',
                         weight: 2
                      }}
                      eventHandlers={{
                        mouseover: (e) => e.target.openPopup(),
                      }}
                    >
                      <Popup>
                        <div style={{ color: '#000', fontSize: '11px' }}>
                          <div style={{ fontWeight: 900, color: '#ef4444', marginBottom: 2 }}>{d.type}_ALERT</div>
                          <strong>{d.location.city} Node Exception</strong><br/>
                          Severity: {(d.severity * 10).toFixed(1)} / 10<br/>
                          Status: Active Blockage
                        </div>
                      </Popup>
                    </CircleMarker>
                </React.Fragment>
             ))}
           </MapContainer>
        </div>
        
        <div style={{ position: 'absolute', bottom: 32, left: 32, display: 'flex', gap: 24, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', zIndex: 1000, background: 'rgba(0,0,0,0.6)', padding: '10px 16px', borderRadius: 8, backdropFilter: 'blur(4px)' }}>
           <div>COORD_SYNC: OK</div>
           <div>CARTO_LINK: ONLINE</div>
           <div>LATENCY: {Math.round(20 + chaosLevel * 500)}ms</div>
        </div>
      </div>

      {/* DISRUPTION FEED */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Zap size={18} color="var(--accent-primary)" />
            <h4 style={{ fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>Node Telemetry</h4>
         </div>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
            {disruptions.length === 0 && !chaosLevel && (
              <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                 <Globe size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                 <p style={{ fontSize: 12 }}>No active regional disruptions identified.</p>
              </div>
            )}
            
            {disruptions.map(d => (
              <div key={d.id} className="card" style={{ padding: 24, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <ShieldAlert size={16} color="var(--accent-rose)" />
                    <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent-rose)' }}>{d.type}</span>
                 </div>
                 <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{d.location.city} Node Exception</div>
                 <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{d.description}</p>
              </div>
            ))}
         </div>

         <div className="card" style={{ marginTop: 'auto', padding: 24, background: 'rgba(99, 102, 241, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
               <Zap size={16} color="var(--accent-cyan)" />
               <div style={{ fontSize: 12, fontWeight: 900 }}>SYSTEM_HEALTH</div>
            </div>
            <div style={{ height: 4, background: 'var(--border-dim)', borderRadius: 2, overflow: 'hidden' }}>
               <div style={{ height: '100%', width: `${(1 - chaosLevel) * 100}%`, background: chaosLevel > 0.5 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }} />
            </div>
         </div>
      </div>
    </div>
  );
};
