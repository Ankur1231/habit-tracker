'use client';

import { useState, useEffect } from 'react';
import type { User, Habit, CellMap, MentalMap, TweakValues, JobColumn, Job } from '@/lib/types';
import Sidebar from './layout/Sidebar';
import HabitApp from './HabitApp';
import JobTracker from './jobs/JobTracker';

type View = 'habit' | 'job';

interface Props {
  year: number;
  month: number;
  habits: Habit[];
  cells: CellMap;
  mental: MentalMap;
  preferences: TweakValues;
  user: User;
  columns: JobColumn[];
  jobs: Job[];
}

export default function AppShell(props: Props) {
  const { user, columns, jobs } = props;

  const [view, setView] = useState<View>(() => {
    if (typeof window === 'undefined') return 'habit';
    return (localStorage.getItem(`ht:view:${user.id}`) as View) ?? 'habit';
  });

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(`ht:sidebar-collapsed:${user.id}`) !== '0';
  });

  // Persist view and sidebar state
  useEffect(() => {
    try { localStorage.setItem(`ht:view:${user.id}`, view); } catch { /* */ }
  }, [view, user.id]);

  useEffect(() => {
    try { localStorage.setItem(`ht:sidebar-collapsed:${user.id}`, collapsed ? '1' : '0'); } catch { /* */ }
  }, [collapsed, user.id]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar
        view={view}
        onView={setView}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />
      <div style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        {view === 'habit' ? (
          <HabitApp {...props} />
        ) : (
          <JobTracker user={user} columns={columns} jobs={jobs} />
        )}
      </div>
    </div>
  );
}
