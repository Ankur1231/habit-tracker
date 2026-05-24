'use client';

import { monthLabel } from '@/lib/habitUtils';
import type { User } from '@/lib/types';
import UserChip from '../auth/UserChip';

interface Props {
  year: number;
  month: number;
  habitCount: number;
  completedCells: number;
  totalCells: number;
  overallPct: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  user: User;
}

export default function HeaderBar({ year, month, habitCount, completedCells, totalCells, overallPct, onPrev, onNext, onToday, user }: Props) {
  return (
    <header style={{ padding: '24px 32px 18px', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, var(--accent), #1f9a76)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px -8px rgba(43,212,161,0.55)',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 12L10 17L19 7" stroke="#06150e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '.28em', color: 'var(--ink-mute)', textTransform: 'uppercase', fontWeight: 600 }}>Habit Tracker</div>
          <h1 style={{ margin: '2px 0 0', fontSize: 30, lineHeight: 1.05, fontWeight: 600, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            {monthLabel(year, month)}
          </h1>
        </div>
      </div>

      <div style={{
        background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: 'var(--radius, 14px)',
        padding: '12px 18px',
        display: 'flex', gap: 24, alignItems: 'center',
        flexWrap: 'wrap', flex: '1 1 auto', minWidth: 380,
      }}>
        <StatBlock label="Habits" value={habitCount} />
        <StatBlock label="Completed" value={completedCells} />
        <div style={{ flex: '1 1 160px', minWidth: 140 }}>
          <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 8 }}>Progress</div>
          <div style={{ position: 'relative', height: 12, background: '#0c1426', border: '1px solid var(--line)', borderRadius: 4 }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              width: `${overallPct}%`,
              background: 'linear-gradient(90deg, var(--accent), #facc15)',
              borderRadius: 3,
              transition: 'width 600ms cubic-bezier(.2,.7,.2,1)',
            }} />
          </div>
        </div>
        <StatBlock label="In %" value={`${overallPct.toFixed(2)}%`} highlight />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <NavBtn onClick={onPrev} dir="prev" />
        <button onClick={onToday} style={{
          padding: '10px 16px', borderRadius: 10,
          background: 'var(--accent)', color: '#06150e',
          fontWeight: 700, fontSize: 12, letterSpacing: '.05em',
          whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}>This Month</button>
        <NavBtn onClick={onNext} dir="next" />
        <UserChip user={user} />
      </div>
    </header>
  );
}

function StatBlock({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.2, marginTop: 4, color: highlight ? 'var(--accent)' : 'var(--ink)' }}>{value}</div>
    </div>
  );
}

function NavBtn({ onClick, dir }: { onClick: () => void; dir: 'prev' | 'next' }) {
  return (
    <button onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 10,
      background: 'var(--panel)', border: '1px solid var(--line)',
      color: 'var(--ink-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 140ms', cursor: 'pointer',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--panel-2)'; e.currentTarget.style.color = 'var(--ink)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--panel)'; e.currentTarget.style.color = 'var(--ink-dim)'; }}
    >
      {dir === 'prev' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      )}
    </button>
  );
}
