export type Specialist = {
  id: string
  name: string
  specialty: string
  hospital: string
}

const SEED_SPECIALISTS: Specialist[] = [
  { id: 'spec-1', name: 'Dr. Sarah Chen', specialty: 'Orthopedics', hospital: 'General Hospital' },
  { id: 'spec-2', name: 'Dr. James Okafor', specialty: 'Orthopedics', hospital: 'City Medical Center' },
  { id: 'spec-3', name: 'Dr. Maria Santos', specialty: 'Cardiology', hospital: 'Heart & Vascular Institute' },
  { id: 'spec-4', name: 'Dr. Ahmed Hassan', specialty: 'Neurology', hospital: 'University Hospital' },
  { id: 'spec-5', name: 'Dr. Emily Park', specialty: 'Dermatology', hospital: 'Skin & Wellness Clinic' },
  { id: 'spec-6', name: 'Dr. Robert Kim', specialty: 'General Practice', hospital: 'Community Health Clinic' },
]

class SpecialistStore {
  private specialists: Specialist[] = [...SEED_SPECIALISTS]

  getAll(): Specialist[] {
    return [...this.specialists]
  }

  getById(id: string): Specialist | undefined {
    return this.specialists.find((s) => s.id === id)
  }

  getBySpecialty(specialty: string): Specialist[] {
    const lower = specialty.toLowerCase()
    return this.specialists.filter(
      (s) =>
        s.specialty.toLowerCase().includes(lower) ||
        lower.includes(s.specialty.toLowerCase())
    )
  }

  findOrCreate(name: string, specialty: string, hospital: string): Specialist {
    const existing = this.specialists.find(
      (s) =>
        s.name.toLowerCase() === name.toLowerCase() &&
        s.specialty.toLowerCase() === specialty.toLowerCase() &&
        s.hospital.toLowerCase() === hospital.toLowerCase()
    )
    if (existing) return existing

    const newSpec: Specialist = {
      id: `spec-${Date.now()}`,
      name,
      specialty,
      hospital,
    }
    this.specialists.push(newSpec)
    return newSpec
  }
}

export const specialistStore = new SpecialistStore()
