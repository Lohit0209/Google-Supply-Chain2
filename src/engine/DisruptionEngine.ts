import type { Hub } from '../data/logisticsData';
import { HUBS } from '../data/logisticsData';

export interface Disruption {
  id: string;
  type: 'WEATHER' | 'STRIKE' | 'CONGESTION' | 'GEOPOLITICAL';
  severity: number; // 0-1
  location: Hub;
  radiusKm: number;
  description: string;
  affectedCarrierIds: string[];
}

export class DisruptionEngine {
  private static liveDisruptions: Disruption[] = [
    {
      id: 'd1',
      type: 'WEATHER',
      severity: 0.85,
      location: HUBS[0], // Shanghai
      radiusKm: 500,
      description: 'Super Typhoon Mawar approaching East China Sea. Port operations throttled.',
      affectedCarrierIds: ['maersk', 'cma']
    },
    {
      id: 'd2',
      type: 'CONGESTION',
      severity: 0.65,
      location: HUBS[7], // New York
      radiusKm: 200,
      description: 'Labor negotiations at NJ terminal causing 48h vessel berthing delays.',
      affectedCarrierIds: ['fedex', 'ups', 'maersk']
    },
    {
      id: 'd3',
      type: 'GEOPOLITICAL',
      severity: 0.95,
      location: HUBS[8], // Dubai
      radiusKm: 1000,
      description: 'Airspace restriction in Red Sea corridor. All low-altitude flight paths rerouted.',
      affectedCarrierIds: ['dhl', 'fedex']
    }
  ];

  static getLiveDisruptions(): Disruption[] {
    return this.liveDisruptions;
  }

  static analyzeRoute(origin: Hub, destination: Hub): { 
    isDisrupted: boolean; 
    relevantDisruptions: Disruption[]; 
    riskDelta: number;
    mitigationStrategy: string;
  } {
    const relevant = this.liveDisruptions.filter(d => {
      const distToOrigin = this.haversine(origin.coordinates, d.location.coordinates);
      const distToDest = this.haversine(destination.coordinates, d.location.coordinates);
      return distToOrigin < d.radiusKm || distToDest < d.radiusKm;
    });

    const totalSeverity = relevant.reduce((sum, d) => sum + d.severity, 0);
    const riskDelta = Math.min(40, totalSeverity * 30);

    return {
      isDisrupted: relevant.length > 0,
      relevantDisruptions: relevant,
      riskDelta,
      mitigationStrategy: relevant.length > 0 
        ? `RE-VECTORING: Detected ${relevant.length} tactical bottleneck(s). Diverting via safe-harbor hubs and applying contingency buffering.`
        : 'PATH_CLEAR: No active strategic disruptions detected on this vector.'
    };
  }

  private static haversine(c1: [number, number], c2: [number, number]): number {
    const R = 6371; // Earth radius in km
    const dLat = (c2[0] - c1[0]) * Math.PI / 180;
    const dLon = (c2[1] - c1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(c1[0] * Math.PI / 180) * Math.cos(c2[0] * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
