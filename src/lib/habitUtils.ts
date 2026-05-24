import type { Habit, MonthData, CellMap, MentalMap, Week } from './types';
import { DEFAULT_HABITS } from './constants';

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function dowOf(year: number, month: number, day: number): number {
  return new Date(year, month, day).getDay();
}

export function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export type CellDateRelation = 'past' | 'today' | 'future';

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** month is 0-based (JS Date style) when monthIsOneBased is false, else 1-based (URL / API style). */
export function getCellDateRelation(
  year: number,
  month: number,
  day: number,
  monthIsOneBased = false
): CellDateRelation {
  const cell = new Date(year, monthIsOneBased ? month - 1 : month, day);
  cell.setHours(0, 0, 0, 0);
  const today = startOfToday();
  if (cell > today) return 'future';
  if (cell < today) return 'past';
  return 'today';
}

export function buildWeeks(year: number, month: number): Week[] {
  const total = daysInMonth(year, month);
  const weeks: Week[] = [];
  for (let start = 1; start <= total; start += 7) {
    const days = [];
    for (let d = start; d < start + 7 && d <= total; d++) {
      days.push({ day: d, dow: dowOf(year, month, d) });
    }
    weeks.push({ index: weeks.length, days });
  }
  return weeks;
}

export function seedCells(habits: Habit[], year: number, month: number): CellMap {
  const total = daysInMonth(year, month);
  const cells: CellMap = {};
  habits.forEach((h, hi) => {
    cells[h.id] = {};
    for (let d = 1; d <= total; d++) {
      const r = Math.abs(Math.sin((hi + 1) * 17 + d * 7.3 + month) * 1000) % 1;
      cells[h.id][d] = r < 0.62;
    }
  });
  return cells;
}

export function seedMental(year: number, month: number): MentalMap {
  const total = daysInMonth(year, month);
  const out: MentalMap = {};
  for (let d = 1; d <= total; d++) {
    const mood = 5 + Math.round(Math.sin(d * 0.7 + month) * 3 + Math.cos(d * 0.4) * 1.5);
    const mot = 5 + Math.round(Math.cos(d * 0.6 + month) * 3 + Math.sin(d * 0.3) * 1.5);
    out[d] = {
      mood: Math.max(1, Math.min(10, mood)),
      motivation: Math.max(1, Math.min(10, mot)),
    };
  }
  return out;
}

export function makeDefaultMonth(year: number, month: number): MonthData {
  const habits = DEFAULT_HABITS.map((h) => ({ ...h }));
  return {
    habits,
    cells: seedCells(habits, year, month),
    mental: seedMental(year, month),
  };
}

export function pctColor(pct: number): string {
  if (pct >= 80) return '#22c55e';
  if (pct >= 60) return '#2bd4a1';
  if (pct >= 40) return '#facc15';
  if (pct >= 20) return '#fb923c';
  return '#ef4d6c';
}

export function parseHabitInput(text: string): { emoji: string; name: string } {
  const trimmed = text.trim();
  const match = trimmed.match(
    /^(\p{Extended_Pictographic}(?:‍\p{Extended_Pictographic})*(?:️)?)\s+(.+)$/u
  );
  if (match) return { emoji: match[1], name: match[2] };
  return { emoji: '✨', name: trimmed };
}
