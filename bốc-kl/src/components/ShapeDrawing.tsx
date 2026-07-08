import { SteelShapeType } from '../types';

interface ShapeDrawingProps {
  type: SteelShapeType;
  inputs: Record<string, string>;
}

export default function ShapeDrawing({ type, inputs }: ShapeDrawingProps) {
  const getNumeric = (key: string, def: number) => {
    const val = parseFloat(inputs[key]);
    return isNaN(val) || val <= 0 ? def : val;
  };

  // Render responsive elegant SVG schemas with dimensions
  const renderSvgContent = () => {
    const strokeColor = "#3b82f6"; // professional steel blue (blue-500)
    const fillColor = "rgba(59, 130, 246, 0.1)"; // light blue fill
    const annotationColor = "#64748b"; // slate-500 for dimension lines
    const textStyle = { fill: "#334155", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", fontWeight: "bold" as const };

    switch (type) {
      case 'V': {
        const b = getNumeric('b', 50);
        const t = getNumeric('t', 5);

        // Visual layout bounds
        const startX = 45;
        const startY = 45;
        const size = 110;

        // Visual thickness scaled proportionally relative to size, clamped
        const t_ratio = Math.max(0.04, Math.min(0.25, t / b));
        const t_visual = size * t_ratio;

        // Coordinates
        const xOuterCorner = startX;
        const yOuterCorner = startY + size;
        const xRightEnd = startX + size;
        const yTopEnd = startY;

        // Path of the equal-leg angle L shape
        const pathD = `M ${xOuterCorner},${yTopEnd} ` +
          `L ${xOuterCorner},${yOuterCorner} ` +
          `L ${xRightEnd},${yOuterCorner} ` +
          `L ${xRightEnd},${yOuterCorner - t_visual} ` +
          `L ${xOuterCorner + t_visual},${yOuterCorner - t_visual} ` +
          `L ${xOuterCorner + t_visual},${yTopEnd} Z`;

        return (
          <g>
            {/* L Shape Profile */}
            <path
              d={pathD}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Vertical Dimension (Leg height b) */}
            <line x1="25" y1={yTopEnd} x2="25" y2={yOuterCorner} stroke={annotationColor} strokeWidth="1" strokeDasharray="3,3" />
            <path d={`M 25,${yTopEnd} L 22,${yTopEnd + 5} M 25,${yTopEnd} L 28,${yTopEnd + 5} M 25,${yOuterCorner} L 22,${yOuterCorner - 5} M 25,${yOuterCorner} L 28,${yOuterCorner - 5}`} stroke={annotationColor} strokeWidth="1" />
            <text x="10" y={(yTopEnd + yOuterCorner) / 2 + 4} style={textStyle}>b={b}</text>

            {/* Horizontal Dimension (Leg width b) */}
            <line x1={xOuterCorner} y1={yOuterCorner + 20} x2={xRightEnd} y2={yOuterCorner + 20} stroke={annotationColor} strokeWidth="1" strokeDasharray="3,3" />
            <path d={`M ${xOuterCorner},${yOuterCorner + 20} L ${xOuterCorner + 5},${yOuterCorner + 17} M ${xOuterCorner},${yOuterCorner + 20} L ${xOuterCorner + 5},${yOuterCorner + 23} M ${xRightEnd},${yOuterCorner + 20} L ${xRightEnd - 5},${yOuterCorner + 17} M ${xRightEnd},${yOuterCorner + 20} L ${xRightEnd - 5},${yOuterCorner + 23}`} stroke={annotationColor} strokeWidth="1" />
            <text x={(xOuterCorner + xRightEnd) / 2} y={yOuterCorner + 34} style={{ ...textStyle, textAnchor: "middle" }}>b={b}</text>

            {/* Thickness t dimension */}
            <line x1={xOuterCorner} y1={yTopEnd - 15} x2={xOuterCorner + t_visual} y2={yTopEnd - 15} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${xOuterCorner},${yTopEnd - 15} L ${xOuterCorner + 3},${yTopEnd - 18} M ${xOuterCorner},${yTopEnd - 15} L ${xOuterCorner + 3},${yTopEnd - 12} M ${xOuterCorner + t_visual},${yTopEnd - 15} L ${xOuterCorner + t_visual - 3},${yTopEnd - 18} M ${xOuterCorner + t_visual},${yTopEnd - 15} L ${xOuterCorner + t_visual - 3},${yTopEnd - 12}`} stroke={annotationColor} strokeWidth="1" />
            <text x={xOuterCorner + t_visual / 2} y={yTopEnd - 23} style={{ ...textStyle, textAnchor: "middle", fontSize: "10px" }}>t={t}</text>
          </g>
        );
      }
      case 'BOX': {
        const b = getNumeric('b', 40);
        const h = getNumeric('h', 80);
        const t = getNumeric('t', 2);

        // Calculate aspect-ratio scaling inside a 110x110 bounding box
        const max_dim = 110;
        let w_visual = max_dim;
        let h_visual = max_dim;

        if (h >= b) {
          w_visual = max_dim * (b / h);
        } else {
          h_visual = max_dim * (h / b);
        }

        // Apply visual safety clamps
        w_visual = Math.max(40, w_visual);
        h_visual = Math.max(40, h_visual);

        const x1 = 100 - w_visual / 2;
        const y1 = 100 - h_visual / 2;

        const t_ratio_w = Math.max(0.04, Math.min(0.3, t / b));
        const t_ratio_h = Math.max(0.04, Math.min(0.3, t / h));
        const t_visual_w = w_visual * t_ratio_w;
        const t_visual_h = h_visual * t_ratio_h;

        const x2 = x1 + t_visual_w;
        const y2 = y1 + t_visual_h;
        const w2 = w_visual - 2 * t_visual_w;
        const h2 = h_visual - 2 * t_visual_h;

        return (
          <g>
            {/* Box Outer Profile */}
            <rect x={x1} y={y1} width={w_visual} height={h_visual} fill={fillColor} stroke={strokeColor} strokeWidth="2" rx="3" ry="3" />
            {/* Box Inner Profile */}
            <rect x={x2} y={y2} width={w2} height={h2} fill="#f8fafc" stroke={strokeColor} strokeWidth="1.5" rx="1.5" ry="1.5" />

            {/* Width Dimension b */}
            <line x1={x1} y1={y1 - 15} x2={x1 + w_visual} y2={y1 - 15} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${x1},${y1 - 15} L ${x1 + 5},${y1 - 18} M ${x1},${y1 - 15} L ${x1 + 5},${y1 - 12} M ${x1 + w_visual},${y1 - 15} L ${x1 + w_visual - 5},${y1 - 18} M ${x1 + w_visual},${y1 - 15} L ${x1 + w_visual - 5},${y1 - 12}`} stroke={annotationColor} strokeWidth="1" />
            <text x={100} y={y1 - 22} style={{ ...textStyle, textAnchor: "middle" }}>b={b}</text>

            {/* Height Dimension h */}
            <line x1={x1 - 15} y1={y1} x2={x1 - 15} y2={y1 + h_visual} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${x1 - 15},${y1} L ${x1 - 18},${y1 + 5} M ${x1 - 15},${y1} L ${x1 - 12},${y1 + 5} M ${x1 - 15},${y1 + h_visual} L ${x1 - 18},${y1 + h_visual - 5} M ${x1 - 15},${y1 + h_visual} L ${x1 - 12},${y1 + h_visual - 5}`} stroke={annotationColor} strokeWidth="1" />
            <text x={x1 - 25} y={104} style={{ ...textStyle, textAnchor: "end" }}>h={h}</text>

            {/* Thickness Dimension t (Red arrow line pointing to wall) */}
            <line x1={x1 + w_visual + 15} y1={100} x2={x1 + w_visual - t_visual_w / 2} y2={100} stroke="#ef4444" strokeWidth="1" />
            <path d={`M ${x1 + w_visual - t_visual_w / 2},100 L ${x1 + w_visual - t_visual_w / 2 + 4},97 M ${x1 + w_visual - t_visual_w / 2},100 L ${x1 + w_visual - t_visual_w / 2 + 4},103`} stroke="#ef4444" strokeWidth="1" />
            <text x={x1 + w_visual + 20} y={103} style={{ ...textStyle, fill: "#ef4444", fontSize: "10px" }}>t={t}</text>
          </g>
        );
      }
      case 'ROUND': {
        const d = getNumeric('d', 16);

        // Circular bar with crosshairs
        const radius = 55;
        const cx = 100;
        const cy = 100;

        return (
          <g>
            {/* Round Solid Bar */}
            <circle cx={cx} cy={cy} r={radius} fill={fillColor} stroke={strokeColor} strokeWidth="2" />

            {/* Center crosshairs */}
            <line x1={cx - radius - 15} y1={cy} x2={cx + radius + 15} y2={cy} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" />
            <line x1={cx} y1={cy - radius - 15} x2={cx} y2={cy + radius + 15} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" />

            {/* Diagonal Dimension Line of diameter */}
            <line x1={cx - 39} y1={cy - 39} x2={cx + 39} y2={cy + 39} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${cx - 39},${cy - 39} L ${cx - 32},${cy - 39} M ${cx - 39},${cy - 39} L ${cx - 39},${cy - 32} M ${cx + 39},${cy + 39} L ${cx + 32},${cy + 39} M ${cx + 39},${cy + 39} L ${cx + 39},${cy + 32}`} stroke={annotationColor} strokeWidth="1" />
            <text x={cx + 5} y={cy - 5} style={textStyle}>d=Ø{d}</text>
          </g>
        );
      }
      case 'PIPE': {
        const D = getNumeric('D', 114);
        const t = getNumeric('t', 4);

        const rOuter = 55;
        const t_ratio = Math.max(0.04, Math.min(0.4, t / D));
        const rInner = rOuter * (1 - t_ratio);
        const cx = 100;
        const cy = 100;

        return (
          <g>
            {/* Outer and Inner circles */}
            <circle cx={cx} cy={cy} r={rOuter} fill={fillColor} stroke={strokeColor} strokeWidth="2" />
            <circle cx={cx} cy={cy} r={rInner} fill="#f8fafc" stroke={strokeColor} strokeWidth="1.5" />

            {/* Center crosshairs */}
            <line x1={cx - rOuter - 15} y1={cy} x2={cx + rOuter + 15} y2={cy} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" />
            <line x1={cx} y1={cy - rOuter - 15} x2={cx} y2={cy + rOuter + 15} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" />

            {/* Diameter dimension */}
            <line x1={cx - rOuter} y1={cy + rOuter + 15} x2={cx + rOuter} y2={cy + rOuter + 15} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${cx - rOuter},${cy + rOuter + 15} L ${cx - rOuter + 5},${cy + rOuter + 12} M ${cx - rOuter},${cy + rOuter + 15} L ${cx - rOuter + 5},${cy + rOuter + 18} M ${cx + rOuter},${cy + rOuter + 15} L ${cx + rOuter - 5},${cy + rOuter + 12} M ${cx + rOuter},${cy + rOuter + 15} L ${cx + rOuter - 5},${cy + rOuter + 18}`} stroke={annotationColor} strokeWidth="1" />
            <text x={cx} y={cy + rOuter + 28} style={{ ...textStyle, textAnchor: "middle" }}>D=Ø{D}</text>

            {/* Thickness t label (Red indicator arrow to wall) */}
            <line x1={cx + rOuter + 15} y1={cy} x2={cx + (rOuter + rInner) / 2} y2={cy} stroke="#ef4444" strokeWidth="1" />
            <path d={`M ${cx + (rOuter + rInner) / 2},${cy} L ${cx + (rOuter + rInner) / 2 + 4},${cy - 3} M ${cx + (rOuter + rInner) / 2},${cy} L ${cx + (rOuter + rInner) / 2 + 4},${cy + 3}`} stroke="#ef4444" strokeWidth="1" />
            <text x={cx + rOuter + 20} y={cy + 3} style={{ ...textStyle, fill: "#ef4444", fontSize: "10px" }}>t={t}</text>
          </g>
        );
      }
      case 'H_I': {
        const h = getNumeric('h', 200);
        const b = getNumeric('b', 100);
        const t1 = getNumeric('t1', 5.5);
        const t2 = getNumeric('t2', 8);

        // Aspect scaling box
        const max_dim = 110;
        let w_visual = max_dim;
        let h_visual = max_dim;

        if (h >= b) {
          w_visual = max_dim * (b / h);
        } else {
          h_visual = max_dim * (h / b);
        }

        w_visual = Math.max(45, w_visual);
        h_visual = Math.max(45, h_visual);

        const x1 = 100 - w_visual / 2;
        const y1 = 100 - h_visual / 2;
        const x2 = 100 + w_visual / 2;
        const y2 = 100 + h_visual / 2;

        const t1_ratio = Math.max(0.04, Math.min(0.3, t1 / b));
        const t2_ratio = Math.max(0.04, Math.min(0.3, t2 / h));

        const t1_visual = w_visual * t1_ratio;
        const t2_visual = h_visual * t2_ratio;

        const pathD = `M ${x1},${y1} ` +
          `L ${x2},${y1} ` +
          `L ${x2},${y1 + t2_visual} ` +
          `L ${100 + t1_visual / 2},${y1 + t2_visual} ` +
          `L ${100 + t1_visual / 2},${y2 - t2_visual} ` +
          `L ${x2},${y2 - t2_visual} ` +
          `L ${x2},${y2} ` +
          `L ${x1},${y2} ` +
          `L ${x1},${y2 - t2_visual} ` +
          `L ${100 - t1_visual / 2},${y2 - t2_visual} ` +
          `L ${100 - t1_visual / 2},${y1 + t2_visual} ` +
          `L ${x1},${y1 + t2_visual} Z`;

        return (
          <g>
            {/* H/I Profile Shape */}
            <path
              d={pathD}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Width Dimension b */}
            <line x1={x1} y1={y1 - 15} x2={x2} y2={y1 - 15} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${x1},${y1 - 15} L ${x1 + 5},${y1 - 18} M ${x1},${y1 - 15} L ${x1 + 5},${y1 - 12} M ${x2},${y1 - 15} L ${x2 - 5},${y1 - 18} M ${x2},${y1 - 15} L ${x2 - 5},${y1 - 12}`} stroke={annotationColor} strokeWidth="1" />
            <text x={100} y={y1 - 22} style={{ ...textStyle, textAnchor: "middle" }}>b={b}</text>

            {/* Height Dimension h */}
            <line x1={x1 - 15} y1={y1} x2={x1 - 15} y2={y2} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${x1 - 15},${y1} L ${x1 - 18},${y1 + 5} M ${x1 - 15},${y1} L ${x1 - 12},${y1 + 5} M ${x1 - 15},${y2} L ${x1 - 18},${y2 - 5} M ${x1 - 15},${y2} L ${x1 - 12},${y2 - 5}`} stroke={annotationColor} strokeWidth="1" />
            <text x={x1 - 25} y={104} style={{ ...textStyle, textAnchor: "end" }}>h={h}</text>

            {/* Web thickness t1 (Red marker on web) */}
            <line x1={100 - t1_visual / 2} y1={100} x2={100 + t1_visual / 2} y2={100} stroke="#ef4444" strokeWidth="1" />
            <text x={100} y={112} style={{ ...textStyle, fill: "#ef4444", fontSize: "9px", textAnchor: "middle" }}>t1={t1}</text>

            {/* Flange thickness t2 (Red marker on top flange) */}
            <line x1={x2 + 15} y1={y1} x2={x2 + 15} y2={y1 + t2_visual} stroke="#ef4444" strokeWidth="1" />
            <path d={`M ${x2 + 15},${y1} L ${x2 + 12},${y1 + 3} M ${x2 + 15},${y1} L ${x2 + 18},${y1 + 3} M ${x2 + 15},${y1 + t2_visual} L ${x2 + 12},${y1 + t2_visual - 3} M ${x2 + 15},${y1 + t2_visual} L ${x2 + 18},${y1 + t2_visual - 3}`} stroke="#ef4444" strokeWidth="1" />
            <text x={x2 + 22} y={y1 + t2_visual / 2 + 3} style={{ ...textStyle, fill: "#ef4444", fontSize: "9px" }}>t2={t2}</text>
          </g>
        );
      }
      case 'U': {
        const h = getNumeric('h', 150);
        const b = getNumeric('b', 75);
        const t1 = getNumeric('t1', 6.5);
        const t2 = getNumeric('t2', 10);

        // Aspect scaling box
        const max_dim = 110;
        let w_visual = max_dim;
        let h_visual = max_dim;

        if (h >= b) {
          w_visual = max_dim * (b / h);
        } else {
          h_visual = max_dim * (h / b);
        }

        w_visual = Math.max(45, w_visual);
        h_visual = Math.max(45, h_visual);

        const x1 = 100 - w_visual / 2;
        const y1 = 100 - h_visual / 2;
        const x2 = 100 + w_visual / 2;
        const y2 = 100 + h_visual / 2;

        const t1_ratio = Math.max(0.04, Math.min(0.3, t1 / b));
        const t2_ratio = Math.max(0.04, Math.min(0.3, t2 / h));

        const t1_visual = w_visual * t1_ratio;
        const t2_visual = h_visual * t2_ratio;

        const pathD = `M ${x2},${y1} ` +
          `L ${x1},${y1} ` +
          `L ${x1},${y2} ` +
          `L ${x2},${y2} ` +
          `L ${x2},${y2 - t2_visual} ` +
          `L ${x1 + t1_visual},${y2 - t2_visual} ` +
          `L ${x1 + t1_visual},${y1 + t2_visual} ` +
          `L ${x2},${y1 + t2_visual} Z`;

        return (
          <g>
            {/* U Shape Profile */}
            <path
              d={pathD}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Width Dimension b */}
            <line x1={x1} y1={y1 - 15} x2={x2} y2={y1 - 15} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${x1},${y1 - 15} L ${x1 + 5},${y1 - 18} M ${x1},${y1 - 15} L ${x1 + 5},${y1 - 12} M ${x2},${y1 - 15} L ${x2 - 5},${y1 - 18} M ${x2},${y1 - 15} L ${x2 - 5},${y1 - 12}`} stroke={annotationColor} strokeWidth="1" />
            <text x={(x1 + x2) / 2} y={y1 - 22} style={{ ...textStyle, textAnchor: "middle" }}>b={b}</text>

            {/* Height Dimension h */}
            <line x1={x1 - 15} y1={y1} x2={x1 - 15} y2={y2} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${x1 - 15},${y1} L ${x1 - 18},${y1 + 5} M ${x1 - 15},${y1} L ${x1 - 12},${y1 + 5} M ${x1 - 15},${y2} L ${x1 - 18},${y2 - 5} M ${x1 - 15},${y2} L ${x1 - 12},${y2 - 5}`} stroke={annotationColor} strokeWidth="1" />
            <text x={x1 - 25} y={104} style={{ ...textStyle, textAnchor: "end" }}>h={h}</text>

            {/* Web thickness t1 (Red marker) */}
            <line x1={x1} y1={100} x2={x1 + t1_visual} y2={100} stroke="#ef4444" strokeWidth="1" />
            <text x={x1 + t1_visual / 2} y={112} style={{ ...textStyle, fill: "#ef4444", fontSize: "9px", textAnchor: "middle" }}>t1={t1}</text>

            {/* Flange thickness t2 (Red marker) */}
            <line x1={x2 + 15} y1={y1} x2={x2 + 15} y2={y1 + t2_visual} stroke="#ef4444" strokeWidth="1" />
            <path d={`M ${x2 + 15},${y1} L ${x2 + 12},${y1 + 3} M ${x2 + 15},${y1} L ${x2 + 18},${y1 + 3} M ${x2 + 15},${y1 + t2_visual} L ${x2 + 12},${y1 + t2_visual - 3} M ${x2 + 15},${y1 + t2_visual} L ${x2 + 18},${y1 + t2_visual - 3}`} stroke="#ef4444" strokeWidth="1" />
            <text x={x2 + 22} y={y1 + t2_visual / 2 + 3} style={{ ...textStyle, fill: "#ef4444", fontSize: "9px" }}>t2={t2}</text>
          </g>
        );
      }
      case 'PLATE': {
        const b = getNumeric('b', 200);
        const t = getNumeric('t', 10);

        // Aspect scaling box for a thin steel plate
        const w_visual = 130;
        const t_ratio = Math.max(0.04, Math.min(0.3, t / b));
        const h_visual = Math.max(10, w_visual * t_ratio);

        const x1 = 100 - w_visual / 2;
        const y1 = 100 - h_visual / 2;

        return (
          <g>
            {/* Plate Profile */}
            <rect x={x1} y={y1} width={w_visual} height={h_visual} fill={fillColor} stroke={strokeColor} strokeWidth="2" rx="2" ry="2" />

            {/* Width Dimension b */}
            <line x1={x1} y1={y1 - 15} x2={x1 + w_visual} y2={y1 - 15} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${x1},${y1 - 15} L ${x1 + 5},${y1 - 18} M ${x1},${y1 - 15} L ${x1 + 5},${y1 - 12} M ${x1 + w_visual},${y1 - 15} L ${x1 + w_visual - 5},${y1 - 18} M ${x1 + w_visual},${y1 - 15} L ${x1 + w_visual - 5},${y1 - 12}`} stroke={annotationColor} strokeWidth="1" />
            <text x={100} y={y1 - 22} style={{ ...textStyle, textAnchor: "middle" }}>b={b}</text>

            {/* Thickness Dimension t */}
            <line x1={x1 + w_visual + 15} y1={y1} x2={x1 + w_visual + 15} y2={y1 + h_visual} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${x1 + w_visual + 15},${y1} L ${x1 + w_visual + 12},${y1 + 4} M ${x1 + w_visual + 15},${y1} L ${x1 + w_visual + 18},${y1 + 4} M ${x1 + w_visual + 15},${y1 + h_visual} L ${x1 + w_visual + 12},${y1 + h_visual - 4} M ${x1 + w_visual + 15},${y1 + h_visual} L ${x1 + w_visual + 18},${y1 + h_visual - 4}`} stroke={annotationColor} strokeWidth="1" />
            <text x={x1 + w_visual + 22} y={104} style={textStyle}>t={t}</text>
          </g>
        );
      }
      case 'C': {
        const H = getNumeric('H', 150);
        const F = getNumeric('F', 50);
        const a = getNumeric('a', 15);
        const t = getNumeric('t', 2);

        // Aspect scaling box
        const max_dim = 110;
        let w_visual = max_dim;
        let h_visual = max_dim;

        if (H >= F) {
          w_visual = max_dim * (F / H);
        } else {
          h_visual = max_dim * (H / F);
        }

        w_visual = Math.max(45, w_visual);
        h_visual = Math.max(55, h_visual);

        const x1 = 100 - w_visual / 2;
        const y1 = 100 - h_visual / 2;
        const x2 = 100 + w_visual / 2;
        const y2 = 100 + h_visual / 2;

        const t_ratio = Math.max(0.03, Math.min(0.15, t / H));
        const t_visual = h_visual * t_ratio;

        const a_ratio = Math.max(0.08, Math.min(0.3, a / H));
        const a_visual = h_visual * a_ratio;

        const pathD = `M ${x2},${y1 + a_visual} ` +
          `L ${x2},${y1} ` +
          `L ${x1},${y1} ` +
          `L ${x1},${y2} ` +
          `L ${x2},${y2} ` +
          `L ${x2},${y2 - a_visual} ` +
          `L ${x2 - t_visual},${y2 - a_visual} ` +
          `L ${x2 - t_visual},${y2 - t_visual} ` +
          `L ${x1 + t_visual},${y2 - t_visual} ` +
          `L ${x1 + t_visual},${y1 + t_visual} ` +
          `L ${x2 - t_visual},${y1 + t_visual} ` +
          `L ${x2 - t_visual},${y1 + a_visual} Z`;

        return (
          <g>
            {/* C Purlin Shape */}
            <path
              d={pathD}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Height H */}
            <line x1={x1 - 15} y1={y1} x2={x1 - 15} y2={y2} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${x1 - 15},${y1} L ${x1 - 18},${y1 + 5} M ${x1 - 15},${y1} L ${x1 - 12},${y1 + 5} M ${x1 - 15},${y2} L ${x1 - 18},${y2 - 5} M ${x1 - 15},${y2} L ${x1 - 12},${y2 - 5}`} stroke={annotationColor} strokeWidth="1" />
            <text x={x1 - 25} y={104} style={{ ...textStyle, textAnchor: "end" }}>H={H}</text>

            {/* Flange width F */}
            <line x1={x1} y1={y1 - 15} x2={x2} y2={y1 - 15} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${x1},${y1 - 15} L ${x1 + 5},${y1 - 18} M ${x1},${y1 - 15} L ${x1 + 5},${y1 - 12} M ${x2},${y1 - 15} L ${x2 - 5},${y1 - 18} M ${x2},${y1 - 15} L ${x2 - 5},${y1 - 12}`} stroke={annotationColor} strokeWidth="1" />
            <text x={(x1 + x2) / 2} y={y1 - 22} style={{ ...textStyle, textAnchor: "middle" }}>F={F}</text>

            {/* Lip a */}
            <line x1={x2 + 15} y1={y1} x2={x2 + 15} y2={y1 + a_visual} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${x2 + 15},${y1} L ${x2 + 12},${y1 + 4} M ${x2 + 15},${y1} L ${x2 + 18},${y1 + 4} M ${x2 + 15},${y1 + a_visual} L ${x2 + 12},${y1 + a_visual - 4} M ${x2 + 15},${y1 + a_visual} L ${x2 + 18},${y1 + a_visual - 4}`} stroke={annotationColor} strokeWidth="1" />
            <text x={x2 + 22} y={y1 + a_visual / 2 + 4} style={{ ...textStyle, fontSize: "9px" }}>a={a}</text>

            {/* Thickness t (Red arrow pointing to web) */}
            <line x1={100} y1={100} x2={x1 + t_visual / 2} y2={100} stroke="#ef4444" strokeWidth="1" />
            <path d={`M ${x1 + t_visual / 2},100 L ${x1 + t_visual / 2 + 4},97 M ${x1 + t_visual / 2},100 L ${x1 + t_visual / 2 + 4},103`} stroke="#ef4444" strokeWidth="1" />
            <text x={105} y={103} style={{ ...textStyle, fill: "#ef4444", fontSize: "10px" }}>t={t}</text>
          </g>
        );
      }
      case 'Z': {
        const H = getNumeric('H', 200);
        const E = getNumeric('E', 62);
        const F = getNumeric('F', 58);
        const a = getNumeric('a', 20);
        const t = getNumeric('t', 2);

        // Aspect scaling box
        const max_dim = 110;
        let w_visual = max_dim;
        let h_visual = max_dim;
        const max_flange = Math.max(E, F);

        if (H >= max_flange) {
          h_visual = max_dim;
          w_visual = max_dim * (max_flange / H);
        } else {
          w_visual = max_dim;
          h_visual = max_dim * (H / max_flange);
        }

        w_visual = Math.max(50, w_visual);
        h_visual = Math.max(65, h_visual);

        // Web position at x = 100
        const web_x = 100;
        const y1 = 100 - h_visual / 2;
        const y2 = 100 + h_visual / 2;

        const E_visual = w_visual * (E / max_flange);
        const F_visual = w_visual * (F / max_flange);

        const t_ratio = Math.max(0.03, Math.min(0.15, t / H));
        const t_visual = h_visual * t_ratio;

        const a_ratio = Math.max(0.08, Math.min(0.3, a / H));
        const a_visual = h_visual * a_ratio;

        // Path coordinates forming the true Z profile with lips and thickness
        const pathD = `M ${web_x + F_visual},${y2 - a_visual} ` +
          `L ${web_x + F_visual},${y2} ` +
          `L ${web_x},${y2} ` +
          `L ${web_x},${y1} ` +
          `L ${web_x - E_visual},${y1} ` +
          `L ${web_x - E_visual},${y1 + a_visual} ` +
          `L ${web_x - E_visual + t_visual},${y1 + a_visual} ` +
          `L ${web_x - E_visual + t_visual},${y1 + t_visual} ` +
          `L ${web_x + t_visual},${y1 + t_visual} ` +
          `L ${web_x + t_visual},${y2 - t_visual} ` +
          `L ${web_x + F_visual - t_visual},${y2 - t_visual} ` +
          `L ${web_x + F_visual - t_visual},${y2 - a_visual} Z`;

        return (
          <g>
            {/* Z Purlin Profile Shape */}
            <path
              d={pathD}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Height H (Vertical dotted indicator line inside) */}
            <line x1={web_x + t_visual / 2} y1={y1} x2={web_x + t_visual / 2} y2={y2} stroke={annotationColor} strokeWidth="1" strokeDasharray="3,3" />
            <path d={`M ${web_x + t_visual / 2},${y1} L ${web_x + t_visual / 2 - 3},${y1 + 5} M ${web_x + t_visual / 2},${y1} L ${web_x + t_visual / 2 + 3},${y1 + 5} M ${web_x + t_visual / 2},${y2} L ${web_x + t_visual / 2 - 3},${y2 - 5} M ${web_x + t_visual / 2},${y2} L ${web_x + t_visual / 2 + 3},${y2 - 5}`} stroke={annotationColor} strokeWidth="1" />
            <text x={web_x - 38} y={104} style={textStyle}>H={H}</text>

            {/* Top Flange Width E */}
            <line x1={web_x - E_visual} y1={y1 - 15} x2={web_x} y2={y1 - 15} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${web_x - E_visual},${y1 - 15} L ${web_x - E_visual + 5},${y1 - 18} M ${web_x - E_visual},${y1 - 15} L ${web_x - E_visual + 5},${y1 - 12} M ${web_x},${y1 - 15} L ${web_x - 5},${y1 - 18} M ${web_x},${y1 - 15} L ${web_x - 5},${y1 - 12}`} stroke={annotationColor} strokeWidth="1" />
            <text x={web_x - E_visual / 2} y={y1 - 22} style={{ ...textStyle, textAnchor: "middle" }}>E={E}</text>

            {/* Bottom Flange Width F */}
            <line x1={web_x} y1={y2 + 15} x2={web_x + F_visual} y2={y2 + 15} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${web_x},${y2 + 15} L ${web_x + 5},${y2 + 12} M ${web_x},${y2 + 15} L ${web_x + 5},${y2 + 18} M ${web_x + F_visual},${y2 + 15} L ${web_x + F_visual - 5},${y2 + 12} M ${web_x + F_visual},${y2 + 15} L ${web_x + F_visual - 5},${y2 + 18}`} stroke={annotationColor} strokeWidth="1" />
            <text x={web_x + F_visual / 2} y={y2 + 27} style={{ ...textStyle, textAnchor: "middle" }}>F={F}</text>

            {/* Lip a (Bottom right lip indicator) */}
            <line x1={web_x + F_visual + 15} y1={y2 - a_visual} x2={web_x + F_visual + 15} y2={y2} stroke={annotationColor} strokeWidth="1" />
            <path d={`M ${web_x + F_visual + 15},${y2 - a_visual} L ${web_x + F_visual + 12},${y2 - a_visual + 4} M ${web_x + F_visual + 15},${y2 - a_visual} L ${web_x + F_visual + 18},${y2 - a_visual + 4} M ${web_x + F_visual + 15},${y2} L ${web_x + F_visual + 12},${y2 - 4} M ${web_x + F_visual + 15},${y2} L ${web_x + F_visual + 18},${y2 - 4}`} stroke={annotationColor} strokeWidth="1" />
            <text x={web_x + F_visual + 22} y={y2 - a_visual / 2 + 3} style={{ ...textStyle, fontSize: "9px" }}>a={a}</text>

            {/* Thickness t (Red indicator arrow to the center web) */}
            <line x1={web_x + 28} y1={100} x2={web_x + t_visual / 2} y2={100} stroke="#ef4444" strokeWidth="1" />
            <path d={`M ${web_x + t_visual / 2},100 L ${web_x + t_visual / 2 + 4},97 M ${web_x + t_visual / 2},100 L ${web_x + t_visual / 2 + 4},103`} stroke="#ef4444" strokeWidth="1" />
            <text x={web_x + 33} y={103} style={{ ...textStyle, fill: "#ef4444", fontSize: "10px" }}>t={t}</text>
          </g>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <svg
        viewBox="0 0 200 200"
        className="w-full max-w-[170px] h-auto drop-shadow-sm transition-transform duration-300 hover:scale-[1.03]"
        style={{ overflow: "visible" }}
      >
        {renderSvgContent()}
      </svg>
      <div className="mt-3 text-center">
        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">SƠ ĐỒ MẶT CẮT THIẾT KẾ</p>
        <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">Tự động vẽ thay đổi theo số liệu đầu vào thực tế</p>
      </div>
    </div>
  );
}
