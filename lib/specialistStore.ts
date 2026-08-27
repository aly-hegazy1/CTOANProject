import { supabase } from './supabaseClient'

export type Specialist = {
  id: string
  name: string
  specialty: string
  hospital: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSpecialist(row: any): Specialist {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    hospital: row.hospital,
  }
}

class SpecialistStore {
  async getAll(): Promise<Specialist[]> {
    const { data, error } = await supabase.from('specialists').select('*')
    if (error) throw error
    return (data ?? []).map(toSpecialist)
  }

  async getById(id: string): Promise<Specialist | undefined> {
    const { data, error } = await supabase
      .from('specialists')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return undefined
    return toSpecialist(data)
  }

  async getBySpecialty(specialty: string): Promise<Specialist[]> {
    const { data, error } = await supabase
      .from('specialists')
      .select('*')
      .ilike('specialty', `%${specialty}%`)
    if (error) throw error
    return (data ?? []).map(toSpecialist)
  }

  async findOrCreate(name: string, specialty: string, hospital: string): Promise<Specialist> {
    const { data: existing } = await supabase
      .from('specialists')
      .select('*')
      .ilike('name', name)
      .ilike('specialty', specialty)
      .ilike('hospital', hospital)
      .maybeSingle()

    if (existing) return toSpecialist(existing)

    const id = `spec-${Date.now()}`
    const { data: created, error } = await supabase
      .from('specialists')
      .insert({ id, name, specialty, hospital })
      .select()
      .single()
    if (error) throw error
    return toSpecialist(created)
  }
}

export const specialistStore = new SpecialistStore()
