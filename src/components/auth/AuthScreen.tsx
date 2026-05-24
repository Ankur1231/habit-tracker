'use client';

import { useState, useActionState } from 'react';
import { signIn, signUp } from '@/app/actions/auth';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');

  const [signInState, signInAction, signInPending] = useActionState(signIn, null);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, null);

  const pending = signInPending || signUpPending;
  const error = mode === 'signin' ? signInState?.error : signUpState?.error;
  const action = mode === 'signin' ? signInAction : signUpAction;

  function switchMode(m: Mode) {
    setMode(m);
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background:
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(43,212,161,0.12), transparent 60%),' +
          'radial-gradient(ellipse 60% 40% at 80% 100%, rgba(90,167,255,0.10), transparent 60%),' +
          'radial-gradient(ellipse 50% 40% at 10% 80%, rgba(244,114,182,0.08), transparent 60%)',
      }} />
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4, zIndex: 0,
        background: 'linear-gradient(90deg, #8b5cf6 0%, #5aa7ff 25%, #2bd4a1 50%, #f472b6 75%, #4ade80 100%)',
        opacity: 0.5,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: 'min(420px, 100%)',
        background: 'rgba(17, 26, 46, 0.85)',
        border: '1px solid var(--line)',
        borderRadius: 18,
        padding: 32,
        boxShadow: '0 30px 80px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02) inset',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
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
            <div style={{ fontSize: 10, letterSpacing: '.28em', color: 'var(--ink-mute)', textTransform: 'uppercase', fontWeight: 600 }}>
              Habit Tracker
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.01em', marginTop: 2 }}>
              {mode === 'signin' ? 'Welcome back.' : 'Start your streak.'}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', background: '#0c1426',
          border: '1px solid var(--line)', borderRadius: 10,
          padding: 3, marginBottom: 18,
        }}>
          {(['signin', 'signup'] as const).map((m) => (
            <button key={m} onClick={() => switchMode(m)} style={{
              flex: 1, padding: '8px 0', fontSize: 12.5, fontWeight: 600,
              borderRadius: 7, transition: 'all 160ms',
              background: mode === m ? 'var(--accent)' : 'transparent',
              color: mode === m ? '#0a0f1a' : 'var(--ink-dim)',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {m === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'signup' && (
            <Field label="Name" name="name" type="text" placeholder="Alex Doe" autoFocus />
          )}
          <Field label="Email" name="email" type="email"
            placeholder="you@example.com" autoFocus={mode === 'signin'} />
          <Field label="Password" name="password" type="password"
            placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'} />

          {error && (
            <div style={{
              fontSize: 12, color: '#ef4d6c',
              background: 'rgba(239,77,108,0.08)', border: '1px solid rgba(239,77,108,0.25)',
              padding: '8px 10px', borderRadius: 8,
            }}>{error}</div>
          )}

          <button type="submit" disabled={pending} style={{
            marginTop: 4, padding: '12px 14px', borderRadius: 10,
            background: 'var(--accent)', color: '#06150e',
            fontWeight: 700, fontSize: 13, letterSpacing: '.04em',
            opacity: pending ? 0.6 : 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {pending ? 'Please wait…' : mode === 'signin' ? 'Sign in →' : 'Create account →'}
          </button>
        </form>

        <div style={{
          marginTop: 16, fontSize: 11.5, color: 'var(--ink-mute)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
        }}>
          <span>
            {mode === 'signin' ? "Don't have an account?" : 'Already have one?'}{' '}
            <button onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              style={{ color: 'var(--accent)', fontWeight: 600, padding: 0, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11.5 }}>
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </span>
        </div>

        <div style={{
          marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--line)',
          fontSize: 10.5, color: 'var(--ink-mute)', textAlign: 'center', lineHeight: 1.5,
        }}>
          Backed by Supabase. Your data is private and secure.
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type, placeholder, autoFocus }: {
  label: string; name: string; type: string; placeholder?: string; autoFocus?: boolean;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 600 }}>
        {label}
      </span>
      <input
        autoFocus={autoFocus}
        type={type}
        name={name}
        placeholder={placeholder}
        className="auth-field"
        style={{
          background: '#0a1224', border: '1px solid var(--line)',
          color: 'var(--ink)', fontSize: 13.5,
          padding: '10px 12px', borderRadius: 9, outline: 'none',
          transition: 'border-color 140ms, box-shadow 140ms',
          fontFamily: 'inherit',
        }}
      />
    </label>
  );
}
