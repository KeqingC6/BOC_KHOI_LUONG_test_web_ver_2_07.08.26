import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SteelGrade, ConcreteClass } from '../types';

export type Language = 'vi' | 'en';

const translations = {
  vi: {
    common: {
      close: 'Đóng',
      clear: 'Xóa',
      save: 'Lưu',
      print: 'In bảng',
      delete: 'Xóa',
      edit: 'Sửa',
      cancel: 'Hủy',
      actions: 'Thao tác',
      note: 'Ghi chú',
      quantity: 'Số lượng',
      confirmDelete: 'Xác nhận xóa?',
      add: 'Thêm',
      exportExcel: 'Xuất Excel',
      copied: 'Đã sao chép vào bộ nhớ tạm!',
      savedSuccess: 'Đã lưu thành công!',
      validationError: 'Vui lòng kiểm tra lại dữ liệu nhập vào!',
      total: 'Tổng cộng',
      noData: 'Chưa có dữ liệu thống kê.'
    },
    header: {
      title: 'Construction Calc Pro',
      subtitle: 'THỐNG KÊ KHỐI LƯỢNG VẬT LIỆU TRONG CÔNG TRÌNH',
      totalSteelWeight: 'Tổng khối lượng thép dự án',
      totalPaintArea: 'Diện tích sơn chống rỉ',
      tons: 'Tấn',
      sqm: 'm²'
    },
    tabs: {
      calculator: 'Tra cứu thép hình',
      concrete: 'Bê tông & Cốt thép',
      formwork: 'Tính ván khuôn',
      grades: 'Cường độ vật liệu',
      bom: 'Bảng thống kê'
    },
    buttons: {
      quickConverter: 'Đổi đơn vị nhanh',
      linearInterpolator: 'Nội suy tuyến tính'
    },
    converter: {
      title: 'ĐỔI ĐƠN VỊ NHANH',
      length: 'Độ dài',
      area: 'Diện tích',
      mass: 'Khối lượng',
      volume: 'Thể tích',
      pressure: 'Áp suất / Độ bền',
      force: 'Lực / Tải trọng',
      temperature: 'Nhiệt độ',
      presetLabel: 'Phím nhanh:',
      copyLeft: 'Sao chép kết quả trái',
      copyRight: 'Sao chép kết quả phải',
      swap: 'Đổi chiều chuyển đổi'
    },
    interpolator: {
      title: 'NỘI SUY TUYẾN TÍNH',
      desc: 'Nội suy giá trị Y tương ứng với X từ hai điểm (X0, Y0) và (X1, Y1)',
      point0: 'Điểm thứ nhất (X0, Y0)',
      point1: 'Điểm thứ hai (X1, Y1)',
      target: 'Giá trị cần tra (X)',
      result: 'Kết quả nội suy (Y)',
      calculate: 'Tính toán',
      invalidRange: 'Khoảng nội suy không hợp lệ (X0 không được bằng X1)'
    },
    steelCalc: {
      selectShape: 'CHỌN LOẠI THÉP HÌNH',
      steelGrade: 'MÁC THÉP',
      targetBOM: 'BẢNG THỐNG KÊ MỤC TIÊU',
      inputsTitle: 'THÔNG SỐ HÌNH HỌC MẶT CẮT',
      resultsTitle: 'KẾT QUẢ ĐẶC TÍNH MẶT CẮT',
      qtyLabel: 'Số lượng cấu kiện (thanh/tấm)',
      noteLabel: 'Ký hiệu bản vẽ / Ghi chú cấu kiện',
      saveToBOM: 'LƯU VÀO BẢNG THỐNG KÊ',
      b: 'Chiều rộng cánh (b)',
      h: 'Chiều cao / Chiều rộng b2 (h)',
      t: 'Chiều dày (t)',
      t1: 'Chiều dày bụng (t1)',
      t2: 'Chiều dày cánh (t2)',
      d: 'Đường kính thép (d)',
      D: 'Đường kính ngoài (D)',
      H: 'Chiều cao tiết diện (H)',
      E: 'Chiều rộng cánh lớn (E)',
      F: 'Chiều rộng cánh nhỏ (F)',
      a: 'Chiều rộng mép gấp (a)',
      L: 'Chiều dài thanh L (m)',
      properties: {
        area: 'Diện tích tiết diện',
        unitWeight: 'Trọng lượng đơn vị',
        totalWeight: 'Tổng trọng lượng',
        paintArea: 'Diện tích sơn bề mặt',
        tensile: 'Khả năng chịu kéo giới hạn (N_t)',
        bending: 'Khả năng chịu uốn giới hạn (M_u)'
      },
      shapes: {
        V: 'Thép V (Đều cạnh)',
        BOX: 'Thép Hộp Chữ Nhật',
        ROUND: 'Thép Tròn Trơn / Cốt Thép',
        PIPE: 'Thép Ống Tròn',
        H_I: 'Thép hình H / I',
        U: 'Thép hình U',
        PLATE: 'Thép Tấm / Thép Bản Mã',
        Z: 'Xà Gồ Chữ Z',
        C: 'Xà Gồ Chữ C'
      },
      savedToast: 'Đã lưu thép hình vào bảng kê!'
    },
    concreteCalc: {
      selectMember: 'CHỌN CẤU KIỆN BÊ TÔNG',
      inputsTitle: 'THÔNG SỐ HÌNH HỌC & CỐT THÉP',
      resultsTitle: 'KẾT QUẢ THỐNG KÊ VẬT LIỆU',
      saveMember: 'LƯU CẤU KIỆN',
      memberTypes: {
        COLUMN_RECT: 'Cột chữ nhật',
        COLUMN_CIRC: 'Cột tròn',
        BEAM: 'Dầm bê tông',
        SLAB: 'Sàn bê tông'
      },
      b: 'Chiều rộng b (mm)',
      h: 'Chiều cao h / L (mm)',
      hSlab: 'Chiều dày sàn h (mm)',
      D: 'Đường kính cột D (mm)',
      L: 'Chiều dài cấu kiện L (m)',
      W: 'Chiều rộng sàn W (m)',
      qty: 'Số lượng cấu kiện',
      concreteClass: 'Cấp độ bền bê tông',
      rebarSelect: 'Bố trí cốt thép dọc chịu lực',
      rebarDiameter: 'Đường kính thép d (mm)',
      rebarCount: 'Số lượng thanh (n)',
      rebarRatioPercent: 'Hàm lượng thép giả định (%)',
      rebarRatioPercentHelp: 'Tính thép dựa theo % thể tích bê tông',
      results: {
        concreteVolume: 'Thể tích bê tông tổng cộng',
        concreteWeight: 'Khối lượng bê tông tổng cộng',
        steelWeight: 'Khối lượng cốt thép tổng cộng',
        steelRatio: 'Hàm lượng thép trung bình',
        unit: 'cấu kiện'
      },
      historyTitle: 'DANH SÁCH CẤU KIỆN BÊ TÔNG ĐÃ TÍNH',
      cols: {
        name: 'Tên / Ghi chú',
        type: 'Loại',
        qty: 'SL',
        concrete: 'Cấp bê tông',
        vol: 'V bê tông (m³)',
        steelWeight: 'M thép (kg)',
        ratio: 'Hàm lượng'
      },
      savedToast: 'Đã lưu cấu kiện bê tông vào lịch sử!'
    },
    formworkCalc: {
      title: 'TÍNH DIỆN TÍCH VÁN KHUÔN',
      desc: 'Hỗ trợ tính toán diện tích tiếp xúc ván khuôn gỗ/thép và hao hụt thi công',
      selectMember: 'CHỌN LOẠI CẤU KIỆN CẦN TÍNH',
      inputsTitle: 'THÔNG SỐ KÍCH THƯỚC HÌNH HỌC',
      resultsTitle: 'DIỆN TÍCH VÁN KHUÔN & HAO HỤT',
      saveFormwork: 'LƯU KẾT QUẢ VÁN KHUÔN',
      b: 'Chiều rộng mặt cắt b (mm)',
      h: 'Chiều cao mặt cắt h (mm)',
      D: 'Đường kính cột D (mm)',
      L: 'Chiều dài/Chiều cao cấu kiện L (m)',
      W: 'Chiều rộng sàn W (m)',
      qty: 'Số lượng cấu kiện',
      wasteFactor: 'Hệ số hao hụt thi công (%)',
      formworkType: 'Loại ván khuôn',
      formworkTypeLabel: 'Gợi ý kích thước ván khuôn gỗ phủ phim',
      results: {
        contactArea: 'Diện tích ván khuôn tiếp xúc',
        totalAreaWithWaste: 'Diện tích bao gồm hao hụt',
        woodPlates: 'Số lượng tấm ván đề xuất (1.22m x 2.44m)'
      },
      savedToast: 'Đã lưu thống kê ván khuôn vào lịch sử!',
      cols: {
        name: 'Tên / Ghi chú',
        type: 'Cấu kiện',
        qty: 'SL',
        contactArea: 'S tiếp xúc (m²)',
        totalArea: 'S hao hụt (m²)',
        boards: 'Số tấm ván'
      }
    },
    gradesTable: {
      steelTitle: 'BẢNG CƯỜNG ĐỘ TIÊU CHUẨN CỦA MÁC THÉP',
      concreteTitle: 'BẢNG CẤP ĐỘ BỀN VÀ TRỊ TIÊU CHUẨN CỦA BÊ TÔNG',
      customSteelTitle: 'THÊM MÁC THÉP TỰ ĐỊNH NGHĨA',
      customConcreteTitle: 'THÊM CẤP BÊ TÔNG TỰ ĐỊNH NGHĨA',
      addGrade: 'Thêm mác thép',
      addClass: 'Thêm cấp bê tông',
      cols: {
        name: 'Mác thép / Cấp',
        standard: 'Tiêu chuẩn / Mác cũ',
        fy: 'Cường độ chảy fy (MPa)',
        fu: 'Cường độ đứt fu (MPa)',
        elastic: 'Mô-đun đàn hồi E (GPa)',
        description: 'Mô tả ứng dụng',
        concreteGrade: 'Mác bê tông tương đương',
        rb: 'Cường độ nén Rb (MPa)',
        rbt: 'Cường độ kéo Rbt (MPa)',
        eb: 'Mô-đun đàn hồi Eb (GPa)'
      },
      category: {
        structural: 'Thép hình kết cấu',
        rebar: 'Thép thanh cốt bê tông'
      }
    },
    bom: {
      title: 'BẢNG THỐNG KÊ KHỐI LƯỢNG CHI TIẾT (BOM)',
      manageTables: 'QUẢN LÝ CÁC BẢNG THỐNG KÊ DỰ ÁN',
      activeTable: 'Bảng kê hiển thị hoạt động:',
      createTable: 'Tạo bảng kê mới',
      newTableNamePlaceholder: 'Tên bảng thống kê mới...',
      tableList: 'Danh sách bảng kê:',
      itemsCount: 'mục',
      cols: {
        no: 'STT',
        shape: 'Loại thép hình',
        dimensions: 'Kích thước',
        grade: 'Mác thép',
        qty: 'SL',
        weightPerMeter: 'M/1m (kg/m)',
        totalWeight: 'Tổng M (kg)',
        paintArea: 'S sơn (m²)',
        note: 'Ghi chú / Cấu kiện',
        actions: 'Thao tác'
      },
      totalSum: 'TỔNG CỘNG TOÀN BẢNG KÊ',
      totalWeightLabel: 'Khối lượng thép tổng cộng:',
      totalPaintLabel: 'Tổng diện tích sơn chống rỉ:',
      printTitle: 'BÁNG THỐNG KÊ CHI TIẾT DỰ ÁN'
    }
  },
  en: {
    common: {
      close: 'Close',
      clear: 'Clear',
      save: 'Save',
      print: 'Print Table',
      delete: 'Delete',
      edit: 'Edit',
      cancel: 'Cancel',
      actions: 'Actions',
      note: 'Note',
      quantity: 'Quantity',
      confirmDelete: 'Confirm delete?',
      add: 'Add',
      exportExcel: 'Export Excel',
      copied: 'Copied to clipboard!',
      savedSuccess: 'Saved successfully!',
      validationError: 'Please check your inputs!',
      total: 'Total',
      noData: 'No summary data available.'
    },
    header: {
      title: 'Construction Calc Pro',
      subtitle: 'STEEL SHAPES & CONCRETE ESTIMATION PLATFORM',
      totalSteelWeight: 'Total Project Steel Weight',
      totalPaintArea: 'Total Anti-Rust Paint Area',
      tons: 'Tons',
      sqm: 'm²'
    },
    tabs: {
      calculator: 'Steel Shapes',
      concrete: 'Concrete & Rebar',
      formwork: 'Formwork',
      grades: 'Material Grades',
      bom: 'BOM Table'
    },
    buttons: {
      quickConverter: 'Quick Converter',
      linearInterpolator: 'Linear Interpolation'
    },
    converter: {
      title: 'QUICK UNIT CONVERTER',
      length: 'Length',
      area: 'Area',
      mass: 'Mass',
      volume: 'Volume',
      pressure: 'Pressure / Strength',
      force: 'Force / Load',
      temperature: 'Temperature',
      presetLabel: 'Quick Presets:',
      copyLeft: 'Copy Left Value',
      copyRight: 'Copy Right Value',
      swap: 'Swap Conversion Direction'
    },
    interpolator: {
      title: 'LINEAR INTERPOLATION',
      desc: 'Interpolate Y corresponding to target X using coordinates (X0, Y0) and (X1, Y1)',
      point0: 'First Point (X0, Y0)',
      point1: 'Second Point (X1, Y1)',
      target: 'Target value to find (X)',
      result: 'Interpolated Result (Y)',
      calculate: 'Interpolate',
      invalidRange: 'Invalid interpolation range (X0 cannot be equal to X1)'
    },
    steelCalc: {
      selectShape: 'SELECT STEEL PROFILE',
      steelGrade: 'STEEL GRADE',
      targetBOM: 'TARGET BOM TABLE',
      inputsTitle: 'SECTION GEOMETRY PARAMETERS',
      resultsTitle: 'SECTION PROPERTIES RESULTS',
      qtyLabel: 'Member quantity (pieces/plates)',
      noteLabel: 'Drawing mark / Structural component note',
      saveToBOM: 'SAVE TO BOM LIST',
      b: 'Flange Width (b)',
      h: 'Height / Width b2 (h)',
      t: 'Thickness (t)',
      t1: 'Web Thickness (t1)',
      t2: 'Flange Thickness (t2)',
      d: 'Bar Diameter (d)',
      D: 'Outer Diameter (D)',
      H: 'Section Height (H)',
      E: 'Large Flange Width (E)',
      F: 'Small Flange Width (F)',
      a: 'Lip Fold Width (a)',
      L: 'Bar Length L (m)',
      properties: {
        area: 'Cross-sectional Area',
        unitWeight: 'Unit Weight per Meter',
        totalWeight: 'Total Structural Weight',
        paintArea: 'Surface Paint Area',
        tensile: 'Limit Tensile Capacity (N_t)',
        bending: 'Limit Bending Capacity (M_u)'
      },
      shapes: {
        V: 'Angle Steel (L-shape)',
        BOX: 'Hollow Section (Rect/Square)',
        ROUND: 'Round Bar / Rebar',
        PIPE: 'Circular Hollow Section (Pipe)',
        H_I: 'H / I Beam',
        U: 'U Channel',
        PLATE: 'Steel Plate / Flat Bar',
        Z: 'Z Purlin',
        C: 'C Purlin'
      },
      savedToast: 'Saved profile properties to the BOM table!'
    },
    concreteCalc: {
      selectMember: 'SELECT CONCRETE MEMBER',
      inputsTitle: 'GEOMETRY & REINFORCEMENT OPTIONS',
      resultsTitle: 'MATERIAL QUANTITY ESTIMATION',
      saveMember: 'SAVE MEMBER',
      memberTypes: {
        COLUMN_RECT: 'Rectangular Column',
        COLUMN_CIRC: 'Circular Column',
        BEAM: 'Concrete Beam',
        SLAB: 'Concrete Slab'
      },
      b: 'Width b (mm)',
      h: 'Height h / L (mm)',
      hSlab: 'Slab Thickness h (mm)',
      D: 'Column Diameter D (mm)',
      L: 'Member Length L (m)',
      W: 'Slab Width W (m)',
      qty: 'Member Quantity',
      concreteClass: 'Concrete Class',
      rebarSelect: 'Main Tension Rebar Layout',
      rebarDiameter: 'Bar Diameter d (mm)',
      rebarCount: 'Rebar Count (n)',
      rebarRatioPercent: 'Assumed Rebar Ratio (%)',
      rebarRatioPercentHelp: 'Estimate steel weight as a volume percentage',
      results: {
        concreteVolume: 'Total Concrete Volume',
        concreteWeight: 'Total Concrete Weight',
        steelWeight: 'Total Steel Weight',
        steelRatio: 'Average Rebar Percentage',
        unit: 'members'
      },
      historyTitle: 'CALCULATED CONCRETE MEMBERS HISTORY',
      cols: {
        name: 'Name / Note',
        type: 'Type',
        qty: 'Qty',
        concrete: 'Concrete Class',
        vol: 'Concrete V (m³)',
        steelWeight: 'Steel Weight (kg)',
        ratio: 'Rebar Ratio'
      },
      savedToast: 'Saved concrete member to history!'
    },
    formworkCalc: {
      title: 'FORMWORK AREA CALCULATOR',
      desc: 'Calculate contact formwork area for wood/steel shutters with standard waste allowance',
      selectMember: 'SELECT MEMBER TYPE TO CALCULATE',
      inputsTitle: 'GEOMETRIC DIMENSION PARAMETERS',
      resultsTitle: 'FORMWORK AREA & MATERIAL ESTIMATE',
      saveFormwork: 'SAVE FORMWORK RESULT',
      b: 'Section Width b (mm)',
      h: 'Section Height h (mm)',
      D: 'Column Diameter D (mm)',
      L: 'Member Length/Height L (m)',
      W: 'Slab Width W (m)',
      qty: 'Member Quantity',
      wasteFactor: 'Construction Waste Factor (%)',
      formworkType: 'Formwork Type',
      formworkTypeLabel: 'Recommended standard film-faced plywood sheets (1.22m x 2.44m)',
      results: {
        contactArea: 'Contact Formwork Area',
        totalAreaWithWaste: 'Total Area (incl. waste)',
        woodPlates: 'Suggested Plywood Sheets (1.22m x 2.44m)'
      },
      savedToast: 'Saved formwork calculation to history!',
      cols: {
        name: 'Name / Note',
        type: 'Member',
        qty: 'Qty',
        contactArea: 'Contact S (m²)',
        totalArea: 'Waste S (m²)',
        boards: 'Plywood Sheets'
      }
    },
    gradesTable: {
      steelTitle: 'STANDARD STEEL GRADE PROPERTIES TABLE',
      concreteTitle: 'STANDARD CONCRETE CLASSES & DESIGN VALUES TABLE',
      customSteelTitle: 'ADD CUSTOM STEEL GRADE',
      customConcreteTitle: 'ADD CUSTOM CONCRETE CLASS',
      addGrade: 'Add Steel Grade',
      addClass: 'Add Concrete Class',
      cols: {
        name: 'Grade / Class',
        standard: 'Standard / Former Grade',
        fy: 'Yield Strength fy (MPa)',
        fu: 'Tensile Strength fu (MPa)',
        elastic: 'Elastic Modulus E (GPa)',
        description: 'Typical Applications',
        concreteGrade: 'Equivalent Russian Mark',
        rb: 'Compressive Design Strength Rb (MPa)',
        rbt: 'Tensile Design Strength Rbt (MPa)',
        eb: 'Elastic Modulus Eb (GPa)'
      },
      category: {
        structural: 'Structural Steel',
        rebar: 'Concrete Rebar Steel'
      }
    },
    bom: {
      title: 'DETAILED BILL OF MATERIALS (BOM) SUMMARY',
      manageTables: 'MANAGE PROJECT TABLES',
      activeTable: 'Active Displaying Table:',
      createTable: 'Create New Table',
      newTableNamePlaceholder: 'New table name...',
      tableList: 'Table Registry:',
      itemsCount: 'items',
      cols: {
        no: 'No.',
        shape: 'Steel Profile',
        dimensions: 'Dimensions',
        grade: 'Steel Grade',
        qty: 'Qty',
        weightPerMeter: 'M/1m (kg/m)',
        totalWeight: 'Total M (kg)',
        paintArea: 'Paint Area (m²)',
        note: 'Note / Member mark',
        actions: 'Actions'
      },
      totalSum: 'TOTAL BOM SUMMARY',
      totalWeightLabel: 'Total Project Steel weight:',
      totalPaintLabel: 'Total Anti-rust Paint area:',
      printTitle: 'DETAILED PROJECT BILL OF MATERIALS (BOM)'
    }
  }
};

