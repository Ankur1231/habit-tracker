'use client';

import { useState, useCallback, useTransition } from 'react';
import type { TweakValues } from '@/lib/types';
import { updatePreferences } from '@/app/actions/preferences';

export function usePrefs(initial: TweakValues) {
  const [values, setValues] = useState<TweakValues>(initial);
  const [, startTransition] = useTransition();

  const setTweak = useCallback(<K extends keyof TweakValues>(key: K, val: TweakValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    startTransition(() => updatePreferences({ [key]: val }));
  }, []);

  return [values, setTweak] as const;
}
