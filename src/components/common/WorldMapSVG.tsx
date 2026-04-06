import React from 'react';

export const WorldMapPaths: React.FC<{ color?: string }> = ({ color = 'rgba(255,255,255,0.1)' }) => {
  return (
    <g>
      {/* North America */}
      <path fill={color} d="M50,150 L120,80 L250,80 L350,120 L350,220 L250,250 L150,250 Z" />
      {/* South America */}
      <path fill={color} d="M250,250 L350,250 L400,320 L350,480 L250,480 L220,320 Z" />
      {/* Europe */}
      <path fill={color} d="M450,100 L550,100 L600,160 L500,200 L450,160 Z" />
      {/* Africa */}
      <path fill={color} d="M450,200 L580,200 L650,300 L600,450 L480,450 L420,300 Z" />
      {/* Asia */}
      <path fill={color} d="M550,100 L950,100 L980,250 L900,380 L650,380 L580,200 Z" />
      {/* Australia */}
      <path fill={color} d="M800,350 L950,350 L980,450 L850,480 L800,450 Z" />
      
      {/* High-detail island groups for realism */}
      <circle cx="380" cy="50" r="12" fill={color} /> {/* Greenland */}
      <circle cx="880" cy="180" r="8" fill={color} /> {/* Japan */}
      <circle cx="700" cy="420" r="6" fill={color} /> {/* Madagascar */}
      <circle cx="150" cy="100" r="10" fill={color} /> {/* Alaska/Arctic */}
      <circle cx="950" cy="300" r="5" fill={color} /> {/* Pacific Islands */}
    </g>
  );
};
