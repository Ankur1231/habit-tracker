import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { TweakValues } from '@/lib/types'
import { TWEAK_DEFAULTS } from '@/lib/constants'

export interface DbHabit {
  id: string
  emoji: string
  name: string
  sort_order: number
}

export interface DbCompletion {
  habit_id: string
  done_on: string
}

export interface DbMentalLog {
  logged_on: string
  mood: number
  motivation: number
}

export interface DbProfile {
  id: string
  name: string
  accent: string
  week_scheme: string
  density: string
  check_style: string
  show_mental: boolean
  show_analysis: boolean
  show_area: boolean
  radius: number
}

export async function getProfile(): Promise<DbProfile | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').single()
  return data
}

export function profileToPrefs(profile: DbProfile): TweakValues {
  return {
    accent: profile.accent ?? TWEAK_DEFAULTS.accent,
    weekScheme: (profile.week_scheme as TweakValues['weekScheme']) ?? TWEAK_DEFAULTS.weekScheme,
    density: (profile.density as TweakValues['density']) ?? TWEAK_DEFAULTS.density,
    checkStyle: (profile.check_style as TweakValues['checkStyle']) ?? TWEAK_DEFAULTS.checkStyle,
    showMental: profile.show_mental ?? TWEAK_DEFAULTS.showMental,
    showAnalysis: profile.show_analysis ?? TWEAK_DEFAULTS.showAnalysis,
    showArea: profile.show_area ?? TWEAK_DEFAULTS.showArea,
    radius: profile.radius ?? TWEAK_DEFAULTS.radius,
  }
}

// Returns habits visible in the given year/month:
// created_at <= last day of month AND (archived_at IS NULL OR archived_at > last day of month)
// Using > lastDay (not >= firstDay) ensures a habit deleted mid-month disappears immediately,
// while still appearing in past months' views where lastDay is before the archive date.
export async function getHabitsForMonth(year: number, month: number): Promise<DbHabit[]> {
  const supabase = await createClient()
  const lastDay = new Date(year, month, 0).toISOString().slice(0, 10) // month is 1-based here

  const { data, error } = await supabase
    .from('habits')
    .select('id, emoji, name, sort_order')
    .lte('created_at', lastDay + 'T23:59:59Z')
    .or(`archived_at.is.null,archived_at.gt.${lastDay}`)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getCompletionsForMonth(year: number, month: number): Promise<DbCompletion[]> {
  const supabase = await createClient()
  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('habit_completions')
    .select('habit_id, done_on')
    .gte('done_on', firstDay)
    .lte('done_on', lastDay)

  if (error) throw error
  return data ?? []
}

export async function getMentalLogsForMonth(year: number, month: number): Promise<DbMentalLog[]> {
  const supabase = await createClient()
  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('mental_logs')
    .select('logged_on, mood, motivation')
    .gte('logged_on', firstDay)
    .lte('logged_on', lastDay)

  if (error) throw error
  return data ?? []
}
