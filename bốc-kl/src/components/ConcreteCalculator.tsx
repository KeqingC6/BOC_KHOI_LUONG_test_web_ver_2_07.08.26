import { useState, useEffect, useId } from 'react';
import { ConcreteClass, SavedConcreteItem } from '../types';
import { formatWithCommas } from '../utils';
import { Building, Plus, Trash2, ShieldCheck } from 'lucide-react';

interface ConcreteCalculatorProps {
  concreteClasses: ConcreteClass[];
}

export default function ConcreteCalculator({ concreteClasses }: ConcreteCalculatorProps) {
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
    const typeLabelMap = {
      COLUMN_RECT: 'Cột chữ nhật',
      COLUMN_CIRC: 'Cột tròn',
      BEAM: 'Dầm bê tông',
      SLAB: 'Sàn bê tông',
    };
    const newItem: SavedConcreteItem = {
      id: `conc-${Date.now()}`,
      name: name.trim() || `${typeLabelMap[memberType]} ${savedList.length + 1}`,
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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <Building className="text-orange-500 w-5 h-5" />
        <div>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Tính toán bê tông & cốt thép cấu kiện
          </h3>
          <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Tiêu chuẩn TCVN 5574:2018
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Member selector */}
          <div className="grid grid-cols-4 gap-2">
            {(['COLUMN_RECT', 'COLUMN_CIRC', 'BEAM', 'SLAB'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMemberType(t)}
                className={`py-2 px-1.5 rounded-lg text-[10.5px] font-extrabold border transition-colors cursor-pointer text-center truncate ${
                  memberType === t
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t === 'COLUMN_RECT' ? 'Cột HCN' : t === 'COLUMN_CIRC' ? 'Cột Tròn' : t === 'BEAM' ? 'Dầm / Giằng' : 'Sàn / Móng'}
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
                    {key === 'H' || key === 'L' || key === 'B' ? `${key} (m)` : `${key} (mm)`}
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
              <label htmlFor={selectConcreteId} className="block text-xs font-extrabold text-slate-600">Cấp độ bền bê tông</label>
              <select
                id={selectConcreteId}
                value={concreteId}
                onChange={(e) => setConcreteId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:bg-white focus:outline-none cursor-pointer text-slate-800"
              >
                {concreteClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className} (Mác {c.gradeName})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor={inputQtyId} className="block text-xs font-extrabold text-slate-600">Số lượng cấu kiện</label>
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
              <label htmlFor={inputNameId} className="block text-xs font-extrabold text-slate-600">Ký hiệu kết cấu</label>
              <input
                type="text"
                id={inputNameId}
                placeholder="Ví dụ: Cột C1 dầm D3..."
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
            <Plus className="w-4 h-4" /> Lưu thống kê bê tông
          </button>
        </div>

        {/* Results Box */}
        <div className="lg:col-span-5 bg-orange-50/40 p-5 rounded-xl border border-orange-200/40 space-y-4">
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest block flex items-center gap-1">
            <Building className="w-3.5 h-3.5" /> Tổng lượng bê tông & thép dự kiến
          </span>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-xs">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Thể tích V</span>
              <span className="text-base font-black font-mono text-slate-800">
                {formatWithCommas(results.concreteVol, 3)}{' '}
                <span className="text-[10px] text-slate-500 font-normal">m³</span>
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-xs">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Trọng lượng BT</span>
              <span className="text-base font-black font-mono text-slate-800">
                {formatWithCommas(results.concreteWt, 2)}{' '}
                <span className="text-[10px] text-slate-500 font-normal">Tấn</span>
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-xs">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Lượng thép định suất</span>
              <span className="text-lg font-black font-mono text-blue-600">
                {formatWithCommas(results.steelWt, 1)}{' '}
                <span className="text-[10px] text-slate-500 font-normal font-sans">kg</span>
              </span>
              <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">
                Tỷ suất hàm lượng: {formatWithCommas(results.steelRatio, 1)} kg/m³
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Database log section */}
      {savedList.length > 0 && (
        <div className="pt-4 border-t border-slate-100 animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Danh sách cấu kiện đã lưu ({savedList.length})
            </h4>
            <button
              onClick={() => {
                if (confirm('Xóa toàn bộ thống kê bê tông?')) {
                  setSavedList([]);
                }
              }}
              className="text-[10.5px] text-red-600 hover:text-red-700 font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-500 uppercase tracking-widest text-[9px]">
                  <th className="px-4 py-3 text-center w-12">STT</th>
                  <th className="px-4 py-3">Ký hiệu</th>
                  <th className="px-4 py-3">Phân loại cấu kiện</th>
                  <th className="px-4 py-3 text-center">Bê tông</th>
                  <th className="px-4 py-3 text-right">Khối lượng V (m³)</th>
                  <th className="px-4 py-3 text-right">Lượng thép (kg)</th>
                  <th className="px-4 py-3 text-center w-12">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {savedList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-extrabold text-slate-800">{item.name}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-500 text-[10.5px]">
                      {item.type === 'COLUMN_RECT'
                        ? 'Cột hình chữ nhật'
                        : item.type === 'COLUMN_CIRC'
                        ? 'Cột tròn xoay'
                        : item.type === 'BEAM'
                        ? 'Dầm bê tông cốt thép'
                        : 'Bản sàn / Móng bè'}
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
