import { useState, useEffect, useId, ComponentType } from 'react';
import { SteelGrade, BOMTable, SteelShapeType } from '../types';
import { STEEL_SHAPES } from '../data';
import { calculateSteelProperties, formatWithCommas } from '../utils';
import ShapeDrawing from './ShapeDrawing';
import * as Icons from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ShapeIcon = ({ type, className }: { type: SteelShapeType; className?: string }) => {
  if (type === 'V') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {/* L-profile (Equal leg angle) */}
        <path d="M 8,7 L 8,17 L 18,17" />
      </svg>
    );
  }
  if (type === 'BOX') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {/* Square Hollow Section profile */}
        <rect x="6" y="6" width="12" height="12" rx="1.5" />
      </svg>
    );
  }
  if (type === 'H_I') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {/* I-beam profile */}
        <path d="M 7,7 L 17,7 M 12,7 L 12,17 M 7,17 L 17,17" />
      </svg>
    );
  }
  if (type === 'U') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {/* Channel profile (U-shape) */}
        <path d="M 16,7 L 8,7 L 8,17 L 16,17" />
      </svg>
    );
  }
  if (type === 'Z') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {/* Z Purlin: Top flange goes left with lip going down; Bottom flange goes right with lip going up */}
        <path d="M 7,9 L 7,5 L 12,5 L 12,19 L 17,19 L 17,15" />
      </svg>
    );
  }
  if (type === 'C') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {/* C Purlin: Channel shape with lips */}
        <path d="M 16,8 L 16,5 L 8,5 L 8,19 L 16,19 L 16,16" />
      </svg>
    );
  }
  const shape = STEEL_SHAPES.find((s) => s.type === type);
  const IconComponent =
    (Icons[shape?.icon as keyof typeof Icons] as ComponentType<{ className?: string }>) ||
    Icons.HelpCircle;
  return <IconComponent className={className} />;
};

interface SteelShapeCalculatorProps {
  grades: SteelGrade[];
  bomTables: BOMTable[];
  targetTableId: string;
  setTargetTableId: (id: string) => void;
  onSaveToHistory: (
    shapeType: SteelShapeType,
    shapeLabel: string,
    gradeId: string,
    gradeName: string,
    inputs: Record<string, number>,
    results: any,
    qty: number,
    note: string
  ) => void;
}

