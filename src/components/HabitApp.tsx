'use client';

import { useMemo, useEffect, useOptimistic, useTransition, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Habit, CellMap, MentalMap, TweakValues } from '@/lib/types';
import { WEEK_SCHEMES } from '@/lib/constants';
import { daysInMonth, buildWeeks, monthLabel, getCellDateRelation } from '@/lib/habitUtils';
import { usePrefs } from '@/hooks/usePrefs';
import HeaderBar from './layout/HeaderBar';
import HabitGrid from './habit/HabitGrid';
import Panel from './layout/Panel';
import AreaChart from './charts/AreaChart';
import MentalSection from './MentalSection';
import TweaksPanel from './layout/TweaksPanel';
import {
  addHabit as addHabitAction,
  renameHabit as renameHabitAction,
  setEmoji as setEmojiAction,
  deleteHabit as deleteHabitAction,
  duplicateHabit as duplicateHabitAction,
  reorderHabits as reorderHabitsAction,
} from '@/app/actions/habits';
import { toggleCell as toggleCellAction } from '@/app/actions/cells';
import { setMental as setMentalAction } from '@/app/actions/mental';

interface Props {
  year: number;
  month: number;
  habits: Habit[];
  cells: CellMap;
  mental: MentalMap;
  preferences: TweakValues;
  user: User;
}

