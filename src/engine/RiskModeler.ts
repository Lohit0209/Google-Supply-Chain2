import type { Hub, Carrier } from '../data/logisticsData';

export interface ShipmentParams {
  itemType: string;
  weight: number; // KG
  cargoValue: number; // USD
  sensitivity: number; // 0-1
  isHazardous: boolean;
  priority: 'cost' | 'time' | 'risk' | 'balanced';
  
  // Location Intelligence (Legacy/Display)
  originCity: string;
  originCountry: string;
  destCity: string;
  destCountry: string;

  // Real-World Entity References
  originHub?: Hub;
  destHub?: Hub;

  // Mission Constraints
  deliveryDeadline?: string; // ISO date string
}

export interface RiskScore {
  total: number;
  operational: number;
  environmental: number;
  geopolitical: number;
  cargoSpecific: number;
  breakdown: string[];
}

export class RiskModeler {
  static calculateSegmentRisk(
    origin: Hub,
    destination: Hub,
    carrier: Carrier,
    params: ShipmentParams,
    realTimeSignals: { weather: number; news: number }
  ): RiskScore {
    // 1. Operational Risk (0-100)
    // Handling points are higher in LCL (simulated elsewhere)
    const operational = (carrier.delayVariance * 40) + (origin.congestionIndex * 30) + (destination.congestionIndex * 30);

    // 2. Environmental Risk (0-100)
    // Dynamic based on real-time weather signal
    const environmental = realTimeSignals.weather * 100;

    // 3. Geopolitical Risk (0-100)
    // Dynamic based on real-time news signal
    const geopolitical = realTimeSignals.news * 100;

    // 4. Product-Specific Risk (0-100)
    const valueRisk = params.cargoValue > 50000 ? 40 : (params.cargoValue > 10000 ? 20 : 0);
    const itemRisk = params.isHazardous ? 50 : (params.itemType.toLowerCase().includes('electronics') ? 30 : 0);
    const cargoSpecific = (params.sensitivity * 20) + (carrier.damageRate * 30) + valueRisk + itemRisk;

    // Composite Weights
    const total = (operational * 0.3) + (environmental * 0.3) + (geopolitical * 0.2) + (cargoSpecific * 0.2);

    const breakdown = [];
    if (operational > 60) breakdown.push('High port congestion or carrier unreliability');
    if (environmental > 50) breakdown.push('Severe weather disruption detected');
    if (geopolitical > 50) breakdown.push('Regional instability or trade restrictions');
    if (cargoSpecific > 70) breakdown.push('High cargo value or sensitivity vs carrier risk');

    return {
      total: Math.round(total),
      operational: Math.round(operational),
      environmental: Math.round(environmental),
      geopolitical: Math.round(geopolitical),
      cargoSpecific: Math.round(cargoSpecific),
      breakdown
    };
  }
}