export default function SteelShapeCalculator({
  grades,
  bomTables,
  targetTableId,
  setTargetTableId,
  onSaveToHistory,
}: SteelShapeCalculatorProps) {
  const { t, language, translateShape } = useLanguage();
  const [activeShape, setActiveShape] = useState<SteelShapeType>(() => {
    const saved = localStorage.getItem('steel_calc_active_shape');
    return (saved as SteelShapeType) || 'V';
  });
  const [isSelectorExpanded, setIsSelectorExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('steel_calc_selector_expanded');
    return saved !== null ? saved === 'true' : true;
  });
  const [selectedGradeId, setSelectedGradeId] = useState<string>(() => {
    const saved = localStorage.getItem('steel_calc_selected_grade_id');
    return saved || 'ct3';
  });
  const [quantity, setQuantity] = useState<number | ''>(() => {
    const saved = localStorage.getItem('steel_calc_quantity');
    return saved !== null ? (saved === '' ? '' : parseInt(saved, 10) || 1) : 1;
  });
  const [note, setNote] = useState<string>(() => {
    const saved = localStorage.getItem('steel_calc_note');
    return saved || '';
  });

  // Auto-generated unique IDs for form elements to avoid conflicts
  const selectGradeId = useId();
  const selectTargetTableId = useId();
  const inputQtyId = useId();
  const inputNoteId = useId();

  const [inputs, setInputs] = useState<Record<SteelShapeType, Record<string, string>>>(() => {
    const saved = localStorage.getItem('steel_calc_inputs');
    const defaultInputs = {
      V: { b: '50', t: '5', L: '6' },
      BOX: { b: '40', h: '80', t: '2', L: '6' },
      ROUND: { d: '16', L: '11.7' },
      PIPE: { D: '114', t: '4', L: '6' },
      H_I: { h: '200', b: '100', t1: '5.5', t2: '8', L: '12' },
      U: { h: '150', b: '75', t1: '6.5', t2: '10', L: '12' },
      PLATE: { b: '200', t: '10', L: '1.5' },
      Z: { H: '200', E: '62', F: '58', a: '20', t: '2', L: '6' },
      C: { H: '150', F: '50', a: '15', t: '2', L: '6' },
    };
    return saved ? JSON.parse(saved) : defaultInputs;
  });

  // Save changes to localStorage to enable complete state persistence
  useEffect(() => {
    localStorage.setItem('steel_calc_active_shape', activeShape);
  }, [activeShape]);

  useEffect(() => {
    localStorage.setItem('steel_calc_selector_expanded', String(isSelectorExpanded));
  }, [isSelectorExpanded]);

  useEffect(() => {
    localStorage.setItem('steel_calc_selected_grade_id', selectedGradeId);
  }, [selectedGradeId]);

  useEffect(() => {
    localStorage.setItem('steel_calc_quantity', String(quantity));
  }, [quantity]);

  useEffect(() => {
    localStorage.setItem('steel_calc_note', note);
  }, [note]);

  useEffect(() => {
    localStorage.setItem('steel_calc_inputs', JSON.stringify(inputs));
  }, [inputs]);

  const handleInputChange = (field: string, val: string) => {
    setInputs((prev) => ({
      ...prev,
      [activeShape]: {
        ...prev[activeShape],
        [field]: val,
      },
    }));
  };

  const currentInputs = inputs[activeShape];
  const numInputs: Record<string, number> = {};
  Object.entries(currentInputs).forEach(([k, v]) => {
    numInputs[k] = parseFloat(v as string) || 0;
  });

  const selectedGrade = grades.find((g) => g.id === selectedGradeId) || grades[0];
  const results = calculateSteelProperties(activeShape, numInputs, selectedGrade);

  const handleSave = () => {
    const shapeLabel = `${translateShape(activeShape)} (${Object.entries(currentInputs)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ')})`;

    onSaveToHistory(
      activeShape,
      shapeLabel,
      selectedGrade.id,
      selectedGrade.name,
      numInputs,
      results,
      quantity || 1,
      note.trim() || `${translateShape(activeShape)}`
    );

    setQuantity(1);
    setNote('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-6">
        {/* Selector Grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div
            onClick={() => setIsSelectorExpanded(!isSelectorExpanded)}
            className="flex justify-between items-center cursor-pointer select-none pb-2 border-b border-slate-100"
          >
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span> {t('steelCalc.selectShape')}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              {!isSelectorExpanded && (
                <span className="font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-[10px]">
                  {translateShape(activeShape)}
                </span>
              )}
              {isSelectorExpanded ? (
                <Icons.ChevronUp className="w-4 h-4" />
              ) : (
                <Icons.ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>

          {isSelectorExpanded && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
              {STEEL_SHAPES.map((shape) => {
                const isActive = activeShape === shape.type;
                return (
                  <button
                    key={shape.type}
                    onClick={() => setActiveShape(shape.type)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all cursor-pointer text-center ${
                      isActive
                        ? 'border-orange-500 bg-orange-50/40 text-orange-600 font-extrabold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShapeIcon type={shape.type} className={`mb-1.5 w-4 h-4 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                    <span className="text-[10.5px] font-bold truncate w-full">{translateShape(shape.type)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Inputs & Schema Drawer */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Icons.SlidersHorizontal className="w-4 h-4 text-slate-400" /> {t('steelCalc.inputsTitle')}
            </h3>
            <span className="text-[10px] bg-slate-900 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">
              {translateShape(activeShape)}
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Live Interactive SVG Drawing */}
            <div className="sm:col-span-5 bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-center items-center min-h-[180px]">
              <ShapeDrawing type={activeShape} inputs={currentInputs} />
            </div>

            {/* Input Parameter Form Fields */}
            <div className="sm:col-span-7 grid grid-cols-2 gap-4">
              {Object.entries(currentInputs).map(([key, value]) => {
                const inputId = `param-${activeShape}-${key}`;
                return (
                  <div key={key} className="space-y-1">
                    <label htmlFor={inputId} className="block text-xs font-extrabold text-slate-600">
                      {t(`steelCalc.${key}`)}
                    </label>
                    <input
                      type="number"
                      id={inputId}
                      step="any"
                      min="0"
                      value={value}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-black font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grade, Quantity, Save Controls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor={selectGradeId} className="block text-xs font-extrabold text-slate-600">{t('steelCalc.steelGrade')}</label>
              <select
                id={selectGradeId}
                value={selectedGradeId}
                onChange={(e) => setSelectedGradeId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:bg-white focus:outline-none cursor-pointer text-slate-800"
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.standard})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor={inputQtyId} className="block text-xs font-extrabold text-slate-600">{t('steelCalc.qtyLabel')}</label>
              <input
                type="number"
                id={inputQtyId}
                min="1"
                value={quantity}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setQuantity('');
                  } else {
                    const parsed = parseInt(val, 10);
                    setQuantity(isNaN(parsed) ? '' : parsed);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-black font-mono focus:bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={inputNoteId} className="block text-xs font-extrabold text-slate-600">{t('steelCalc.noteLabel')}</label>
              <input
                type="text"
                id={inputNoteId}
                placeholder={language === 'vi' ? 'Ví dụ: Dầm mái trục A-B...' : 'e.g., Roof beam axis A-B...'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-3 border-t border-slate-100 gap-4">
            <div className="space-y-0.5">
              <label htmlFor={selectTargetTableId} className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">{t('steelCalc.targetBOM')}</label>
              <select
                id={selectTargetTableId}
                value={targetTableId}
                onChange={(e) => setTargetTableId(e.target.value)}
                className="bg-transparent border-none text-xs font-black text-slate-700 focus:outline-none cursor-pointer"
              >
                {bomTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white text-xs font-extrabold rounded-lg shadow-sm uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Icons.Plus className="w-4 h-4" /> {t('steelCalc.saveToBOM')}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Results Display Panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#ecd3be] px-5 py-4 border-b border-orange-200/50 flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest text-[#758299] flex items-center gap-1.5">
              <Icons.TrendingUp className="text-orange-600 w-4 h-4" /> {t('steelCalc.resultsTitle')}
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-black tracking-wider">OFFLINE ENGINE</span>
          </div>

          <div className="p-6 space-y-5 bg-[#fff8ed]">
            {/* Weight per Meter */}
            <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">{t('steelCalc.properties.unitWeight')}</span>
                <span className="text-[11px] text-slate-600">{language === 'vi' ? 'Trọng lượng lý thuyết định lượng' : 'Theoretical nominal weight'}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black font-mono text-orange-600">
                  {formatWithCommas(results.weightPerMeter, 3)}
                </span>
                <span className="text-[10px] text-slate-500 font-extrabold ml-1 uppercase">kg/m</span>
              </div>
            </div>

            {/* Total Weight */}
            <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                  {t('steelCalc.properties.totalWeight')} ({quantity || 1} {activeShape === 'PLATE' ? (language === 'vi' ? 'tấm' : 'plates') : (language === 'vi' ? 'thanh' : 'pieces')})
                </span>
                <span className="text-[11px] text-slate-600">{language === 'vi' ? `Tính theo chiều dài L = ${numInputs.L || 0}m` : `Calculated for length L = ${numInputs.L || 0}m`}</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black font-mono text-blue-600">
                  {formatWithCommas(results.totalWeightKg * (quantity || 1), 2)}
                </span>
                <span className="text-[10px] text-slate-500 font-extrabold ml-1 uppercase">kg</span>
              </div>
            </div>

            {/* Paint Area */}
            <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                  {t('steelCalc.properties.paintArea')}
                </span>
                <span className="text-[11px] text-slate-600">{language === 'vi' ? 'Cơ sở tính toán định lượng sơn phủ' : 'Basis for paint quantity estimation'}</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black font-mono text-emerald-700">
                  {formatWithCommas(results.totalPaintAreaM2 * (quantity || 1), 3)}
                </span>
                <span className="text-[10px] text-slate-500 font-extrabold ml-1 uppercase">m²</span>
              </div>
            </div>

            {/* Capacities (Tensile and Bending) */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-[#ecd3be] p-3 rounded-lg border border-orange-200/60">
                <span className="text-[9px] text-[#f54040] font-extrabold uppercase tracking-wider block">{t('steelCalc.properties.tensile')}</span>
                <span className="text-sm font-black font-mono text-[#000000] mt-1 block">
                  {formatWithCommas(results.tensileCapacityKn, 1)}{' '}
                  <span className="text-[10px] text-slate-600 font-normal">kN</span>
                </span>
              </div>
              <div className="bg-[#ecd3be] p-3 rounded-lg border border-orange-200/60">
                <span className="text-[9px] text-[#f54040] font-extrabold uppercase tracking-wider block">{t('steelCalc.properties.bending')}</span>
                <span className="text-sm font-black font-mono text-[#000000] mt-1 block">
                  {formatWithCommas(results.bendingCapacityKnm, 2)}{' '}
                  <span className="text-[10px] text-slate-600 font-normal">kNm</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
