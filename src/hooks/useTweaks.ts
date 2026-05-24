'use client';

import { useState, useCallback } from 'react';
import type { TweakValues } from '@/lib/types';
import { TWEAK_DEFAULTS } from '@/lib/constants';

export function useTweaks() {
  const [values, setValues] = useState<TweakValues>(TWEAK_DEFAULTS);

  const setTweak = useCallback(<K extends keyof TweakValues>(key: K, val: TweakValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  return [values, setTweak] as const;
}