export default function HabitApp({ year, month, habits, cells, mental, preferences, user }: Props) {
  const router = useRouter();
  const [tweaks, setTweak] = usePrefs(preferences);
  const [, transition] = useTransition();

  // URL month is 1-based (Jan=1); JS Date utilities expect 0-based (Jan=0)
  const month0 = month - 1;
  const totalDays = daysInMonth(year, month0);
  const weeks = useMemo(() => buildWeeks(year, month0), [year, month0]);

  // Apply CSS vars
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', tweaks.accent);
    root.style.setProperty('--mood', tweaks.accent);
    const scheme = WEEK_SCHEMES[tweaks.weekScheme] || WEEK_SCHEMES.rainbow;
    for (let i = 0; i < 5; i++) {
      const c = tweaks.weekScheme === 'mono' ? tweaks.accent : (scheme?.[i] || tweaks.accent);
      root.style.setProperty(`--w${i + 1}`, c);
    }
    root.style.setProperty('--radius', tweaks.radius + 'px');
    root.style.setProperty('--cell-h', tweaks.density === 'compact' ? '24px' : tweaks.density === 'comfy' ? '34px' : '28px');
    root.style.setProperty('--cell-w', tweaks.density === 'compact' ? '24px' : tweaks.density === 'comfy' ? '34px' : '28px');
  }, [tweaks.accent, tweaks.weekScheme, tweaks.radius, tweaks.density]);

  type HabitAction = { type: 'remove'; id: string } | { type: 'reorder'; orderedIds: string[] };
  const [optimisticHabits, dispatchHabit] = useOptimistic(
    habits,
    (state: Habit[], action: HabitAction) => {
      if (action.type === 'remove') return state.filter((h) => h.id !== action.id);
      const map = new Map(state.map((h) => [h.id, h]));
      return action.orderedIds.map((id) => map.get(id)).filter(Boolean) as Habit[];
    }
  );

  // Optimistic cell toggle
  const [optimisticCells, addOptimisticToggle] = useOptimistic(
    cells,
    (state: CellMap, { habitId, day }: { habitId: string; day: number }) => ({
      ...state,
      [habitId]: { ...(state[habitId] ?? {}), [day]: !state[habitId]?.[day] },
    })
  );

  function toggleCell(habitId: string, day: number) {
    const relation = getCellDateRelation(year, month, day, true);
    if (relation === 'future') return;
    if (relation === 'past') {
      if (!confirm('This date is in the past. Are you sure you want to change it?')) return;
    }

    const currentValue = !!optimisticCells[habitId]?.[day];
    startTransition(async () => {
      addOptimisticToggle({ habitId, day });
      await toggleCellAction(habitId, year, month, day, currentValue);
    });
  }

  function addHabit(text: string) {
    transition(() => addHabitAction(text));
  }

  function renameHabit(habitId: string, name: string) {
    transition(() => renameHabitAction(habitId, name));
  }

  function setEmoji(habitId: string, emoji: string) {
    transition(() => setEmojiAction(habitId, emoji));
  }

  function deleteHabit(habitId: string) {
    if (!confirm('Delete this habit?')) return;
    startTransition(async () => {
      dispatchHabit({ type: 'remove', id: habitId });
      await deleteHabitAction(habitId);
    });
  }

  function duplicateHabit(habitId: string) {
    transition(() => duplicateHabitAction(habitId));
  }

  function reorderHabits(orderedIds: string[]) {
    startTransition(async () => {
      dispatchHabit({ type: 'reorder', orderedIds });
      await reorderHabitsAction(orderedIds);
    });
  }

  function setMental(day: number, key: 'mood' | 'motivation', val: number) {
    transition(() => setMentalAction(year, month, day, key, val));
  }

  function prevMonth() {
    let y = year, m = month - 1;
    if (m < 1) { m = 12; y--; }
    router.push(`/${y}/${String(m).padStart(2, '0')}`);
  }

  function nextMonth() {
    let y = year, m = month + 1;
    if (m > 12) { m = 1; y++; }
    router.push(`/${y}/${String(m).padStart(2, '0')}`);
  }

  function toThisMonth() {
    const d = new Date();
    router.push(`/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  // Aggregates (use optimisticHabits so stats update instantly on delete)
  const habitCount = optimisticHabits.length;
  const totalCells = habitCount * totalDays;
  const completedCells = optimisticHabits.reduce((acc, h) => {
    let n = 0;
    for (let d = 1; d <= totalDays; d++) if (optimisticCells?.[h.id]?.[d]) n++;
    return acc + n;
  }, 0);
  const overallPct = totalCells ? (completedCells / totalCells) * 100 : 0;

  const dailyPct: number[] = [];
  for (let d = 1; d <= totalDays; d++) {
    let done = 0;
    optimisticHabits.forEach((h) => { if (optimisticCells?.[h.id]?.[d]) done++; });
    dailyPct.push(habitCount ? (done / habitCount) * 100 : 0);
  }

  const moodArr: number[] = [];
  const motArr: number[] = [];
  const dayLabels: string[] = [];
  for (let d = 1; d <= totalDays; d++) {
    const m = mental?.[d] || { mood: 5, motivation: 5 };
    moodArr.push(m.mood);
    motArr.push(m.motivation);
    dayLabels.push(String(d));
  }

  const weekStats = weeks.map((wk, wi) => {
    let mood = 0, mot = 0, n = 0;
    wk.days.forEach((d) => {
      const m = mental?.[d.day] || { mood: 5, motivation: 5 };
      mood += m.mood; mot += m.motivation; n++;
    });
    return { idx: wi, mood: n ? mood / n : 0, motivation: n ? mot / n : 0, moodPct: n ? (mood / n / 10) * 100 : 0, motPct: n ? (mot / n / 10) * 100 : 0 };
  });

  return (
    <div style={{ paddingBottom: 48 }}>
      <HeaderBar
        year={year} month={month0}
        habitCount={habitCount} completedCells={completedCells}
        totalCells={totalCells} overallPct={overallPct}
        onPrev={prevMonth} onNext={nextMonth} onToday={toThisMonth}
        user={user}
      />

      <div style={{ padding: '6px 32px 22px' }}>
        <HabitGrid
          habits={optimisticHabits} cells={optimisticCells}
          weeks={weeks} totalDays={totalDays}
          year={year} month={month0}
          onToggleCell={toggleCell} onAddHabit={addHabit}
          onRenameHabit={renameHabit} onSetEmoji={setEmoji}
          onDeleteHabit={deleteHabit} onDuplicateHabit={duplicateHabit}
          onReorderHabits={reorderHabits}
          showAnalysis={tweaks.showAnalysis} checkStyle={tweaks.checkStyle}
        />
      </div>

      {tweaks.showArea && (
        <div style={{ padding: '0 32px 22px' }}>
          <Panel title="Daily Completion" subtitle={`${monthLabel(year, month0)} · % of habits completed each day`}>
            <div style={{ padding: '6px 18px 14px' }}>
              <AreaChart values={dailyPct} dayLabels={dayLabels} color="var(--accent)" height={180} />
            </div>
          </Panel>
        </div>
      )}

      {tweaks.showMental && (
        <div style={{ padding: '0 32px 22px' }}>
          <MentalSection
            weeks={weeks} totalDays={totalDays} mental={mental}
            year={year} month={month0}
            mood={moodArr} motivation={motArr} dayLabels={dayLabels}
            weekStats={weekStats} showAnalysis={tweaks.showAnalysis}
            onChange={setMental}
          />
        </div>
      )}

      <div style={{ padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink-mute)', fontSize: 11.5 }}>
        <div>Click any cell to tick · click a name to rename · click the emoji to swap · right-click a habit to duplicate or delete</div>
      </div>

      <TweaksPanel tweaks={tweaks} setTweak={setTweak} />
    </div>
  );
}
