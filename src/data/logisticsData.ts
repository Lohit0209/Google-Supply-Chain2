export interface Carrier {
  id: string;
  name: string;
  costRate: number;      // Multiplier for base distance cost
  delayVariance: number; // 0-1 scale of reliability
  damageRate: number;    // Instances per 1000
  specialties: string[];
  coverage: string[];    // Regions
}

export interface Hub {
  id: string;
  name: string;
  city: string;
  country: string;
  type: 'air' | 'sea' | 'rail' | 'road';
  coordinates: [number, number];
  congestionIndex: number; // 0-1
}

export const CARRIERS: Carrier[] = [
  {
    id: 'dhl',
    name: 'DHL Express',
    costRate: 1.15, // Premium speed
    delayVariance: 0.03,
    damageRate: 0.05,
    specialties: ['electronics', 'perishable', 'high-value'],
    coverage: ['Global Air']
  },
  {
    id: 'fedex',
    name: 'FedEx Priority',
    costRate: 1.10,
    delayVariance: 0.05,
    damageRate: 0.08,
    specialties: ['electronics', 'industrial'],
    coverage: ['North America', 'Europe', 'Asia']
  },
  {
    id: 'maersk',
    name: 'Maersk Ocean',
    costRate: 0.85, // Volume discount
    delayVariance: 0.15,
    damageRate: 0.12,
    specialties: ['industrial', 'heavy-machinery'],
    coverage: ['Major Ports Global']
  },
  {
    id: 'ups',
    name: 'UPS Worldwide',
    costRate: 1.05,
    delayVariance: 0.06,
    damageRate: 0.09,
    specialties: ['retail', 'industrial', 'electronics'],
    coverage: ['Global Network']
  },
  {
    id: 'cma',
    name: 'CMA CGM Bulk',
    costRate: 0.80,
    delayVariance: 0.18,
    damageRate: 0.14,
    specialties: ['raw-materials', 'hazardous'],
    coverage: ['Global Shipping Lanes']
  }
];

export const HUBS: Hub[] = [
  { id: 'h1', name: 'Shanghai Terminal', city: 'Shanghai', country: 'China', type: 'sea', coordinates: [31.23, 121.47], congestionIndex: 0.8 },
  { id: 'h2', name: 'Los Angeles Terminal', city: 'Los Angeles', country: 'USA', type: 'sea', coordinates: [33.73, -118.26], congestionIndex: 0.6 },
  { id: 'h3', name: 'Rotterdam Terminal', city: 'Rotterdam', country: 'Netherlands', type: 'sea', coordinates: [51.92, 4.47], congestionIndex: 0.4 },
  { id: 'h4', name: 'Singapore Terminal', city: 'Singapore', country: 'Singapore', type: 'air', coordinates: [1.36, 103.99], congestionIndex: 0.3 },
  { id: 'h5', name: 'London Heathrow', city: 'London', country: 'UK', type: 'air', coordinates: [51.47, -0.45], congestionIndex: 0.7 },
  { id: 'h6', name: 'Mumbai JNPT', city: 'Mumbai', country: 'India', type: 'sea', coordinates: [18.95, 72.95], congestionIndex: 0.9 },
  { id: 'h7', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan', type: 'air', coordinates: [35.54, 139.77], congestionIndex: 0.5 },
  { id: 'h8', name: 'New York / NJ', city: 'New York', country: 'USA', type: 'sea', coordinates: [40.71, -74.00], congestionIndex: 0.8 },
  { id: 'h9', name: 'Dubai Emirates', city: 'Dubai', country: 'UAE', type: 'air', coordinates: [25.25, 55.36], congestionIndex: 0.4 },
  { id: 'h10', name: 'Sydney Port', city: 'Sydney', country: 'Australia', type: 'sea', coordinates: [-33.86, 151.20], congestionIndex: 0.3 }
];

// Coordinate Lookup Utility
export const resolveLocation = (city: string): Hub => {
  const normalized = city.toLowerCase().trim();
  const found = HUBS.find(h => h.city.toLowerCase() === normalized);
  if (found) return found;
  
  // Default to Shanghai if not found (simulation fallback)
  return HUBS[0];
};
