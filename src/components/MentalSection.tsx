'use client';

import type { MentalMap, Week } from '@/lib/types';
import { DAY_SHORT } from '@/lib/constants';
import { pctColor, monthLabel } from '@/lib/habitUtils';
import Panel from './layout/Panel';
import MoodLines from './charts/MoodLines';
import AnalysisBar from './charts/AnalysisBar';

interface WeekStat { idx: number; mood: number; motivation: number; moodPct: number; motPct: number; }

interface Props {
  weeks: Week[];
  totalDays: number;
  mental: MentalMap;
  year: number;
  month: number;
  mood: number[];
  motivation: number[];
  dayLabels: string[];
  weekStats: WeekStat[];
  showAnalysis: boolean;
  onChange: (day: number, key: 'mood' | 'motivation', val: number) => void;
}

function chipColor(v: number): string {
  if (v >= 9) return '#22c55e';
  if (v >= 7) return '#2bd4a1';
  if (v >= 5) return '#5aa7ff';
  if (v >= 3) return '#fb923c';
  return '#ef4d6c';
}

export default function MentalSection({ weeks, totalDays, mental, year, month, mood, motivation, dayLabels, weekStats, showAnalysis, onChange }: Props) {
  const today = new Date();
  const todayDay = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : null;
  const gridCols = `190px repeat(${totalDays}, minmax(28px, 1fr))${showAnalysis ? ' 280px' : ''}`;
  const minWidth = `${190 + totalDays * 28 + (showAnalysis ? 280 : 0)}px`;

  function renderRow(label: string, key: 'mood' | 'motivation', accent: string) {
    return (
      <>
        <div style={{ padding: '8px 14px', fontSize: 12, color: accent, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, display: 'inline-block' }} />
          {label}
        </div>
        {weeks.map((wk) => wk.days.map((d) => {
          const v = mental?.[d.day]?.[key] ?? 5;
          return (
            <div key={`${key}-${d.day}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
              <select
                value={v}
                onChange={(e) => onChange(d.day, key, parseInt(e.target.value, 10))}
                style={{
                  width: 26, height: 22, padding: 0, textAlign: 'center',
                  background: chipColor(v) + '22',
                  border: `1px solid ${chipColor(v)}55`,
                  borderRadius: 4,
                  color: chipColor(v),
                  fontWeight: 700, fontSize: 11,
                  appearance: 'none', WebkitAppearance: 'none',
                  cursor: 'pointer', textAlignLast: 'center',
                  fontFamily: 'inherit',
                }}
              >
                {Array.from({ length: 11 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          );
        }))}
        {showAnalysis && <div />}
      </>
    );
  }

  return (
    <Panel title="Mental State" subtitle={`Mood · Motivation · ${monthLabel(year, month)}`}>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, minWidth, rowGap: 2, padding: '14px 0' }}>
          <div />
          {weeks.map((wk, wi) => (
            <div key={`mwh-${wi}`} style={{
              gridColumn: `span ${wk.days.length}`,
              color: '#0a0f1a', fontSize: 13, fontWeight: 700, textAlign: 'center',
              padding: '8px 4px', background: `var(--w${wi + 1})`, letterSpacing: '.04em',
            }}>Week {wi + 1}</div>
          ))}
          {showAnalysis && <div style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, textAlign: 'right' }}>Analysis</div>}

          <div />
          {weeks.map((wk, wi) => wk.days.map((d) => (
            <div key={`mdow-${d.day}`} style={{ fontSize: 10, color: '#0a0f1a', fontWeight: 600, textAlign: 'center', padding: '3px 0', background: `var(--w${wi + 1})`, opacity: 0.88 }}>
              {DAY_SHORT[d.dow]}
            </div>
          )))}
          {showAnalysis && <div />}

          <div />
          {weeks.map((wk, wi) => wk.days.map((d) => (
            <div key={`mdn-${d.day}`} style={{
              fontSize: 11, color: '#0a0f1a', fontWeight: 700,
              textAlign: 'center', padding: '3px 0 5px',
              background: `var(--w${wi + 1})`, opacity: 0.95,
              borderBottom: d.day === todayDay ? '2px solid #0a0f1a' : 'none',
            }}>{d.day}</div>
          )))}
          {showAnalysis && <div />}

          {renderRow('Mood', 'mood', 'var(--mood)')}
          {renderRow('Motivation', 'motivation', 'var(--motivation)')}
        </div>
      </div>

      <div style={{ padding: '8px 18px 14px', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingTop: 8, paddingBottom: 4 }}>
          <Dot color="var(--mood)" label="Mood" />
          <Dot color="var(--motivation)" label="Motivation" />
        </div>
        <MoodLines mood={mood} motivation={motivation} dayLabels={dayLabels} height={180} />
      </div>

      {showAnalysis && (
        <div style={{ borderTop: '1px solid var(--line)', padding: '14px 22px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {[
            { key: 'mood' as const, label: 'Mood', accent: 'var(--mood)' },
            { key: 'motivation' as const, label: 'Motivation', accent: 'var(--motivation)' },
          ].map((stat) => (
            <div key={stat.key}>
              <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: stat.accent, fontWeight: 700, marginBottom: 10 }}>
                {stat.label} · Mindset Score
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {weekStats.map((ws, i) => {
                  const pct = stat.key === 'mood' ? ws.moodPct : ws.motPct;
                  return (
                    <div key={ws.idx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 56px', alignItems: 'center', gap: 12, fontSize: 12 }}>
                      <div style={{ color: 'var(--ink-dim)' }}>Week {i + 1}</div>
                      <AnalysisBar pct={pct} color={pctColor(pct)} />
                      <div style={{ textAlign: 'right', color: 'var(--ink-dim)', fontWeight: 600 }}>{pct.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function Dot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: 'var(--ink-dim)' }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </div>
  );
}
