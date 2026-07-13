import { useState, useId } from 'react';
import { Copy, Check, X, Calculator, RefreshCw, Bookmark, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LinearInterpolatorProps {
  onClose?: () => void;
}

interface SavedInterpolation {
  id: string;
  timestamp: number;
  a1: string;
  x1: string;
  a2: string;
  x2: string;
  a3: string;
  x3: string;
  note: string;
}

export default function LinearInterpolator({ onClose }: LinearInterpolatorProps) {
  const { language, t } = useLanguage();
  const [a1, setA1] = useState<string>('0');
  const [x1, setX1] = useState<string>('0');
  const [a2, setA2] = useState<string>('10');
  const [x2, setX2] = useState<string>('100');
  const [a3, setA3] = useState<string>('5');
  const [note, setNote] = useState<string>('');

  const [copiedField, setCopiedField] = useState<'x3' | 'formula' | null>(null);
  const [savedList, setSavedList] = useState<SavedInterpolation[]>(() => {
    const saved = localStorage.getItem('steel_calc_interpolations');
    return saved ? JSON.parse(saved) : [];
  });

  const idNote = useId();

  // Helper to parse decimal numbers safely supporting both commas and dots
  const parseNum = (str: string) => {
    if (!str) return NaN;
    return parseFloat(str.replace(',', '.'));
  };

  const numA1 = parseNum(a1);
  const numX1 = parseNum(x1);
  const numA2 = parseNum(a2);
  const numX2 = parseNum(x2);
  const numA3 = parseNum(a3);

  let x3Result = '';
  let errorMsg = '';
  let mode: 'nội suy' | 'ngoại suy' | null = null;

  const isInputsValid =
    !isNaN(numA1) &&
    !isNaN(numX1) &&
    !isNaN(numA2) &&
    !isNaN(numX2) &&
    !isNaN(numA3);

  if (isInputsValid) {
    if (Math.abs(numA2 - numA1) < 1e-9) {
      errorMsg = language === 'vi' 
        ? 'Lỗi: A1 phải khác A2 để tránh chia cho 0.' 
        : 'Error: A1 must differ from A2 to avoid division by 0.';
    } else {
      const computedX3 = numX1 + (numA3 - numA1) * ((numX2 - numX1) / (numA2 - numA1));
      // Format beautifully
      if (Math.abs(computedX3) < 1e-9) {
        x3Result = '0';
      } else {
        let formatted = computedX3.toFixed(6);
        if (formatted.includes('.')) {
          formatted = formatted.replace(/0+$/, '').replace(/\.$/, '');
        }
        x3Result = formatted;
      }

      // Check if it's interpolation or extrapolation
      const minA = Math.min(numA1, numA2);
      const maxA = Math.max(numA1, numA2);
      if (numA3 >= minA && numA3 <= maxA) {
        mode = 'nội suy';
      } else {
        mode = 'ngoại suy';
      }
    }
  } else {
    errorMsg = language === 'vi' 
      ? 'Nhập đầy đủ số liệu hợp lệ để tính toán.' 
      : 'Enter complete valid data to calculate.';
  }

  const handleCopy = (text: string, type: 'x3' | 'formula') => {
    navigator.clipboard.writeText(text);
    setCopiedField(type);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveResult = () => {
    if (!isInputsValid || errorMsg) return;
    const newEntry: SavedInterpolation = {
      id: `interp-${Date.now()}`,
      timestamp: Date.now(),
      a1,
      x1,
      a2,
      x2,
      a3,
      x3: x3Result,
      note: note.trim() || (language === 'vi' ? 'Cấu kiện nội suy' : 'Interpolated member'),
    };
    const updated = [newEntry, ...savedList];
    setSavedList(updated);
    localStorage.setItem('steel_calc_interpolations', JSON.stringify(updated));
    setNote('');
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedList.filter((item) => item.id !== id);
    setSavedList(updated);
    localStorage.setItem('steel_calc_interpolations', JSON.stringify(updated));
  };

  const handleClearAllSaved = () => {
    if (confirm(language === 'vi' ? 'Xóa toàn bộ lịch sử nội suy?' : 'Clear all interpolation history?')) {
      setSavedList([]);
      localStorage.removeItem('steel_calc_interpolations');
    }
  };

  const handleSwapPoints = () => {
    const tempA = a1;
    const tempX = x1;
    setA1(a2);
    setX1(x2);
    setA2(tempA);
    setX2(tempX);
  };

  const handleClearInputs = () => {
    setA1('');
    setX1('');
    setA2('');
    setX2('');
    setA3('');
    setNote('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 transition-all">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-orange-500" /> {t('buttons.linearInterpolator')}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            id="btn-close-interpolator"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-500 border border-slate-100 mb-4 font-mono leading-relaxed relative overflow-hidden">
        <div className="absolute right-2 top-2 text-[8px] font-black uppercase text-slate-300 select-none">
          Formula
        </div>
        <p className="font-bold text-slate-700 mb-1">
          {language === 'vi' ? 'Công thức nội suy tìm X₃:' : 'Interpolation Formula to find X₃:'}
        </p>
        <p className="text-orange-600 font-bold bg-white inline-block px-1.5 py-0.5 rounded border border-slate-200">
          X₃ = X₁ + (A₃ - A₁) × (X₂ - X₁) / (A₂ - A₁)
        </p>
        <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">
          <p>
            {language === 'vi'
              ? '• A₁, X₁: Giá trị điểm thứ nhất'
              : '• A₁, X₁: Values of the first point'}
          </p>
          <p>
            {language === 'vi'
              ? '• A₂, X₂: Giá trị điểm thứ hai'
              : '• A₂, X₂: Values of the second point'}
          </p>
          <p>
            {language === 'vi'
              ? '• A₃: Giá trị đã biết nằm giữa A₁ và A₂'
              : '• A₃: Known variable lying between A₁ and A₂'}
          </p>
          <p>
            {language === 'vi' ? '• X₃: Giá trị cần tìm' : '• X₃: Target value to search for'}
          </p>
        </div>
      </div>

      {/* Preset values for structural calculations */}
      <div className="mb-4">
        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1.5">
          {language === 'vi' ? 'Ví dụ tính toán' : 'Calculation Examples'}
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => {
              setA1('100'); setX1('1.2');
              setA2('200'); setX2('1.8');
              setA3('150');
            }}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9.5px] font-bold transition-colors cursor-pointer"
          >
            {language === 'vi' ? 'Hệ số uốn dầm (L=150)' : 'Beam bending factor (L=150)'}
          </button>
          <button
            onClick={() => {
              setA1('0'); setX1('210');
              setA2('100'); setX2('190');
              setA3('45');
            }}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9.5px] font-bold transition-colors cursor-pointer"
          >
            {language === 'vi' ? 'Độ bền theo nhiệt độ (t=45)' : 'Strength by temp (t=45)'}
          </button>
        </div>
      </div>

      {/* Inputs container */}
      <div className="space-y-4">
        {/* Point 1 (A1, X1) */}
        <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              {language === 'vi' ? 'Điểm thứ nhất (1)' : 'First Point (1)'}
            </span>
            <button
              onClick={handleSwapPoints}
              className="text-[9px] text-slate-500 hover:text-orange-500 font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
              title={language === 'vi' ? 'Đảo vị trí điểm 1 và điểm 2' : 'Swap Point 1 and Point 2'}
            >
              <RefreshCw className="w-3 h-3" /> {language === 'vi' ? 'Đảo Điểm' : 'Swap Points'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold text-slate-500 block mb-0.5">
                {language === 'vi' ? 'Biến số A₁' : 'Variable A₁'}
              </label>
              <input
                type="text"
                value={a1}
                onChange={(e) => setA1(e.target.value)}
                placeholder="A1"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold font-mono text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-500 block mb-0.5">
                {language === 'vi' ? 'Giá trị X₁' : 'Value X₁'}
              </label>
              <input
                type="text"
                value={x1}
                onChange={(e) => setX1(e.target.value)}
                placeholder="X1"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold font-mono text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Point 2 (A2, X2) */}
        <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {language === 'vi' ? 'Điểm thứ hai (2)' : 'Second Point (2)'}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold text-slate-500 block mb-0.5">
                {language === 'vi' ? 'Biến số A₂' : 'Variable A₂'}
              </label>
              <input
                type="text"
                value={a2}
                onChange={(e) => setA2(e.target.value)}
                placeholder="A2"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold font-mono text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-500 block mb-0.5">
                {language === 'vi' ? 'Giá trị X₂' : 'Value X₂'}
              </label>
              <input
                type="text"
                value={x2}
                onChange={(e) => setX2(e.target.value)}
                placeholder="X2"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold font-mono text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Input Target A3 */}
        <div className="p-3 bg-[#FFF7ED] rounded-lg border border-orange-100 space-y-1.5">
          <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">
            {language === 'vi' ? 'Điểm cần tra cứu (3)' : 'Target Point (3)'}
          </span>
          <div>
            <label className="text-[9px] font-bold text-slate-500 block mb-0.5">
              {language === 'vi' ? 'Nhập biến số đã biết A₃' : 'Enter known variable A₃'}
            </label>
            <input
              type="text"
              value={a3}
              onChange={(e) => setA3(e.target.value)}
              placeholder={language === 'vi' ? 'Nhập A3...' : 'Enter A3...'}
              className="w-full bg-white border border-orange-200 rounded-lg px-2.5 py-1.5 text-xs font-black font-mono text-slate-800 focus:ring-1 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Output Area */}
        <div 
          className="p-4 rounded-xl text-slate-800 space-y-2 relative overflow-hidden border border-orange-100"
          style={{ backgroundColor: '#fff5e8' }}
        >
          {mode && (
            <span className={`absolute right-3 top-3 text-[8px] font-black uppercase px-1.5 py-0.5 rounded text-white ${
              mode === 'nội suy' ? 'bg-emerald-600' : 'bg-amber-600'
            }`}>
              {mode === 'nội suy' 
                ? (language === 'vi' ? 'nội suy' : 'interpolated')
                : (language === 'vi' ? 'ngoại suy' : 'extrapolated')}
            </span>
          )}

          <span className="text-[9px] font-extrabold uppercase tracking-wider block" style={{ color: '#3758b4' }}>
            {language === 'vi' ? 'Kết quả giá trị X₃' : 'Interpolated Result X₃'}
          </span>

          {errorMsg ? (
            <p className="text-rose-600 text-xs font-bold font-sans">{errorMsg}</p>
          ) : (
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black font-mono text-slate-900 tracking-tight">
                {x3Result}
              </span>
              <button
                onClick={() => handleCopy(x3Result, 'x3')}
                className="text-[10px] text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedField === 'x3' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> {language === 'vi' ? 'Đã chép' : 'Copied'}
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> {language === 'vi' ? 'Sao chép' : 'Copy'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Save to results */}
        {!errorMsg && isInputsValid && (
          <div className="space-y-2 pt-1">
            <div className="flex gap-2">
              <input
                type="text"
                id={idNote}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  language === 'vi'
                    ? 'Ghi chú kết quả (ví dụ: Chi tiết dầm D1...)'
                    : 'Result note (e.g., Beam detail D1...)'
                }
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
              />
              <button
                onClick={handleSaveResult}
                className="hover:bg-opacity-95 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                style={{ backgroundColor: '#227d3a' }}
              >
                <Bookmark className="w-3.5 h-3.5 text-white/90" /> {t('common.save')}
              </button>
            </div>
          </div>
        )}

        {/* Action controls */}
        <div className="flex justify-end pt-1">
          <button
            onClick={handleClearInputs}
            className="text-[10px] text-slate-400 hover:text-slate-600 font-black uppercase tracking-wider cursor-pointer transition-colors"
          >
            {language === 'vi' ? 'Làm mới đầu vào' : 'Clear Inputs'}
          </button>
        </div>

        {/* Saved Items List */}
        {savedList.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                {language === 'vi' ? `Lịch sử nội suy (${savedList.length})` : `Interpolation History (${savedList.length})`}
              </span>
              <button
                onClick={handleClearAllSaved}
                className="text-rose-500 hover:text-rose-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> {language === 'vi' ? 'Xóa hết' : 'Clear All'}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-0.5">
              {savedList.map((item) => (
                <div key={item.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 relative group text-[11px]">
                  <button
                    onClick={() => handleDeleteSaved(item.id)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title={language === 'vi' ? 'Xóa dòng' : 'Delete entry'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="font-bold text-slate-700 pr-5 truncate">{item.note}</div>
                  <div className="font-mono text-[10px] text-slate-500 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                    <span>P1:({item.a1}, {item.x1})</span>
                    <span>P2:({item.a2}, {item.x2})</span>
                    <span className="text-orange-600 font-bold">
                      {language === 'vi' ? 'Tra' : 'Find'}:{item.a3} → {item.x3}
                    </span>
                  </div>
                  <div className="mt-1.5 flex gap-2">
                    <button
                      onClick={() => {
                        setA1(item.a1);
                        setX1(item.x1);
                        setA2(item.a2);
                        setX2(item.x2);
                        setA3(item.a3);
                        setNote(item.note);
                      }}
                      className="text-[9px] text-blue-600 hover:text-blue-800 font-extrabold cursor-pointer"
                    >
                      {language === 'vi' ? 'Nạp lại số liệu' : 'Reload Data'}
                    </button>
                    <button
                      onClick={() => handleCopy(item.x3, 'x3')}
                      className="text-[9px] text-slate-500 hover:text-slate-800 font-extrabold cursor-pointer"
                    >
                      {language === 'vi' ? 'Sao chép X₃' : 'Copy X₃'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
