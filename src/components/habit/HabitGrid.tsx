'use client';

import { useState, useMemo, FormEvent } from 'react';
import type { Habit, CellMap, Week, CheckStyle } from '@/lib/types';
import { DAY_SHORT } from '@/lib/constants';
import { pctColor, getCellDateRelation } from '@/lib/habitUtils';
import CheckCell from './CheckCell';
import EmojiButton from './EmojiButton';
import ContextMenu from './ContextMenu';
import AnalysisBar from '../charts/AnalysisBar';

interface Props {
  habits: Habit[];
  cells: CellMap;
  weeks: Week[];
  totalDays: number;
  year: number;
  month: number;
  onToggleCell: (habitId: string, day: number) => void;
  onAddHabit: (text: string) => void;
  onRenameHabit: (habitId: string, name: string) => void;
  onSetEmoji: (habitId: string, emoji: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onDuplicateHabit: (habitId: string) => void;
  showAnalysis: boolean;
  checkStyle: CheckStyle;
}

export default function HabitGrid({
  habits, cells, weeks, totalDays, year, month,
  onToggleCell, onAddHabit, onRenameHabit, onSetEmoji, onDeleteHabit, onDuplicateHabit,
  showAnalysis, checkStyle,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; habitId: string } | null>(null);

  const dailyStats = useMemo(() => {
    const stats: Record<number, { done: number; notDone: number; pct: number }> = {};
    for (let d = 1; d <= totalDays; d++) {
      let done = 0;
      habits.forEach((h) => { if (cells?.[h.id]?.[d]) done++; });
      stats[d] = { done, notDone: habits.length - done, pct: habits.length ? Math.round(done / habits.length * 100) : 0 };
    }
    return stats;
  }, [habits, cells, totalDays]);

  const habitStats = useMemo(() => {
    const stats: Record<string, { done: number; pct: number }> = {};
    habits.forEach((h) => {
      let done = 0;
      for (let d = 1; d <= totalDays; d++) if (cells?.[h.id]?.[d]) done++;
      stats[h.id] = { done, pct: totalDays ? (done / totalDays) * 100 : 0 };
    });
    return stats;
  }, [habits, cells, totalDays]);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDay = isCurrentMonth ? today.getDate() : null;

  const gridCols = `190px repeat(${totalDays}, minmax(28px, 1fr))${showAnalysis ? ' 280px' : ''}`;
  const minWidth = `${190 + totalDays * 28 + (showAnalysis ? 280 : 0)}px`;

  const footerRows = [
    { key: 'pct', label: 'Progress', val: (d: number) => `${dailyStats[d].pct}%`, color: (d: number) => pctColor(dailyStats[d].pct) },
    { key: 'done', label: 'Done', val: (d: number) => String(dailyStats[d].done), color: () => 'var(--ink)' },
    { key: 'not', label: 'Not Done', val: (d: number) => String(dailyStats[d].notDone), color: () => 'var(--ink-mute)' },
  ];

  return (
    <>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius, 16px)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, minWidth, rowGap: 2 }}>

            {/* Row 1: My Habits + week banners */}
            <div style={{ padding: '10px 14px', fontSize: 16, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center' }}>My Habits</div>
            {weeks.map((wk, i) => (
              <div key={`wkh-${i}`} style={{
                gridColumn: `span ${wk.days.length}`,
                color: '#0a0f1a', fontSize: 13, fontWeight: 700, textAlign: 'center',
                padding: '10px 4px',
                background: `var(--w${i + 1})`,
                borderTopLeftRadius: i === 0 ? 8 : 0,
                borderTopRightRadius: i === weeks.length - 1 && !showAnalysis ? 8 : 0,
                letterSpacing: '.04em',
              }}>Week {i + 1}</div>
            ))}
            {showAnalysis && (
              <div style={{ padding: '10px 16px', fontSize: 16, fontWeight: 600, color: 'var(--ink)', textAlign: 'right' }}>Analysis</div>
            )}

            {/* Row 2: Day-of-week labels */}
            <div />
            {weeks.map((wk, wi) => wk.days.map((d) => (
              <div key={`dow-${d.day}`} style={{
                fontSize: 10, color: '#0a0f1a', fontWeight: 600,
                textAlign: 'center', padding: '4px 0',
                background: `var(--w${wi + 1})`, opacity: 0.88,
              }}>{DAY_SHORT[d.dow]}</div>
            )))}
            {showAnalysis && <div />}

            {/* Row 3: Day numbers */}
            <div />
            {weeks.map((wk, wi) => wk.days.map((d) => {
              const isToday = d.day === todayDay;
              return (
                <div key={`dnum-${d.day}`} style={{
                  fontSize: 11, color: '#0a0f1a', fontWeight: 700,
                  textAlign: 'center', padding: '4px 0 6px',
                  background: `var(--w${wi + 1})`, opacity: 0.95, position: 'relative',
                  borderBottom: isToday ? '2px solid #0a0f1a' : 'none',
                }}>{d.day}</div>
              );
            }))}
            {showAnalysis && <div />}

            {/* Habit rows */}
            {habits.map((h, hi) => {
              const rowBg = hi % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)';
              const stat = habitStats[h.id];
              return (
                <HabitRow
                  key={h.id}
                  habit={h}
                  rowBg={rowBg}
                  editingId={editingId}
                  editValue={editValue}
                  onStartEdit={() => { setEditingId(h.id); setEditValue(h.name); }}
                  onEditChange={setEditValue}
                  onEditCommit={() => { onRenameHabit(h.id, editValue.trim() || h.name); setEditingId(null); }}
                  onEditCancel={() => setEditingId(null)}
                  onSetEmoji={(em) => onSetEmoji(h.id, em)}
                  onDelete={() => onDeleteHabit(h.id)}
                  onContextMenu={(x, y) => setCtxMenu({ x, y, habitId: h.id })}
                  year={year}
                  month={month}
                  weeks={weeks}
                  cells={cells}
                  checkStyle={checkStyle}
                  onToggleCell={(day) => onToggleCell(h.id, day)}
                  showAnalysis={showAnalysis}
                  stat={stat}
                />
              );
            })}

            {/* Add habit row */}
            <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-mute)', borderTop: '1px solid var(--line)' }}>
              {adding ? (
                <form onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  const text = draft.trim();
                  if (text) onAddHabit(text);
                  setDraft(''); setAdding(false);
                }} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <span style={{ fontSize: 14 }}>✦</span>
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => { const text = draft.trim(); if (text) onAddHabit(text); setDraft(''); setAdding(false); }}
                    onKeyDown={(e) => { if (e.key === 'Escape') { setAdding(false); setDraft(''); } }}
                    placeholder="New habit name (start with emoji optional)…"
                    style={{
                      flex: 1, background: 'transparent', border: 0, outline: 'none',
                      borderBottom: '1px solid var(--accent)', padding: '2px 0',
                      color: 'var(--ink)', fontSize: 13, fontFamily: 'inherit',
                    }}
                  />
                </form>
              ) : (
                <button onClick={() => setAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-mute)', padding: 0, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                  <span style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px dashed var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, lineHeight: 1 }}>+</span>
                  Add habit
                </button>
              )}
            </div>
            <div style={{ gridColumn: `span ${totalDays}`, borderTop: '1px solid var(--line)' }} />
            {showAnalysis && <div style={{ borderTop: '1px solid var(--line)' }} />}

            {/* Footer rows */}
            {footerRows.map((row, ri) => (
              <FooterRow key={row.key} row={row} ri={ri} weeks={weeks} />
            ))}
            {/* Footer analysis spacers */}
            {footerRows.map((_, ri) => showAnalysis && (
              <div key={`fa-${ri}`} style={{ borderTop: ri === 0 ? '1px solid var(--line)' : 'none' }} />
            ))}
          </div>
        </div>
      </div>

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          onClose={() => setCtxMenu(null)}
          items={[
            {
              icon: 'copy', label: 'Duplicate habit',
              onClick: () => { onDuplicateHabit(ctxMenu.habitId); setCtxMenu(null); },
            },
            {
              icon: 'pen', label: 'Rename',
              onClick: () => {
                const habit = habits.find((h) => h.id === ctxMenu.habitId);
                setEditingId(ctxMenu.habitId);
                setEditValue(habit?.name || '');
                setCtxMenu(null);
              },
            },
            { divider: true },
            {
              icon: 'trash', label: 'Delete habit', danger: true,
              onClick: () => { onDeleteHabit(ctxMenu.habitId); setCtxMenu(null); },
            },
          ]}
        />
      )}

      <style>{`
        .habit-name-row:hover .del-habit { opacity: 1 !important; }
        .habit-name-row:hover .del-habit:hover { background: rgba(255,255,255,0.08); color: var(--ink); }
        .auth-field:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px rgba(43,212,161,0.12) !important; }
      `}</style>
    </>
  );
}

