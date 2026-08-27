import { supabase } from '@/lib/supabaseClient'

export default async function Home() {
  const { data, error } = await supabase.from('patients').select('*')
  console.log('DATA:', data, 'ERROR:', error)
  return <div>Check your terminal for DATA/ERROR output</div>
}