// Advanced Gamification System — Hearts, Combos, Leagues, Daily Challenge

const HEARTS_KEY = 'intoefl_hearts'
const COMBO_KEY = 'intoefl_combo'
const LEAGUE_KEY = 'intoefl_league'
const DAILY_KEY = 'intoefl_daily_challenge'

// === HEARTS (Lives) ===
export interface HeartsData {
  hearts: number
  maxHearts: number
  lastRefill: string
}

export function getHearts(): HeartsData {
  if (typeof window === 'undefined') return { hearts: 5, maxHearts: 5, lastRefill: '' }
  const saved = localStorage.getItem(HEARTS_KEY)
  if (!saved) return { hearts: 5, maxHearts: 5, lastRefill: new Date().toISOString() }
  const data: HeartsData = JSON.parse(saved)

  // Refill hearts every 4 hours
  const lastRefill = new Date(data.lastRefill)
  const now = new Date()
  const hoursPassed = (now.getTime() - lastRefill.getTime()) / (1000 * 60 * 60)
  if (hoursPassed >= 4 && data.hearts < data.maxHearts) {
    data.hearts = Math.min(data.maxHearts, data.hearts + Math.floor(hoursPassed / 4))
    data.lastRefill = now.toISOString()
    localStorage.setItem(HEARTS_KEY, JSON.stringify(data))
  }

  return data
}

export function loseHeart(): number {
  const data = getHearts()
  data.hearts = Math.max(0, data.hearts - 1)
  localStorage.setItem(HEARTS_KEY, JSON.stringify(data))
  return data.hearts
}

export function refillHearts(): void {
  const data = getHearts()
  data.hearts = data.maxHearts
  data.lastRefill = new Date().toISOString()
  localStorage.setItem(HEARTS_KEY, JSON.stringify(data))
}

// === COMBO (Streak multiplier) ===
export interface ComboData {
  current: number
  best: number
  multiplier: number
}

export function getCombo(): ComboData {
  if (typeof window === 'undefined') return { current: 0, best: 0, multiplier: 1 }
  const saved = localStorage.getItem(COMBO_KEY)
  if (!saved) return { current: 0, best: 0, multiplier: 1 }
  return JSON.parse(saved)
}

export function addCombo(): ComboData {
  const data = getCombo()
  data.current += 1
  if (data.current > data.best) data.best = data.current

  // Multiplier tiers
  if (data.current >= 20) data.multiplier = 4
  else if (data.current >= 10) data.multiplier = 3
  else if (data.current >= 5) data.multiplier = 2
  else data.multiplier = 1

  localStorage.setItem(COMBO_KEY, JSON.stringify(data))
  return data
}

export function resetCombo(): ComboData {
  const data = getCombo()
  data.current = 0
  data.multiplier = 1
  localStorage.setItem(COMBO_KEY, JSON.stringify(data))
  return data
}

// === LEAGUES ===
export interface LeagueData {
  league: string
  weeklyXP: number
  weekStart: string
  icon: string
  color: string
  nextLeague: string
  xpToNext: number
}

const LEAGUES = [
  { name: 'Bronze', icon: '🥉', color: '#CD7F32', minXP: 0 },
  { name: 'Prata', icon: '🥈', color: '#C0C0C0', minXP: 200 },
  { name: 'Ouro', icon: '🥇', color: '#FFD700', minXP: 500 },
  { name: 'Diamante', icon: '💎', color: '#00BCD4', minXP: 1000 },
  { name: 'Mestre', icon: '👑', color: '#9C27B0', minXP: 2000 },
  { name: 'Lenda', icon: '🏆', color: '#FF6F00', minXP: 5000 },
]

export function getLeague(): LeagueData {
  if (typeof window === 'undefined') return { league: 'Bronze', weeklyXP: 0, weekStart: '', icon: '🥉', color: '#CD7F32', nextLeague: 'Prata', xpToNext: 200 }

  const saved = localStorage.getItem(LEAGUE_KEY)
  let data = saved ? JSON.parse(saved) : { weeklyXP: 0, weekStart: '' }

  // Check if new week
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.getFullYear(), now.getMonth(), diff).toISOString().split('T')[0]

  if (data.weekStart !== monday) {
    data.weeklyXP = 0
    data.weekStart = monday
    localStorage.setItem(LEAGUE_KEY, JSON.stringify(data))
  }

  // Determine league
  let currentLeague = LEAGUES[0]
  let nextLeague = LEAGUES[1]
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (data.weeklyXP >= LEAGUES[i].minXP) {
      currentLeague = LEAGUES[i]
      nextLeague = LEAGUES[i + 1] || LEAGUES[i]
      break
    }
  }

  return {
    league: currentLeague.name,
    weeklyXP: data.weeklyXP,
    weekStart: data.weekStart,
    icon: currentLeague.icon,
    color: currentLeague.color,
    nextLeague: nextLeague.name,
    xpToNext: nextLeague.minXP - data.weeklyXP,
  }
}

export function addLeagueXP(amount: number): LeagueData {
  const saved = localStorage.getItem(LEAGUE_KEY)
  const data = saved ? JSON.parse(saved) : { weeklyXP: 0, weekStart: '' }
  data.weeklyXP += amount
  localStorage.setItem(LEAGUE_KEY, JSON.stringify(data))
  return getLeague()
}

// === DAILY CHALLENGE ===
export interface DailyChallenge {
  date: string
  completed: boolean
  type: 'speed' | 'perfect' | 'endurance'
  description: string
  goal: number
  progress: number
  reward: number
}

export function getDailyChallenge(): DailyChallenge {
  if (typeof window === 'undefined') return { date: '', completed: false, type: 'speed', description: '', goal: 0, progress: 0, reward: 0 }

  const today = new Date().toISOString().split('T')[0]
  const saved = localStorage.getItem(DAILY_KEY)

  if (saved) {
    const data: DailyChallenge = JSON.parse(saved)
    if (data.date === today) return data
  }

  // Generate new daily challenge
  const challenges = [
    { type: 'speed' as const, description: 'Responda 10 questões em menos de 5 minutos', goal: 10, reward: 100 },
    { type: 'perfect' as const, description: 'Acerte 5 questões seguidas sem errar', goal: 5, reward: 150 },
    { type: 'endurance' as const, description: 'Complete 20 exercícios hoje', goal: 20, reward: 200 },
    { type: 'speed' as const, description: 'Complete 3 lições em uma sessão', goal: 3, reward: 120 },
    { type: 'perfect' as const, description: 'Acerte 100% em uma lição', goal: 1, reward: 100 },
    { type: 'endurance' as const, description: 'Estude 3 habilidades diferentes hoje', goal: 3, reward: 150 },
  ]

  // Use date as seed for consistent daily challenge
  const dayNum = Math.floor(new Date(today).getTime() / 86400000)
  const challenge = challenges[dayNum % challenges.length]

  const daily: DailyChallenge = {
    date: today,
    completed: false,
    ...challenge,
    progress: 0,
  }

  localStorage.setItem(DAILY_KEY, JSON.stringify(daily))
  return daily
}

export function updateDailyProgress(amount: number): DailyChallenge {
  const daily = getDailyChallenge()
  daily.progress += amount
  if (daily.progress >= daily.goal && !daily.completed) {
    daily.completed = true
  }
  localStorage.setItem(DAILY_KEY, JSON.stringify(daily))
  return daily
}
