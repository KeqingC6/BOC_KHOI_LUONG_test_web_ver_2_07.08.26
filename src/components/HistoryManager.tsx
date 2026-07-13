import { useState, useId } from 'react';
import { BOMItem, BOMTable, SteelGrade } from '../types';
import { formatWithCommas, calculateSteelProperties } from '../utils';
import { STEEL_SHAPES } from '../data';
import { useLanguage } from '../contexts/LanguageContext';
import {
  FolderOpen,
  Plus,
  Check,
  X,
  Printer,
  FileSpreadsheet,
  Trash2,
  Search,
  Scale,
  Sparkles,
  Layers,
  FileText,
  Pencil,
} from 'lucide-react';

interface HistoryManagerProps {
  history: BOMItem[];
  bomTables: BOMTable[];
  activeTableId: string;
  onSelectTable: (id: string) => void;
  onCreateTable: (name: string) => void;
  onDeleteTable: (id: string) => void;
  onDeleteHistoryEntry: (id: string) => void;
  onClearHistory: () => void;
  onUpdateHistoryEntry: (item: BOMItem) => void;
  grades: SteelGrade[];
}

export default function HistoryManager({
  history,
  bomTables,
  activeTableId,
  onSelectTable,
  onCreateTable,
  onDeleteTable,
  onDeleteHistoryEntry,
  onClearHistory,
  onUpdateHistoryEntry,
  grades,
}: HistoryManagerProps) {
  const { language, t } = useLanguage();
  const [isCreating, setIsCreating] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Modal editing states
  const [editingItem, setEditingItem] = useState<BOMItem | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [tempGradeId, setTempGradeId] = useState('');
  const [tempInputs, setTempInputs] = useState<Record<string, string>>({});
  const [tempQuantity, setTempQuantity] = useState<number | ''>(1);

  const startEditing = (item: BOMItem) => {
    setEditingItem(item);
    setTempNote(item.note);
    setTempGradeId(item.gradeId);
    
    const inputsCopy: Record<string, string> = {};
    Object.entries(item.inputs).forEach(([k, v]) => {
      inputsCopy[k] = v.toString();
    });
    setTempInputs(inputsCopy);
    setTempQuantity(item.quantity);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    const finalInputs: Record<string, number> = {};
    Object.entries(tempInputs).forEach(([k, v]) => {
      finalInputs[k] = parseFloat(String(v).replace(',', '.')) || 0;
    });

    const finalGrade = grades.find((g) => g.id === tempGradeId) || grades[0];
    const finalResults = calculateSteelProperties(
      editingItem.shapeType,
      finalInputs,
      finalGrade
    );

    const shapeObj = STEEL_SHAPES.find((s) => s.type === editingItem.shapeType);
    const shapeLabel = shapeObj
      ? `${shapeObj.vietnameseName} (${Object.entries(finalInputs)
          .map(([inpK, inpV]) => `${inpK}=${inpV}`)
          .join(', ')})`
      : editingItem.shapeType;

    const updatedItem: BOMItem = {
      ...editingItem,
      note: tempNote,
      gradeId: finalGrade.id,
      gradeName: finalGrade.name,
      inputs: finalInputs,
      results: finalResults,
      quantity: tempQuantity || 1,
      shapeLabel,
    };

    onUpdateHistoryEntry(updatedItem);
    setEditingItem(null);
  };

  const handleDoubleClickCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedText(language === 'vi' ? `Đã chép ${label}: ${val}` : `Copied ${label}: ${val}`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const searchInputId = useId();
  const newTableInputId = useId();

  const handleConfirmCreate = () => {
    if (newTableName.trim()) {
      onCreateTable(newTableName.trim());
    }
    setIsCreating(false);
    setNewTableName('');
  };

  const filteredHistory = history.filter(
    (item) =>
      item.shapeLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.note.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalWeightKg = filteredHistory.reduce((sum, item) => sum + item.results.totalWeightKg * item.quantity, 0);
  const totalPaintM2 = filteredHistory.reduce((sum, item) => sum + item.results.totalPaintAreaM2 * item.quantity, 0);

  const exportToCSV = () => {
    if (history.length === 0) return;
    const headers = language === 'vi' ? [
      'STT',
      'Mo ta / Ky hieu',
      'Loai thep hinh',
      'Mac thep',
      'So luong',
      'Khoi luong don vi (kg/m)',
      'Tong khoi luong (kg)',
      'Dien tich son (m2)',
    ] : [
      'No.',
      'Mark / Description',
      'Steel Shape Profile',
      'Steel Grade',
      'Qty',
      'Unit Weight (kg/m)',
      'Total Weight (kg)',
      'Paint Area (m2)',
    ];
    const rows = history.map((e, idx) => [
      idx + 1,
      `"${e.note}"`,
      `"${e.shapeLabel}"`,
      e.gradeName,
      e.quantity,
      e.results.weightPerMeter.toFixed(3),
      (e.results.totalWeightKg * e.quantity).toFixed(2),
      (e.results.totalPaintAreaM2 * e.quantity).toFixed(3),
    ]);

    // Use standard UTF-8 Byte Order Mark (BOM) to prevent Vietnamese accents from corruption in Excel
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Bao_Cao_Thong_Ke_BOM_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Multi-BOM block */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 font-sans no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <FolderOpen className="text-orange-500 w-4 h-4" /> {language === 'vi' ? 'Quản lý bảng thống kê dự án' : 'Project Tables (BOM) Manager'} ({bomTables.length})
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">
              {language === 'vi' ? 'Bóc tách định lượng riêng biệt cho từng hạng mục công trình.' : 'Separate quantity takeoff lists for different structures.'}
            </p>
          </div>

          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[10.5px] font-extrabold rounded-lg uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
              id="btn-create-table-trigger"
            >
              <Plus className="w-3.5 h-3.5" /> {language === 'vi' ? 'Tạo hạng mục mới' : 'Add New Table'}
            </button>
          ) : (
            <div className="flex items-center gap-2 animate-fadeIn">
              <label htmlFor={newTableInputId} className="sr-only">{language === 'vi' ? 'Tên bảng mới...' : 'New table name...'}</label>
              <input
                id={newTableInputId}
                type="text"
                placeholder={language === 'vi' ? 'Tên hạng mục mới...' : 'New table name...'}
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmCreate();
                }}
                className="px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold"
              />
              <button
                onClick={handleConfirmCreate}
                className="p-1.5 bg-emerald-500 text-white rounded cursor-pointer transition-transform hover:scale-105"
                id="btn-confirm-create-table"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1.5 bg-slate-100 text-slate-500 rounded cursor-pointer hover:bg-slate-200"
                id="btn-cancel-create-table"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* List of active tables */}
        <div className="flex flex-wrap gap-2">
          {bomTables.map((t) => {
            const isActive = t.id === activeTableId;
            return (
              <div
                key={t.id}
                onClick={() => onSelectTable(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm scale-[1.02]'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                id={`tab-bom-${t.id}`}
              >
                <span>{t.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                    isActive ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {t.items.length}
                </span>
                {bomTables.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(language === 'vi' ? `Xóa hoàn toàn bảng kê "${t.name}" và tất cả cấu kiện?` : `Completely delete the project table "${t.name}" and all of its items?`)) {
                        onDeleteTable(t.id);
                      }
                    }}
                    className="text-slate-400 hover:text-red-500 ml-1.5 cursor-pointer transition-colors"
                    id={`btn-del-table-${t.id}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Table BOM Details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4 print-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest font-sans flex items-center gap-1.5">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span> {language === 'vi' ? 'Chi tiết bảng thống kê' : 'Bill of Materials breakdown'} ({filteredHistory.length} {language === 'vi' ? 'cấu kiện' : 'items'})
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.print()}
              disabled={history.length === 0}
              className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-[10.5px] font-extrabold text-slate-600 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer transition-colors"
              id="btn-print-bom"
            >
              <Printer className="w-3.5 h-3.5" /> {language === 'vi' ? 'In phiếu / Xuất PDF' : 'Print / Export PDF'}
            </button>
            <button
              onClick={exportToCSV}
              disabled={history.length === 0}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-[10.5px] font-extrabold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer transition-colors"
              id="btn-export-bom"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> {language === 'vi' ? 'Xuất Excel (CSV)' : 'Export Excel (CSV)'}
            </button>
            <button
              onClick={onClearHistory}
              disabled={history.length === 0}
              className="px-3.5 py-1.5 border border-red-200 text-red-600 rounded-lg text-[10.5px] font-extrabold hover:bg-red-50 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer transition-colors"
              id="btn-clear-bom"
            >
              <Trash2 className="w-3.5 h-3.5" /> {language === 'vi' ? 'Xóa sạch bảng' : 'Clear Table'}
            </button>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="relative max-w-xs no-print">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <label htmlFor={searchInputId} className="sr-only">{language === 'vi' ? 'Lọc cấu kiện...' : 'Filter structures...'}</label>
          <input
            id={searchInputId}
            type="text"
            placeholder={language === 'vi' ? 'Lọc ký hiệu hoặc loại thép...' : 'Filter by mark or shape...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none font-bold text-slate-800"
          />
        </div>

        {/* Printing header */}
        <div className="hidden print:block text-center space-y-2 pb-6 border-b border-slate-300">
          <h1 className="text-xl font-black uppercase text-slate-900">{language === 'vi' ? 'BẢNG THỐNG KÊ CHI TIẾT THÉP HÌNH' : 'DETAILED BILL OF MATERIALS (BOM)'}</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            {language === 'vi' ? 'Hạng mục' : 'Category'}: {bomTables.find((t) => t.id === activeTableId)?.name || (language === 'vi' ? 'Mặc định' : 'Default')}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">{language === 'vi' ? 'Thời gian xuất' : 'Exported At'}: {new Date().toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}</p>
        </div>

        {/* Detailed Table Grid */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 print-table-wrapper">
          <table className="w-full text-left border-collapse text-xs print-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                <th className="px-4 py-3 text-center w-12">{language === 'vi' ? 'STT' : 'No.'}</th>
                <th className="px-4 py-3">{language === 'vi' ? 'Ký hiệu / Vị trí kết cấu' : 'Structural Mark / Note'}</th>
                <th className="px-4 py-3">{language === 'vi' ? 'Phân loại Thép' : 'Steel Profile Shape'}</th>
                <th className="px-4 py-3 text-center w-20">{language === 'vi' ? 'Mác Thép' : 'Grade'}</th>
                <th className="px-4 py-3 text-right">{language === 'vi' ? 'Khối lượng riêng (kg/m)' : 'Unit Weight (kg/m)'}</th>
                <th className="px-4 py-3 text-center w-16">{language === 'vi' ? 'SL' : 'Qty'}</th>
                <th className="px-4 py-3 text-right">{language === 'vi' ? 'Khối lượng M (kg)' : 'Total Weight M (kg)'}</th>
                <th className="px-4 py-3 text-right">{language === 'vi' ? 'Bề mặt sơn (m²)' : 'Paint Surface (m²)'}</th>
                <th className="px-4 py-3 text-center w-20 no-print">{language === 'vi' ? 'Hành động' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredHistory.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td 
                    className="px-4 py-3 text-center font-mono text-slate-400 font-bold cursor-pointer select-none hover:bg-slate-100/50 rounded-lg transition-all"
                    title={language === 'vi' ? 'Nhấp đúp chuột để sao chép số thứ tự' : 'Double click to copy STT'}
                    onDoubleClick={() => handleDoubleClickCopy((idx + 1).toString(), language === 'vi' ? 'STT' : 'No.')}
                  >
                    {idx + 1}
                  </td>
                  <td 
                    className="px-4 py-3 font-extrabold text-slate-800 cursor-pointer select-none hover:bg-slate-100/40 rounded transition-all"
                    title={language === 'vi' ? 'Nhấp đúp chuột để sao chép Ký hiệu' : 'Double click to copy structural mark'}
                    onDoubleClick={() => handleDoubleClickCopy(item.note, language === 'vi' ? 'Ký hiệu' : 'Mark')}
                  >
                    {item.note || '---'}
                  </td>
                  <td 
                    className="px-4 py-3 font-bold text-slate-500 text-[11px] cursor-pointer select-none hover:bg-slate-100/40 rounded transition-all"
                    title={language === 'vi' ? 'Nhấp đúp chuột để sao chép thông số Thép' : 'Double click to copy shape stats'}
                    onDoubleClick={() => handleDoubleClickCopy(item.shapeLabel, language === 'vi' ? 'Thông số thép' : 'Shape Parameters')}
                  >
                    <span className="font-extrabold text-slate-700 block text-[10px] uppercase tracking-wider">{item.shapeType} shape</span>
                    <span>{item.shapeLabel}</span>
                  </td>
                  <td 
                    className="px-4 py-3 text-center font-mono font-bold text-slate-700 cursor-pointer select-none hover:bg-slate-100/40 rounded transition-all"
                    title={language === 'vi' ? 'Nhấp đúp chuột để sao chép Mác thép' : 'Double click to copy steel grade'}
                    onDoubleClick={() => handleDoubleClickCopy(item.gradeName, language === 'vi' ? 'Mác thép' : 'Steel Grade')}
                  >
                    {item.gradeName}
                  </td>
                  <td 
                    className="px-4 py-3 text-right font-mono font-bold text-slate-600 cursor-pointer select-none hover:bg-slate-100/40 rounded transition-all"
                    title={language === 'vi' ? 'Nhấp đúp chuột để sao chép Khối lượng riêng' : 'Double click to copy unit weight'}
                    onDoubleClick={() => handleDoubleClickCopy(item.results.weightPerMeter.toFixed(3), language === 'vi' ? 'Khối lượng riêng' : 'Unit Weight')}
                  >
                    {formatWithCommas(item.results.weightPerMeter, 3)}
                  </td>
                  <td 
                    className="px-4 py-3 text-center font-mono font-black text-slate-800 cursor-pointer select-none hover:bg-slate-100/40 rounded transition-all"
                    title={language === 'vi' ? 'Nhấp đúp chuột để sao chép Số lượng' : 'Double click to copy Quantity'}
                    onDoubleClick={() => handleDoubleClickCopy(item.quantity.toString(), language === 'vi' ? 'Số lượng' : 'Quantity')}
                  >
                    {item.quantity}
                  </td>
                  <td 
                    className="px-4 py-3 text-right font-mono font-black text-slate-800 cursor-pointer select-none hover:bg-slate-100/40 rounded transition-colors"
                    title={language === 'vi' ? 'Nhấp đúp chuột để sao chép Tổng khối lượng M' : 'Double click to copy Total Weight M'}
                    onDoubleClick={() => handleDoubleClickCopy(formatWithCommas(item.results.totalWeightKg * item.quantity, 2), language === 'vi' ? 'Tổng khối lượng M' : 'Total Weight M')}
                  >
                    {formatWithCommas(item.results.totalWeightKg * item.quantity, 2)}
                  </td>
                  <td 
                    className="px-4 py-3 text-right font-mono font-black text-emerald-600 cursor-pointer select-none hover:bg-slate-100/40 rounded transition-colors"
                    title={language === 'vi' ? 'Nhấp đúp chuột để sao chép Bề mặt sơn' : 'Double click to copy paint area'}
                    onDoubleClick={() => handleDoubleClickCopy(formatWithCommas(item.results.totalPaintAreaM2 * item.quantity, 3), language === 'vi' ? 'Bề mặt sơn' : 'Paint Surface Area')}
                  >
                    {formatWithCommas(item.results.totalPaintAreaM2 * item.quantity, 3)}
                  </td>
                  <td className="px-4 py-3 text-center no-print flex items-center justify-center gap-2">
                    <button
                      onClick={() => startEditing(item)}
                      className="text-slate-400 hover:text-orange-500 transition-colors cursor-pointer p-1 rounded hover:bg-slate-100"
                      title={language === 'vi' ? 'Chỉnh sửa cấu kiện' : 'Edit profile'}
                      id={`btn-edit-entry-${item.id}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteHistoryEntry(item.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-1 rounded hover:bg-slate-100"
                      title={language === 'vi' ? 'Xóa cấu kiện' : 'Delete profile'}
                      id={`btn-del-entry-${item.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400 font-bold">
                    {language === 'vi' ? 'Bảng thống kê trống hoặc không tìm thấy dữ liệu cấu kiện trùng khớp.' : 'The bill of materials is currently empty or no matched entries were found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Aggregated Totals Footer Summary Cards */}
        {filteredHistory.length > 0 && (
          <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-150 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mt-3 shadow-inner">
            <div>
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">{language === 'vi' ? 'Tổng số lượng thép' : 'Total Quantity'}</span>
              <span className="text-sm font-black font-mono text-slate-700 block mt-1">
                {filteredHistory.reduce((s, i) => s + i.quantity, 0)}{' '}
                <span className="text-[10px] font-bold font-sans text-slate-400">{language === 'vi' ? 'Thanh/Tấm' : 'Bars/Plates'}</span>
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">{language === 'vi' ? 'Tổng trọng lượng' : 'Total Steel Weight'}</span>
              <span className="text-sm font-black font-mono text-orange-600 block mt-1">
                {formatWithCommas(totalWeightKg / 1000, 4)}{' '}
                <span className="text-[10px] font-bold font-sans text-orange-400">{language === 'vi' ? 'Tấn' : 'Tons'}</span>
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">{language === 'vi' ? 'Diện tích sơn bảo ôn' : 'Coating Surface Area'}</span>
              <span className="text-sm font-black font-mono text-emerald-600 block mt-1">
                {formatWithCommas(totalPaintM2, 3)}{' '}
                <span className="text-[10px] font-bold font-sans text-emerald-500">m²</span>
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">{language === 'vi' ? 'Sơn phủ trung bình' : 'Average Coating Ratio'}</span>
              <span className="text-sm font-black font-mono text-slate-700 block mt-1">
                {formatWithCommas(totalWeightKg > 0 ? totalPaintM2 / (totalWeightKg / 1000) : 0, 1)}{' '}
                <span className="text-[10px] font-bold font-sans text-slate-400">{language === 'vi' ? 'm²/Tấn' : 'm²/Ton'}</span>
              </span>
            </div>
          </div>
        )}

        {copiedText && (
          <div className="fixed bottom-10 right-10 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-black z-50 flex items-center gap-2 border border-emerald-500 animate-fadeIn font-sans no-print">
            <Check className="w-4.5 h-4.5" />
            <span>{copiedText}</span>
          </div>
        )}

        {editingItem && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn no-print">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden transform transition-all flex flex-col">
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{language === 'vi' ? 'Chỉnh sửa cấu kiện' : 'Edit Structural Profile'}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{language === 'vi' ? 'Phân loại' : 'Category'}: {editingItem.shapeType} shape</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form body */}
              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Note / Ky hieu */}
                <div className="space-y-1.5">
                  <label className="text-[10.5px] text-slate-500 font-extrabold uppercase tracking-wider block">{language === 'vi' ? 'Ký hiệu / Vị trí kết cấu' : 'Structural Mark / Location note'}</label>
                  <input
                    type="text"
                    value={tempNote}
                    onChange={(e) => setTempNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-slate-50/50 focus:bg-white transition-all"
                    placeholder={language === 'vi' ? 'Ký hiệu vị trí hoặc ghi chú...' : 'Location mark or notes...'}
                  />
                </div>

                {/* Grade selection */}
                <div className="space-y-1.5">
                  <label className="text-[10.5px] text-slate-500 font-extrabold uppercase tracking-wider block">{language === 'vi' ? 'Mác thép' : 'Steel Grade'}</label>
                  <select
                    value={tempGradeId}
                    onChange={(e) => setTempGradeId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-slate-50/50 focus:bg-white cursor-pointer transition-all"
                  >
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.standard})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity input */}
                <div className="space-y-1.5">
                  <label className="text-[10.5px] text-slate-500 font-extrabold uppercase tracking-wider block">{language === 'vi' ? 'Số lượng cấu kiện (SL)' : 'Member Quantity (Qty)'}</label>
                  <input
                    type="number"
                    min="1"
                    value={tempQuantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setTempQuantity('');
                      } else {
                        const parsed = parseInt(val, 10);
                        setTempQuantity(isNaN(parsed) ? '' : parsed);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs font-black text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-slate-50/50 focus:bg-white transition-all"
                  />
                </div>

                {/* Dimensions inputs */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <span className="text-[10.5px] text-slate-500 font-extrabold uppercase tracking-wider block mb-2">{language === 'vi' ? 'Kích thước hình học (mm)' : 'Geometrical Dimensions (mm)'}</span>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(tempInputs).map((key) => {
                      // Custom labels or descriptions for steel dimensions keys
                      const labelMap: Record<string, string> = language === 'vi' ? {
                        L: 'Chiều dài L (mm)',
                        w: 'Bề rộng w (mm)',
                        h: 'Chiều cao h (mm)',
                        t: 'Độ dày t (mm)',
                        d: 'Đường kính d (mm)',
                        D: 'Đường kính ngoài D (mm)',
                        b: 'Bề rộng cánh b (mm)',
                        tw: 'Độ dày bụng tw (mm)',
                        tf: 'Độ dày cánh tf (mm)',
                        r: 'Bán kính r (mm)',
                        a: 'Cạnh a (mm)',
                      } : {
                        L: 'Length L (mm)',
                        w: 'Width w (mm)',
                        h: 'Height h (mm)',
                        t: 'Thickness t (mm)',
                        d: 'Diameter d (mm)',
                        D: 'Outer Diameter D (mm)',
                        b: 'Flange Width b (mm)',
                        tw: 'Web Thickness tw (mm)',
                        tf: 'Flange Thickness tf (mm)',
                        r: 'Radius r (mm)',
                        a: 'Side length a (mm)',
                      };
                      const displayLabel = labelMap[key] || (language === 'vi' ? `Thông số ${key.toUpperCase()}` : `Dimension ${key.toUpperCase()}`);

                      return (
                        <div key={key} className="space-y-1">
                          <label className="text-[9.5px] text-slate-400 font-bold block">{displayLabel}</label>
                          <input
                            type="text"
                            value={tempInputs[key] || ''}
                            onChange={(e) => setTempInputs({ ...tempInputs, [key]: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-slate-50/50 focus:bg-white transition-all"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live Preview section */}
                {(() => {
                  const parsedInputs: Record<string, number> = {};
                  Object.entries(tempInputs).forEach(([k, v]) => {
                    parsedInputs[k] = parseFloat(String(v).replace(',', '.')) || 0;
                  });

                  const currentGrade = grades.find((g) => g.id === tempGradeId) || grades[0];
                  const calculatedResults = calculateSteelProperties(
                    editingItem.shapeType,
                    parsedInputs,
                    currentGrade
                  );

                  const tempWeightPerMeter = calculatedResults.weightPerMeter;
                  // If L is not defined, default to 1000mm (1m) so calculations are realistic
                  const tempL = parsedInputs.L || 1000;
                  const tempTotalWeight = tempWeightPerMeter * (tempL / 1000) * (tempQuantity || 1);
                  const tempPaintArea = calculatedResults.totalPaintAreaM2 * (tempQuantity || 1);

                  return (
                    <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-2 mt-4">
                      <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider block">{language === 'vi' ? 'Kết quả tính toán sau chỉnh sửa' : 'Updated Calculation Results'}</span>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] font-semibold block">{language === 'vi' ? 'Khối lượng riêng (kg/m):' : 'Unit Weight (kg/m):'}</span>
                          <span className="font-mono font-black text-slate-700 block text-xs mt-0.5">
                            {formatWithCommas(tempWeightPerMeter, 3)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-semibold block">{language === 'vi' ? 'Tổng khối lượng M (kg):' : 'Total Weight M (kg):'}</span>
                          <span className="font-mono font-black text-orange-600 block text-xs mt-0.5">
                            {formatWithCommas(tempTotalWeight, 2)}
                          </span>
                        </div>
                        <div className="col-span-2 border-t border-slate-100 pt-1.5 mt-1">
                          <span className="text-slate-400 text-[10px] font-semibold block">{language === 'vi' ? 'Tổng diện tích sơn (m²):' : 'Total Paint Surface (m²):'}</span>
                          <span className="font-mono font-black text-emerald-600 block text-xs mt-0.5">
                            {formatWithCommas(tempPaintArea, 3)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Footer Actions */}
              <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-black text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
                >
                  {language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-xs font-black text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> {language === 'vi' ? 'Lưu thay đổi' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
