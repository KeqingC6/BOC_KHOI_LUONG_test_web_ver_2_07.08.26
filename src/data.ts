import { SteelGrade, ConcreteClass, SteelShape } from './types';

export const INITIAL_STEEL_GRADES: SteelGrade[] = [
  {
    id: 'ct3',
    name: 'CT3',
    category: 'structural',
    standard: 'TCVN 1765:1975',
    fy: 235,
    fu: 373,
    density: 7850,
    elasticModulus: 206,
    description: 'Thép kết cấu carbon thông dụng tại Việt Nam (TCVN 1765:1975).'
  },
  {
    id: 'ss400',
    name: 'SS400',
    category: 'structural',
    standard: 'JIS G3101 (Nhật Bản)',
    fy: 245,
    fu: 400,
    density: 7850,
    elasticModulus: 200,
    description: 'Thép cán nóng thông dụng nhất cho nhà xưởng, dầm cột và bản mã.'
  },
  {
    id: 'ss540',
    name: 'SS540',
    category: 'structural',
    standard: 'JIS G3101 (Nhật Bản)',
    fy: 400,
    fu: 540,
    density: 7850,
    elasticModulus: 200,
    description: 'Thép tấm, thép hình cường độ cao tiêu chuẩn Nhật Bản.'
  },
  {
    id: 'sm400',
    name: 'SM400',
    category: 'structural',
    standard: 'JIS G3106 (Nhật Bản)',
    fy: 245,
    fu: 400,
    density: 7850,
    elasticModulus: 200,
    description: 'Thép kết cấu hàn tiêu chuẩn Nhật Bản.'
  },
  {
    id: 'sm490',
    name: 'SM490',
    category: 'structural',
    standard: 'JIS G3106 (Nhật Bản)',
    fy: 325,
    fu: 490,
    density: 7850,
    elasticModulus: 200,
    description: 'Thép kết cấu hàn cường độ cao, chịu lực lớn tiêu chuẩn Nhật Bản.'
  },
  {
    id: 's235jr',
    name: 'S235JR',
    category: 'structural',
    standard: 'EN 10025-2 (Châu Âu)',
    fy: 235,
    fu: 360,
    density: 7850,
    elasticModulus: 210,
    description: 'Thép kết cấu carbon tiêu chuẩn châu Âu, dễ hàn và định hình.'
  },
  {
    id: 's275jr',
    name: 'S275JR',
    category: 'structural',
    standard: 'EN 10025-2 (Châu Âu)',
    fy: 275,
    fu: 410,
    density: 7850,
    elasticModulus: 210,
    description: 'Thép kết cấu tiêu chuẩn châu Âu.'
  },
  {
    id: 's355jr',
    name: 'S355JR',
    category: 'structural',
    standard: 'EN 10025-2 (Châu Âu)',
    fy: 355,
    fu: 470,
    density: 7850,
    elasticModulus: 210,
    description: 'Thép kết cấu hợp kim thấp cường độ cao tiêu chuẩn châu Âu.'
  },
  {
    id: 'a36',
    name: 'A36',
    category: 'structural',
    standard: 'ASTM A36 (Mỹ)',
    fy: 250,
    fu: 400,
    density: 7850,
    elasticModulus: 200,
    description: 'Mác thép kết cấu carbon tiêu chuẩn Mỹ rất phổ biến cho các cấu kiện hàn.'
  },
  {
    id: 'a572gr50',
    name: 'A572 Gr.50',
    category: 'structural',
    standard: 'ASTM A572 (Mỹ)',
    fy: 345,
    fu: 450,
    density: 7850,
    elasticModulus: 200,
    description: 'Thép kết cấu cường độ cao hợp kim thấp tiêu chuẩn Mỹ.'
  },
  {
    id: 'q235b',
    name: 'Q235B',
    category: 'structural',
    standard: 'GB/T 700 - Trung Quốc',
    fy: 235,
    fu: 370,
    density: 7850,
    elasticModulus: 200,
    description: 'Thép kết cấu cacbon thông thường tiêu chuẩn Trung Quốc.'
  },
  {
    id: 'q345b',
    name: 'Q345B',
    category: 'structural',
    standard: 'GB/T 1591 - Trung Quốc',
    fy: 345,
    fu: 470,
    density: 7850,
    elasticModulus: 200,
    description: 'Thép hợp kim thấp, cường độ cao tiêu chuẩn Trung Quốc.'
  },
  {
    id: 'ct3_st3sp',
    name: 'CT3 (St3sp)',
    category: 'structural',
    standard: 'GOST 380-2005 (Nga)',
    fy: 235,
    fu: 370,
    density: 7850,
    elasticModulus: 200,
    description: 'Thép tấm, thép hình kết cấu cacbon tiêu chuẩn Nga.'
  },
  {
    id: 'cb240-t',
    name: 'CB240-T',
    category: 'rebar',
    standard: 'TCVN 1651:2018',
    fy: 240,
    fu: 380,
    density: 7850,
    elasticModulus: 200,
    description: 'Cốt thép bê tông dạng tròn trơn tiêu chuẩn Việt Nam.'
  },
  {
    id: 'cb300-v',
    name: 'CB300-V',
    category: 'rebar',
    standard: 'TCVN 1651:2018',
    fy: 300,
    fu: 450,
    density: 7850,
    elasticModulus: 200,
    description: 'Cốt thép bê tông dạng thanh vằn tiêu chuẩn Việt Nam.'
  },
  {
    id: 'cb400-v',
    name: 'CB400-V',
    category: 'rebar',
    standard: 'TCVN 1651:2018',
    fy: 400,
    fu: 570,
    density: 7850,
    elasticModulus: 200,
    description: 'Cốt thép bê tông dạng thanh vằn tiêu chuẩn Việt Nam.'
  },
  {
    id: 'cb500-v',
    name: 'CB500-V',
    category: 'rebar',
    standard: 'TCVN 1651:2018',
    fy: 500,
    fu: 650,
    density: 7850,
    elasticModulus: 200,
    description: 'Cốt thép bê tông dạng thanh vằn cường độ cao tiêu chuẩn Việt Nam.'
  },
  {
    id: 'sd295a',
    name: 'SD295A',
    category: 'rebar',
    standard: 'JIS G3112 (Nhật Bản)',
    fy: 295,
    fu: 440,
    density: 7850,
    elasticModulus: 200,
    description: 'Cốt thép bê tông cán nóng dạng thanh vằn tiêu chuẩn Nhật Bản.'
  },
  {
    id: 'sd390',
    name: 'SD390',
    category: 'rebar',
    standard: 'JIS G3112 (Nhật Bản)',
    fy: 390,
    fu: 560,
    density: 7850,
    elasticModulus: 200,
    description: 'Cốt thép bê tông cường độ cao tiêu chuẩn Nhật Bản.'
  },
  {
    id: 'grade40',
    name: 'Grade 40',
    category: 'rebar',
    standard: 'ASTM A615 (Mỹ)',
    fy: 280,
    fu: 420,
    density: 7850,
    elasticModulus: 200,
    description: 'Cốt thép bê tông tiêu chuẩn Mỹ cường độ trung bình.'
  },
  {
    id: 'grade60',
    name: 'Grade 60',
    category: 'rebar',
    standard: 'ASTM A615 (Mỹ)',
    fy: 420,
    fu: 620,
    density: 7850,
    elasticModulus: 200,
    description: 'Cốt thép bê tông cường độ cao tiêu chuẩn Mỹ.'
  }
];

