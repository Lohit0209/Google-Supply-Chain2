import React from 'react';
import { Cloud, CloudLightning, CloudRain, Sun, Wind, Thermometer } from 'lucide-react';
import { useWeatherData } from '../hooks/useWeatherData';
import type { Hub } from '../data/logisticsData';

interface Props {
  hub: Hub;
  label: string;
}

export const HubWeatherWidget: React.FC<Props> = ({ hub, label }) => {
  const { data, loading } = useWeatherData(hub.coordinates[0], hub.coordinates[1]);

  const getWeatherIcon = (code: number) => {
    if (code > 80) return <CloudLightning size={16} color="var(--accent-rose)" />;
    if (code > 60) return <CloudRain size={16} color="var(--accent-cyan)" />;
    if (code > 40) return <Cloud size={16} color="var(--text-label)" />;
    return <Sun size={16} color="var(--accent-amber)" />;
  };

  return (
    <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16, flex: 1, background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-dim)' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12 }}>
        {loading ? <div className="pulse" /> : getWeatherIcon(data?.temperature || 0)}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label} TERMINAL</div>
        <div style={{ fontSize: 13, fontWeight: 800 }}>{hub.city.toUpperCase()}</div>
        
        {!loading && data && (
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-label)', fontWeight: 600 }}>
              <Thermometer size={10} /> {data.temperature}°C
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-label)', fontWeight: 600 }}>
              <Wind size={10} /> {data.windSpeed} KM/H
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