const shapeTranslationMap: Record<string, { vi: string; en: string }> = {
  V: { vi: 'Thép V (Đều cạnh)', en: 'Angle Steel (L-shape)' },
  BOX: { vi: 'Thép Hộp Chữ Nhật', en: 'Hollow Section (Rect/Square)' },
  ROUND: { vi: 'Thép Tròn Trơn / Cốt Thép', en: 'Round Bar / Rebar' },
  PIPE: { vi: 'Thép Ống Tròn', en: 'Circular Hollow Section (Pipe)' },
  H_I: { vi: 'Thép hình H / I', en: 'H / I Beam' },
  U: { vi: 'Thép hình U', en: 'U Channel' },
  PLATE: { vi: 'Thép Tấm / Thép Bản Mã', en: 'Steel Plate / Flat Bar' },
  Z: { vi: 'Xà Gồ Chữ Z', en: 'Z Purlin' },
  C: { vi: 'Xà Gồ Chữ C', en: 'C Purlin' }
};

const conversionsTranslationMap: Record<string, { name: { vi: string; en: string }; units: Record<string, { vi: string; en: string }> }> = {
  length: {
    name: { vi: 'Độ dài', en: 'Length' },
    units: {
      mm: { vi: 'Milimet (mm)', en: 'Millimeter (mm)' },
      cm: { vi: 'Centimet (cm)', en: 'Centimeter (cm)' },
      m: { vi: 'Mét (m)', en: 'Meter (m)' },
      in: { vi: 'Inch (in)', en: 'Inch (in)' },
      ft: { vi: 'Foot (ft)', en: 'Foot (ft)' }
    }
  },
  area: {
    name: { vi: 'Diện tích', en: 'Area' },
    units: {
      sq_mm: { vi: 'mm²', en: 'mm²' },
      sq_cm: { vi: 'cm²', en: 'cm²' },
      sq_m: { vi: 'm²', en: 'm²' },
      sq_in: { vi: 'in²', en: 'in²' },
      sq_ft: { vi: 'ft²', en: 'ft²' }
    }
  },
  mass: {
    name: { vi: 'Khối lượng', en: 'Mass' },
    units: {
      g: { vi: 'Gram (g)', en: 'Gram (g)' },
      kg: { vi: 'Kilogram (kg)', en: 'Kilogram (kg)' },
      t: { vi: 'Tấn (t)', en: 'Metric Ton (t)' },
      lb: { vi: 'Pound (lb)', en: 'Pound (lb)' }
    }
  },
  volume: {
    name: { vi: 'Thể tích', en: 'Volume' },
    units: {
      ml: { vi: 'Mililit (ml)', en: 'Milliliter (ml)' },
      l: { vi: 'Lít (l)', en: 'Liter (l)' },
      cum: { vi: 'Mét khối (m³)', en: 'Cubic Meter (m³)' },
      gal: { vi: 'Gallon (Mỹ)', en: 'Gallon (US)' }
    }
  },
  pressure: {
    name: { vi: 'Áp suất / Độ bền', en: 'Pressure / Strength' },
    units: {
      pa: { vi: 'Pascal (Pa)', en: 'Pascal (Pa)' },
      kpa: { vi: 'Kilopascal (kPa)', en: 'Kilopascal (kPa)' },
      mpa: { vi: 'Megapascal (MPa)', en: 'Megapascal (MPa)' },
      n_mm2: { vi: 'N/mm² (Newton/mm²)', en: 'N/mm² (Newton/mm²)' },
      bar: { vi: 'Bar', en: 'Bar' },
      psi: { vi: 'PSI', en: 'PSI' }
    }
  },
  force: {
    name: { vi: 'Lực / Tải trọng', en: 'Force / Load' },
    units: {
      n: { vi: 'Newton (N)', en: 'Newton (N)' },
      kn: { vi: 'Kilonewton (kN)', en: 'Kilonewton (kN)' },
      kgf: { vi: 'Kilogram (kgf)', en: 'Kilogram (kgf)' },
      tf: { vi: 'Tấn lực (tf)', en: 'Ton force (tf)' }
    }
  },
  temperature: {
    name: { vi: 'Nhiệt độ', en: 'Temperature' },
    units: {
      c: { vi: 'Độ C (°C)', en: 'Celsius (°C)' },
      f: { vi: 'Độ F (°F)', en: 'Fahrenheit (°F)' }
    }
  }
};