export const STEEL_SHAPES: SteelShape[] = [
  { type: 'V', name: 'Angle Steel (L-shape)', vietnameseName: 'Thép V (Đều cạnh)', icon: 'Triangle' },
  { type: 'BOX', name: 'Hollow Section (Rect/Square)', vietnameseName: 'Thép Hộp Chữ Nhật', icon: 'Box' },
  { type: 'ROUND', name: 'Round Bar / Rebar', vietnameseName: 'Thép Tròn Trơn / Cốt Thép', icon: 'CircleDot' },
  { type: 'PIPE', name: 'Circular Hollow Section (Pipe)', vietnameseName: 'Thép Ống Tròn', icon: 'Circle' },
  { type: 'H_I', name: 'H / I Beam', vietnameseName: 'Thép hình H / I', icon: 'Columns2' },
  { type: 'U', name: 'U Channel', vietnameseName: 'Thép hình U', icon: 'Baseline' },
  { type: 'PLATE', name: 'Steel Plate / Flat Bar', vietnameseName: 'Thép Tấm / Thép Bản Mã', icon: 'Layers' },
  { type: 'Z', name: 'Z Purlin', vietnameseName: 'Xà Gồ Chữ Z', icon: 'ChevronsUp' },
  { type: 'C', name: 'C Purlin', vietnameseName: 'Xà Gồ Chữ C', icon: 'Menu' }
];

