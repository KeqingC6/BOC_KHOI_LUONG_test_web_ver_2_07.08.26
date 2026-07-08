import { useState } from 'react';
import { CONVERSIONS } from '../data';
import { Copy, Check, X, ArrowLeftRight } from 'lucide-react';

interface UnitConverterProps {
  onClose?: () => void;
}

export default function UnitConverter({ onClose }: UnitConverterProps) {
  const [category, setCategory] = useState<string>('length');
  const [unitLeft, setUnitLeft] = useState<string>(CONVERSIONS.length.defaultLeft);
  const [unitRight, setUnitRight] = useState<string>(CONVERSIONS.length.defaultRight);
  const [inputValue, setInputValue] = useState<string>('1');
  const [inputSource, setInputSource] = useState<'left' | 'right'>('left');
  const [copiedField, setCopiedField] = useState<'left' | 'right' | null>(null);

  const activeCatData = CONVERSIONS[category];
  const activeUnits = activeCatData.units;

  const parseDecimalString = (str: string) => {
    if (!str) return NaN;
    return parseFloat(str.replace(',', '.'));
  };

  const formatValue = (num: number) => {
    if (isNaN(num) || !isFinite(num)) return '';
    if (Math.abs(num) < 1e-9) return '0';
    let formatted = num.toFixed(6);
    if (formatted.includes('.')) {
      formatted = formatted.replace(/0+$/, '').replace(/\.$/, '');
    }
    return formatted;
  };

  const performConversion = (valueStr: string, fromUnit: string, toUnit: string, cat: string) => {
    if (valueStr === '' || valueStr === '-' || valueStr === '.' || valueStr === ',') return '';
    const num = parseDecimalString(valueStr);
    if (isNaN(num)) return '';

    if (cat === 'temperature') {
      let celsius = num;
      if (fromUnit === 'f') celsius = ((num - 32) * 5) / 9;
      let result = celsius;
      if (toUnit === 'f') result = (celsius * 9) / 5 + 32;
      return formatValue(result);
    }

    const units = CONVERSIONS[cat].units;
    const factorFrom = units[fromUnit].factor;
    const factorTo = units[toUnit].factor;
    return formatValue((num * factorFrom) / factorTo);
  };

  const displayValLeft = inputSource === 'left' ? inputValue : performConversion(inputValue, unitRight, unitLeft, category);
  const displayValRight = inputSource === 'right' ? inputValue : performConversion(inputValue, unitLeft, unitRight, category);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setUnitLeft(CONVERSIONS[newCat].defaultLeft);
    setUnitRight(CONVERSIONS[newCat].defaultRight);
    setInputValue('1');
    setInputSource('left');
  };

  const copyToClipboard = (text: string, field: 'left' | 'right') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 transition-all">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <ArrowLeftRight className="w-3.5 h-3.5 text-orange-500" /> Đổi đơn vị nhanh
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            id="btn-close-converter"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {Object.entries(CONVERSIONS).map(([key, data]) => (
          <button
            key={key}
            id={`tab-conv-${key}`}
            onClick={() => handleCategoryChange(key)}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-extrabold border transition-colors cursor-pointer text-center ${
              category === key
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {data.name}
          </button>
        ))}
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {activeCatData.presets.map((preset, idx) => (
          <button
            key={idx}
            id={`preset-conv-${idx}`}
            onClick={() => {
              setUnitLeft(preset.unitLeft);
              setInputValue(preset.value);
              setInputSource('left');
            }}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9.5px] font-bold transition-colors cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Left input */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <select
              value={unitLeft}
              onChange={(e) => setUnitLeft(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              id="select-conv-left"
            >
              {Object.entries(activeUnits).map(([k, u]) => (
                <option key={k} value={k}>
                  {u.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => copyToClipboard(displayValLeft, 'left')}
              className="text-[10px] text-slate-400 hover:text-slate-600 font-bold flex items-center gap-1 cursor-pointer"
              id="btn-copy-left"
            >
              {copiedField === 'left' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <input
            type="text"
            id="input-conv-left"
            value={displayValLeft}
            onChange={(e) => {
              setInputValue(e.target.value);
              setInputSource('left');
            }}
            placeholder="0.00"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
          />
        </div>

        {/* Arrow spacer */}
        <div className="flex justify-center text-slate-400 py-1">
          <ArrowLeftRight className="w-4 h-4 rotate-90 sm:rotate-0" />
        </div>

        {/* Right input */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <select
              value={unitRight}
              onChange={(e) => setUnitRight(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              id="select-conv-right"
            >
              {Object.entries(activeUnits).map(([k, u]) => (
                <option key={k} value={k}>
                  {u.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => copyToClipboard(displayValRight, 'right')}
              className="text-[10px] text-slate-400 hover:text-slate-600 font-bold flex items-center gap-1 cursor-pointer"
              id="btn-copy-right"
            >
              {copiedField === 'right' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <input
            type="text"
            id="input-conv-right"
            value={displayValRight}
            onChange={(e) => {
              setInputValue(e.target.value);
              setInputSource('right');
            }}
            placeholder="0.00"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
