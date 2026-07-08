export interface SteelGrade {
  id: string;
  name: string;
  category: 'structural' | 'rebar';
  standard: string;
  fy: number; // MPa
  fu: number; // MPa
  density: number; // kg/m³
  elasticModulus: number; // GPa
  description: string;
}

export interface ConcreteClass {
  id: string;
  className: string;
  gradeName: string;
  rb: number; // MPa - compressive strength design
  rbt: number; // MPa - tensile strength design
  eb: number; // GPa - elastic modulus
  description: string;
}

export type SteelShapeType = 'V' | 'BOX' | 'ROUND' | 'PIPE' | 'H_I' | 'U' | 'PLATE' | 'Z' | 'C';

export interface SteelShape {
  type: SteelShapeType;
  name: string;
  vietnameseName: string;
  icon: string;
}

export interface SteelProperties {
  areaMm2: number;
  weightPerMeter: number;
  totalWeightKg: number;
  totalPaintAreaM2: number;
  tensileCapacityKn: number;
  bendingCapacityKnm: number;
}

export interface BOMItem {
  id: string;
  timestamp: number;
  shapeType: SteelShapeType;
  shapeLabel: string;
  gradeId: string;
  gradeName: string;
  inputs: Record<string, number>;
  results: SteelProperties;
  quantity: number;
  note: string;
}

export interface BOMTable {
  id: string;
  name: string;
  createdAt: number;
  items: BOMItem[];
}

export interface SavedConcreteItem {
  id: string;
  name: string;
  type: 'COLUMN_RECT' | 'COLUMN_CIRC' | 'BEAM' | 'SLAB';
  qty: number;
  concreteClass: string;
  concreteGrade: string;
  concreteVolume: number;
  concreteWeight: number;
  steelWeight: number;
  steelRatio: number;
  timestamp: number;
}
