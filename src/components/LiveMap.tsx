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

  // Support multi-segment polylines for rerouting and arc smoothing
  const getRenderPaths = () => {
    const segments = selectedScenario 
      ? selectedScenario.segments
      : [{ from: origin, to: destination, mode: 'air' as const }];

    const paths: [number, number][][] = [];

    segments.forEach(seg => {
      const p1 = seg.from.coordinates;
      const p2 = seg.to.coordinates;
      const mode = seg.mode;
      
      // Direct line for road
      if (mode === 'road') {
         paths.push([p1, p2]);
         return;
      }
      
      if (mode === 'sea') {
         const lon1 = p1[1] > 180 ? p1[1] - 360 : p1[1];
         const lon2 = p2[1] > 180 ? p2[1] - 360 : p2[1];
         
         const isAsia = (lon: number) => lon > 40 && lon < 150;
         const isEurope = (lon: number) => lon > -10 && lon <= 40;
         const isAmericasE = (lon: number) => lon < -40 && lon > -85;
         const isAmericasW = (lon: number) => lon <= -85 || lon >= 180;
         
         const isDelhi = (lon: number) => lon > 75 && lon < 78;
         const isFrankfurt = (lat: number, lon: number) => lat > 49 && lon > 8 && lon < 10;
         
         const path: [number, number][] = [p1];
         
         // Snap inland origins to nearest port
         if (isDelhi(lon1)) path.push([18.9, 72.8]); // Mumbai
         if (isFrankfurt(p1[0], lon1)) path.push([51.9, 4.4]); // Rotterdam

         // Hardcoded Oceanic Corridors
         if (isAsia(lon1) && isAmericasW(lon2)) {
             path.push([1.3, 103.8]);  // Singapore
             path.push([15, -160]);    // Cross Pacific
         } 
         else if (isAmericasW(lon1) && isAsia(lon2)) {
             path.push([15, -160]);    // Cross Pacific
             path.push([1.3, 103.8]);  // Singapore
         }
         else if (isAsia(lon1) && isAmericasE(lon2)) {
             path.push([12, 45]);      // Gulf of Aden
             path.push([27, 34]);      // Suez
             path.push([36, -10]);     // Gibraltar
             path.push([35, -40]);     // Mid Atlantic
         }
         else if (isAmericasE(lon1) && isAsia(lon2)) {
             path.push([35, -40]);     // Mid Atlantic
             path.push([36, -10]);     // Gibraltar
             path.push([27, 34]);      // Suez
             path.push([12, 45]);      // Gulf of Aden
         }
         else if (isAsia(lon1) && isEurope(lon2)) {
             path.push([12, 45]);
             path.push([27, 34]);
             path.push([36, 15]);      // Mediterranean
         }
         else if (isEurope(lon1) && isAsia(lon2)) {
             path.push([36, 15]);
             path.push([27, 34]);
             path.push([12, 45]);
         }
         else if (isEurope(lon1) && isAmericasW(lon2)) {
             path.push([30, -40]);
             path.push([15, -75]);     // Caribbean
             path.push([9, -79.5]);    // Panama Canal
         }
         else if (isAmericasW(lon1) && isEurope(lon2)) {
             path.push([9, -79.5]);
             path.push([15, -75]);
             path.push([30, -40]);
         }
         else if (isAmericasE(lon1) && isAmericasW(lon2)) {
             path.push([20, -70]);
             path.push([9, -79.5]);    // Panama Canal
         }
         else if (isAmericasW(lon1) && isAmericasE(lon2)) {
             path.push([9, -79.5]);    // Panama Canal
             path.push([20, -70]);
         }

         // Snap inland destinations to nearest port
         if (isDelhi(lon2)) path.push([18.9, 72.8]);
         if (isFrankfurt(p2[0], lon2)) path.push([51.9, 4.4]);
         
         path.push(p2);
         // Make continuous for leaflet wrapping over dateline
         const continuousPath: [number, number][] = [[path[0][0], path[0][1]]];
         for (let i = 1; i < path.length; i++) {
             let prevLon = continuousPath[i-1][1];
             let currLon = path[i][1];
             while (currLon - prevLon > 180) currLon -= 360;
             while (prevLon - currLon > 180) currLon += 360;
             continuousPath.push([path[i][0], currLon]);
         }
         paths.push(continuousPath);
         return;
      }

      // Add a slight arc curve to flight paths to look natural
      const arcPoints: [number, number][] = [];
      const numPoints = 30;
      let lon1 = p1[1];
      let lon2 = p2[1];
      
      // Calculate shortest continuous arc around the globe (do not wrap within loop)
      if (lon2 - lon1 > 180) lon2 -= 360;
      else if (lon1 - lon2 > 180) lon2 += 360;

      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const lat = p1[0] * (1 - t) + p2[0] * t;
        const lng = lon1 * (1 - t) + lon2 * t;
        
        const offset = Math.sin(t * Math.PI) * 15; // Flight arch
        arcPoints.push([lat + offset, lng]);
      }
      paths.push(arcPoints);
    });
    
    return paths;
  };

  const polylines = getRenderPaths();

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
        zoomControl={true}
        scrollWheelZoom={true}
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