function HabitRow({ habit, rowBg, editingId, editValue, onStartEdit, onEditChange, onEditCommit, onEditCancel, onSetEmoji, onDelete, onContextMenu, year, month, weeks, cells, checkStyle, onToggleCell, showAnalysis, stat }: {
  habit: Habit; rowBg: string; editingId: string | null; editValue: string;
  onStartEdit: () => void; onEditChange: (v: string) => void; onEditCommit: () => void; onEditCancel: () => void;
  onSetEmoji: (em: string) => void; onDelete: () => void; onContextMenu: (x: number, y: number) => void;
  year: number; month: number;
  weeks: Week[]; cells: CellMap; checkStyle: CheckStyle; onToggleCell: (day: number) => void;
  showAnalysis: boolean; stat: { done: number; pct: number };
}) {
  const isEditing = editingId === habit.id;
  return (
    <>
      <div className="habit-name-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', fontSize: 13, background: rowBg, minHeight: 30, position: 'relative' }}
        onContextMenu={(e) => { e.preventDefault(); onContextMenu(e.clientX, e.clientY); }}
      >
        <EmojiButton emoji={habit.emoji} onPick={onSetEmoji} />
        {isEditing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={onEditCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onEditCommit();
              if (e.key === 'Escape') onEditCancel();
            }}
            style={{ flex: 1, background: 'transparent', border: 0, outline: 'none', borderBottom: '1px solid var(--accent)', padding: '1px 0', color: 'var(--ink)', fontSize: 13, fontFamily: 'inherit' }}
          />
        ) : (
          <span onClick={onStartEdit} style={{ flex: 1, cursor: 'text', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={habit.name}>
            {habit.name}
          </span>
        )}
        <button onClick={onDelete} className="del-habit" aria-label="delete habit" style={{
          opacity: 0, width: 18, height: 18, borderRadius: 4,
          color: 'var(--ink-mute)', fontSize: 14, lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 120ms', background: 'none', border: 'none', cursor: 'pointer',
        }}>×</button>
      </div>

      {weeks.map((wk, wi) => wk.days.map((d) => {
        const checked = !!cells?.[habit.id]?.[d.day];
        const isFuture = getCellDateRelation(year, month, d.day) === 'future';
        return (
          <div key={`c-${habit.id}-${d.day}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2, background: rowBg }}>
            <CheckCell
              checked={checked}
              color={`var(--w${wi + 1})`}
              style={checkStyle}
              disabled={isFuture}
              title={isFuture ? "You can't mark habits for future dates" : undefined}
              onClick={() => onToggleCell(d.day)}
            />
          </div>
        );
      }))}

      {showAnalysis && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px', alignItems: 'center', gap: 10, padding: '4px 16px', background: rowBg }}>
          <AnalysisBar pct={stat.pct} color={pctColor(stat.pct)} />
          <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--ink-dim)', fontWeight: 600 }}>{stat.pct.toFixed(1)}%</div>
        </div>
      )}
    </>
  );
}

function FooterRow({ row, ri, weeks }: {
  row: { key: string; label: string; val: (d: number) => string; color: (d: number) => string };
  ri: number; weeks: Week[];
}) {
  return (
    <>
      <div style={{ padding: '7px 14px', fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', borderTop: ri === 0 ? '1px solid var(--line)' : 'none' }}>
        {row.label}
      </div>
      {weeks.map((wk) => wk.days.map((d) => (
        <div key={`f-${row.key}-${d.day}`} style={{ padding: '7px 0', textAlign: 'center', fontSize: 11, color: row.color(d.day), fontWeight: 600, borderTop: ri === 0 ? '1px solid var(--line)' : 'none' }}>
          {row.val(d.day)}
        </div>
      )))}
    </>
  );
}
