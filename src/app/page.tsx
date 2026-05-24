import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const d = new Date()
  redirect(`/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`)
}
