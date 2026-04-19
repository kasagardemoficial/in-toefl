// Onboarding state
const ONBOARDING_KEY = 'intoefl_onboarding'

export interface OnboardingData {
  name: string
  email: string
  goal: 'study_abroad' | 'medical' | 'work' | 'immigration' | 'personal'
  dailyMinutes: 10 | 20 | 30
  currentLevel: 'zero' | 'basic' | 'intermediate' | 'advanced'
  completed: boolean
}

const defaultOnboarding: OnboardingData = {
  name: '',
  email: '',
  goal: 'study_abroad',
  dailyMinutes: 20,
  currentLevel: 'zero',
  completed: false,
}

export function getOnboarding(): OnboardingData {
  if (typeof window === 'undefined') return defaultOnboarding
  const saved = localStorage.getItem(ONBOARDING_KEY)
  if (!saved) return defaultOnboarding
  return JSON.parse(saved)
}

export function saveOnboarding(data: OnboardingData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(data))
}

export function isOnboardingDone(): boolean {
  if (typeof window === 'undefined') return false
  const data = getOnboarding()
  return data.completed
}

export const goalLabels: Record<string, string> = {
  study_abroad: 'Estudar no exterior',
  medical: 'Estágio/Residência médica',
  work: 'Trabalhar fora',
  immigration: 'Imigrar para outro país',
  personal: 'Crescimento pessoal',
}
