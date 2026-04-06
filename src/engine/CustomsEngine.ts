import type { Hub } from '../data/logisticsData';

export interface DutyRate {
  rate: number;
  processingFee: number; // Flat fee in USD
  deMinimis: number; // Value below which duty is 0 (in USD)
}

// A more realistic matrix of duty rates based on HS categories and regions
// In a real app, this would come from a live API like Avalara or CustomsCity
export const CUSTOMS_MATRIX: Record<string, Record<string, DutyRate>> = {
  electronics: {
    'India-USA': { rate: 0.0, processingFee: 15.00, deMinimis: 800 },
    'China-USA': { rate: 0.15, processingFee: 25.00, deMinimis: 800 },
    'China-India': { rate: 0.20, processingFee: 10.00, deMinimis: 0 },
    'USA-India': { rate: 0.18, processingFee: 10.00, deMinimis: 0 },
    'UK-USA': { rate: 0.03, processingFee: 15.00, deMinimis: 800 },
    'Netherlands-USA': { rate: 0.03, processingFee: 15.00, deMinimis: 800 },
  },
  perishable: {
    'default': { rate: 0.10, processingFee: 50.00, deMinimis: 50 }
  },
  industrial: {
    'default': { rate: 0.05, processingFee: 100.00, deMinimis: 0 }
  },
  hazardous: {
    'default': { rate: 0.12, processingFee: 250.00, deMinimis: 0 }
  }
};

export class CustomsEngine {
  static getDuty(
    itemType: string,
    origin: Hub,
    destination: Hub,
    cargoValueUsd: number
  ): { duties: number; manifest: string[] } {
    const pairKey = `${origin.country}-${destination.country}`;
    const categoryRules = CUSTOMS_MATRIX[itemType] || CUSTOMS_MATRIX.industrial;
    const rule = categoryRules[pairKey] || categoryRules.default || { rate: 0.05, processingFee: 25.00, deMinimis: 0 };

    if (cargoValueUsd <= rule.deMinimis) {
      return {
        duties: rule.processingFee,
        manifest: [
          `Valuation: $${cargoValueUsd.toFixed(2)} (Below De Minimis)`,
          `Processing Fee: $${rule.processingFee.toFixed(2)}`
        ]
      };
    }

    const calculatedDuty = cargoValueUsd * rule.rate;
    const total = calculatedDuty + rule.processingFee;

    return {
      duties: total,
      manifest: [
        `HS Category: ${itemType.toUpperCase()}`,
        `Region Pair: ${pairKey}`,
        `Base Rate: ${(rule.rate * 100).toFixed(1)}%`,
        `Calculated: $${calculatedDuty.toFixed(2)}`,
        `Admin Fee: $${rule.processingFee.toFixed(2)}`
      ]
    };
  }
}
