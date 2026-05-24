import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getProfile,
  getHabitsForMonth,
  getCompletionsForMonth,
  getMentalLogsForMonth,
  profileToPrefs,
} from '@/lib/db/queries'
import HabitApp from '@/components/HabitApp'
import type { CellMap, MentalMap, Habit } from '@/lib/types'
import { TWEAK_DEFAULTS } from '@/lib/constants'

interface Props {
  params: Promise<{ year: string; month: string }>
}

export default async function MonthPage({ params }: Props) {
  const { year: yearStr, month: monthStr } = await params
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    redirect('/')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, dbHabits, completions, mentalLogs] = await Promise.all([
    getProfile(),
    getHabitsForMonth(year, month),
    getCompletionsForMonth(year, month),
    getMentalLogsForMonth(year, month),
  ])

  const habits: Habit[] = dbHabits.map((h) => ({
    id: h.id,
    emoji: h.emoji,
    name: h.name,
  }))

  const cells: CellMap = {}
  for (const h of habits) cells[h.id] = {}
  for (const c of completions) {
    const day = new Date(c.done_on + 'T00:00:00').getDate()
    if (!cells[c.habit_id]) cells[c.habit_id] = {}
    cells[c.habit_id][day] = true
  }

  const mental: MentalMap = {}
  for (const log of mentalLogs) {
    const day = new Date(log.logged_on + 'T00:00:00').getDate()
    mental[day] = { mood: log.mood, motivation: log.motivation }
  }

  const preferences = profile ? profileToPrefs(profile) : TWEAK_DEFAULTS

  const serverUser = { id: user.id, email: user.email ?? '', name: profile?.name ?? '' }

  return (
    <HabitApp
      year={year}
      month={month}
      habits={habits}
      cells={cells}
      mental={mental}
      preferences={preferences}
      user={serverUser}
    />
  )
}
