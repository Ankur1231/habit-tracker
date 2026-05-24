'use client';

import { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}

export default function Panel({ title, subtitle, children, action }: Props) {
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius, 16px)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 22px 12px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 4, letterSpacing: '.06em', textTransform: 'uppercase' }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
