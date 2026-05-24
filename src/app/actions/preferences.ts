'use server'

import { createClient } from '@/lib/supabase/server'
import type { TweakValues } from '@/lib/types'

export async function updatePreferences(prefs: Partial<TweakValues>): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const update: Record<string, unknown> = {}
  if (prefs.accent !== undefined) update.accent = prefs.accent
  if (prefs.weekScheme !== undefined) update.week_scheme = prefs.weekScheme
  if (prefs.density !== undefined) update.density = prefs.density
  if (prefs.checkStyle !== undefined) update.check_style = prefs.checkStyle
  if (prefs.showMental !== undefined) update.show_mental = prefs.showMental
  if (prefs.showAnalysis !== undefined) update.show_analysis = prefs.showAnalysis
  if (prefs.showArea !== undefined) update.show_area = prefs.showArea
  if (prefs.radius !== undefined) update.radius = prefs.radius

  if (Object.keys(update).length > 0) {
    await supabase.from('profiles').update(update).eq('id', user.id)
  }
  // No refresh() — preferences update CSS vars client-side instantly
}
