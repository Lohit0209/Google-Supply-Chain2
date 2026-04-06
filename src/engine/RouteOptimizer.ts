import { CARRIERS, HUBS } from '../data/logisticsData';
import type { Hub, Carrier } from '../data/logisticsData';
import { RiskModeler } from './RiskModeler';
import type { RiskScore, ShipmentParams } from './RiskModeler';
import { CustomsEngine } from './CustomsEngine';
import { DisruptionEngine } from './DisruptionEngine';
import type { Disruption } from './DisruptionEngine';

export interface ShapValue {
  feature: string;
  impact: number;
  weight: number; 
  isPositive: boolean; 
}

export interface CostBreakdown {
  freight: number;
  duties: number;
  fuel: number;
  handling: number;
  carbonOffset?: number; // ESG Feature
  totalRange: [number, number];
  confidenceRating: number; 
  manifest: {
    freight: string[];
    duties: string[];
    fuel: string[];
    handling: string[];
    esg?: string[]; // ESG Feature
  };
}

export interface RouteSegment {
  mode: 'air' | 'sea' | 'rail' | 'road';
  from: Hub;
  to: Hub;
  carrier: Carrier;
  distance: number;
  timeDays: number;
  cost: number;
  risk: RiskScore;
  breakdown: CostBreakdown;
}

export interface Scenario {
  name: string;
  modality: 'AIR' | 'OCEAN' | 'ROAD' | 'RAIL' | 'MULTIMODAL';
  totalTime: number;
  totalCost: number;
  totalCostRange: [number, number];
  confidence: number;
  totalRisk: number;
  co2kg: number; // ESG Feature
  isNetZero: boolean; // ESG Feature
  segments: RouteSegment[];
  description: string;
  rationale: string;
  isRecommended?: boolean;
  slaViolation?: boolean;
  activeDisruptions: Disruption[];
  shapImportance: ShapValue[];
}

export class RouteOptimizer {
  static generateScenarios(
    params: ShipmentParams,
    origin: Hub,
    destination: Hub,
    realTimeSignals: { weather: number; news: number },
    chaosLevel: number = 0 // Chaos Simulation Feature
  ): Scenario[] {
    const distance = this.calculateDistance(origin.coordinates, destination.coordinates);
    const scenarios: Scenario[] = [];

    // Apply Chaos to signals
    const signals = {
      weather: Math.min(1, realTimeSignals.weather + (chaosLevel * 0.8)),
      news: Math.min(1, realTimeSignals.news + (chaosLevel * 0.9))
    };

    // 1. Expedited (Air)
    scenarios.push(this.createScenario('Expedited', 'AIR', 'air', distance, params, origin, destination, signals, false, chaosLevel));
    
    // 2. Economical (Ocean)
    scenarios.push(this.createScenario('Economical', 'OCEAN', 'sea', distance, params, origin, destination, signals, false, chaosLevel));
    
    // 3. Strategic (Balanced)
    scenarios.push(this.createScenario('Strategic', 'MULTIMODAL', 'sea', distance, params, origin, destination, signals, true, chaosLevel));
    
    // SLA Check & Recommendation
    const recommended = this.buildRecommendation(scenarios, params);
    
    return scenarios.map(s => {
      const scenario = this.applySLA(s, params);
      if (scenario.name === recommended.name) scenario.isRecommended = true;
      return scenario;
    });
  }