export const INITIAL_CONCRETE_CLASSES: ConcreteClass[] = [
  { id: 'b7.5', className: 'B7.5', gradeName: 'M100', rb: 4.5, rbt: 0.48, eb: 19.0, description: 'Bê tông lót hoặc cấu kiện chịu lực ít.' },
  { id: 'b12.5', className: 'B12.5', gradeName: 'M150', rb: 7.5, rbt: 0.66, eb: 23.0, description: 'Bê tông móng, sân vườn, cấu kiện nhỏ.' },
  { id: 'b15', className: 'B15', gradeName: 'M200', rb: 8.5, rbt: 0.75, eb: 24.0, description: 'Mác thông dụng cho nhà dân dụng thấp tầng.' },
  { id: 'b20', className: 'B20', gradeName: 'M250', rb: 11.5, rbt: 0.90, eb: 27.5, description: 'Mác phổ biến cho dầm, cột, sàn nhà phố.' },
  { id: 'b25', className: 'B25', gradeName: 'M300', rb: 14.5, rbt: 1.05, eb: 30.0, description: 'Cấp độ bền cao phổ biến cho dầm sàn nhịp lớn, nhà cao tầng.' },
  { id: 'b30', className: 'B30', gradeName: 'M400', rb: 17.0, rbt: 1.15, eb: 32.5, description: 'Dùng cho cấu kiện nhịp lớn, móng băng/móng bè tải trọng cao.' },
  { id: 'b35', className: 'B35', gradeName: 'M450', rb: 19.5, rbt: 1.25, eb: 34.5, description: 'Bê tông cường độ cao cho nhà cao tầng, cầu, cảng.' },
  { id: 'b40', className: 'B40', gradeName: 'M500', rb: 22.0, rbt: 1.40, eb: 36.0, description: 'Bê tông siêu cao cho dự án đặc thù, dầm dự ứng lực.' }
];

export interface ConversionCategory {
  name: string;
  icon: string;
  defaultLeft: string;
  defaultRight: string;
  presets: Array<{ label: string; value: string; unitLeft: string }>;
  units: Record<string, { name: string; factor: number }>;
}

export const CONVERSIONS: Record<string, ConversionCategory> = {
  length: {
    name: 'Độ dài',
    icon: 'Ruler',
    defaultLeft: 'mm',
    defaultRight: 'in',
    presets: [
      { label: '1 mm', value: '1', unitLeft: 'mm' },
      { label: '25.4 mm (1")', value: '25.4', unitLeft: 'mm' },
      { label: '1 inch', value: '1', unitLeft: 'in' },
      { label: '1 m', value: '1', unitLeft: 'm' }
    ],
    units: {
      mm: { name: 'Milimet (mm)', factor: 1e-3 },
      cm: { name: 'Centimet (cm)', factor: 1e-2 },
      m: { name: 'Mét (m)', factor: 1 },
      in: { name: 'Inch (in)', factor: 0.0254 },
      ft: { name: 'Foot (ft)', factor: 0.3048 }
    }
  },
  area: {
    name: 'Diện tích',
    icon: 'Layers',
    defaultLeft: 'sq_mm',
    defaultRight: 'sq_m',
    presets: [
      { label: '1 cm²', value: '1', unitLeft: 'sq_cm' },
      { label: '1 m²', value: '1', unitLeft: 'sq_m' }
    ],
    units: {
      sq_mm: { name: 'mm²', factor: 1e-6 },
      sq_cm: { name: 'cm²', factor: 1e-4 },
      sq_m: { name: 'm²', factor: 1 }
    }
  },
  mass: {
    name: 'Khối lượng',
    icon: 'Scale',
    defaultLeft: 'kg',
    defaultRight: 't',
    presets: [
      { label: '1 kg', value: '1', unitLeft: 'kg' },
      { label: '1 Tấn (t)', value: '1', unitLeft: 't' }
    ],
    units: {
      kg: { name: 'Kilogram (kg)', factor: 1 },
      t: { name: 'Tấn (t)', factor: 1000 },
      lb: { name: 'Pound (lb)', factor: 0.45359237 }
    }
  },
  volume: {
    name: 'Thể tích',
    icon: 'Box',
    defaultLeft: 'l',
    defaultRight: 'cu_m',
    presets: [
      { label: '1 Lít', value: '1', unitLeft: 'l' },
      { label: '1 m³', value: '1', unitLeft: 'cu_m' }
    ],
    units: {
      l: { name: 'Lít (l)', factor: 1e-3 },
      cu_m: { name: 'Mét khối (m³)', factor: 1 }
    }
  },
  pressure: {
    name: 'Áp suất / Độ bền',
    icon: 'Zap',
    defaultLeft: 'mpa',
    defaultRight: 'psi',
    presets: [
      { label: '1 MPa', value: '1', unitLeft: 'mpa' },
      { label: '1 Bar', value: '1', unitLeft: 'bar' }
    ],
    units: {
      pa: { name: 'Pascal (Pa)', factor: 1 },
      mpa: { name: 'Megapascal (MPa)', factor: 1e6 },
      bar: { name: 'Bar', factor: 100000 },
      psi: { name: 'PSI', factor: 6894.76 }
    }
  },
  temperature: {
    name: 'Nhiệt độ',
    icon: 'Activity',
    defaultLeft: 'c',
    defaultRight: 'f',
    presets: [
      { label: '0 °C', value: '0', unitLeft: 'c' },
      { label: '100 °C', value: '100', unitLeft: 'c' }
    ],
    units: {
      c: { name: 'Độ C (°C)', factor: 1 },
      f: { name: 'Độ F (°F)', factor: 1 }
    }
  }
};
