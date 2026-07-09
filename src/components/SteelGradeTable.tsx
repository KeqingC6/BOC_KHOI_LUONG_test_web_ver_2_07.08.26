import { useState, useId, FormEvent } from 'react';
import { SteelGrade, ConcreteClass } from '../types';
import { formatWithCommas } from '../utils';
import { Search, RotateCcw, Database, Plus, Trash2, Check, X, AlertCircle } from 'lucide-react';

interface SteelGradeTableProps {
  grades: SteelGrade[];
  onResetGrades: () => void;
  concreteClasses: ConcreteClass[];
  onAddGrade: (newGrade: SteelGrade) => boolean;
  onDeleteGrade: (id: string) => void;
  onAddConcreteClass: (newClass: ConcreteClass) => boolean;
  onDeleteConcreteClass: (id: string) => void;
}

export default function SteelGradeTable({
  grades,
  onResetGrades,
  concreteClasses,
  onAddGrade,
  onDeleteGrade,
  onAddConcreteClass,
  onDeleteConcreteClass,
}: SteelGradeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [concreteSearchTerm, setConcreteSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'steel' | 'concrete'>('steel');
  
  // Form visibility
  const [showAddGradeForm, setShowAddGradeForm] = useState(false);
  const [showAddConcreteForm, setShowAddConcreteForm] = useState(false);

  // Steel grade form state
  const [gradeName, setGradeName] = useState('');
  const [gradeCategory, setGradeCategory] = useState<'structural' | 'rebar'>('structural');
  const [gradeStandard, setGradeStandard] = useState('');
  const [gradeFy, setGradeFy] = useState('');
  const [gradeFu, setGradeFu] = useState('');
  const [gradeElastic, setGradeElastic] = useState('200');
  const [gradeDensity, setGradeDensity] = useState('7850');
  const [gradeDesc, setGradeDesc] = useState('');
  const [gradeError, setGradeError] = useState('');

  // Concrete class form state
  const [concreteName, setConcreteName] = useState('');
  const [concreteEquivalent, setConcreteEquivalent] = useState('');
  const [concreteRb, setConcreteRb] = useState('');
  const [concreteRbt, setConcreteRbt] = useState('');
  const [concreteEb, setConcreteEb] = useState('');
  const [concreteDesc, setConcreteDesc] = useState('');
  const [concreteError, setConcreteError] = useState('');

  const searchInputId = useId();
  const concreteSearchInputId = useId();

  // Filters
  const filteredGrades = grades.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.standard.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConcrete = concreteClasses.filter(
    (c) =>
      c.className.toLowerCase().includes(concreteSearchTerm.toLowerCase()) ||
      c.gradeName.toLowerCase().includes(concreteSearchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(concreteSearchTerm.toLowerCase())
  );

  // Submit Steel Grade
  const handleGradeSubmit = (e: FormEvent) => {
    e.preventDefault();
    setGradeError('');

    if (!gradeName.trim()) return setGradeError('Vui lòng nhập tên mác thép.');
    if (!gradeStandard.trim()) return setGradeError('Vui lòng nhập tiêu chuẩn đăng kiểm.');
    
    const fyVal = parseFloat(gradeFy);
    const fuVal = parseFloat(gradeFu);
    const elasticVal = parseFloat(gradeElastic);
    const densityVal = parseFloat(gradeDensity);

    if (isNaN(fyVal) || fyVal <= 0) return setGradeError('Giới hạn chảy fy phải là số dương.');
    if (isNaN(fuVal) || fuVal <= 0) return setGradeError('Giới hạn bền fu phải là số dương.');
    if (isNaN(elasticVal) || elasticVal <= 0) return setGradeError('Mô đun đàn hồi E phải là số dương.');
    if (isNaN(densityVal) || densityVal <= 0) return setGradeError('Khối lượng riêng phải là số dương.');

    const newGrade: SteelGrade = {
      id: `grade-${Date.now()}`,
      name: gradeName.trim(),
      category: gradeCategory,
      standard: gradeStandard.trim(),
      fy: fyVal,
      fu: fuVal,
      density: densityVal,
      elasticModulus: elasticVal,
      description: gradeDesc.trim() || `Mác thép cán nóng tự định nghĩa: ${gradeName.trim()}`,
    };

    const success = onAddGrade(newGrade);
    if (success) {
      // Reset form
      setGradeName('');
      setGradeStandard('');
      setGradeFy('');
      setGradeFu('');
      setGradeElastic('200');
      setGradeDensity('7850');
      setGradeDesc('');
      setShowAddGradeForm(false);
    }
  };

  // Submit Concrete Class
  const handleConcreteSubmit = (e: FormEvent) => {
    e.preventDefault();
    setConcreteError('');

    if (!concreteName.trim()) return setConcreteError('Vui lòng nhập cấp độ bền (B).');
    if (!concreteEquivalent.trim()) return setConcreteError('Vui lòng nhập mác tương đương (M).');
    
    const rbVal = parseFloat(concreteRb);
    const rbtVal = parseFloat(concreteRbt);
    const ebVal = parseFloat(concreteEb);

    if (isNaN(rbVal) || rbVal <= 0) return setConcreteError('Cường độ nén Rb phải là số dương.');
    if (isNaN(rbtVal) || rbtVal <= 0) return setConcreteError('Cường độ kéo Rbt phải là số dương.');
    if (isNaN(ebVal) || ebVal <= 0) return setConcreteError('Mô đun đàn hồi Eb phải là số dương.');

    const newClass: ConcreteClass = {
      id: `concrete-${Date.now()}`,
      className: concreteName.trim(),
      gradeName: concreteEquivalent.trim(),
      rb: rbVal,
      rbt: rbtVal,
      eb: ebVal,
      description: concreteDesc.trim() || `Cấp bê tông cường độ tự tạo: ${concreteName.trim()}`,
    };

    const success = onAddConcreteClass(newClass);
    if (success) {
      // Reset form
      setConcreteName('');
      setConcreteEquivalent('');
      setConcreteRb('');
      setConcreteRbt('');
      setConcreteEb('');
      setConcreteDesc('');
      setShowAddConcreteForm(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Database className="text-orange-500 w-5 h-5" />
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest font-sans">
              Thư viện tra cứu & Bổ sung cường độ vật liệu
            </h3>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
              Quản lý danh mục cơ sở dữ liệu mác thép & cấp độ bền bê tông
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveSubTab('steel')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-[10px] font-black rounded-md transition-all cursor-pointer ${
              activeSubTab === 'steel' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
            id="tab-db-steel"
          >
            Mác Thép (Steel Grades)
          </button>
          <button
            onClick={() => setActiveSubTab('concrete')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-[10px] font-black rounded-md transition-all cursor-pointer ${
              activeSubTab === 'concrete' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
            id="tab-db-concrete"
          >
            Bê Tông (Concrete)
          </button>
        </div>
      </div>

      {/* Steel Grade Tab Content */}
      {activeSubTab === 'steel' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-1 gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <label htmlFor={searchInputId} className="sr-only">Tìm mác thép...</label>
                <input
                  id={searchInputId}
                  type="text"
                  placeholder="Tìm tên mác thép hoặc tiêu chuẩn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none font-bold"
                />
              </div>
              <button
                onClick={() => {
                  setShowAddGradeForm(!showAddGradeForm);
                  setGradeError('');
                }}
                className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                  showAddGradeForm 
                    ? 'bg-rose-50 border border-rose-200 text-rose-600' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
                id="btn-toggle-add-grade"
              >
                {showAddGradeForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {showAddGradeForm ? 'Đóng form' : 'Bổ sung mác thép'}
              </button>
            </div>

            <button
              onClick={onResetGrades}
              className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
              id="btn-reset-grades"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Khôi phục dữ liệu gốc
            </button>
          </div>

          {/* Add Steel Grade Form */}
          {showAddGradeForm && (
            <form onSubmit={handleGradeSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-orange-500" /> Thêm mác thép cán nóng hoặc cốt thép mới
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddGradeForm(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {gradeError && (
                <div className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-100 flex items-center gap-2 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{gradeError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Tên mác thép *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: CB600-V, SS490"
                    value={gradeName}
                    onChange={(e) => setGradeName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Tiêu chuẩn đăng kiểm *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: TCVN 1651:2018, JIS G3101"
                    value={gradeStandard}
                    onChange={(e) => setGradeStandard(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Phân loại *</label>
                  <select
                    value={gradeCategory}
                    onChange={(e) => setGradeCategory(e.target.value as 'structural' | 'rebar')}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-bold"
                  >
                    <option value="structural">Kết cấu (Structural)</option>
                    <option value="rebar">Cốt thép (Rebar)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Khối lượng riêng (kg/m³) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="VD: 7850"
                    value={gradeDensity}
                    onChange={(e) => setGradeDensity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Cường độ chảy fy (MPa) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="VD: 345"
                    value={gradeFy}
                    onChange={(e) => setGradeFy(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Giới hạn bền fu (MPa) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="VD: 490"
                    value={gradeFu}
                    onChange={(e) => setGradeFu(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Mô đun đàn hồi E (GPa) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="VD: 200, 206, 210"
                    value={gradeElastic}
                    onChange={(e) => setGradeElastic(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Ghi chú ứng dụng</label>
                  <input
                    type="text"
                    placeholder="VD: Thép bản mã đặc biệt chịu mài mòn"
                    value={gradeDesc}
                    onChange={(e) => setGradeDesc(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGradeForm(false)}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Lưu mác thép
                </button>
              </div>
            </form>
          )}

          {/* Steel Grades Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                  <th className="px-4 py-3">Mác Thép</th>
                  <th className="px-4 py-3">Tiêu Chuẩn Đăng Kiểm</th>
                  <th className="px-4 py-3 text-right">Cường Độ Chảy fy (MPa)</th>
                  <th className="px-4 py-3 text-right">Giới Hạn Bền fu (MPa)</th>
                  <th className="px-4 py-3 text-right">Mô Đun Đàn Hồi E (GPa)</th>
                  <th className="px-4 py-3 text-center">Phân Loại</th>
                  <th className="px-4 py-3 text-center w-20">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredGrades.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-extrabold text-slate-800">{g.name}</td>
                    <td className="px-4 py-3 font-bold text-slate-400">{g.standard}</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-slate-800">
                      {formatWithCommas(g.fy, 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black text-slate-500">
                      {formatWithCommas(g.fu, 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-400">
                      {formatWithCommas(g.elasticModulus, 0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          g.category === 'structural'
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}
                      >
                        {g.category === 'structural' ? 'Kết cấu' : 'Cốt thép'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa mác thép "${g.name}" khỏi danh mục không?`)) {
                            onDeleteGrade(g.id);
                          }
                        }}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Xóa mác thép"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredGrades.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-bold">
                      Không tìm thấy mác thép nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Concrete Tab Content */}
      {activeSubTab === 'concrete' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-1 gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <label htmlFor={concreteSearchInputId} className="sr-only">Tìm mác bê tông...</label>
                <input
                  id={concreteSearchInputId}
                  type="text"
                  placeholder="Tìm cấp bê tông, mác hoặc ứng dụng..."
                  value={concreteSearchTerm}
                  onChange={(e) => setConcreteSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none font-bold"
                />
              </div>
              <button
                onClick={() => {
                  setShowAddConcreteForm(!showAddConcreteForm);
                  setConcreteError('');
                }}
                className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                  showAddConcreteForm 
                    ? 'bg-rose-50 border border-rose-200 text-rose-600' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
                id="btn-toggle-add-concrete"
              >
                {showAddConcreteForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {showAddConcreteForm ? 'Đóng form' : 'Bổ sung cấp bê tông'}
              </button>
            </div>

            <button
              onClick={onResetGrades}
              className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
              id="btn-reset-concrete"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Khôi phục dữ liệu gốc
            </button>
          </div>

          {/* Add Concrete Class Form */}
          {showAddConcreteForm && (
            <form onSubmit={handleConcreteSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-orange-500" /> Thêm cấp độ bền bê tông (B) và mác bê tông (M) mới
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddConcreteForm(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {concreteError && (
                <div className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-100 flex items-center gap-2 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{concreteError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Cấp độ bền bê tông (B) *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: B22.5, B45"
                    value={concreteName}
                    onChange={(e) => setConcreteName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Mác bê tông tương đương (M) *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: M275, M600"
                    value={concreteEquivalent}
                    onChange={(e) => setConcreteEquivalent(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Cường độ nén Rb (MPa) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="VD: 13.0, 25.0"
                    value={concreteRb}
                    onChange={(e) => setConcreteRb(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Cường độ kéo Rbt (MPa) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="VD: 0.98, 1.55"
                    value={concreteRbt}
                    onChange={(e) => setConcreteRbt(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Mô đun đàn hồi Eb (GPa) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="VD: 29.0, 37.5"
                    value={concreteEb}
                    onChange={(e) => setConcreteEb(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Ứng dụng khuyên dùng</label>
                  <input
                    type="text"
                    placeholder="VD: Bê tông kết cấu dầm sàn cường độ cao"
                    value={concreteDesc}
                    onChange={(e) => setConcreteDesc(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddConcreteForm(false)}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Lưu cấp bê tông
                </button>
              </div>
            </form>
          )}

          {/* Concrete Strength Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                  <th className="px-4 py-3">Cấp Độ Bền (B)</th>
                  <th className="px-4 py-3">Mác Bê Tông Tương Đương (M)</th>
                  <th className="px-4 py-3 text-right">Nén Tính Toán Rb (MPa)</th>
                  <th className="px-4 py-3 text-right">Kéo Tính Toán Rbt (MPa)</th>
                  <th className="px-4 py-3 text-right">Mô Đun Đàn Hồi Eb (GPa)</th>
                  <th className="px-4 py-3">Ứng dụng khuyên dùng</th>
                  <th className="px-4 py-3 text-center w-20">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredConcrete.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-extrabold text-slate-800">{c.className}</td>
                    <td className="px-4 py-3 font-extrabold text-slate-400">{c.gradeName}</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-slate-800">
                      {formatWithCommas(c.rb, 1)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black text-slate-500">
                      {formatWithCommas(c.rbt, 2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-400">
                      {formatWithCommas(c.eb, 1)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-500 text-[10.5px]">
                      {c.description}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa cấp bê tông "${c.className}" khỏi danh mục không?`)) {
                            onDeleteConcreteClass(c.id);
                          }
                        }}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Xóa cấp bê tông"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredConcrete.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-bold">
                      Không tìm thấy cấp bê tông nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
