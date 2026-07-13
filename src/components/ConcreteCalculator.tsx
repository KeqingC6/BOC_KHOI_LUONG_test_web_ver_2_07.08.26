import { useState, useEffect, useId } from 'react';
import { ConcreteClass, SavedConcreteItem } from '../types';
import { formatWithCommas } from '../utils';
import { Building, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ConcreteCalculatorProps {
  concreteClasses: ConcreteClass[];
}

export default function ConcreteCalculator({ concreteClasses }: ConcreteCalculatorProps) {
  const { t, language } = useLanguage();
  const [memberType, setMemberType] = useState<'COLUMN_RECT' | 'COLUMN_CIRC' | 'BEAM' | 'SLAB'>('COLUMN_RECT');
  const [concreteId, setConcreteId] = useState('b20');
  const [qty, setQty] = useState<number>(1);
  const [name, setName] = useState('');

  // Auto-generated unique IDs to avoid duplicate form IDs
  const selectConcreteId = useId();
  const inputQtyId = useId();
  const inputNameId = useId();

  const [dims, setDims] = useState<Record<string, Record<string, string>>>({
    COLUMN_RECT: { b: '400', h: '400', H: '3.6' },
    COLUMN_CIRC: { D: '400', H: '3.6' },
    BEAM: { b: '300', h: '600', L: '5.5' },
    SLAB: { B: '4.0', L: '6.0', h: '120' },
  });

  const [savedList, setSavedList] = useState<SavedConcreteItem[]>(() => {
    const saved = localStorage.getItem('concrete_saved_items');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('concrete_saved_items', JSON.stringify(savedList));
  }, [savedList]);

  const selectedConcrete = concreteClasses.find((c) => c.id === concreteId) || concreteClasses[3] || concreteClasses[0];

  const handleDimChange = (field: string, val: string) => {
    setDims((p) => ({
      ...p,
      [memberType]: {
        ...p[memberType],
        [field]: val,
      },
    }));
  };

  const calculateConcreteResults = () => {
    const currentDims = dims[memberType];
    let vol = 0;
    let steelWt = 0;

    if (memberType === 'COLUMN_RECT') {
      const b = parseFloat(currentDims.b) || 0;
      const h = parseFloat(currentDims.h) || 0;
      const H = parseFloat(currentDims.H) || 0;
      vol = (b / 1000) * (h / 1000) * H;
      steelWt = vol * 120; // 120 kg/m³
    } else if (memberType === 'COLUMN_CIRC') {
      const D = parseFloat(currentDims.D) || 0;
      const H = parseFloat(currentDims.H) || 0;
      vol = Math.PI * Math.pow(D / 2000, 2) * H;
      steelWt = vol * 110; // 110 kg/m³
    } else if (memberType === 'BEAM') {
      const b = parseFloat(currentDims.b) || 0;
      const h = parseFloat(currentDims.h) || 0;
      const L = parseFloat(currentDims.L) || 0;
      vol = (b / 1000) * (h / 1000) * L;
      steelWt = vol * 100; // 100 kg/m³
    } else if (memberType === 'SLAB') {
      const B = parseFloat(currentDims.B) || 0;
      const L = parseFloat(currentDims.L) || 0;
      const h = parseFloat(currentDims.h) || 0;
      vol = B * L * (h / 1000);
      steelWt = vol * 90; // 90 kg/m³
    }

    const totalVol = vol * qty;
    const totalConcreteWt = totalVol * 2.5; // tons
    const totalSteelWt = steelWt * qty;

    return {
      concreteVol: totalVol,
      concreteWt: totalConcreteWt,
      steelWt: totalSteelWt,
      steelRatio: totalVol > 0 ? totalSteelWt / totalVol : 0,
    };
  };

  const results = calculateConcreteResults();

  const handleSaveItem = () => {
    const defaultName = `${t('concreteCalc.memberTypes.' + memberType)} ${savedList.length + 1}`;
    const newItem: SavedConcreteItem = {
      id: `conc-${Date.now()}`,
      name: name.trim() || defaultName,
      type: memberType,
      qty,
      concreteClass: selectedConcrete.className,
      concreteGrade: selectedConcrete.gradeName,
      concreteVolume: results.concreteVol,
      concreteWeight: results.concreteWt,
      steelWeight: results.steelWt,
      steelRatio: results.steelRatio,
      timestamp: Date.now(),
    };
    setSavedList([newItem, ...savedList]);
    setName('');
  };

  // 3D Isometric View & 2D Cross Section calculations based on selected member type
  const currentDims = dims[memberType];
  const bVal = parseFloat(currentDims.b) || 0;
  const hVal = parseFloat(currentDims.h) || 0;
  const HVal = parseFloat(currentDims.H) || 0;
  const DVal = parseFloat(currentDims.D) || 0;
  const LVal = parseFloat(currentDims.L) || 0;
  const BVal = parseFloat(currentDims.B) || 0;

  let w3D = 60, h3D = 120, d3D = 40, dx = 30, dy = -15;
  let x0_3d = 180, y0_3d = 180;
  let rx3d = 30, ry3d = 10;
  
  let wSec = 100, hSec = 100, rSec = 50;
  let xSec = 600, ySec = 150;
  const cxSec = 600, cySec = 150;

  if (memberType === 'COLUMN_RECT') {
    const bVal_m = bVal / 1000;
    const hVal_m = hVal / 1000;
    const HVal_m = HVal;
    
    const maxDim3D = Math.max(0.1, bVal_m, hVal_m, HVal_m * 0.4);
    const scale3D = 90 / maxDim3D;
    w3D = Math.max(35, Math.min(85, bVal_m * scale3D));
    d3D = Math.max(35, Math.min(85, hVal_m * scale3D));
    h3D = Math.max(100, Math.min(160, HVal_m * 40));
    
    dx = d3D * 0.7;
    dy = -d3D * 0.4;
    x0_3d = 180 - (w3D + dx) / 2;
    y0_3d = 160 + (h3D + Math.abs(dy)) / 2;

    const maxDimSec = Math.max(0.1, bVal_m, hVal_m);
    const scaleSec = 140 / maxDimSec;
    wSec = Math.max(50, Math.min(160, bVal_m * scaleSec));
    hSec = Math.max(50, Math.min(160, hVal_m * scaleSec));
    xSec = cxSec - wSec / 2;
    ySec = cySec - hSec / 2;
  } else if (memberType === 'COLUMN_CIRC') {
    const DVal_m = DVal / 1000;
    const HVal_m = HVal;
    
    const maxDim3D = Math.max(0.1, DVal_m, HVal_m * 0.4);
    const scale3D = 90 / maxDim3D;
    w3D = Math.max(45, Math.min(100, DVal_m * scale3D));
    h3D = Math.max(100, Math.min(160, HVal_m * 40));
    
    rx3d = w3D / 2;
    ry3d = rx3d * 0.3;
    x0_3d = 180 - w3D / 2;
    y0_3d = 160 + h3D / 2;

    const scaleSec = 140 / DVal_m;
    rSec = Math.max(30, Math.min(80, (DVal_m / 2) * scaleSec));
  } else if (memberType === 'BEAM') {
    const bVal_m = bVal / 1000;
    const hVal_m = hVal / 1000;
    const LVal_m = LVal;
    
    const maxDim3D = Math.max(0.1, bVal_m, hVal_m, LVal_m * 0.3);
    const scale3D = 120 / maxDim3D;
    w3D = Math.max(100, Math.min(180, LVal_m * 25)); // w3D represents Length in horizontal beam
    h3D = Math.max(35, Math.min(75, hVal_m * scale3D));
    d3D = Math.max(30, Math.min(65, bVal_m * scale3D));
    
    dx = d3D * 0.7;
    dy = -d3D * 0.4;
    x0_3d = 180 - (w3D + dx) / 2;
    y0_3d = 150 + (h3D + Math.abs(dy)) / 2;

    const maxDimSec = Math.max(0.1, bVal_m, hVal_m);
    const scaleSec = 140 / maxDimSec;
    wSec = Math.max(50, Math.min(150, bVal_m * scaleSec));
    hSec = Math.max(50, Math.min(160, hVal_m * scaleSec));
    xSec = cxSec - wSec / 2;
    ySec = cySec - hSec / 2;
  } else if (memberType === 'SLAB') {
    const BVal_m = BVal;
    const LVal_m = LVal;
    const hVal_m = hVal / 1000;
    
    const maxDim3D = Math.max(0.1, BVal_m, LVal_m);
    const scale3D = 120 / maxDim3D;
    w3D = Math.max(100, Math.min(180, BVal_m * scale3D));
    d3D = Math.max(60, Math.min(110, LVal_m * scale3D));
    h3D = Math.max(12, Math.min(25, hVal_m * 150));
    
    dx = d3D * 0.7;
    dy = -d3D * 0.4;
    x0_3d = 180 - (w3D + dx) / 2;
    y0_3d = 150 + (h3D + Math.abs(dy)) / 2;

    hSec = Math.max(15, Math.min(75, hVal_m * 250));
    wSec = 220;
    xSec = cxSec - wSec / 2;
    ySec = cySec - hSec / 2;
  }

  // 3D Anchor points
  const fbl = { x: x0_3d, y: y0_3d };
  const fbr = { x: x0_3d + w3D, y: y0_3d };
  const ftr = { x: x0_3d + w3D, y: y0_3d - h3D };
  const ftl = { x: x0_3d, y: y0_3d - h3D };
  
  const bbl = { x: x0_3d + dx, y: y0_3d + dy };
  const bbr = { x: x0_3d + w3D + dx, y: y0_3d + dy };
  const btr = { x: x0_3d + w3D + dx, y: y0_3d - h3D + dy };
  const btl = { x: x0_3d + dx, y: y0_3d - h3D + dy };

  // Translate helper for concrete dimension inputs
  const getDimLabel = (k: string) => {
    if (k === 'b') return t('concreteCalc.b');
    if (k === 'h') return memberType === 'SLAB' ? t('concreteCalc.hSlab') : t('concreteCalc.h');
    if (k === 'H' || k === 'L') return t('concreteCalc.L');
    if (k === 'D') return t('concreteCalc.D');
    if (k === 'B') return t('concreteCalc.W');
    return `${k}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <Building className="text-orange-500 w-5 h-5" />
        <div>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
            {t('concreteCalc.selectMember')}
          </h3>
          <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {language === 'vi' ? 'Tiêu chuẩn TCVN 5574:2018' : 'Standard TCVN 5574:2018'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Member selector */}
          <div className="grid grid-cols-4 gap-2">
            {(['COLUMN_RECT', 'COLUMN_CIRC', 'BEAM', 'SLAB'] as const).map((tType) => (
              <button
                key={tType}
                onClick={() => setMemberType(tType)}
                className={`py-2 px-1.5 rounded-lg text-[10.5px] font-extrabold border transition-colors cursor-pointer text-center truncate ${
                  memberType === tType
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tType === 'COLUMN_RECT' ? (language === 'vi' ? 'Cột HCN' : 'Rect Column') : tType === 'COLUMN_CIRC' ? (language === 'vi' ? 'Cột Tròn' : 'Circ Column') : tType === 'BEAM' ? (language === 'vi' ? 'Dầm / Giằng' : 'Beam') : (language === 'vi' ? 'Sàn / Móng' : 'Slab')}
              </button>
            ))}
          </div>

          {/* Dimensional Parameter Inputs */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {Object.entries(dims[memberType]).map(([key, val]) => {
              const inputId = `conc-dim-${memberType}-${key}`;
              return (
                <div key={key} className="space-y-1">
                  <label htmlFor={inputId} className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    {getDimLabel(key)}
                  </label>
                  <input
                    type="number"
                    id={inputId}
                    step="any"
                    min="0"
                    value={val}
                    onChange={(e) => handleDimChange(key, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-black font-mono text-slate-800 focus:outline-none"
                  />
                </div>
              );
            })}
          </div>

          {/* Strength, quantity and name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor={selectConcreteId} className="block text-xs font-extrabold text-slate-600">{t('concreteCalc.concreteClass')}</label>
              <select
                id={selectConcreteId}
                value={concreteId}
                onChange={(e) => setConcreteId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:bg-white focus:outline-none cursor-pointer text-slate-800"
              >
                {concreteClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className} ({language === 'vi' ? 'Mác' : 'Mark'} {c.gradeName})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor={inputQtyId} className="block text-xs font-extrabold text-slate-600">{t('concreteCalc.qty')}</label>
              <input
                type="number"
                id={inputQtyId}
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-black font-mono focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={inputNameId} className="block text-xs font-extrabold text-slate-600">{t('concreteCalc.cols.name')}</label>
              <input
                type="text"
                id={inputNameId}
                placeholder={language === 'vi' ? 'Ví dụ: Cột C1 dầm D3...' : 'e.g., Column C1, Beam B3...'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSaveItem}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 active:scale-[0.99] text-white text-xs font-extrabold rounded-lg shadow-sm transition-all cursor-pointer font-sans uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> {t('concreteCalc.saveMember')}
          </button>
        </div>

        {/* Results Box */}
        <div className="lg:col-span-5 bg-orange-50/40 p-5 rounded-xl border border-orange-200/40 space-y-4">
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest block flex items-center gap-1">
            <Building className="w-3.5 h-3.5" /> {t('concreteCalc.resultsTitle')}
          </span>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-xs">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block">{t('concreteCalc.results.concreteVolume')}</span>
              <span className="text-base font-black font-mono text-slate-800">
                {formatWithCommas(results.concreteVol, 3)}{' '}
                <span className="text-[10px] text-slate-500 font-normal">m³</span>
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-xs">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block">{t('concreteCalc.results.concreteWeight')}</span>
              <span className="text-base font-black font-mono text-slate-800">
                {formatWithCommas(results.concreteWt, 2)}{' '}
                <span className="text-[10px] text-slate-500 font-normal">{language === 'vi' ? 'Tấn' : 'Tons'}</span>
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-xs">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block">{t('concreteCalc.results.steelWeight')}</span>
              <span className="text-lg font-black font-mono text-blue-600">
                {formatWithCommas(results.steelWt, 1)}{' '}
                <span className="text-[10px] text-slate-500 font-normal font-sans">kg</span>
              </span>
              <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">
                {language === 'vi' ? 'Tỷ suất hàm lượng: ' : 'Average steel ratio: '}{formatWithCommas(results.steelRatio, 1)} kg/m³
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic SVG Visualizer Panel */}
      <div className="lg:col-span-12 space-y-4 pt-2">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between relative">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              {language === 'vi' ? 'HÌNH VẼ MINH HỌA ĐỘNG (MM)' : 'LIVE INTERACTIVE DRAWING (MM)'}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            <svg viewBox="0 0 800 300" className="w-full max-w-[1050px] max-h-[380px] h-auto select-none font-mono">
              <defs>
                <pattern id="concrete-pattern-concrete" width="8" height="8" patternUnits="userSpaceOnUse">
                  <rect width="8" height="8" fill="#f1f5f9" />
                  <circle cx="2" cy="2" r="1" fill="#cbd5e1" />
                  <circle cx="6" cy="5" r="0.6" fill="#94a3b8" />
                </pattern>
              </defs>

              {/* Panel 1: 3D Isometric View */}
              <g>
                <rect x="10" y="25" width="370" height="255" fill="none" stroke="#e2e8f0" strokeWidth="1" rx="8" />
                <text x="195" y="42" textAnchor="middle" fill="#64748b" className="text-[10px] font-extrabold tracking-widest uppercase">
                  {language === 'vi' ? 'Phối cảnh 3D cấu kiện bê tông' : '3D Perspective of Concrete Member'}
                </text>

                {memberType === 'COLUMN_RECT' && (
                  <g>
                    {/* Top Face */}
                    <polygon
                      points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`}
                      fill="url(#concrete-pattern-concrete)"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <polygon
                      points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`}
                      fill="#ffffff"
                      fillOpacity="0.3"
                      pointerEvents="none"
                    />

                    {/* Back hidden lines */}
                    <line x1={bbl.x} y1={bbl.y} x2={btl.x} y2={btl.y} stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3,3" />
                    <line x1={bbl.x} y1={bbl.y} x2={fbl.x} y2={fbl.y} stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3,3" />
                    <line x1={bbl.x} y1={bbl.y} x2={bbr.x} y2={bbr.y} stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3,3" />

                    {/* Rebars mờ bên trong cột 3D */}
                    <line x1={fbl.x + 8} y1={fbl.y - 8} x2={ftl.x + 8} y2={ftl.y + 8} stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="2,2" />
                    <line x1={fbr.x - 8} y1={fbr.y - 8} x2={ftr.x - 8} y2={ftr.y + 8} stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="2,2" />
                    <line x1={btl.x + 8} y1={btl.y + 8} x2={bbl.x + 8} y2={bbl.y - 8} stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="2,2" />
                    <line x1={btr.x - 8} y1={btr.y + 8} x2={bbr.x - 8} y2={bbr.y - 8} stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="2,2" />

                    {/* Right Face */}
                    <polygon
                      points={`${fbr.x},${fbr.y} ${bbr.x},${bbr.y} ${btr.x},${btr.y} ${ftr.x},${ftr.y}`}
                      fill="url(#concrete-pattern-concrete)"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <polygon
                      points={`${fbr.x},${fbr.y} ${bbr.x},${bbr.y} ${btr.x},${btr.y} ${ftr.x},${ftr.y}`}
                      fill="#000000"
                      fillOpacity="0.1"
                      pointerEvents="none"
                    />

                    {/* Front Face */}
                    <polygon
                      points={`${fbl.x},${fbl.y} ${fbr.x},${fbr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`}
                      fill="url(#concrete-pattern-concrete)"
                      stroke="#64748b"
                      strokeWidth="1.2"
                    />
                    <polygon
                      points={`${fbl.x},${fbl.y} ${fbr.x},${fbr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`}
                      fill="#ffffff"
                      fillOpacity="0.1"
                      pointerEvents="none"
                    />

                    <text x="195" y="60" textAnchor="middle" fill="#0f172a" className="text-[10px] font-black tracking-widest bg-slate-100">{language === 'vi' ? 'BÊ TÔNG CỘT' : 'COLUMN CONCRETE'}</text>

                    {/* b (Width) */}
                    <line x1={fbl.x} y1={fbl.y + 12} x2={fbr.x} y2={fbr.y + 12} stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                    <path d={`M ${fbl.x},${fbl.y + 12} L ${fbl.x + 4},${fbl.y + 9} M ${fbl.x},${fbl.y + 12} L ${fbl.x + 4},${fbl.y + 15} M ${fbr.x},${fbr.y + 12} L ${fbr.x - 4},${fbr.y + 9} M ${fbr.x},${fbr.y + 12} L ${fbr.x - 4},${fbr.y + 15}`} stroke="#64748b" strokeWidth="0.8" />
                    <text x={fbl.x + w3D / 2} y={fbl.y + 22} textAnchor="middle" fill="#334155" className="text-[9px] font-black font-mono">b = {bVal} mm</text>

                    {/* h (Depth) */}
                    <line x1={fbr.x + 8} y1={fbr.y + 4} x2={bbr.x + 8} y2={bbr.y + 4} stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                    <path d={`M ${fbr.x + 8},${fbr.y + 4} L ${fbr.x + 10},${fbr.y} M ${fbr.x + 8},${fbr.y + 4} L ${fbr.x + 12},${fbr.y + 7} M ${bbr.x + 8},${bbr.y + 4} L ${bbr.x + 6},${bbr.y + 1} M ${bbr.x + 8},${bbr.y + 4} L ${bbr.x + 4},${bbr.y + 8}`} stroke="#64748b" strokeWidth="0.8" />
                    <text x={(fbr.x + bbr.x)/2 + 15} y={(fbr.y + bbr.y)/2 + 12} textAnchor="start" fill="#334155" className="text-[9px] font-black font-mono">L = {hVal} mm</text>

                    {/* H (Height) */}
                    <line x1={fbl.x - 12} y1={fbl.y} x2={ftl.x - 12} y2={ftl.y} stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                    <path d={`M ${fbl.x - 12},${fbl.y} L ${fbl.x - 15},${fbl.y - 4} M ${fbl.x - 12},${fbl.y} L ${fbl.x - 9},${fbl.y - 4} M ${ftl.x - 12},${ftl.y} L ${ftl.x - 15},${ftl.y + 4} M ${ftl.x - 12},${ftl.y} L ${ftl.x - 9},${ftl.y + 4}`} stroke="#64748b" strokeWidth="0.8" />
                    <text x={fbl.x - 18} y={(fbl.y + ftl.y) / 2 + 3} textAnchor="end" fill="#334155" className="text-[9px] font-black font-mono">H = {HVal} m</text>
                  </g>
                )}

                {memberType === 'COLUMN_CIRC' && (
                  <g>
                    {/* Bottom Elipse Back half */}
                    <path d={`M ${x0_3d},${y0_3d} A ${rx3d},${ry3d} 0 0,1 ${x0_3d + w3D},${y0_3d}`} fill="none" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3,3" />

                    {/* Thép dọc mờ chạy đứng */}
                    <line x1={x0_3d + rx3d * 0.4} y1={y0_3d + ry3d * 0.6} x2={x0_3d + rx3d * 0.4} y2={y0_3d - h3D + ry3d * 0.6} stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="2,2" />
                    <line x1={x0_3d + rx3d * 1.6} y1={y0_3d + ry3d * 0.6} x2={x0_3d + rx3d * 1.6} y2={y0_3d - h3D + ry3d * 0.6} stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="2,2" />
                    <line x1={x0_3d + rx3d * 0.7} y1={y0_3d - ry3d * 0.6} x2={x0_3d + rx3d * 0.7} y2={y0_3d - h3D - ry3d * 0.6} stroke="#f97316" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2,2" />
                    <line x1={x0_3d + rx3d * 1.3} y1={y0_3d - ry3d * 0.6} x2={x0_3d + rx3d * 1.3} y2={y0_3d - h3D - ry3d * 0.6} stroke="#f97316" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2,2" />

                    {/* Cylinder Body */}
                    <path d={`M ${x0_3d},${y0_3d - h3D} L ${x0_3d},${y0_3d} A ${rx3d},${ry3d} 0 0,0 ${x0_3d + w3D},${y0_3d} L ${x0_3d + w3D},${y0_3d - h3D} Z`} fill="url(#concrete-pattern-concrete)" stroke="#94a3b8" strokeWidth="1" />
                    <path d={`M ${x0_3d},${y0_3d - h3D} L ${x0_3d},${y0_3d} A ${rx3d},${ry3d} 0 0,0 ${x0_3d + w3D},${y0_3d} L ${x0_3d + w3D},${y0_3d - h3D} Z`} fill="#ffffff" fillOpacity="0.15" pointerEvents="none" />

                    {/* Top Elipse */}
                    <ellipse cx={x0_3d + rx3d} cy={y0_3d - h3D} rx={rx3d} ry={ry3d} fill="url(#concrete-pattern-concrete)" stroke="#64748b" strokeWidth="1.2" />
                    <ellipse cx={x0_3d + rx3d} cy={y0_3d - h3D} rx={rx3d} ry={ry3d} fill="#ffffff" fillOpacity="0.3" pointerEvents="none" />

                    <text x="195" y="60" textAnchor="middle" fill="#0f172a" className="text-[10px] font-black tracking-widest">{language === 'vi' ? 'CỘT TRÒN BTCT' : 'RC CIRCULAR COLUMN'}</text>

                    {/* D (Diameter) */}
                    <line x1={x0_3d} y1={y0_3d + 12} x2={x0_3d + w3D} y2={y0_3d + 12} stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                    <path d={`M ${x0_3d},${y0_3d + 12} L ${x0_3d + 4},${y0_3d + 9} M ${x0_3d},${y0_3d + 12} L ${x0_3d + 4},${y0_3d + 15} M ${x0_3d + w3D},${y0_3d + 12} L ${x0_3d + w3D - 4},${y0_3d + 9} M ${x0_3d + w3D},${y0_3d + 12} L ${x0_3d + w3D - 4},${y0_3d + 15}`} stroke="#64748b" strokeWidth="0.8" />
                    <text x={x0_3d + rx3d} y={y0_3d + 22} textAnchor="middle" fill="#334155" className="text-[9px] font-black font-mono">D = {DVal} mm</text>

                    {/* H (Height) */}
                    <line x1={x0_3d - 12} y1={y0_3d} x2={x0_3d - 12} y2={y0_3d - h3D} stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                    <path d={`M ${x0_3d - 12},${y0_3d} L ${x0_3d - 15},${y0_3d - 4} M ${x0_3d - 12},${y0_3d} L ${x0_3d - 9},${y0_3d - 4} M ${x0_3d - 12},${y0_3d - h3D} L ${x0_3d - 15},${y0_3d - h3D + 4} M ${x0_3d - 12},${y0_3d - h3D} L ${x0_3d - 9},${y0_3d - h3D + 4}`} stroke="#64748b" strokeWidth="0.8" />
                    <text x={x0_3d - 18} y={y0_3d - h3D / 2 + 3} textAnchor="end" fill="#334155" className="text-[9px] font-black font-mono">H = {HVal} m</text>
                  </g>
                )}

                {memberType === 'BEAM' && (
                  <g>
                    {/* Top Face */}
                    <polygon
                      points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`}
                      fill="url(#concrete-pattern-concrete)"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <polygon
                      points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`}
                      fill="#ffffff"
                      fillOpacity="0.3"
                      pointerEvents="none"
                    />

                    {/* Back hidden lines */}
                    <line x1={bbl.x} y1={bbl.y} x2={btl.x} y2={btl.y} stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3,3" />
                    <line x1={bbl.x} y1={bbl.y} x2={fbl.x} y2={fbl.y} stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3,3" />
                    <line x1={bbl.x} y1={bbl.y} x2={bbr.x} y2={bbr.y} stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3,3" />

                    {/* Rebars mờ bên trong dầm */}
                    <line x1={fbl.x + 8} y1={fbl.y - 8} x2={fbr.x - 8} y2={fbr.y - 8} stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="2,2" />
                    <line x1={ftl.x + 8} y1={ftl.y + 8} x2={ftr.x - 8} y2={ftr.y + 8} stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="2,2" />

                    {/* Right Face */}
                    <polygon
                      points={`${fbr.x},${fbr.y} ${bbr.x},${bbr.y} ${btr.x},${btr.y} ${ftr.x},${ftr.y}`}
                      fill="url(#concrete-pattern-concrete)"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <polygon
                      points={`${fbr.x},${fbr.y} ${bbr.x},${bbr.y} ${btr.x},${btr.y} ${ftr.x},${ftr.y}`}
                      fill="#000000"
                      fillOpacity="0.1"
                      pointerEvents="none"
                    />

                    {/* Front Face */}
                    <polygon
                      points={`${fbl.x},${fbl.y} ${fbr.x},${fbr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`}
                      fill="url(#concrete-pattern-concrete)"
                      stroke="#64748b"
                      strokeWidth="1.2"
                    />
                    <polygon
                      points={`${fbl.x},${fbl.y} ${fbr.x},${fbr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`}
                      fill="#ffffff"
                      fillOpacity="0.1"
                      pointerEvents="none"
                    />

                    <text x={fbl.x + w3D / 2} y={fbl.y - h3D / 2 + 3} textAnchor="middle" fill="#475569" className="text-[10px] font-black tracking-wider">{language === 'vi' ? 'DẦM BTCT' : 'RC BEAM'}</text>

                    {/* L (Length) */}
                    <line x1={fbl.x} y1={fbl.y + 12} x2={fbr.x} y2={fbr.y + 12} stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                    <path d={`M ${fbl.x},${fbl.y + 12} L ${fbl.x + 4},${fbl.y + 9} M ${fbl.x},${fbl.y + 12} L ${fbl.x + 4},${fbl.y + 15} M ${fbr.x},${fbr.y + 12} L ${fbr.x - 4},${fbr.y + 9} M ${fbr.x},${fbr.y + 12} L ${fbr.x - 4},${fbr.y + 15}`} stroke="#64748b" strokeWidth="0.8" />
                    <text x={fbl.x + w3D / 2} y={fbl.y + 22} textAnchor="middle" fill="#334155" className="text-[9px] font-black font-mono">L = {LVal} m</text>

                    {/* b (Width) */}
                    <line x1={fbr.x + 8} y1={fbr.y + 4} x2={bbr.x + 8} y2={bbr.y + 4} stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                    <path d={`M ${fbr.x + 8},${fbr.y + 4} L ${fbr.x + 10},${fbr.y} M ${fbr.x + 8},${fbr.y + 4} L ${fbr.x + 12},${fbr.y + 7} M ${bbr.x + 8},${bbr.y + 4} L ${bbr.x + 6},${bbr.y + 1} M ${bbr.x + 8},${bbr.y + 4} L ${bbr.x + 4},${bbr.y + 8}`} stroke="#64748b" strokeWidth="0.8" />
                    <text x={(fbr.x + bbr.x)/2 + 15} y={(fbr.y + bbr.y)/2 + 12} textAnchor="start" fill="#334155" className="text-[9px] font-black font-mono">b = {bVal} mm</text>

                    {/* h (Height) */}
                    <line x1={fbl.x - 12} y1={fbl.y} x2={ftl.x - 12} y2={ftl.y} stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                    <path d={`M ${fbl.x - 12},${fbl.y} L ${fbl.x - 15},${fbl.y - 4} M ${fbl.x - 12},${fbl.y} L ${fbl.x - 9},${fbl.y - 4} M ${ftl.x - 12},${ftl.y} L ${ftl.x - 15},${ftl.y + 4} M ${ftl.x - 12},${ftl.y} L ${ftl.x - 9},${ftl.y + 4}`} stroke="#64748b" strokeWidth="0.8" />
                    <text x={fbl.x - 18} y={(fbl.y + ftl.y) / 2 + 3} textAnchor="end" fill="#334155" className="text-[9px] font-black font-mono">h = {hVal} mm</text>
                  </g>
                )}

                {memberType === 'SLAB' && (
                  <g>
                    {/* Top Face */}
                    <polygon
                      points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`}
                      fill="url(#concrete-pattern-concrete)"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <polygon
                      points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`}
                      fill="#ffffff"
                      fillOpacity="0.3"
                      pointerEvents="none"
                    />

                    {/* Back hidden lines */}
                    <line x1={bbl.x} y1={bbl.y} x2={btl.x} y2={btl.y} stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3,3" />
                    <line x1={bbl.x} y1={bbl.y} x2={fbl.x} y2={fbl.y} stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3,3" />
                    <line x1={bbl.x} y1={bbl.y} x2={bbr.x} y2={bbr.y} stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3,3" />

                    {/* Steel Mesh mờ bên trong sàn */}
                    <line x1={ftl.x + 5} y1={ftl.y + 5} x2={bbl.x + 5} y2={bbl.y - 5} stroke="#f97316" strokeWidth="0.8" strokeOpacity="0.35" strokeDasharray="2,2" />
                    <line x1={ftr.x - 5} y1={ftr.y + 5} x2={bbr.x - 5} y2={bbr.y - 5} stroke="#f97316" strokeWidth="0.8" strokeOpacity="0.35" strokeDasharray="2,2" />

                    {/* Right Face */}
                    <polygon
                      points={`${fbr.x},${fbr.y} ${bbr.x},${bbr.y} ${btr.x},${btr.y} ${ftr.x},${ftr.y}`}
                      fill="url(#concrete-pattern-concrete)"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <polygon
                      points={`${fbr.x},${fbr.y} ${bbr.x},${bbr.y} ${btr.x},${btr.y} ${ftr.x},${ftr.y}`}
                      fill="#000000"
                      fillOpacity="0.1"
                      pointerEvents="none"
                    />

                    {/* Front Face */}
                    <polygon
                      points={`${fbl.x},${fbl.y} ${fbr.x},${fbr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`}
                      fill="url(#concrete-pattern-concrete)"
                      stroke="#64748b"
                      strokeWidth="1.2"
                    />
                    <polygon
                      points={`${fbl.x},${fbl.y} ${fbr.x},${fbr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`}
                      fill="#ffffff"
                      fillOpacity="0.1"
                      pointerEvents="none"
                    />

                    <text x={fbl.x + w3D / 2} y={fbl.y - h3D / 2 + 3} textAnchor="middle" fill="#475569" className="text-[10px] font-black tracking-wider">{language === 'vi' ? 'SÀN / MÓNG BTCT' : 'RC SLAB / FOOTING'}</text>

                    {/* B (Width) */}
                    <line x1={fbl.x} y1={fbl.y + 12} x2={fbr.x} y2={fbr.y + 12} stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                    <path d={`M ${fbl.x},${fbl.y + 12} L ${fbl.x + 4},${fbl.y + 9} M ${fbl.x},${fbl.y + 12} L ${fbl.x + 4},${fbl.y + 15} M ${fbr.x},${fbr.y + 12} L ${fbr.x - 4},${fbr.y + 9} M ${fbr.x},${fbr.y + 12} L ${fbr.x - 4},${fbr.y + 15}`} stroke="#64748b" strokeWidth="0.8" />
                    <text x={fbl.x + w3D / 2} y={fbl.y + 22} textAnchor="middle" fill="#334155" className="text-[9px] font-black font-mono">B = {BVal} m</text>

                    {/* L (Length) */}
                    <line x1={fbr.x + 8} y1={fbr.y + 4} x2={bbr.x + 8} y2={bbr.y + 4} stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                    <path d={`M ${fbr.x + 8},${fbr.y + 4} L ${fbr.x + 10},${fbr.y} M ${fbr.x + 8},${fbr.y + 4} L ${fbr.x + 12},${fbr.y + 7} M ${bbr.x + 8},${bbr.y + 4} L ${bbr.x + 6},${bbr.y + 1} M ${bbr.x + 8},${bbr.y + 4} L ${bbr.x + 4},${bbr.y + 8}`} stroke="#64748b" strokeWidth="0.8" />
                    <text x={(fbr.x + bbr.x)/2 + 15} y={(fbr.y + bbr.y)/2 + 12} textAnchor="start" fill="#334155" className="text-[9px] font-black font-mono">L = {LVal} m</text>

                    {/* h (Thickness) */}
                    <line x1={fbl.x - 12} y1={fbl.y} x2={ftl.x - 12} y2={ftl.y} stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                    <path d={`M ${fbl.x - 12},${fbl.y} L ${fbl.x - 15},${fbl.y - 4} M ${fbl.x - 12},${fbl.y} L ${fbl.x - 9},${fbl.y - 4} M ${ftl.x - 12},${ftl.y} L ${ftl.x - 15},${ftl.y + 4} M ${ftl.x - 12},${ftl.y} L ${ftl.x - 9},${ftl.y + 4}`} stroke="#64748b" strokeWidth="0.8" />
                    <text x={fbl.x - 18} y={(fbl.y + ftl.y) / 2 + 3} textAnchor="end" fill="#334155" className="text-[9px] font-black font-mono">h = {hVal} mm</text>
                  </g>
                )}
              </g>

              {/* Panel 2: Cross section & Rebars layout */}
              <g>
                <rect x="400" y="25" width="390" height="255" fill="none" stroke="#e2e8f0" strokeWidth="1" rx="8" />
                <text x="595" y="42" textAnchor="middle" fill="#64748b" className="text-[10px] font-extrabold tracking-widest uppercase">
                  {language === 'vi' ? 'Mặt cắt ngang & Bố trí cốt thép' : 'Cross Section & Rebar Details'}
                </text>

                {memberType === 'COLUMN_RECT' && (
                  <g>
                    {/* Concrete profile */}
                    <rect x={xSec} y={ySec} width={wSec} height={hSec} fill="url(#concrete-pattern-concrete)" stroke="#475569" strokeWidth="1.5" />
                    <rect x={xSec} y={ySec} width={wSec} height={hSec} fill="#ffffff" fillOpacity="0.2" pointerEvents="none" />

                    {/* Stirrup (Đai cột) - Wraps around outer edge and curves at the 4 corners */}
                    <path
                      d={
                        `M ${xSec + 5.5},${ySec + 11} ` +
                        `A 5.5,5.5 0 0,1 ${xSec + 11},${ySec + 5.5} ` +
                        `L ${xSec + wSec - 11},${ySec + 5.5} ` +
                        `A 5.5,5.5 0 0,1 ${xSec + wSec - 5.5},${ySec + 11} ` +
                        `L ${xSec + wSec - 5.5},${ySec + hSec - 11} ` +
                        `A 5.5,5.5 0 0,1 ${xSec + wSec - 11},${ySec + hSec - 5.5} ` +
                        `L ${xSec + 11},${ySec + hSec - 5.5} ` +
                        `A 5.5,5.5 0 0,1 ${xSec + 5.5},${ySec + hSec - 11} ` +
                        `Z`
                      }
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="1.5"
                    />

                    {/* Corner Rebars */}
                    <circle cx={xSec + 11} cy={ySec + 11} r="5.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                    <circle cx={xSec + wSec - 11} cy={ySec + 11} r="5.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                    <circle cx={xSec + 11} cy={ySec + hSec - 11} r="5.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                    <circle cx={xSec + wSec - 11} cy={ySec + hSec - 11} r="5.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />

                    {/* Mid Rebars (dynamic based on size) */}
                    {hSec > 95 && (
                      <>
                        <circle cx={xSec + 11} cy={ySec + hSec / 2} r="5.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                        <circle cx={xSec + wSec - 11} cy={ySec + hSec / 2} r="5.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                      </>
                    )}
                    {wSec > 95 && (
                      <>
                        <circle cx={xSec + wSec / 2} cy={ySec + 11} r="5.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                        <circle cx={xSec + wSec / 2} cy={ySec + hSec - 11} r="5.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                      </>
                    )}

                    <text x={cxSec} y={cySec + 4} textAnchor="middle" fill="#1e293b" className="text-[10px] font-extrabold tracking-widest bg-white/70">{language === 'vi' ? 'MẶT CẮT CỘT' : 'COLUMN SECTION'}</text>

                    {/* b Dimension */}
                    <line x1={xSec} y1={ySec + hSec + 12} x2={xSec + wSec} y2={ySec + hSec + 12} stroke="#475569" strokeWidth="0.8" />
                    <path d={`M ${xSec},${ySec + hSec + 12} L ${xSec + 4},${ySec + hSec + 9} M ${xSec},${ySec + hSec + 12} L ${xSec + 4},${ySec + hSec + 15} M ${xSec + wSec},${ySec + hSec + 12} L ${xSec + wSec - 4},${ySec + hSec + 9} M ${xSec + wSec},${ySec + hSec + 12} L ${xSec + wSec - 4},${ySec + hSec + 15}`} stroke="#475569" strokeWidth="0.8" />
                    <text x={cxSec} y={ySec + hSec + 22} textAnchor="middle" fill="#1e293b" className="text-[9px] font-extrabold font-mono">b = {bVal} mm</text>

                    {/* L Dimension */}
                    <line x1={xSec + wSec + 12} y1={ySec} x2={xSec + wSec + 12} y2={ySec + hSec} stroke="#475569" strokeWidth="0.8" />
                    <path d={`M ${xSec + wSec + 12},${ySec} L ${xSec + wSec + 9},${ySec + 4} M ${xSec + wSec + 12},${ySec} L ${xSec + wSec + 15},${ySec + 4} M ${xSec + wSec + 12},${ySec + hSec} L ${xSec + wSec + 9},${ySec + hSec - 4} M ${xSec + wSec + 12},${ySec + hSec} L ${xSec + wSec + 15},${ySec + hSec - 4}`} stroke="#475569" strokeWidth="0.8" />
                    <text x={xSec + wSec + 18} y={cySec + 3} textAnchor="start" fill="#1e293b" className="text-[9px] font-extrabold font-mono">L = {hVal} mm</text>
                  </g>
                )}

                {memberType === 'COLUMN_CIRC' && (
                  <g>
                    {/* Circle concrete profile */}
                    <circle cx={cxSec} cy={cySec} r={rSec} fill="url(#concrete-pattern-concrete)" stroke="#475569" strokeWidth="1.5" />
                    <circle cx={cxSec} cy={cySec} r={rSec} fill="#ffffff" fillOpacity="0.2" pointerEvents="none" />

                    {/* Circle Stirrup (Đai tròn) - Wraps around the outer edge of steel rebars */}
                    <circle cx={cxSec} cy={cySec} r={rSec - 5.5} fill="none" stroke="#ea580c" strokeWidth="1.5" />

                    {/* Distributed circular rebars */}
                    {[0, 60, 120, 180, 240, 300].map((angleDegree, idx) => {
                      const angleRad = (angleDegree * Math.PI) / 180;
                      const rRebar = rSec - 11;
                      const bx = cxSec + rRebar * Math.cos(angleRad);
                      const by = cySec + rRebar * Math.sin(angleRad);
                      return (
                        <circle key={idx} cx={bx} cy={by} r="5.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                      );
                    })}

                    <text x={cxSec} y={cySec + 4} textAnchor="middle" fill="#1e293b" className="text-[10px] font-extrabold tracking-widest">{language === 'vi' ? 'MẶT CẮT TRÒN' : 'CIRCULAR SECTION'}</text>

                    {/* Diameter Dimension line */}
                    <line x1={cxSec - rSec} y1={cySec + rSec + 12} x2={cxSec + rSec} y2={cySec + rSec + 12} stroke="#475569" strokeWidth="0.8" />
                    <path d={`M ${cxSec - rSec},${cySec + rSec + 12} L ${cxSec - rSec + 4},${cySec + rSec + 9} M ${cxSec - rSec},${cySec + rSec + 12} L ${cxSec - rSec + 4},${cySec + rSec + 15} M ${cxSec + rSec},${cySec + rSec + 12} L ${cxSec + rSec - 4},${cySec + rSec + 9} M ${cxSec + rSec},${cySec + rSec + 12} L ${cxSec + rSec - 4},${cySec + rSec + 15}`} stroke="#475569" strokeWidth="0.8" />
                    <text x={cxSec} y={cySec + rSec + 22} textAnchor="middle" fill="#1e293b" className="text-[9px] font-extrabold font-mono">D = {DVal} mm</text>
                  </g>
                )}

                {memberType === 'BEAM' && (
                  <g>
                    {/* Concrete profile */}
                    <rect x={xSec} y={ySec} width={wSec} height={hSec} fill="url(#concrete-pattern-concrete)" stroke="#475569" strokeWidth="1.5" />
                    <rect x={xSec} y={ySec} width={wSec} height={hSec} fill="#ffffff" fillOpacity="0.2" pointerEvents="none" />

                    {/* Stirrup (Đai dầm) - Wraps around outer edge and curves at the 4 corners */}
                    <path
                      d={
                        `M ${xSec + 5.5},${ySec + 11} ` +
                        `A 5.5,5.5 0 0,1 ${xSec + 11},${ySec + 5.5} ` +
                        `L ${xSec + wSec - 11},${ySec + 5.5} ` +
                        `A 5.5,5.5 0 0,1 ${xSec + wSec - 5.5},${ySec + 11} ` +
                        `L ${xSec + wSec - 5.5},${ySec + hSec - 11} ` +
                        `A 5.5,5.5 0 0,1 ${xSec + wSec - 11},${ySec + hSec - 5.5} ` +
                        `L ${xSec + 11},${ySec + hSec - 5.5} ` +
                        `A 5.5,5.5 0 0,1 ${xSec + 5.5},${ySec + hSec - 11} ` +
                        `Z`
                      }
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="1.5"
                    />

                    {/* Top Steel Layer */}
                    <circle cx={xSec + 11} cy={ySec + 11} r="5.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                    <circle cx={xSec + wSec - 11} cy={ySec + 11} r="5.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                    
                    {/* Bottom Steel Layer */}
                    <circle cx={xSec + 11} cy={ySec + hSec - 11} r="5.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                    <circle cx={xSec + wSec - 11} cy={ySec + hSec - 11} r="5.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                    <circle cx={xSec + wSec / 2} cy={ySec + hSec - 11} r="5.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />

                    <text x={cxSec} y={cySec - hSec / 2 + 25} textAnchor="middle" fill="#1e293b" className="text-[9px] font-extrabold tracking-widest">{language === 'vi' ? 'MẶT CẮT DẦM' : 'BEAM SECTION'}</text>

                    {/* b Dimension */}
                    <line x1={xSec} y1={ySec + hSec + 12} x2={xSec + wSec} y2={ySec + hSec + 12} stroke="#475569" strokeWidth="0.8" />
                    <path d={`M ${xSec},${ySec + hSec + 12} L ${xSec + 4},${ySec + hSec + 9} M ${xSec},${ySec + hSec + 12} L ${xSec + 4},${ySec + hSec + 15} M ${xSec + wSec},${ySec + hSec + 12} L ${xSec + wSec - 4},${ySec + hSec + 9} M ${xSec + wSec},${ySec + hSec + 12} L ${xSec + wSec - 4},${ySec + hSec + 15}`} stroke="#475569" strokeWidth="0.8" />
                    <text x={cxSec} y={ySec + hSec + 22} textAnchor="middle" fill="#1e293b" className="text-[9px] font-extrabold font-mono">b = {bVal} mm</text>

                    {/* h Dimension */}
                    <line x1={xSec + wSec + 12} y1={ySec} x2={xSec + wSec + 12} y2={ySec + hSec} stroke="#475569" strokeWidth="0.8" />
                    <path d={`M ${xSec + wSec + 12},${ySec} L ${xSec + wSec + 9},${ySec + 4} M ${xSec + wSec + 12},${ySec} L ${xSec + wSec + 15},${ySec + 4} M ${xSec + wSec + 12},${ySec + hSec} L ${xSec + wSec + 9},${ySec + hSec - 4} M ${xSec + wSec + 12},${ySec + hSec} L ${xSec + wSec + 15},${ySec + hSec - 4}`} stroke="#475569" strokeWidth="0.8" />
                    <text x={xSec + wSec + 18} y={cySec + 3} textAnchor="start" fill="#1e293b" className="text-[9px] font-extrabold font-mono">h = {hVal} mm</text>
                  </g>
                )}

                {memberType === 'SLAB' && (
                  <g>
                    {/* Concrete slab profile */}
                    <rect x={xSec} y={ySec} width={wSec} height={hSec} fill="url(#concrete-pattern-concrete)" stroke="#475569" strokeWidth="1.5" />
                    <rect x={xSec} y={ySec} width={wSec} height={hSec} fill="#ffffff" fillOpacity="0.2" pointerEvents="none" />
                    
                    {/* Bottom Steel bars */}
                    <line x1={xSec + 8} y1={ySec + hSec - 8} x2={xSec + wSec - 8} y2={ySec + hSec - 8} stroke="#ea580c" strokeWidth="1.8" />

                    {/* Bottom perpendicular distribution - sitting on top of the horizontal line */}
                    {[15, 50, 85, 120, 155, 190, 205].map((off, idx) => (
                      <circle key={`b-${idx}`} cx={xSec + off} cy={ySec + hSec - 11} r="3" fill="#f97316" stroke="#ea580c" strokeWidth="0.8" />
                    ))}

                    <text x={cxSec} y={cySec + hSec / 2 + 20} textAnchor="middle" fill="#1e293b" className="text-[9px] font-bold tracking-widest">{language === 'vi' ? 'MẶT CẮT SÀN (LƯỚI THÉP 1 LỚP)' : 'SLAB SECTION (1-LAYER REBAR)'}</text>

                    {/* h thickness Dimension */}
                    <line x1={xSec + wSec + 12} y1={ySec} x2={xSec + wSec + 12} y2={ySec + hSec} stroke="#475569" strokeWidth="0.8" />
                    <path d={`M ${xSec + wSec + 12},${ySec} L ${xSec + wSec + 9},${ySec + 4} M ${xSec + wSec + 12},${ySec} L ${xSec + wSec + 15},${ySec + 4} M ${xSec + wSec + 12},${ySec + hSec} L ${xSec + wSec + 9},${ySec + hSec - 4} M ${xSec + wSec + 12},${ySec + hSec} L ${xSec + wSec + 15},${ySec + hSec - 4}`} stroke="#475569" strokeWidth="0.8" />
                    <text x={xSec + wSec + 18} y={cySec + 3} textAnchor="start" fill="#1e293b" className="text-[9px] font-extrabold font-mono">h = {hVal} mm</text>
                  </g>
                )}
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Database log section */}
      {savedList.length > 0 && (
        <div className="pt-4 border-t border-slate-100 animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {language === 'vi' ? 'Danh sách cấu kiện đã lưu' : 'Saved Members List'} ({savedList.length})
            </h4>
            <button
              onClick={() => {
                if (confirm(language === 'vi' ? 'Xóa toàn bộ thống kê bê tông?' : 'Clear all concrete calculations?')) {
                  setSavedList([]);
                }
              }}
              className="text-[10.5px] text-red-600 hover:text-red-700 font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> {language === 'vi' ? 'Xóa tất cả' : 'Clear all'}
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-500 uppercase tracking-widest text-[9px]">
                  <th className="px-4 py-3 text-center w-12">{language === 'vi' ? 'STT' : 'No.'}</th>
                  <th className="px-4 py-3">{t('concreteCalc.cols.name')}</th>
                  <th className="px-4 py-3">{language === 'vi' ? 'Phân loại cấu kiện' : 'Member Type'}</th>
                  <th className="px-4 py-3 text-center">{language === 'vi' ? 'Bê tông' : 'Concrete'}</th>
                  <th className="px-4 py-3 text-right">{language === 'vi' ? 'Khối lượng V (m³)' : 'Volume V (m³)'}</th>
                  <th className="px-4 py-3 text-right">{language === 'vi' ? 'Lượng thép (kg)' : 'Steel (kg)'}</th>
                  <th className="px-4 py-3 text-center w-12">{language === 'vi' ? 'Xóa' : 'Delete'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {savedList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-extrabold text-slate-800">{item.name}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-500 text-[10.5px]">
                      {item.type === 'COLUMN_RECT'
                        ? (language === 'vi' ? 'Cột chữ nhật' : 'Rectangular Column')
                        : item.type === 'COLUMN_CIRC'
                        ? (language === 'vi' ? 'Cột tròn xoay' : 'Circular Column')
                        : item.type === 'BEAM'
                        ? (language === 'vi' ? 'Dầm bê tông cốt thép' : 'Concrete Beam')
                        : (language === 'vi' ? 'Bản sàn / Móng bè' : 'Slab / Footing')}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold">{item.concreteClass}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-slate-800">
                      {formatWithCommas(item.concreteVolume, 3)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-black text-blue-600">
                      {formatWithCommas(item.steelWeight, 1)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => setSavedList(savedList.filter((s) => s.id !== item.id))}
                        className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        id={`btn-del-conc-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
