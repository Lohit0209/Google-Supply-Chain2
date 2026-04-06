import { CARRIERS } from '../data/logisticsData';
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
    scenarios.push(this.createScenario('Option 1: Expedited', 'AIR', 'air', distance, params, origin, destination, signals, false, chaosLevel));
    
    // 2. Economical (Sea)
    scenarios.push(this.createScenario('Option 2: Economical', 'OCEAN', 'sea', distance, params, origin, destination, signals, false, chaosLevel));
    
    // 3. Strategic (High Safety / ESG Focus)
    scenarios.push(this.createScenario('Option 3: Strategic ESG', 'MULTIMODAL', 'sea', distance, params, origin, destination, signals, true, chaosLevel));
    
    // 4. Road (Surface)
    if (origin.country === destination.country || chaosLevel > 0.5) {
      scenarios.push(this.createScenario('Option 4: Tactical Surface', 'ROAD', 'road', distance, params, origin, destination, signals, false, chaosLevel));
    }

    // SLA Check & Recommendation
    const recommended = this.buildRecommendation(scenarios, params);
    scenarios.push(recommended);

    return scenarios.map(s => this.applySLA(s, params));
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
    const speedKmh = mode === 'air' ? 850 : (mode === 'sea' ? 35 : 85);
    const disruptionLatency = (disruptionAnalysis.isDisrupted ? (disruptionAnalysis.relevantDisruptions[0].severity * 8) : 0) * (1 + chaosLevel * 2);
    const transitJitter = (Math.random() * 2) * (1 + signals.weather + chaosLevel);
    const timeDays = Math.max(1, Math.round((distance / speedKmh) / 24) + transitJitter + disruptionLatency);
    
    // ESG CALCULATIONS (Google Hackathon Feature)
    const co2Rate = mode === 'air' ? 0.8 : (mode === 'sea' ? 0.02 : 0.15); // kg CO2 per kg per km
    const rawCo2 = params.weight * (distance/1000) * co2Rate;
    const isNetZero = isEsgFocus || mode === 'sea';
    const carbonOffset = isNetZero ? (rawCo2 * 0.15) : 0; // Credits cost

    // FINANCIALS
    const manifestFreights: string[] = [];
    const manifestDuties: string[] = [];
    const manifestEsg: string[] = [];

    const marketRateKg = mode === 'air' ? 6.50 : (mode === 'road' ? 0.45 : 0.12);
    const chaosPremium = 1 + (chaosLevel * 0.5);
    const freight = params.weight * marketRateKg * carrier.costRate * chaosPremium;
    manifestFreights.push(`Base ${mode.toUpperCase()} Market: $${marketRateKg}/kg`);

    const customsResult = CustomsEngine.getDuty(params.itemType, origin, destination, params.cargoValue);
    manifestDuties.push(...customsResult.manifest);

    const insuranceRate = 0.005 + (chaosLevel * 0.02);
    const insurance = params.cargoValue * insuranceRate;

    const fuel = freight * (mode === 'air' ? 0.15 : 0.05) * (1 + signals.weather);
    const handling = (mode === 'air' ? 85 : 120) + (params.isHazardous ? 250 : 0);
    
    const totalCost = freight + customsResult.duties + fuel + handling + insurance + carbonOffset;
    const confidence = Math.max(0.1, 0.95 - (signals.weather * 0.2) - (signals.news * 0.2) - (chaosLevel * 0.5));
    
    const risk = RiskModeler.calculateSegmentRisk(origin, destination, carrier, params, signals);
    
    const breakdown: CostBreakdown = {
      freight: Number(freight.toFixed(2)),
      duties: Number(customsResult.duties.toFixed(2)),
      fuel: Number(fuel.toFixed(2)),
      handling: Number((handling + insurance).toFixed(2)),
      carbonOffset: Number(carbonOffset.toFixed(2)),
      totalRange: [totalCost * 0.95, totalCost * 1.05],
      confidenceRating: confidence,
      manifest: {
        freight: manifestFreights,
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
      { feature: 'Payload Factor', impact: freight/totalCost, weight: 0.8, isPositive: true },
      { feature: 'Geo-Vulnerability', impact: risk.geopolitical/100, weight: 0.9, isPositive: true },
      { feature: 'Climate Buffer', impact: risk.environmental/100, weight: 0.7, isPositive: true },
      { feature: 'Chaos Variance', impact: chaosLevel * 0.4, weight: chaosLevel, isPositive: true }
    ];

    return {
      name, modality, totalTime: Math.round(timeDays), totalCost,
      totalCostRange: [breakdown.totalRange[0], breakdown.totalRange[1]],
      confidence, totalRisk: risk.total, co2kg: rawCo2, isNetZero,
      segments: [{ mode, from: origin, to: destination, carrier, distance, timeDays, cost: totalCost, risk, breakdown }],
      description: isEsgFocus ? 'GREEN_TACTICAL' : 'STANDARD_TACTICAL',
      rationale: disruptionAnalysis.isDisrupted ? `CHAOS_MITIGATION: ${disruptionAnalysis.mitigationStrategy}` : 'OPTIMIZED_PATH',
      activeDisruptions: disruptionAnalysis.relevantDisruptions,
      shapImportance
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
