'use client';

type View = 'habit' | 'job';

interface Props {
  view: View;
  onView: (v: View) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const items: { key: View; label: string; icon: React.ReactNode }[] = [
  {
    key: 'habit',
    label: 'Habit',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M5 12L10 17L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'job',
    label: 'Job',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 12h18" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
];

export default function Sidebar({ view, onView, collapsed, onToggle }: Props) {
  const width = collapsed ? 64 : 220;

  return (
    <aside
      style={{
        width,
        flexShrink: 0,
        background: 'var(--bg-2)',
        borderRight: '1px solid var(--line)',
        transition: 'width 220ms cubic-bezier(.2,.7,.2,1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 10,
      }}
    >
      {/* Brand + toggle */}
      <div
        style={{
          padding: collapsed ? '18px 0 14px' : '18px 16px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--line)',
          gap: 10,
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg, var(--accent), #1f9a76)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12L10 17L19 7" stroke="#06150e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, letterSpacing: '-0.01em', fontSize: 15 }}>Tracker</span>
          </div>
        )}
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
          style={{
            width: 30, height: 30, borderRadius: 8,
            border: '1px solid var(--line)',
            color: 'var(--ink-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 220ms' }}
          >
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(it => {
          const active = view === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onView(it.key)}
              title={collapsed ? it.label : ''}
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'center',
                gap: 12,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 10,
                color: active ? 'var(--accent)' : 'var(--ink-dim)',
                background: active ? 'rgba(43,212,161,0.08)' : 'transparent',
                fontWeight: 600, fontSize: 13.5,
                transition: 'background 140ms, color 140ms',
                width: '100%',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              {active && (
                <span
                  style={{
                    position: 'absolute', left: 0, top: 8, bottom: 8, width: 3,
                    background: 'var(--accent)', borderRadius: 2,
                  }}
                />
              )}
              <span style={{ display: 'flex' }}>{it.icon}</span>
              {!collapsed && <span>{it.label}</span>}
            </button>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {!collapsed && (
        <div
          style={{
            padding: '14px 16px',
            fontSize: 10, letterSpacing: '.16em',
            color: 'var(--ink-mute)', textTransform: 'uppercase',
            borderTop: '1px solid var(--line)',
          }}
        >
          v1 · {view === 'habit' ? 'Habit view' : 'Job view'}
        </div>
      )}
    </aside>
  );
}
