import { useState, useEffect, useId } from 'react';
import { Layers, Plus, Trash2, FileText, Printer, Layers3 } from 'lucide-react';
import { formatWithCommas } from '../utils';

interface SavedFormworkItem {
  id: string;
  name: string;
  b: number; // mm
  h: number; // mm
  L: number; // mm
  t: number; // mm
  calcType: '5_FACES' | '4_FACES';
  qty: number;
  faceAreas: {
    face1: number;
    face2: number;
    face3: number;
    face4: number;
    face5: number;
    face6: number;
  };
  totalArea: number; // m2
  timestamp: number;
}

export default function FormworkCalculator() {
  const [name, setName] = useState('');
  const [b, setB] = useState('300'); // mm
  const [h, setH] = useState('600'); // mm
  const [L, setL] = useState('6000'); // mm
  const [t, setT] = useState('18');   // mm
  const [calcType, setCalcType] = useState<'5_FACES' | '4_FACES'>('5_FACES');
  const [qty, setQty] = useState<number>(1);
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);

  const [savedList, setSavedList] = useState<SavedFormworkItem[]>(() => {
    const saved = localStorage.getItem('formwork_saved_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [toast, setToast] = useState<string | null>(null);

  const selectCalcTypeId = useId();
  const inputBId = useId();
  const inputHId = useId();
  const inputLId = useId();
  const inputTId = useId();
  const inputQtyId = useId();
  const inputNameId = useId();

  useEffect(() => {
    localStorage.setItem('formwork_saved_items', JSON.stringify(savedList));
  }, [savedList]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Convert inputs (entered in mm) to numeric values safely
  const bVal = parseFloat(b) || 0; // mm
  const hVal = parseFloat(h) || 0; // mm
  const LVal = parseFloat(L) || 0; // mm
  const tVal = parseFloat(t) || 0; // mm

  // Convert mm to meters for formulas to yield results in m²
  const bVal_m = bVal / 1000;
  const hVal_m = hVal / 1000;
  const LVal_m = LVal / 1000;
  const tVal_m = tVal / 1000;

  // Areas (in m²)
  const areaFace1 = LVal_m * hVal_m; // L * h
  const areaFace3 = LVal_m * hVal_m; // L * h
  const areaFace2 = LVal_m * (bVal_m + 2 * tVal_m); // L * (b + 2t)
  const areaFace4 = LVal_m * (bVal_m + 2 * tVal_m); // L * (b + 2t)
  const areaFace5 = (bVal_m + 2 * tVal_m) * (hVal_m + 2 * tVal_m); // (b + 2t) * (h + 2t)
  const areaFace6 = (bVal_m + 2 * tVal_m) * (hVal_m + 2 * tVal_m); // (b + 2t) * (h + 2t)

  // Calculations based on mode
  // Kiểu 1: Lấy 5 mặt (Bỏ mặt trên số 2). Mặt 1, 3, 4, 5, 6
  // Kiểu 2: Lấy 4 mặt xung quanh (Bỏ mặt 2 và 4). Mặt 1, 3, 5, 6
  const isFace4Active = calcType === '5_FACES';

  const singleTotalArea =
    areaFace1 +
    areaFace3 +
    (isFace4Active ? areaFace4 : 0) +
    areaFace5 +
    areaFace6;

  const grandTotalArea = singleTotalArea * qty;

  const handleSaveItem = () => {
    const defaultName = `Dầm/Cột ván khuôn #${savedList.length + 1}`;
    const newItem: SavedFormworkItem = {
      id: `fw-${Date.now()}`,
      name: name.trim() || defaultName,
      b: bVal,
      h: hVal,
      L: LVal,
      t: tVal,
      calcType,
      qty,
      faceAreas: {
        face1: areaFace1,
        face2: areaFace2,
        face3: areaFace3,
        face4: areaFace4,
        face5: areaFace5,
        face6: areaFace6,
      },
      totalArea: grandTotalArea,
      timestamp: Date.now(),
    };

    setSavedList([newItem, ...savedList]);
    setName('');
    showToast('Đã lưu cấu kiện ván khuôn thành công!');
  };

  const handleDeleteItem = (id: string) => {
    setSavedList(savedList.filter((item) => item.id !== id));
    showToast('Đã xóa cấu kiện khỏi danh sách.');
  };

  const handleClearAll = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách đã lưu?')) {
      setSavedList([]);
      showToast('Đã xóa toàn bộ danh sách.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePreset = (presetB: string, presetH: string, presetL: string, presetT: string, type: '5_FACES' | '4_FACES', label: string) => {
    setB(presetB);
    setH(presetH);
    setL(presetL);
    setT(presetT);
    setCalcType(type);
    setName(label);
    showToast(`Đã áp dụng mẫu thiết kế: ${label}`);
  };

  // Visual helper sizes for the interactive SVG (using meter scales)
  const maxDim = Math.max(bVal_m, hVal_m, 0.1);
  const visualScale = 100 / maxDim;
  const wBox = Math.max(40, Math.min(120, bVal_m * visualScale));
  const hBox = Math.max(40, Math.min(120, hVal_m * visualScale));
  const tBox = Math.max(4, Math.min(16, tVal_m * visualScale));

  const cx = 110;
  const cy = 135;
  const xConc = cx - wBox / 2;
  const yConc = cy - hBox / 2;

  // 3D Isometric View calculation
  const maxBH = Math.max(0.1, bVal_m, hVal_m);
  const scaleBH = 65 / maxBH;
  const w3D = Math.max(35, Math.min(95, bVal_m * scaleBH));
  const h3D = Math.max(35, Math.min(105, hVal_m * scaleBH));
  
  // Depth of 3D based on L (bounded to look like a realistic 3D beam/column)
  const depth3D = Math.max(40, Math.min(95, 40 + LVal_m * 5));
  
  // Projection vector for 30 degrees cabinet projection
  const dx = depth3D * 0.8;
  const dy = -depth3D * 0.45;

  // Bottom-Left-Front anchor point for 3D drawing inside Panel 1
  const x0_3d = 120 - (w3D + dx) / 2;
  const y0_3d = 145 + (h3D + Math.abs(dy)) / 2;

  const fbl = { x: x0_3d, y: y0_3d };
  const fbr = { x: x0_3d + w3D, y: y0_3d };
  const ftr = { x: x0_3d + w3D, y: y0_3d - h3D };
  const ftl = { x: x0_3d, y: y0_3d - h3D };
  
  const bbl = { x: x0_3d + dx, y: y0_3d + dy };
  const bbr = { x: x0_3d + w3D + dx, y: y0_3d + dy };
  const btr = { x: x0_3d + w3D + dx, y: y0_3d - h3D + dy };
  const btl = { x: x0_3d + dx, y: y0_3d - h3D + dy };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-2xl z-50 flex items-center gap-2 text-xs font-bold border border-slate-800 animate-fadeIn font-sans">
          <span className="bg-orange-500 w-2 h-2 rounded-full animate-ping" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <Layers className="text-orange-500 w-5 h-5" />
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Tính toán diện tích ván khuôn cấu kiện
            </h3>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
              Khối lượng ván khuôn phủ phim / ván gỗ theo hình cắt lớp thực tế (m²)
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 no-print">
          <button
            onClick={() => handlePreset('300', '600', '6000', '18', '5_FACES', 'Dầm D1 (300x600 L=6m)')}
            className="px-2.5 py-1 text-[10px] font-black bg-slate-50 hover:bg-slate-100 text-slate-600 rounded border border-slate-200 cursor-pointer transition-colors animate-fadeIn"
          >
            Mẫu Dầm (5 mặt)
          </button>
          <button
            onClick={() => handlePreset('400', '400', '3500', '15', '4_FACES', 'Cột C1 (400x400 H=3.5m)')}
            className="px-2.5 py-1 text-[10px] font-black bg-slate-50 hover:bg-slate-100 text-slate-600 rounded border border-slate-200 cursor-pointer transition-colors animate-fadeIn"
          >
            Mẫu Cột (4 mặt)
          </button>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-4 no-print">
          
          {/* Dimensional Parameter Inputs - matched design style from other tabs */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="space-y-1">
              <label htmlFor={inputBId} className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                b (mm)
              </label>
              <input
                id={inputBId}
                type="number"
                step="any"
                min="0"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-black font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                value={b}
                onChange={(e) => setB(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={inputHId} className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                h (mm)
              </label>
              <input
                id={inputHId}
                type="number"
                step="any"
                min="0"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-black font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                value={h}
                onChange={(e) => setH(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={inputLId} className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                L (mm)
              </label>
              <input
                id={inputLId}
                type="number"
                step="any"
                min="0"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-black font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                value={L}
                onChange={(e) => setL(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={inputTId} className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                t (mm)
              </label>
              <input
                id={inputTId}
                type="number"
                step="any"
                min="0"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-black font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                value={t}
                onChange={(e) => setT(e.target.value)}
              />
            </div>
          </div>

          {/* Strength, quantity and name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor={selectCalcTypeId} className="block text-xs font-extrabold text-slate-600">
                Phương thức tính
              </label>
              <select
                id={selectCalcTypeId}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:bg-white focus:outline-none cursor-pointer text-slate-800"
                value={calcType}
                onChange={(e) => setCalcType(e.target.value as any)}
              >
                <option value="5_FACES">5 mặt (Dầm / Giằng)</option>
                <option value="4_FACES">4 mặt (Cột / Vách)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor={inputQtyId} className="block text-xs font-extrabold text-slate-600">
                Số lượng cấu kiện
              </label>
              <input
                id={inputQtyId}
                type="number"
                min="1"
                step="1"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-black font-mono focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={inputNameId} className="block text-xs font-extrabold text-slate-600">
                Ký hiệu kết cấu
              </label>
              <input
                id={inputNameId}
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                placeholder="Ví dụ: Dầm D1, Cột C2..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Save button matching style of concrete calculator */}
          <button
            onClick={handleSaveItem}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 active:scale-[0.99] text-white text-xs font-extrabold rounded-lg shadow-sm transition-all cursor-pointer font-sans uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Lưu thống kê ván khuôn
          </button>
        </div>

        {/* Calculations Result Table Overlay - Placed next to inputs */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col h-full justify-between gap-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Kết quả chi tiết các mặt ({qty} cái)
              </span>
              <span className="font-extrabold text-orange-600 text-[10px] font-mono uppercase">
                Đơn vị: m²
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono font-bold text-slate-700">
              <div
                className={`p-1.5 rounded transition-colors ${
                  hoveredFace === 1 ? 'bg-orange-100 border border-orange-300' : 'bg-white border border-slate-100'
                }`}
                onMouseEnter={() => setHoveredFace(1)}
                onMouseLeave={() => setHoveredFace(null)}
              >
                <div className="text-[8.5px] text-slate-400 font-extrabold uppercase">Mặt 1 (Bên)</div>
                <div className="text-xs font-black text-slate-800">{(areaFace1 * qty).toFixed(3)}</div>
              </div>

              <div
                className={`p-1.5 rounded opacity-50 bg-slate-100 border border-slate-200`}
              >
                <div className="text-[8.5px] text-slate-400 font-extrabold uppercase">Mặt 2 (Trên)</div>
                <div className="text-xs font-black text-slate-400">Bỏ qua</div>
              </div>

              <div
                className={`p-1.5 rounded transition-colors ${
                  hoveredFace === 3 ? 'bg-orange-100 border border-orange-300' : 'bg-white border border-slate-100'
                }`}
                onMouseEnter={() => setHoveredFace(3)}
                onMouseLeave={() => setHoveredFace(null)}
              >
                <div className="text-[8.5px] text-slate-400 font-extrabold uppercase">Mặt 3 (Bên)</div>
                <div className="text-xs font-black text-slate-800">{(areaFace3 * qty).toFixed(3)}</div>
              </div>

              <div
                className={`p-1.5 rounded transition-colors ${
                  !isFace4Active
                    ? 'opacity-50 bg-slate-100 border border-slate-200'
                    : hoveredFace === 4
                    ? 'bg-orange-100 border border-orange-300'
                    : 'bg-white border border-slate-100'
                }`}
                onMouseEnter={() => isFace4Active && setHoveredFace(4)}
                onMouseLeave={() => setHoveredFace(null)}
              >
                <div className="text-[8.5px] text-slate-400 font-extrabold uppercase">Mặt 4 (Dưới)</div>
                <div className="text-xs font-black text-slate-800">
                  {isFace4Active ? (areaFace4 * qty).toFixed(3) : 'Bỏ qua'}
                </div>
              </div>

              <div
                className={`p-1.5 rounded transition-colors ${
                  hoveredFace === 5 ? 'bg-orange-100 border border-orange-300' : 'bg-white border border-slate-100'
                }`}
                onMouseEnter={() => setHoveredFace(5)}
                onMouseLeave={() => setHoveredFace(null)}
              >
                <div className="text-[8.5px] text-slate-400 font-extrabold uppercase">Mặt 5 (Đầu R)</div>
                <div className="text-xs font-black text-slate-800">{(areaFace5 * qty).toFixed(3)}</div>
              </div>

              <div
                className={`p-1.5 rounded transition-colors ${
                  hoveredFace === 6 ? 'bg-orange-100 border border-orange-300' : 'bg-white border border-slate-100'
                }`}
                onMouseEnter={() => setHoveredFace(6)}
                onMouseLeave={() => setHoveredFace(null)}
              >
                <div className="text-[8.5px] text-slate-400 font-extrabold uppercase">Mặt 6 (Đầu L)</div>
                <div className="text-xs font-black text-slate-800">{(areaFace6 * qty).toFixed(3)}</div>
              </div>
            </div>

            {/* Aggregated Total Banner */}
            <div className="bg-orange-500 text-white rounded-lg p-3 flex justify-between items-center mt-1 shadow-md shadow-orange-500/10">
              <div>
                <span className="text-[9px] font-black tracking-widest uppercase opacity-90 block">
                  TỔNG DIỆN TÍCH VÁN KHUÔN
                </span>
                <span className="text-[10px] opacity-75 font-bold">
                  ({calcType === '5_FACES' ? 'Tính 5 mặt dầm' : 'Tính 4 mặt cột'} • N={qty} cái)
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xl sm:text-2xl font-black">
                  {formatWithCommas(grandTotalArea, 3)}
                </span>
                <span className="text-xs font-bold uppercase ml-1">m²</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualized SVG Drawing - Moved to the bottom and enlarged */}
        <div className="lg:col-span-12 space-y-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between relative">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Hình vẽ minh họa động (mm)
              </span>
              {/* Removed the "Interactive SVG" badge as requested */}
            </div>

            {/* SVG Canvas Area - Expanded dimensions for beautiful and large visualization */}
            <div className="flex-1 flex items-center justify-center py-6">
              <svg viewBox="0 0 780 280" className="w-full max-w-[1050px] max-h-[380px] h-auto select-none font-mono">
                {/* Defs for textures or markers */}
                <defs>
                  <pattern id="concrete-pattern" width="8" height="8" patternUnits="userSpaceOnUse">
                    <rect width="8" height="8" fill="#e2e8f0" />
                    <circle cx="2" cy="2" r="1.2" fill="#cbd5e1" />
                    <circle cx="6" cy="5" r="0.8" fill="#94a3b8" />
                    <line x1="0" y1="8" x2="8" y2="0" stroke="#f1f5f9" strokeWidth="0.5" />
                  </pattern>
                </defs>

                {/* Panel 1: 3D Isometric View */}
                <g>
                  {/* Outer boundaries container box background */}
                  <rect x="10" y="25" width="240" height="235" fill="none" stroke="#f1f5f9" rx="6" />
                  <text x="130" y="42" textAnchor="middle" fill="#64748b" className="text-[10px] font-extrabold">PHỐI CẢNH 3D KHỐI BÊ TÔNG</text>

                  {/* 3D Core Rendering */}
                  {/* Top Face */}
                  <polygon
                    points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`}
                    fill="url(#concrete-pattern)"
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  <polygon
                    points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`}
                    fill="#ffffff"
                    fillOpacity="0.4"
                    pointerEvents="none"
                  />

                  {/* Right Face */}
                  <polygon
                    points={`${fbr.x},${fbr.y} ${bbr.x},${bbr.y} ${btr.x},${btr.y} ${ftr.x},${ftr.y}`}
                    fill="url(#concrete-pattern)"
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  <polygon
                    points={`${fbr.x},${fbr.y} ${bbr.x},${bbr.y} ${btr.x},${btr.y} ${ftr.x},${ftr.y}`}
                    fill="#000000"
                    fillOpacity="0.12"
                    pointerEvents="none"
                  />

                  {/* Front Face */}
                  <polygon
                    points={`${fbl.x},${fbl.y} ${fbr.x},${fbr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`}
                    fill="url(#concrete-pattern)"
                    stroke="#94a3b8"
                    strokeWidth="1.2"
                  />
                  <polygon
                    points={`${fbl.x},${fbl.y} ${fbr.x},${fbr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`}
                    fill="#ffffff"
                    fillOpacity="0.15"
                    pointerEvents="none"
                  />
                  <text
                    x={fbl.x + w3D / 2}
                    y={fbl.y - h3D / 2 + 4}
                    textAnchor="middle"
                    fill="#475569"
                    className="text-[9px] font-black tracking-widest"
                  >
                    BÊ TÔNG
                  </text>

                  {/* Dimension Lines and Annotation labels */}
                  {/* Dimension b (Width) */}
                  <line x1={fbl.x} y1={fbl.y + 15} x2={fbr.x} y2={fbr.y + 15} stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
                  <path d={`M ${fbl.x},${fbl.y + 15} L ${fbl.x + 4},${fbl.y + 12} M ${fbl.x},${fbl.y + 15} L ${fbl.x + 4},${fbl.y + 18} M ${fbr.x},${fbr.y + 15} L ${fbr.x - 4},${fbr.y + 12} M ${fbr.x},${fbr.y + 15} L ${fbr.x - 4},${fbr.y + 18}`} stroke="#64748b" strokeWidth="0.8" />
                  <text x={fbl.x + w3D / 2} y={fbl.y + 25} textAnchor="middle" fill="#334155" className="text-[8px] font-bold">b = {b} mm</text>

                  {/* Dimension h (Height) */}
                  <line x1={fbl.x - 15} y1={fbl.y} x2={ftl.x - 15} y2={ftl.y} stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
                  <path d={`M ${fbl.x - 15},${fbl.y} L ${fbl.x - 18},${fbl.y - 4} M ${fbl.x - 15},${fbl.y} L ${fbl.x - 12},${fbl.y - 4} M ${ftl.x - 15},${ftl.y} L ${ftl.x - 18},${ftl.y + 4} M ${ftl.x - 15},${ftl.y} L ${ftl.x - 12},${ftl.y + 4}`} stroke="#64748b" strokeWidth="0.8" />
                  <text x={fbl.x - 20} y={(fbl.y + ftl.y) / 2 + 3} textAnchor="end" fill="#334155" className="text-[8px] font-bold">h = {h} mm</text>

                  {/* Dimension L (Length) */}
                  <line x1={fbr.x + 12} y1={fbr.y + 10} x2={bbr.x + 12} y2={bbr.y + 10} stroke="#475569" strokeWidth="1" />
                  <path d={`M ${fbr.x + 12},${fbr.y + 10} L ${fbr.x + 16},${fbr.y + 7} M ${fbr.x + 12},${fbr.y + 10} L ${fbr.x + 14},${fbr.y + 14} M ${bbr.x + 12},${bbr.y + 10} L ${bbr.x + 8},${bbr.y + 6} M ${bbr.x + 12},${bbr.y + 10} L ${bbr.x + 10},${bbr.y + 13}`} stroke="#475569" strokeWidth="0.8" />
                  <text x={(fbr.x + bbr.x) / 2 + 18} y={(fbr.y + bbr.y) / 2 + 13} textAnchor="start" fill="#1e293b" className="text-[8px] font-black font-mono">L = {L} mm</text>
                </g>

                {/* Panel 2: Cross section */}
                <g transform="translate(260, 0)">
                  {/* Outer boundaries container box background */}
                  <rect x="10" y="25" width="220" height="235" fill="none" stroke="#f1f5f9" rx="6" />
                  <text x="120" y="42" textAnchor="middle" fill="#64748b" className="text-[10px] font-extrabold">MẶT CẮT NGANG</text>

                  {/* Concrete Core */}
                  <rect
                    x={xConc}
                    y={yConc}
                    width={wBox}
                    height={hBox}
                    fill="url(#concrete-pattern)"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                  <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fill="#475569"
                    className="text-[10px] font-black tracking-widest"
                  >
                    BÊ TÔNG
                  </text>

                  {/* Side Panel 1 (Left) */}
                  <rect
                    x={xConc - tBox}
                    y={yConc}
                    width={tBox}
                    height={hBox}
                    fill={hoveredFace === 1 ? '#ffedd5' : '#fff7ed'}
                    stroke={hoveredFace === 1 ? '#ea580c' : '#f97316'}
                    strokeWidth={hoveredFace === 1 ? '2.5' : '1.5'}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredFace(1)}
                    onMouseLeave={() => setHoveredFace(null)}
                  />
                  <text
                    x={xConc - tBox / 2}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#c2410c"
                    className="text-[8px] font-black"
                  >
                    1
                  </text>

                  {/* Side Panel 3 (Right) */}
                  <rect
                    x={xConc + wBox}
                    y={yConc}
                    width={tBox}
                    height={hBox}
                    fill={hoveredFace === 3 ? '#ffedd5' : '#fff7ed'}
                    stroke={hoveredFace === 3 ? '#ea580c' : '#f97316'}
                    strokeWidth={hoveredFace === 3 ? '2.5' : '1.5'}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredFace(3)}
                    onMouseLeave={() => setHoveredFace(null)}
                  />
                  <text
                    x={xConc + wBox + tBox / 2}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#c2410c"
                    className="text-[8px] font-black"
                  >
                    3
                  </text>

                  {/* Top Panel 2 - Always inactive/omitted based on rule "bỏ mặt trên cùng" */}
                  <rect
                    x={xConc - tBox}
                    y={yConc - tBox}
                    width={wBox + 2 * tBox}
                    height={tBox}
                    fill="#fafafa"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    className="opacity-50"
                  />
                  <text
                    x={cx}
                    y={yConc - tBox / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#94a3b8"
                    className="text-[8px] font-extrabold"
                  >
                    2 (Bỏ)
                  </text>

                  {/* Bottom Panel 4 */}
                  {isFace4Active ? (
                    <rect
                      x={xConc - tBox}
                      y={yConc + hBox}
                      width={wBox + 2 * tBox}
                      height={tBox}
                      fill={hoveredFace === 4 ? '#ffedd5' : '#fff7ed'}
                      stroke={hoveredFace === 4 ? '#ea580c' : '#f97316'}
                      strokeWidth={hoveredFace === 4 ? '2.5' : '1.5'}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredFace(4)}
                      onMouseLeave={() => setHoveredFace(null)}
                    />
                  ) : (
                    <rect
                      x={xConc - tBox}
                      y={yConc + hBox}
                      width={wBox + 2 * tBox}
                      height={tBox}
                      fill="#fafafa"
                      stroke="#cbd5e1"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                      className="opacity-50"
                    />
                  )}
                  <text
                    x={cx}
                    y={yConc + hBox + tBox / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isFace4Active ? '#c2410c' : '#94a3b8'}
                    className="text-[8px] font-black"
                  >
                    {isFace4Active ? '4' : '4 (Bỏ)'}
                  </text>

                  {/* Dimensions Annotations */}
                  {/* b (concrete width) */}
                  <line x1={xConc} y1={yConc + hBox + 22} x2={xConc + wBox} y2={yConc + hBox + 22} stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
                  <path d={`M ${xConc},${yConc + hBox + 22} L ${xConc + 4},${yConc + hBox + 19} M ${xConc},${yConc + hBox + 22} L ${xConc + 4},${yConc + hBox + 25} M ${xConc + wBox},${yConc + hBox + 22} L ${xConc + wBox - 4},${yConc + hBox + 19} M ${xConc + wBox},${yConc + hBox + 22} L ${xConc + wBox - 4},${yConc + hBox + 25}`} stroke="#64748b" strokeWidth="0.8" />
                  <text x={cx} y={yConc + hBox + 32} textAnchor="middle" fill="#334155" className="text-[8px] font-bold">b={b} mm</text>

                  {/* b+2t (formwork full width) */}
                  <line x1={xConc - tBox} y1={yConc + hBox + 42} x2={xConc + wBox + tBox} y2={yConc + hBox + 42} stroke="#475569" strokeWidth="1" />
                  <path d={`M ${xConc - tBox},${yConc + hBox + 42} L ${xConc - tBox + 4},${yConc + hBox + 39} M ${xConc - tBox},${yConc + hBox + 42} L ${xConc - tBox + 4},${yConc + hBox + 45} M ${xConc + wBox + tBox},${yConc + hBox + 42} L ${xConc + wBox + tBox - 4},${yConc + hBox + 39} M ${xConc + wBox + tBox},${yConc + hBox + 42} L ${xConc + wBox + tBox - 4},${yConc + hBox + 45}`} stroke="#475569" strokeWidth="0.8" />
                  <text x={cx} y={yConc + hBox + 51} textAnchor="middle" fill="#1e293b" className="text-[8px] font-black">b+2t={(bVal + 2 * tVal).toFixed(0)} mm</text>

                  {/* h (concrete height) */}
                  <line x1={xConc + wBox + 22} y1={yConc} x2={xConc + wBox + 22} y2={yConc + hBox} stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
                  <path d={`M ${xConc + wBox + 22},${yConc} L ${xConc + wBox + 19},${yConc + 4} M ${xConc + wBox + 22},${yConc} L ${xConc + wBox + 25},${yConc + 4} M ${xConc + wBox + 22},${yConc + hBox} L ${xConc + wBox + 19},${yConc + hBox - 4} M ${xConc + wBox + 22},${yConc + hBox} L ${xConc + wBox + 25},${yConc + hBox - 4}`} stroke="#64748b" strokeWidth="0.8" />
                  <text x={xConc + wBox + 26} y={cy + 3} textAnchor="start" fill="#334155" className="text-[8px] font-bold font-mono">h={h} mm</text>
                </g>

                {/* Panel 3: Unfolded Layout (Khai triển ván khuôn) */}
                <g transform="translate(520, 0)">
                  <rect x="10" y="25" width="240" height="235" fill="none" stroke="#f1f5f9" rx="6" />
                  <text x="130" y="42" textAnchor="middle" fill="#64748b" className="text-[10px] font-extrabold">HÌNH KHAI TRIỂN PHẲNG</text>

                  {/* Panel 1 */}
                  <rect
                    x="50"
                    y="100"
                    width="140"
                    height="24"
                    fill={hoveredFace === 1 ? '#ffedd5' : '#fff7ed'}
                    stroke={hoveredFace === 1 ? '#ea580c' : '#f97316'}
                    strokeWidth={hoveredFace === 1 ? '2' : '1'}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredFace(1)}
                    onMouseLeave={() => setHoveredFace(null)}
                  />
                  <text x="120" y="115" textAnchor="middle" fill="#c2410c" className="text-[8px] font-black">Mặt 1 (L x h)</text>

                  {/* Panel 2 (Always Bỏ) */}
                  <rect
                    x="50"
                    y="124"
                    width="140"
                    height="32"
                    fill="#fafafa"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    className="opacity-50"
                  />
                  <text x="120" y="143" textAnchor="middle" fill="#94a3b8" className="text-[8px] font-extrabold">Mặt 2 (Bỏ)</text>

                  {/* Panel 3 */}
                  <rect
                    x="50"
                    y="156"
                    width="140"
                    height="24"
                    fill={hoveredFace === 3 ? '#ffedd5' : '#fff7ed'}
                    stroke={hoveredFace === 3 ? '#ea580c' : '#f97316'}
                    strokeWidth={hoveredFace === 3 ? '2' : '1'}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredFace(3)}
                    onMouseLeave={() => setHoveredFace(null)}
                  />
                  <text x="120" y="171" textAnchor="middle" fill="#c2410c" className="text-[8px] font-black">Mặt 3 (L x h)</text>

                  {/* Panel 4 */}
                  {isFace4Active ? (
                    <rect
                      x="50"
                      y="180"
                      width="140"
                      height="32"
                      fill={hoveredFace === 4 ? '#ffedd5' : '#fff7ed'}
                      stroke={hoveredFace === 4 ? '#ea580c' : '#f97316'}
                      strokeWidth={hoveredFace === 4 ? '2' : '1'}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredFace(4)}
                      onMouseLeave={() => setHoveredFace(null)}
                    />
                  ) : (
                    <rect
                      x="50"
                      y="180"
                      width="140"
                      height="32"
                      fill="#fafafa"
                      stroke="#cbd5e1"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                      className="opacity-50"
                    />
                  )}
                  <text
                    x="120"
                    y="199"
                    textAnchor="middle"
                    fill={isFace4Active ? '#c2410c' : '#94a3b8'}
                    className="text-[8px] font-black"
                  >
                    {isFace4Active ? 'Mặt 4 (L x (b+2t))' : 'Mặt 4 (Bỏ)'}
                  </text>

                  {/* Panel 6 (Left End) */}
                  <rect
                    x="10"
                    y="88"
                    width="40"
                    height="36"
                    fill={hoveredFace === 6 ? '#ffedd5' : '#fff7ed'}
                    stroke={hoveredFace === 6 ? '#ea580c' : '#f97316'}
                    strokeWidth={hoveredFace === 6 ? '2' : '1'}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredFace(6)}
                    onMouseLeave={() => setHoveredFace(null)}
                  />
                  <text x="30" y="103" textAnchor="middle" fill="#c2410c" className="text-[7.5px] font-black">Mặt 6</text>
                  <text x="30" y="113" textAnchor="middle" fill="#c2410c" className="text-[6.5px] font-semibold">Đầu trái</text>

                  {/* Panel 5 (Right End) */}
                  <rect
                    x="190"
                    y="88"
                    width="40"
                    height="36"
                    fill={hoveredFace === 5 ? '#ffedd5' : '#fff7ed'}
                    stroke={hoveredFace === 5 ? '#ea580c' : '#f97316'}
                    strokeWidth={hoveredFace === 5 ? '2' : '1'}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredFace(5)}
                    onMouseLeave={() => setHoveredFace(null)}
                  />
                  <text x="210" y="103" textAnchor="middle" fill="#c2410c" className="text-[7.5px] font-black">Mặt 5</text>
                  <text x="210" y="113" textAnchor="middle" fill="#c2410c" className="text-[6.5px] font-semibold">Đầu phải</text>

                  {/* Dimension Annotations on Net */}
                  {/* Length L */}
                  <line x1="50" y1="222" x2="190" y2="222" stroke="#64748b" strokeWidth="1" />
                  <path d="M 50,222 L 54,219 M 50,222 L 54,225 M 190,222 L 186,219 M 190,222 L 186,225" stroke="#64748b" strokeWidth="0.8" />
                  <text x="120" y="232" textAnchor="middle" fill="#334155" className="text-[8.5px] font-bold font-mono">L = {L} mm</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Saved list / History table */}
      <div className="pt-6 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
          <div className="flex items-center gap-2">
            <Layers3 className="text-slate-500 w-4.5 h-4.5" />
            <div>
              <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
                Danh sách cấu kiện ván khuôn đã tính ({savedList.length})
              </h4>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase">
                Dữ liệu được lưu trữ tự động trên thiết bị của bạn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print self-end">
            {savedList.length > 0 && (
              <>
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 border border-slate-200 text-[11px] font-black rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> In bảng kê
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 border border-red-200 text-[11px] font-black rounded-lg text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
                </button>
              </>
            )}
          </div>
        </div>

        {savedList.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-200">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase">Chưa có dữ liệu ván khuôn nào được lưu</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Nhập các thông số hình học phía trên rồi nhấn "Lưu cấu kiện" để thống kê.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-3 font-black text-slate-500 uppercase tracking-wider text-[9px]">Tên cấu kiện</th>
                  <th className="p-3 font-black text-slate-500 uppercase tracking-wider text-[9px]">Kích thước bê tông (mm)</th>
                  <th className="p-3 font-black text-slate-500 uppercase tracking-wider text-[9px]">Độ dày ván (mm)</th>
                  <th className="p-3 font-black text-slate-500 uppercase tracking-wider text-[9px]">Kiểu tính</th>
                  <th className="p-3 font-black text-slate-500 uppercase tracking-wider text-[9px] text-center">Số lượng</th>
                  <th className="p-3 font-black text-slate-500 uppercase tracking-wider text-[9px] text-right">Diện tích (m²)</th>
                  <th className="p-3 font-black text-slate-500 uppercase tracking-wider text-[9px] text-center no-print">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {savedList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-none font-medium text-slate-700">
                    <td className="p-3 font-bold text-slate-950">{item.name}</td>
                    <td className="p-3 font-mono font-bold">
                      {item.b} x {item.h} x {item.L}
                    </td>
                    <td className="p-3 font-mono">{item.t} mm</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        item.calcType === '5_FACES' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {item.calcType === '5_FACES' ? '5 mặt (Dầm)' : '4 mặt (Cột)'}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono font-bold">{item.qty}</td>
                    <td className="p-3 text-right font-mono font-black text-orange-600">
                      {formatWithCommas(item.totalArea, 3)}
                    </td>
                    <td className="p-3 text-center no-print">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-colors"
                        title="Xóa dòng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {/* Print total summary row */}
                <tr className="bg-orange-50/30 font-black border-t-2 border-slate-200">
                  <td className="p-3 text-slate-900" colSpan={4}>TỔNG CỘNG HẠNG MỤC VÁN KHUÔN</td>
                  <td className="p-3 text-center font-mono">
                    {savedList.reduce((acc, i) => acc + i.qty, 0)}
                  </td>
                  <td className="p-3 text-right font-mono text-sm text-orange-600">
                    {formatWithCommas(savedList.reduce((acc, i) => acc + i.totalArea, 0), 3)} m²
                  </td>
                  <td className="p-3 no-print"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
