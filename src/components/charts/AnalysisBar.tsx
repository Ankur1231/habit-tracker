'use client';

interface Props {
  pct: number;
  max?: number;
  color: string;
}

export default function AnalysisBar({ pct, max = 100, color }: Props) {
  const w = Math.max(0, Math.min(100, (pct / max) * 100));
  return (
    <div style={{
      position: 'relative', height: 10, background: '#111a2e',
      borderRadius: 4, overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: `${w}%`,
        background: color, borderRadius: 4,
        transition: 'width 600ms cubic-bezier(.2,.7,.2,1)',
      }} />
    </div>
  );
}