export const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
  translateGrade: (g: SteelGrade) => SteelGrade;
  translateConcreteClass: (cc: ConcreteClass) => ConcreteClass;
  translateShape: (shapeType: string) => string;
  translateConversionCategory: (catKey: string, fallback: string) => string;
  translateUnitName: (catKey: string, unitKey: string, fallback: string) => string;
}>({
  language: 'vi',
  setLanguage: () => {},
  t: (path) => path,
  translateGrade: (g) => g,
  translateConcreteClass: (cc) => cc,
  translateShape: (shape) => shape,
  translateConversionCategory: (catKey, fallback) => fallback,
  translateUnitName: (catKey, unitKey, fallback) => fallback,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('steel_calc_lang');
    return (saved as Language) || 'vi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('steel_calc_lang', lang);
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = translations[language];
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return path;
      }
    }
    return typeof current === 'string' ? current : path;
  };

  const translateGrade = (g: SteelGrade): SteelGrade => {
    if (language === 'vi') return g;
    // Translate some descriptions
    let description = g.description;
    if (g.id === 'ct3') {
      description = 'Common carbon structural steel in Vietnam (TCVN 1765:1975).';
    } else if (g.id === 'ss400') {
      description = 'Most common hot-rolled steel for industrial buildings, columns, and plates.';
    } else if (g.id === 'ss540') {
      description = 'High-strength Japanese standard steel plate and shapes.';
    } else if (g.id === 'sm400') {
      description = 'Japanese standard welded structure steel.';
    } else if (g.id === 'sm490') {
      description = 'High-strength welded structure steel for heavy loads, Japanese standard.';
    } else if (g.id === 'cb240-t') {
      description = 'Smooth round reinforcement steel bar, Vietnamese standard.';
    } else if (g.id === 'cb300-v') {
      description = 'Deformed reinforcement steel bar, Vietnamese standard.';
    } else if (g.id === 'cb400-v') {
      description = 'Deformed reinforcement steel bar, Vietnamese standard.';
    } else if (g.id === 'cb500-v') {
      description = 'High-strength deformed reinforcement steel bar, Vietnamese standard.';
    } else if (g.id === 'sd295a') {
      description = 'Hot-rolled deformed reinforcement steel bar, Japanese standard.';
    } else if (g.id === 'sd390') {
      description = 'High-strength reinforcement steel bar, Japanese standard.';
    } else if (g.id === 'grade40') {
      description = 'Medium strength concrete reinforcement steel bar, US standard.';
    } else if (g.id === 'grade60') {
      description = 'High-strength concrete reinforcement steel bar, US standard.';
    }
    return { ...g, description };
  };

  const translateConcreteClass = (cc: ConcreteClass): ConcreteClass => {
    if (language === 'vi') return cc;
    let description = cc.description;
    if (cc.id === 'b7.5') {
      description = 'Concrete bedding layer or low-load structures.';
    } else if (cc.id === 'b12.5') {
      description = 'Foundations, garden pathways, and minor members.';
    } else if (cc.id === 'b15') {
      description = 'Commonly used in low-rise residential structures.';
    } else if (cc.id === 'b20') {
      description = 'Widespread class for beams, columns, and slabs in townhouses.';
    } else if (cc.id === 'b25') {
      description = 'High durability class for long spans, high-rise buildings.';
    } else if (cc.id === 'b30') {
      description = 'Used for large-span structures, heavy raft foundations.';
    } else if (cc.id === 'b35') {
      description = 'High strength concrete for sky-scrapers, bridges, and ports.';
    } else if (cc.id === 'b40') {
      description = 'Ultra-high strength concrete for pre-stressed beams and special projects.';
    }
    return { ...cc, description };
  };

  const translateShape = (shapeType: string): string => {
    return shapeTranslationMap[shapeType]?.[language] || shapeType;
  };

  const translateConversionCategory = (catKey: string, fallback: string): string => {
    return conversionsTranslationMap[catKey]?.name[language] || fallback;
  };

  const translateUnitName = (catKey: string, unitKey: string, fallback: string): string => {
    return conversionsTranslationMap[catKey]?.units[unitKey]?.[language] || fallback;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateGrade,
        translateConcreteClass,
        translateShape,
        translateConversionCategory,
        translateUnitName,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
