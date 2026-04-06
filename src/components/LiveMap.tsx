import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import type { Hub } from '../data/logisticsData';
import type { Scenario } from '../engine/RouteOptimizer';

interface Props {
  origin: Hub;
  destination: Hub;
  selectedScenario?: Scenario | null;
}

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapResizer = () => {
  const map = useMap();
  React.useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

export const LiveMap: React.FC<Props> = ({ origin, destination, selectedScenario }) => {
  const center: [number, number] = [
    (origin.coordinates[0] + destination.coordinates[0]) / 2,
    (origin.coordinates[1] + destination.coordinates[1]) / 2,
  ];

  // Support multi-segment polylines for rerouting
  const polylines = selectedScenario 
    ? selectedScenario.segments.map(s => [s.from.coordinates, s.to.coordinates] as [number, number][])
    : [[origin.coordinates, destination.coordinates] as [number, number][]];

  const getPathColor = () => {
    if (!selectedScenario) return '#6366f1';
    const mode = selectedScenario.segments[0].mode;
    if (mode === 'air') return 'var(--accent-cyan)';
    if (mode === 'sea') return 'var(--accent-primary)';
    return 'var(--accent-emerald)';
  };

  return (
    <div className="map-container animate-in" style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={center} 
        zoom={3} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <MapResizer />
        <ChangeView center={center} zoom={3} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={origin.coordinates}>
          <Popup>
            <div style={{ color: '#000', fontSize: '11px' }}>
              <div style={{ fontWeight: 900, color: 'var(--accent-primary)', marginBottom: 2 }}>ORIGIN_HUB</div>
              <strong>{origin.name}</strong><br/>
              {origin.city}, {origin.country}
            </div>
          </Popup>
        </Marker>
        <Marker position={destination.coordinates}>
          <Popup>
            <div style={{ color: '#000', fontSize: '11px' }}>
              <div style={{ fontWeight: 900, color: 'var(--accent-rose)', marginBottom: 2 }}>DESTINATION_TERMINAL</div>
              <strong>{destination.name}</strong><br/>
              {destination.city}, {destination.country}
            </div>
          </Popup>
        </Marker>
        {polylines.map((path, idx) => (
          <Polyline 
            key={idx}
            positions={path} 
            pathOptions={{ 
              color: getPathColor(), 
              weight: 4, 
              dashArray: selectedScenario?.segments[0].mode === 'air' ? '1, 12' : 'none',
              lineCap: 'round',
              opacity: 0.9
            }} 
          />
        ))}
      </MapContainer>
      
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1000, background: 'rgba(5, 7, 10, 0.8)', padding: '10px 16px', borderRadius: 8, backdropFilter: 'blur(12px)', border: '1px solid var(--border-dim)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-rose)' }} className="pulse" />
          <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--text-label)', fontWeight: 900, letterSpacing: '0.1em' }}>Live Tactical Feed</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 900, fontFamily: 'Outfit', color: '#fff' }}>Network Operations Feed</div>
      </div>
    </div>
  );
};
