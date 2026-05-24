'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import type { User } from '@/lib/types';
import { signOut } from '@/app/actions/auth';

interface Props {
  user: User;
}

export default function UserChip({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const initials = (user.name || user.email || 'U')
    .trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  function handleSignOut() {
    setOpen(false);
    startTransition(() => signOut());
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen((o) => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 10px 6px 6px',
        background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: 999, color: 'var(--ink)',
        transition: 'background 140ms', cursor: 'pointer', fontFamily: 'inherit',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), #1f9a76)',
          color: '#06150e', fontWeight: 700, fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          letterSpacing: '.04em',
        }}>{initials}</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{user.name}</span>
          <span style={{ fontSize: 10, color: 'var(--ink-mute)' }}>{user.email}</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ marginLeft: 2, marginRight: 4, color: 'var(--ink-mute)', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 160ms' }}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div role="menu" style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 200, zIndex: 50,
          background: '#101a30', border: '1px solid var(--line-2)', borderRadius: 10, padding: 4,
          boxShadow: '0 16px 40px -10px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02) inset',
        }}>
          <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{user.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>{user.email}</div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={pending}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '9px 12px', marginTop: 4,
              fontSize: 12.5, color: '#ef4d6c', borderRadius: 6, textAlign: 'left',
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              opacity: pending ? 0.6 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,77,108,0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M9.5 11.5l3-3.5-3-3.5M12.5 8H6M9 13H4a1 1 0 01-1-1V4a1 1 0 011-1h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {pending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
