'use client';

import { useState, ReactNode } from 'react';
import type { TweakValues } from '@/lib/types';

interface Props {
  tweaks: TweakValues;
  setTweak: <K extends keyof TweakValues>(key: K, val: TweakValues[K]) => void;
}

const ACCENT_OPTIONS = ['#2bd4a1', '#5aa7ff', '#ef4d8a', '#fb923c', '#a3e635', '#8b5cf6'];

export default function TweaksPanel({ tweaks, setTweak }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Tweaks"
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 100,
          width: 44, height: 44, borderRadius: 12,
          background: 'var(--panel)', border: '1px solid var(--line-2)',
          color: 'var(--ink-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px -8px rgba(0,0,0,0.5)',
          cursor: 'pointer', transition: 'all 140ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.background = 'var(--panel-2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-dim)'; e.currentTarget.style.background = 'var(--panel)'; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'fixed', right: 16, bottom: 72, zIndex: 200,
          width: 280,
          background: 'rgba(14, 21, 36, 0.95)',
          border: '1px solid var(--line-2)',
          borderRadius: 14,
          padding: 16,
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(16px)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Tweaks</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--ink-mute)', cursor: 'pointer', fontSize: 16, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>✕</button>
          </div>

          <Section label="Theme" />
          <TweakRow label="Accent">
            <div style={{ display: 'flex', gap: 6 }}>
              {ACCENT_OPTIONS.map((c) => (
                <button key={c} onClick={() => setTweak('accent', c)} style={{
                  width: 22, height: 22, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                  boxShadow: tweaks.accent === c ? `0 0 0 2px var(--bg), 0 0 0 4px ${c}` : 'none',
                  transition: 'box-shadow 120ms',
                }} />
              ))}
            </div>
          </TweakRow>
          <SegmentedRow label="Week colors" value={tweaks.weekScheme}
            options={['rainbow', 'cool', 'warm', 'mono']}
            onChange={(v) => setTweak('weekScheme', v as TweakValues['weekScheme'])} />

          <Section label="Layout" />
          <SliderRow label="Corner radius" value={tweaks.radius} min={0} max={24} step={2} unit="px"
            onChange={(v) => setTweak('radius', v)} />
          <SegmentedRow label="Density" value={tweaks.density}
            options={['compact', 'regular', 'comfy']}
            onChange={(v) => setTweak('density', v as TweakValues['density'])} />
          <SegmentedRow label="Check style" value={tweaks.checkStyle}
            options={['fill', 'box', 'dot']}
            onChange={(v) => setTweak('checkStyle', v as TweakValues['checkStyle'])} />

          <Section label="Modules" />
          <ToggleRow label="Analysis column" value={tweaks.showAnalysis} onChange={(v) => setTweak('showAnalysis', v)} />
          <ToggleRow label="Daily area chart" value={tweaks.showArea} onChange={(v) => setTweak('showArea', v)} />
          <ToggleRow label="Mental state" value={tweaks.showMental} onChange={(v) => setTweak('showMental', v)} />
        </div>
      )}
    </>
  );
}

function Section({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-mute)', paddingTop: 4 }}>
      {label}
    </div>
  );
}

function TweakRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 500 }}>{label}</span>
      {children}
    </div>
  );
}

function SliderRow({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) {
  return (
    <TweakRow label={`${label} — ${value}${unit}`}>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)' }} />
    </TweakRow>
  );
}

function SegmentedRow({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <TweakRow label={label}>
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 2 }}>
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)} style={{
            flex: 1, padding: '5px 4px', fontSize: 11, fontWeight: 500, borderRadius: 6,
            background: value === o ? 'rgba(255,255,255,0.12)' : 'transparent',
            color: value === o ? 'var(--ink)' : 'var(--ink-mute)',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 140ms',
          }}>{o}</button>
        ))}
      </div>
    </TweakRow>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        width: 34, height: 19, borderRadius: 999, padding: 0,
        background: value ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
        border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 140ms',
      }}>
        <span style={{
          position: 'absolute', top: 2.5, left: value ? 17 : 3, width: 14, height: 14,
          borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          transition: 'left 140ms',
        }} />
      </button>
    </div>
  );
}
