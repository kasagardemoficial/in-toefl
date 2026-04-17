// Weekly Review System
const WEEKLY_KEY = 'intoefl_weekly_data'
const HISTORY_KEY = 'intoefl_weekly_history'

export interface WeeklyData {
  weekStart: string // ISO Monday date
  daysStudied: number
  exercisesDone: number
  wordsLearned: number
  xpEarned: number
  minutesStudied: number
  levelsGained: number
}

export interface WeeklyHistory {
  weeks: WeeklyData[]
}

export function getCurrentWeekData(): WeeklyData {
  if (typeof window === 'undefined') return emptyWeek()
  const saved = localStorage.getItem(WEEKLY_KEY)
  if (!saved) return emptyWeek()
  const data: WeeklyData = JSON.parse(saved)

  // Check if it's a new week
  const currentMonday = getMonday()
  if (data.weekStart !== currentMonday) {
    // Save old week to history
    saveWeekToHistory(data)
    // Start new week
    const newWeek = emptyWeek()
    localStorage.setItem(WEEKLY_KEY, JSON.stringify(newWeek))
    return newWeek
  }

  return data
}

export function updateWeeklyData(updates: Partial<WeeklyData>): void {
  if (typeof window === 'undefined') return
  const current = getCurrentWeekData()
  const updated = { ...current, ...updates }
  localStorage.setItem(WEEKLY_KEY, JSON.stringify(updated))
}

export function recordDailyActivity(exercisesDone: number, xpEarned: number): void {
  const current = getCurrentWeekData()
  const today = new Date().toISOString().split('T')[0]

  // Check if already counted today
  const studyDaysKey = 'intoefl_study_days'
  const studyDays: string[] = JSON.parse(localStorage.getItem(studyDaysKey) || '[]')

  if (!studyDays.includes(today)) {
    studyDays.push(today)
    localStorage.setItem(studyDaysKey, JSON.stringify(studyDays))
    current.daysStudied += 1
  }

  current.exercisesDone += exercisesDone
  current.xpEarned += xpEarned
  localStorage.setItem(WEEKLY_KEY, JSON.stringify(current))
}

export function getStudyDaysThisWeek(): number[] {
  if (typeof window === 'undefined') return []
  const studyDays: string[] = JSON.parse(localStorage.getItem('intoefl_study_days') || '[]')
  const monday = getMonday()
  const mondayDate = new Date(monday)

  // Get day indices (0=Mon, 1=Tue, ..., 6=Sun) for this week
  const dayIndices: number[] = []
  for (const dateStr of studyDays) {
    const date = new Date(dateStr)
    const diff = Math.floor((date.getTime() - mondayDate.getTime()) / (1000 * 60 * 60 * 24))
    if (diff >= 0 && diff <= 6) {
      dayIndices.push(diff)
    }
  }
  return dayIndices
}

export function getWeeklyHistory(): WeeklyHistory {
  if (typeof window === 'undefined') return { weeks: [] }
  const saved = localStorage.getItem(HISTORY_KEY)
  if (!saved) return { weeks: [] }
  return JSON.parse(saved)
}

export function getLastWeekData(): WeeklyData | null {
  const history = getWeeklyHistory()
  if (history.weeks.length === 0) return null
  return history.weeks[history.weeks.length - 1]
}

export function getWeeklyComparison(): { message: string; positive: boolean } {
  const current = getCurrentWeekData()
  const lastWeek = getLastWeekData()

  if (!lastWeek) {
    return { message: 'Primeira semana! Vamos com tudo! 🚀', positive: true }
  }

  const xpDiff = current.xpEarned - lastWeek.xpEarned
  const daysDiff = current.daysStudied - lastWeek.daysStudied

  if (xpDiff > 0) {
    const pct = Math.round((xpDiff / Math.max(lastWeek.xpEarned, 1)) * 100)
    return { message: `${pct}% mais XP que semana passada! 📈`, positive: true }
  } else if (daysDiff < 0) {
    return { message: `${Math.abs(daysDiff)} dias a menos que semana passada — vamos recuperar? 💪`, positive: false }
  } else {
    return { message: 'Mantendo o ritmo! Continue assim! ⭐', positive: true }
  }
}

export function isSunday(): boolean {
  return new Date().getDay() === 0
}

function emptyWeek(): WeeklyData {
  return {
    weekStart: getMonday(),
    daysStudied: 0,
    exercisesDone: 0,
    wordsLearned: 0,
    xpEarned: 0,
    minutesStudied: 0,
    levelsGained: 0,
  }
}

function getMonday(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.getFullYear(), now.getMonth(), diff)
  return monday.toISOString().split('T')[0]
}

function saveWeekToHistory(week: WeeklyData): void {
  const history = getWeeklyHistory()
  history.weeks.push(week)
  // Keep only last 12 weeks
  if (history.weeks.length > 12) {
    history.weeks = history.weeks.slice(-12)
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}
