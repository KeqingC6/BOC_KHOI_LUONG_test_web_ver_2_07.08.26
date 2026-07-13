import { useState, useEffect } from 'react';
import { INITIAL_STEEL_GRADES, INITIAL_CONCRETE_CLASSES } from './data';
import { BOMItem, BOMTable, SteelGrade, SteelShapeType, ConcreteClass } from './types';
import SteelShapeCalculator from './components/SteelShapeCalculator';
import ConcreteCalculator from './components/ConcreteCalculator';
import FormworkCalculator from './components/FormworkCalculator';
import SteelGradeTable from './components/SteelGradeTable';
import HistoryManager from './components/HistoryManager';
import UnitConverter from './components/UnitConverter';
import LinearInterpolator from './components/LinearInterpolator';
import { HardHat, Calculator, Building, Database, FolderOpen, ArrowLeftRight, CheckCircle2, Layers } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('calculator');
  const [grades, setGrades] = useState<SteelGrade[]>(() => {
    const saved = localStorage.getItem('steel_calc_grades');
    if (saved) {
      try {
        const parsed: SteelGrade[] = JSON.parse(saved);
        const updated = [...parsed];
        INITIAL_STEEL_GRADES.forEach((initial) => {
          const idx = updated.findIndex((g) => g.id === initial.id);
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              name: initial.name,
              standard: initial.standard,
              fy: initial.fy,
              fu: initial.fu,
              category: initial.category,
              elasticModulus: initial.elasticModulus,
              description: initial.description
            };
          } else {
            const nameIdx = updated.findIndex((g) => g.name.toLowerCase() === initial.name.toLowerCase());
            if (nameIdx !== -1) {
              updated[nameIdx] = {
                ...updated[nameIdx],
                id: initial.id,
                standard: initial.standard,
                fy: initial.fy,
                fu: initial.fu,
                category: initial.category,
                elasticModulus: initial.elasticModulus,
                description: initial.description
              };
            } else {
              updated.push(initial);
            }
          }
        });
        return updated;
      } catch (e) {
        return INITIAL_STEEL_GRADES;
      }
    }
    return INITIAL_STEEL_GRADES;
  });
  const [concreteClasses, setConcreteClasses] = useState<ConcreteClass[]>(() => {
    const saved = localStorage.getItem('steel_calc_concrete_classes');
    return saved ? JSON.parse(saved) : INITIAL_CONCRETE_CLASSES;
  });
  const [bomTables, setBomTables] = useState<BOMTable[]>(() => {
    const saved = localStorage.getItem('steel_calc_bom_tables');
    return saved
      ? JSON.parse(saved)
      : [{ id: 'default', name: 'Bảng kê mặc định', createdAt: Date.now(), items: [] }];
  });
  const [activeTableId, setActiveTableId] = useState<string>(() => {
    const saved = localStorage.getItem('steel_calc_active_id');
    return saved || 'default';
  });
  const [targetTableId, setTargetTableId] = useState<string>(() => {
    const saved = localStorage.getItem('steel_calc_target_id');
    return saved || 'default';
  });
  const [toast, setToast] = useState<string | null>(null);
  const [showConverter, setShowConverter] = useState<boolean>(false);
  const [showInterpolator, setShowInterpolator] = useState<boolean>(false);

  // Sync state data to localStorage
  useEffect(() => {
    localStorage.setItem('steel_calc_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('steel_calc_concrete_classes', JSON.stringify(concreteClasses));
  }, [concreteClasses]);

  useEffect(() => {
    localStorage.setItem('steel_calc_bom_tables', JSON.stringify(bomTables));
  }, [bomTables]);

  useEffect(() => {
    localStorage.setItem('steel_calc_active_id', activeTableId);
  }, [activeTableId]);

  useEffect(() => {
    localStorage.setItem('steel_calc_target_id', targetTableId);
  }, [targetTableId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleResetGrades = () => {
    setGrades(INITIAL_STEEL_GRADES);
    setConcreteClasses(INITIAL_CONCRETE_CLASSES);
    showToast(language === 'vi' ? 'Đã khôi phục dữ liệu gốc mác thép và cấp độ bền bê tông.' : 'Restored original steel grades and concrete classes.');
  };

  const handleAddGrade = (newGrade: SteelGrade) => {
    if (grades.some((g) => g.name.toLowerCase() === newGrade.name.toLowerCase())) {
      showToast(language === 'vi' ? `Mác thép "${newGrade.name}" đã tồn tại!` : `Steel grade "${newGrade.name}" already exists!`);
      return false;
    }
    setGrades([...grades, newGrade]);
    showToast(language === 'vi' ? `Đã thêm mác thép "${newGrade.name}" thành công.` : `Successfully added steel grade "${newGrade.name}".`);
    return true;
  };

  const handleDeleteGrade = (id: string) => {
    setGrades(grades.filter((g) => g.id !== id));
    showToast(language === 'vi' ? 'Đã xóa mác thép khỏi danh mục.' : 'Deleted steel grade from list.');
  };

  const handleAddConcreteClass = (newClass: ConcreteClass) => {
    if (concreteClasses.some((c) => c.className.toLowerCase() === newClass.className.toLowerCase())) {
      showToast(language === 'vi' ? `Cấp độ bền "${newClass.className}" đã tồn tại!` : `Concrete class "${newClass.className}" already exists!`);
      return false;
    }
    setConcreteClasses([...concreteClasses, newClass]);
    showToast(language === 'vi' ? `Đã thêm cấp độ bền "${newClass.className}" thành công.` : `Successfully added concrete class "${newClass.className}".`);
    return true;
  };

  const handleDeleteConcreteClass = (id: string) => {
    setConcreteClasses(concreteClasses.filter((c) => c.id !== id));
    showToast(language === 'vi' ? 'Đã xóa cấp độ bền bê tông khỏi danh mục.' : 'Deleted concrete class from list.');
  };

  const handleCreateTable = (name: string) => {
    const id = `bom-${Date.now()}`;
    const newT: BOMTable = { id, name, createdAt: Date.now(), items: [] };
    setBomTables([...bomTables, newT]);
    setActiveTableId(id);
    setTargetTableId(id);
    showToast(language === 'vi' ? `Đã tạo bảng kê "${name}"!` : `Created bill of materials "${name}"!`);
  };

  const handleDeleteTable = (id: string) => {
    if (bomTables.length <= 1) {
      showToast(language === 'vi' ? 'Không thể xóa bảng kê duy nhất!' : 'Cannot delete the unique project table!');
      return;
    }
    const updated = bomTables.filter((t) => t.id !== id);
    setBomTables(updated);
    if (activeTableId === id) setActiveTableId(updated[0].id);
    if (targetTableId === id) setTargetTableId(updated[0].id);
    showToast(language === 'vi' ? 'Đã xóa bảng kê.' : 'Deleted project table.');
  };

  const handleSaveToHistory = (
    shapeType: SteelShapeType,
    shapeLabel: string,
    gradeId: string,
    gradeName: string,
    inputs: Record<string, number>,
    results: any,
    qty: number,
    note: string
  ) => {
    const newEntry: BOMItem = {
      id: `entry-${Date.now()}`,
      timestamp: Date.now(),
      shapeType,
      shapeLabel,
      gradeId,
      gradeName,
      inputs,
      results,
      quantity: qty,
      note,
    };

    setBomTables(
      bomTables.map((t) => {
        if (t.id === targetTableId) {
          return { ...t, items: [newEntry, ...t.items] };
        }
        return t;
      })
    );
    showToast(language === 'vi' ? 'Đã lưu cấu kiện vào bảng thống kê!' : 'Saved member profile to the BOM table!');
  };

  const handleDeleteHistoryEntry = (id: string) => {
    setBomTables(
      bomTables.map((t) => {
        if (t.id === activeTableId) {
          return { ...t, items: t.items.filter((i) => i.id !== id) };
        }
        return t;
      })
    );
    showToast(language === 'vi' ? 'Đã xóa cấu kiện khỏi danh sách.' : 'Deleted member from table.');
  };

  const handleUpdateHistoryEntry = (updated: BOMItem) => {
    setBomTables(
      bomTables.map((t) => {
        if (t.id === activeTableId) {
          return { ...t, items: t.items.map((i) => (i.id === updated.id ? updated : i)) };
        }
        return t;
      })
    );
  };

  const handleClearHistory = () => {
    if (confirm(language === 'vi' ? 'Bạn có chắc chắn muốn làm trống bảng thống kê này?' : 'Are you sure you want to clear this summary table?')) {
      setBomTables(
        bomTables.map((t) => {
          if (t.id === activeTableId) {
            return { ...t, items: [] };
          }
          return t;
        })
      );
      showToast(language === 'vi' ? 'Đã xóa toàn bộ cấu kiện trong hạng mục hiện tại.' : 'Cleared all members from current table.');
    }
  };

  const activeTable = bomTables.find((t) => t.id === activeTableId) || bomTables[0];
  const activeHistory = activeTable.items;

  // Global aggregates across all tables
  const totalBOMWeightTons =
    bomTables.reduce((acc, t) => acc + t.items.reduce((s, i) => s + i.results.totalWeightKg * i.quantity, 0), 0) / 1000;
  const totalBOMPaintArea = bomTables.reduce(
    (acc, t) => acc + t.items.reduce((s, i) => s + i.results.totalPaintAreaM2 * i.quantity, 0),
    0
  );
  const totalItemsCount = bomTables.reduce((s, t) => s + t.items.length, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-orange-500/20 antialiased text-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-2xl z-50 flex items-center gap-2 text-xs font-bold border border-slate-800 animate-fadeIn font-sans">
          <CheckCircle2 className="text-orange-500 w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Sticky Header & Tabs Bar */}
      <div className="sticky top-0 z-40 no-print shrink-0 shadow-md">
        {/* Main Header */}
        <header className="bg-[#1E293B] text-white py-4.5 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-lg shadow-md shadow-orange-500/20">
                <HardHat className="text-white w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black uppercase tracking-tight">{t('header.title')}</h1>
                <p className="text-[9px] text-slate-400 font-extrabold tracking-wider uppercase">
                  {t('header.subtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-6 text-xs pl-6 border-l border-slate-700/60 font-sans">
                <div>
                  <span className="text-slate-400 block font-extrabold uppercase text-[9px] tracking-wider">
                    {t('header.totalSteelWeight')}
                  </span>
                  <span className="font-black font-mono text-orange-500 text-sm">
                    {totalBOMWeightTons.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}{' '}
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{t('header.tons')}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-extrabold uppercase text-[9px] tracking-wider">
                    {t('header.totalPaintArea')}
                  </span>
                  <span className="font-black font-mono text-blue-400 text-sm">
                    {totalBOMPaintArea.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{t('header.sqm')}</span>
                  </span>
                </div>
              </div>

              {/* Language Switcher Buttons with Flags */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 shrink-0 select-none">
                <button
                  onClick={() => setLanguage('vi')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-black transition-all cursor-pointer ${
                    language === 'vi'
                      ? 'bg-orange-500 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Tiếng Việt"
                  id="lang-btn-vi"
                >
                  <span className="text-sm">🇻🇳</span>
                  <span className="hidden sm:inline tracking-wider ml-1">VI</span>
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-black transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-orange-500 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="English (US)"
                  id="lang-btn-en"
                >
                  <span className="text-sm">🇺🇸</span>
                  <span className="hidden sm:inline tracking-wider ml-1">EN</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs & Quick Converter Trigger bar */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-2.5">
            <nav className="flex gap-1 overflow-x-auto pb-1 sm:pb-0" aria-label="Main Navigation">
              <button
                onClick={() => setActiveTab('calculator')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'calculator'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                id="tab-btn-calculator"
              >
                <Calculator className="w-4 h-4" /> {t('tabs.calculator')}
              </button>
              <button
                onClick={() => setActiveTab('concrete')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'concrete'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                id="tab-btn-concrete"
              >
                <Building className="w-4 h-4" /> {t('tabs.concrete')}
              </button>
              <button
                onClick={() => setActiveTab('formwork')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'formwork'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                id="tab-btn-formwork"
              >
                <Layers className="w-4 h-4" /> {t('tabs.formwork')}
              </button>
              <button
                onClick={() => setActiveTab('grades')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'grades'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                id="tab-btn-grades"
              >
                <Database className="w-4 h-4" /> {t('tabs.grades')}
              </button>
              <button
                onClick={() => setActiveTab('bom')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-lg transition-colors cursor-pointer relative whitespace-nowrap ${
                  activeTab === 'bom'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                id="tab-btn-bom"
              >
                <FolderOpen className="w-4 h-4" /> {t('tabs.bom')} ({totalItemsCount})
              </button>
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setShowConverter(!showConverter);
                  setShowInterpolator(false);
                }}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 border text-xs font-black rounded-lg cursor-pointer transition-colors ${
                  showConverter
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                id="tab-btn-converter-toggle"
              >
                <ArrowLeftRight className="w-4 h-4" /> {t('buttons.quickConverter')}
              </button>
              <button
                onClick={() => {
                  setShowInterpolator(!showInterpolator);
                  setShowConverter(false);
                }}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 border text-xs font-black rounded-lg cursor-pointer transition-colors ${
                  showInterpolator
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                id="tab-btn-interpolator-toggle"
              >
                <Calculator className="w-4 h-4" /> {t('buttons.linearInterpolator')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Stage Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className={`${(showConverter || showInterpolator) ? 'lg:col-span-8 space-y-6' : 'lg:col-span-12 space-y-6'} order-2 lg:order-1`}>
            <div className={activeTab === 'calculator' ? 'space-y-6' : 'hidden'}>
              <SteelShapeCalculator
                grades={grades}
                bomTables={bomTables}
                targetTableId={targetTableId}
                setTargetTableId={setTargetTableId}
                onSaveToHistory={handleSaveToHistory}
              />
            </div>

            <div className={activeTab === 'concrete' ? 'space-y-6' : 'hidden'}>
              <ConcreteCalculator concreteClasses={concreteClasses} />
            </div>

            <div className={activeTab === 'formwork' ? 'space-y-6' : 'hidden'}>
              <FormworkCalculator />
            </div>

            <div className={activeTab === 'grades' ? 'space-y-6' : 'hidden'}>
              <SteelGradeTable
                grades={grades}
                onResetGrades={handleResetGrades}
                concreteClasses={concreteClasses}
                onAddGrade={handleAddGrade}
                onDeleteGrade={handleDeleteGrade}
                onAddConcreteClass={handleAddConcreteClass}
                onDeleteConcreteClass={handleDeleteConcreteClass}
              />
            </div>

            <div className={activeTab === 'bom' ? 'space-y-6' : 'hidden'}>
              <HistoryManager
                history={activeHistory}
                bomTables={bomTables}
                activeTableId={activeTableId}
                onSelectTable={setActiveTableId}
                onCreateTable={handleCreateTable}
                onDeleteTable={handleDeleteTable}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
                onClearHistory={handleClearHistory}
                onUpdateHistoryEntry={handleUpdateHistoryEntry}
                grades={grades}
              />
            </div>
          </div>

          {showConverter && (
            <div className="lg:col-span-4 shrink-0 no-print order-1 lg:order-2">
              <UnitConverter onClose={() => setShowConverter(false)} />
            </div>
          )}

          {showInterpolator && (
            <div className="lg:col-span-4 shrink-0 no-print order-1 lg:order-2">
              <LinearInterpolator onClose={() => setShowInterpolator(false)} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-400 text-xs shrink-0 no-print font-sans mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="font-extrabold text-slate-600">Construction Calc Pro</span>
            <span>
              {language === 'vi'
                ? ' • Công cụ tính toán tiên lượng thép và cấu kiện xây dựng offline'
                : ' • Offline engineering estimation tool for steel profiles and structural members'}
            </span>
          </div>
          <div className="font-bold text-slate-400">
            {language === 'vi'
              ? 'Tiêu chuẩn Việt Nam & Quốc tế | Hỗ trợ in ấn PDF chuyên nghiệp'
              : 'Vietnamese & International Standards | Professional PDF Print Support'}
          </div>
        </div>
      </footer>
    </div>
  );
}
