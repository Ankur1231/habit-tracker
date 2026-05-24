'use client';

interface Props {
  values: number[];
  color?: string;
  height?: number;
  dayLabels?: string[];
}

function smoothPath(points: [number, number][]): string {
  if (points.length < 2) return '';
  const d: string[] = [`M ${points[0][0]} ${points[0][1]}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`);
  }
  return d.join(' ');
}

export default function AreaChart({ values, color = 'var(--accent)', height = 170, dayLabels }: Props) {
  const pad = { l: 36, r: 18, t: 16, b: 24 };
  const w = 1040;
  const h = height;
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const n = values.length;
  const xs = (i: number) => pad.l + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const ys = (v: number) => pad.t + innerH - (v / 100) * innerH;

  const pts: [number, number][] = values.map((v, i) => [xs(i), ys(v)]);
  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1][0]} ${pad.t + innerH} L ${pts[0][0]} ${pad.t + innerH} Z`;

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="none" style={{ display: 'block', height }}>
      <defs>
        <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yTicks.map((tk) => {
        const y = ys(tk);
        return (
          <g key={tk}>
            <line x1={pad.l} x2={w - pad.r} y1={y} y2={y}
              stroke="#1b2541" strokeWidth="1" strokeDasharray={tk === 0 ? '' : '2 4'} />
            <text x={pad.l - 8} y={y + 3} textAnchor="end" fontSize="10" fill="var(--ink-mute)" fontFamily="Roboto">{tk}%</text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#areaFill)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {dayLabels && dayLabels.map((lbl, i) =>
        i % Math.ceil(n / 12) === 0 ? (
          <text key={i} x={xs(i)} y={h - 6} textAnchor="middle" fontSize="9.5" fill="var(--ink-mute)" fontFamily="Roboto">{lbl}</text>
        ) : null
      )}
    </svg>
  );
}
