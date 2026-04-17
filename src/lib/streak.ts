// Streak protection system
const STREAK_FREEZE_KEY = 'intoefl_streak_freeze'

export interface StreakFreezeData {
  freezesAvailable: number
  freezeUsedThisWeek: boolean
  lastFreezeReset: string // ISO date of last Monday
  freezeUsedDate?: string
}

function getMonday(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

export function getStreakFreeze(): StreakFreezeData {
  if (typeof window === 'undefined') return { freezesAvailable: 1, freezeUsedThisWeek: false, lastFreezeReset: getMonday() }

  const saved = localStorage.getItem(STREAK_FREEZE_KEY)
  if (!saved) {
    const initial: StreakFreezeData = { freezesAvailable: 1, freezeUsedThisWeek: false, lastFreezeReset: getMonday() }
    localStorage.setItem(STREAK_FREEZE_KEY, JSON.stringify(initial))
    return initial
  }

  const data: StreakFreezeData = JSON.parse(saved)

  // Reset freeze every Monday
  const currentMonday = getMonday()
  if (data.lastFreezeReset !== currentMonday) {
    data.freezesAvailable = 1
    data.freezeUsedThisWeek = false
    data.lastFreezeReset = currentMonday
    localStorage.setItem(STREAK_FREEZE_KEY, JSON.stringify(data))
  }

  return data
}

export function useStreakFreeze(): boolean {
  const data = getStreakFreeze()
  if (data.freezesAvailable <= 0 || data.freezeUsedThisWeek) return false

  data.freezesAvailable = 0
  data.freezeUsedThisWeek = true
  data.freezeUsedDate = new Date().toISOString().split('T')[0]
  localStorage.setItem(STREAK_FREEZE_KEY, JSON.stringify(data))
  return true
}

export function checkAndAutoFreeze(lastActiveDate: string, streak: number): { froze: boolean; message: string } {
  if (typeof window === 'undefined') return { froze: false, message: '' }

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0]

  // If last active was yesterday or today, no need to freeze
  if (lastActiveDate === today || lastActiveDate === yesterday) {
    return { froze: false, message: '' }
  }

  // If last active was 2 days ago and streak > 0, try to freeze
  if (lastActiveDate === twoDaysAgo && streak > 0) {
    const freezeData = getStreakFreeze()
    if (freezeData.freezesAvailable > 0 && !freezeData.freezeUsedThisWeek) {
      const used = useStreakFreeze()
      if (used) {
        return {
          froze: true,
          message: `🧊 Freeze usado! Seu streak de ${streak} dias foi salvo. Você tem 0 freezes restantes esta semana.`
        }
      }
    }
  }

  return { froze: false, message: '' }
}
