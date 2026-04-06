import type { ShipmentParams } from './RiskModeler';

export interface LCLRule {
  class: string;
  incompatibleWith: string[];
  requires: string[];
}

export const HAZARD_RULES: LCLRule[] = [
  { class: 'Class 3 (Flammable)', incompatibleWith: ['Class 8 (Corrosive)', 'Class 5.1 (Oxidizing)'], requires: ['Ventilation'] },
  { class: 'Class 8 (Corrosive)', incompatibleWith: ['Class 3 (Flammable)', 'Class 4.1 (Flammable Solid)'], requires: ['Acid-resistant lining'] },
  { class: 'Class 5.1 (Oxidizing)', incompatibleWith: ['Class 3 (Flammable)', 'Perishables'], requires: ['Isolation'] }
];

export class LogisticsEngine {
  static determineMode(params: ShipmentParams): 'Dedicated Container' | 'Shared (Consolidated)' | 'Hybrid' {
    const { weight, sensitivity, isHazardous, priority } = params;

    // Use weight thresholds (approx 250kg ~ 1m3 for mix, 4000kg ~ full container floor stay)
    if (weight > 4000 || sensitivity > 0.8 || (isHazardous && weight > 2000)) {
      return 'Dedicated Container';
    }

    if (priority === 'balanced' && weight > 1000 && weight < 4000) {
      return 'Hybrid';
    }

    return 'Shared (Consolidated)';
  }

  static checkCompatibility(params: ShipmentParams, coLoadingCargoClass: string | null): { 
    isCompatible: boolean; 
    reason?: string;
    warning?: string;
  } {
    if (!coLoadingCargoClass) return { isCompatible: true };

    const rule = HAZARD_RULES.find(r => r.class === coLoadingCargoClass);
    const itemClass = params.isHazardous ? 'Hazardous' : 'General Goods'; 

    if (rule && rule.incompatibleWith.includes(itemClass)) {
      return { isCompatible: false, reason: `Safety Conflict: Cannot mix ${itemClass} with ${coLoadingCargoClass}` };
    }

    if (params.sensitivity > 0.6 && coLoadingCargoClass.includes('Industrial')) {
      return { isCompatible: true, warning: 'Handling Warning: Heavy industrial components may pose a risk to sensitive goods in a shared environment.' };
    }

    return { isCompatible: true };
  }
}
