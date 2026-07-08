import { SteelGrade, SteelShapeType, SteelProperties } from './types';

export function calculateSteelProperties(
  shapeType: SteelShapeType,
  inputs: Record<string, number>,
  grade: SteelGrade
): SteelProperties {
  const fy = grade.fy;
  const density = grade.density;
  const L = inputs.L || 0;

  let areaMm2 = 0;
  let totalPaintAreaM2 = 0;
  let elasticSectionModulusW3 = 0;

  switch (shapeType) {
    case 'V': {
      const b = inputs.b || 0;
      const t = inputs.t || 0;
      areaMm2 = (2 * b - t) * t;
      totalPaintAreaM2 = 4 * (b / 1000) * L;
      if (b > 0 && t > 0 && b > t) {
        const A1 = b * t;
        const y1 = t / 2;
        const A2 = (b - t) * t;
        const y2 = t + (b - t) / 2;
        const y_c = (A1 * y1 + A2 * y2) / (A1 + A2);
        const I_x1 = (b * Math.pow(t, 3)) / 12 + A1 * Math.pow(y_c - y1, 2);
        const I_x2 = (t * Math.pow(b - t, 3)) / 12 + A2 * Math.pow(y_c - y2, 2);
        const I_x = I_x1 + I_x2;
        const y_max = Math.max(y_c, b - y_c);
        elasticSectionModulusW3 = I_x / y_max;
      }
      break;
    }
    case 'BOX': {
      const b = inputs.b || 0;
      const h = inputs.h || 0;
      const t = inputs.t || 0;
      if (b > 2 * t && h > 2 * t && t > 0) {
        areaMm2 = 2 * t * (b + h - 2 * t);
        totalPaintAreaM2 = (2 * (b + h)) / 1000 * L;
        const b_inner = b - 2 * t;
        const h_inner = h - 2 * t;
        const I_x = (b * Math.pow(h, 3) - b_inner * Math.pow(h_inner, 3)) / 12;
        elasticSectionModulusW3 = I_x / (h / 2);
      }
      break;
    }
    case 'ROUND': {
      const d = inputs.d || 0;
      areaMm2 = (Math.PI * Math.pow(d, 2)) / 4;
      totalPaintAreaM2 = Math.PI * (d / 1000) * L;
      elasticSectionModulusW3 = (Math.PI * Math.pow(d, 3)) / 32;
      break;
    }
    case 'PIPE': {
      const D = inputs.D || 0;
      const t = inputs.t || 0;
      if (D > 2 * t && t > 0) {
        areaMm2 = Math.PI * (D - t) * t;
        totalPaintAreaM2 = Math.PI * (D / 1000) * L;
        const Di = D - 2 * t;
        const I_x = (Math.PI * (Math.pow(D, 4) - Math.pow(Di, 4))) / 64;
        elasticSectionModulusW3 = I_x / (D / 2);
      }
      break;
    }
    case 'H_I': {
      const h = inputs.h || 0;
      const b = inputs.b || 0;
      const t1 = inputs.t1 || 0;
      const t2 = inputs.t2 || 0;
      if (h > 2 * t2 && b > t1 && t1 > 0 && t2 > 0) {
        const hw = h - 2 * t2;
        areaMm2 = hw * t1 + 2 * b * t2;
        totalPaintAreaM2 = (4 * b + 2 * h - 2 * t1) / 1000 * L;
        const I_web = (t1 * Math.pow(hw, 3)) / 12;
        const I_flanges = 2 * ((b * Math.pow(t2, 3)) / 12 + b * t2 * Math.pow(h / 2 - t2 / 2, 2));
        const I_x = I_web + I_flanges;
        elasticSectionModulusW3 = I_x / (h / 2);
      }
      break;
    }
    case 'U': {
      const h = inputs.h || 0;
      const b = inputs.b || 0;
      const t1 = inputs.t1 || 0;
      const t2 = inputs.t2 || 0;
      if (h > 2 * t2 && b > t1 && t1 > 0 && t2 > 0) {
        const hw = h - 2 * t2;
        areaMm2 = h * t1 + 2 * (b - t1) * t2;
        totalPaintAreaM2 = (4 * b + 2 * h - 4 * t1) / 1000 * L;
        const I_x = (b * Math.pow(h, 3) - (b - t1) * Math.pow(hw, 3)) / 12;
        elasticSectionModulusW3 = I_x / (h / 2);
      }
      break;
    }
    case 'PLATE': {
      const b = inputs.b || 0;
      const t = inputs.t || 0;
      areaMm2 = b * t;
      totalPaintAreaM2 = (2 * b) / 1000 * L;
      elasticSectionModulusW3 = (b * Math.pow(t, 2)) / 6;
      break;
    }
    case 'Z': {
      const H = inputs.H || 0;
      const E = inputs.E || 0;
      const F = inputs.F || 0;
      const a = inputs.a || 0;
      const t = inputs.t || 0;
      if (H > 2 * t && E > t && F > t && t > 0) {
        areaMm2 = (H + E + F + 2 * a - 4 * t) * t;
        totalPaintAreaM2 = (2 * (H + E + F + 2 * a)) / 1000 * L;
        const hw = H - t;
        const I_web = (t * Math.pow(hw, 3)) / 12;
        const I_flange_E = (E - t) * t * Math.pow(hw / 2, 2);
        const I_flange_F = (F - t) * t * Math.pow(hw / 2, 2);
        let I_lips = 0;
        if (a > 0) {
          const al = a - t / 2;
          I_lips = 2 * (al * t * Math.pow(H / 2 - a / 2, 2) + (t * Math.pow(al, 3)) / 12);
        }
        const I_x = I_web + I_flange_E + I_flange_F + I_lips;
        elasticSectionModulusW3 = I_x / (H / 2);
      }
      break;
    }
    case 'C': {
      const H = inputs.H || 0;
      const F = inputs.F || 0;
      const a = inputs.a || 0;
      const t = inputs.t || 0;
      if (H > 2 * t && F > t && t > 0) {
        areaMm2 = (H + 2 * F + 2 * a - 4 * t) * t;
        totalPaintAreaM2 = (2 * (H + 2 * F + 2 * a)) / 1000 * L;
        const hw = H - t;
        const I_web = (t * Math.pow(hw, 3)) / 12;
        const I_flanges = 2 * (F - t) * t * Math.pow(hw / 2, 2);
        let I_lips = 0;
        if (a > 0) {
          const al = a - t / 2;
          I_lips = 2 * (al * t * Math.pow(H / 2 - a / 2, 2) + (t * Math.pow(al, 3)) / 12);
        }
        const I_x = I_web + I_flanges + I_lips;
        elasticSectionModulusW3 = I_x / (H / 2);
      }
      break;
    }
  }

  const weightPerMeter = areaMm2 * 0.000001 * density;
  const totalWeightKg = weightPerMeter * L;
  const tensileCapacityKn = areaMm2 * fy * 0.001;
  const bendingCapacityKnm = elasticSectionModulusW3 * fy * 0.000001;

  return {
    areaMm2,
    weightPerMeter,
    totalWeightKg,
    totalPaintAreaM2,
    tensileCapacityKn,
    bendingCapacityKnm
  };
}

export function formatWithCommas(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  return value.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