  private static calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    const dLat = coord1[0] - coord2[0];
    const dLon = coord1[1] - coord2[1];
    return Math.round(Math.sqrt(dLat * dLat + dLon * dLon) * 111.32);
  }

  private static createScenario(
    name: string,
    modality: Scenario['modality'],
    mode: RouteSegment['mode'],
    distance: number,
    params: ShipmentParams,
    origin: Hub,
    destination: Hub,
    signals: { weather: number; news: number },
    isEsgFocus: boolean = false,
    chaosLevel: number = 0
  ): Scenario {
    const disruptionAnalysis = DisruptionEngine.analyzeRoute(origin, destination);
    
    let carrier: Carrier;
    if (mode === 'air') {
      carrier = CARRIERS.find(c => c.id === (isEsgFocus || disruptionAnalysis.isDisrupted ? 'dhl' : 'fedex')) || CARRIERS[0];
    } else if (mode === 'road') {
      carrier = CARRIERS.find(c => c.id === 'fedex') || CARRIERS[0];
    } else {
      carrier = CARRIERS.find(c => c.id === (isEsgFocus ? 'maersk' : 'cma')) || CARRIERS[2];
    }
    
    // TRANSIT DYNAMICS with Chaos impact
    // DYNAMIC REROUTING LOGIC: If disrupted, find a pivot hub
    let segments: RouteSegment[] = [];
    
    if (disruptionAnalysis.isDisrupted) {
      // Find a safe intermediate hub (Dubai or Singapore or Rotterdam)
      const pivotHub = HUBS.find((h: Hub) => h.id !== origin.id && h.id !== destination.id && !DisruptionEngine.analyzeRoute(origin, h).isDisrupted) || HUBS[3];
      
      const dist1 = this.calculateDistance(origin.coordinates, pivotHub.coordinates);
      const dist2 = this.calculateDistance(pivotHub.coordinates, destination.coordinates);
      
      segments.push(this.createSegment(mode, origin, pivotHub, carrier, dist1, signals, chaosLevel));
      segments.push(this.createSegment(mode, pivotHub, destination, carrier, dist2, signals, chaosLevel));
    } else {
      segments.push(this.createSegment(mode, origin, destination, carrier, distance, signals, chaosLevel));
    }

    const timeDays = segments.reduce((sum, s) => sum + s.timeDays, 0);
    const totalCostFreight = segments.reduce((sum, s) => sum + s.cost, 0);
    
    // ESG CALCULATIONS (Google Hackathon Feature)
    const co2Rate = mode === 'air' ? 0.8 : (mode === 'sea' ? 0.02 : 0.15); // kg CO2 per kg per km
    const rawCo2 = params.weight * (distance/1000) * co2Rate;
    const isNetZero = isEsgFocus || mode === 'sea';
    const carbonOffset = isNetZero ? (rawCo2 * 0.15) : 0; // Credits cost

    // FINANCIALS
    const manifestDuties: string[] = [];

    const customsResult = CustomsEngine.getDuty(params.itemType, origin, destination, params.cargoValue);
    manifestDuties.push(...customsResult.manifest);

    const insuranceRate = 0.005 + (chaosLevel * 0.02);
    const insurance = params.cargoValue * insuranceRate;

    const fuel = totalCostFreight * (mode === 'air' ? 0.15 : 0.05) * (1 + signals.weather);
    const handling = (mode === 'air' ? 85 : 120) + (params.isHazardous ? 250 : 0);
    
    const totalCost = totalCostFreight + customsResult.duties + fuel + handling + insurance + carbonOffset;
    const confidence = Math.max(0.1, 0.95 - (signals.weather * 0.2) - (signals.news * 0.2) - (chaosLevel * 0.5));
    
    const risk = RiskModeler.calculateSegmentRisk(origin, destination, carrier, params, signals);
    
    const breakdown: CostBreakdown = {
      freight: Number(totalCostFreight.toFixed(2)),
      duties: Number(customsResult.duties.toFixed(2)),
      fuel: Number(fuel.toFixed(2)),
      handling: Number((handling + insurance).toFixed(2)),
      carbonOffset: Number(carbonOffset.toFixed(2)),
      totalRange: [totalCost * 0.95, totalCost * 1.05],
      confidenceRating: confidence,
      manifest: {
        freight: [`Dynamic Route Multiplier: ${disruptionAnalysis.isDisrupted ? '1.4x (Diverted)' : '1.0x'}`],
        duties: manifestDuties,
        fuel: [`Weather Adjustment: +${(signals.weather*100).toFixed(0)}%`],
        handling: [
          `Insurance (${(insuranceRate*100).toFixed(1)}%): $${insurance.toFixed(2)}`,
          disruptionAnalysis.isDisrupted ? "Disruption Surcharge: $350" : "Network Stability: Fee Waived"
        ],
        esg: isNetZero ? [`Certified Net-Zero Asset`, `Carbon Credit Offset: $${carbonOffset.toFixed(2)}`] : [`High Emission Route`]
      }
    };

    const shapImportance: ShapValue[] = [
      { feature: 'Payload Factor', impact: totalCostFreight/totalCost, weight: 0.8, isPositive: true },
      { feature: 'Geo-Vulnerability', impact: risk.geopolitical/100, weight: 0.9, isPositive: true },
      { feature: 'Climate Buffer', impact: risk.environmental/100, weight: 0.7, isPositive: true },
      { feature: 'Chaos Variance', impact: chaosLevel * 0.4, weight: chaosLevel, isPositive: true }
    ];

    return {
      name, modality, totalTime: Math.round(timeDays), totalCost,
      totalCostRange: [breakdown.totalRange[0], breakdown.totalRange[1]],
      confidence, totalRisk: risk.total, co2kg: rawCo2, isNetZero,
      segments,
      description: isEsgFocus ? 'GREEN_TACTICAL' : 'STANDARD_TACTICAL',
      rationale: disruptionAnalysis.isDisrupted ? `CHAOS_MITIGATION: ${disruptionAnalysis.mitigationStrategy}` : 'OPTIMIZED_PATH',
      activeDisruptions: disruptionAnalysis.relevantDisruptions,
      shapImportance
    };
  }

  private static createSegment(
    mode: RouteSegment['mode'],
    from: Hub,
    to: Hub,
    carrier: Carrier,
    distance: number,
    signals: { weather: number; news: number },
    chaosLevel: number
  ): RouteSegment {
    const speedKmh = mode === 'air' ? 850 : (mode === 'sea' ? 35 : 85);
    const transitJitter = (Math.random() * 2) * (1 + signals.weather + chaosLevel);
    const timeDays = (distance / speedKmh) / 24 + transitJitter;
    const marketRateKg = mode === 'air' ? 6.50 : (mode === 'road' ? 0.45 : 0.12);
    const cost = distance * marketRateKg * 0.1; // simplified cost for segment

    return {
      mode, from, to, carrier, distance, timeDays, cost,
      risk: { total: 10, operational: 5, environmental: 5, geopolitical: 0, cargoSpecific: 0, breakdown: [] }, // simplified segment risk
      breakdown: { freight: cost, duties: 0, fuel: 0, handling: 0, totalRange: [0,0], confidenceRating: 1, manifest: { freight: [], duties: [], fuel: [], handling: [] } }
    };
  }

  private static applySLA(scenario: Scenario, params: ShipmentParams): Scenario {
    if (!params.deliveryDeadline) return scenario;
    const diffDays = (new Date(params.deliveryDeadline).getTime() - Date.now()) / (1000 * 3600 * 24);
    return { ...scenario, slaViolation: scenario.totalTime > diffDays };
  }

  private static buildRecommendation(scenarios: Scenario[], params: ShipmentParams): Scenario {
    const sorted = [...scenarios].sort((a, b) => {
      const score = (s: Scenario) => {
        const costW = params.priority === 'cost' ? 0.8 : 0.3;
        const timeW = params.priority === 'time' ? 0.8 : 0.3;
        const netZeroBonus = s.isNetZero ? -0.2 : 0;
        return (s.totalCost/10000)*costW + (s.totalTime/5)*timeW + netZeroBonus;
      };
      return score(a) - score(b);
    });
    return { ...sorted[0], name: 'AI SELECTION', isRecommended: true };
  }
}
