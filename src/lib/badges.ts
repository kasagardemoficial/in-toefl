// Badge system for In-TOEFL
const BADGES_KEY = 'intoefl_badges'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  condition: string
  earned: boolean
  earnedDate?: string
}

export const allBadges: Badge[] = [
  // Streak badges
  { id: 'streak_3', name: 'Consistente', description: '3 dias seguidos de estudo', icon: '🔥', condition: 'streak >= 3', earned: false },
  { id: 'streak_7', name: 'Uma Semana!', description: '7 dias seguidos de estudo', icon: '⭐', condition: 'streak >= 7', earned: false },
  { id: 'streak_14', name: 'Duas Semanas!', description: '14 dias seguidos', icon: '🌟', condition: 'streak >= 14', earned: false },
  { id: 'streak_30', name: 'Um Mês!', description: '30 dias seguidos — incrível!', icon: '🏆', condition: 'streak >= 30', earned: false },
  { id: 'streak_60', name: 'Imparável', description: '60 dias seguidos', icon: '💎', condition: 'streak >= 60', earned: false },
  { id: 'streak_100', name: 'Lendário', description: '100 dias seguidos!', icon: '👑', condition: 'streak >= 100', earned: false },

  // XP badges
  { id: 'xp_100', name: 'Primeiros Passos', description: 'Ganhou 100 XP', icon: '🌱', condition: 'xp >= 100', earned: false },
  { id: 'xp_500', name: 'Estudante Dedicado', description: '500 XP acumulados', icon: '📚', condition: 'xp >= 500', earned: false },
  { id: 'xp_1000', name: 'Mil Pontos!', description: '1.000 XP acumulados', icon: '🎯', condition: 'xp >= 1000', earned: false },
  { id: 'xp_5000', name: 'Mestre do XP', description: '5.000 XP acumulados', icon: '💫', condition: 'xp >= 5000', earned: false },
  { id: 'xp_10000', name: 'Lenda', description: '10.000 XP!', icon: '🏅', condition: 'xp >= 10000', earned: false },

  // Level badges
  { id: 'first_level', name: 'Primeiro Nível!', description: 'Avançou de nível pela primeira vez', icon: '🎉', condition: 'any_level >= 2', earned: false },
  { id: 'level_10', name: 'Nível 10', description: 'Atingiu nível 10 em qualquer habilidade', icon: '🔟', condition: 'any_level >= 10', earned: false },
  { id: 'level_25', name: 'Metade do Caminho', description: 'Nível 25 em qualquer habilidade', icon: '⚡', condition: 'any_level >= 25', earned: false },
  { id: 'level_50', name: 'Nível Máximo!', description: 'Atingiu nível 50 — pronto para o TOEFL!', icon: '🏆', condition: 'any_level >= 50', earned: false },

  // Skill badges
  { id: 'all_skills_5', name: 'Equilibrado', description: 'Todas as 6 habilidades no nível 5+', icon: '⚖️', condition: 'all_levels >= 5', earned: false },
  { id: 'all_skills_10', name: 'Completo', description: 'Todas no nível 10+', icon: '🎖️', condition: 'all_levels >= 10', earned: false },
  { id: 'all_skills_25', name: 'Avançado', description: 'Todas no nível 25+', icon: '🥇', condition: 'all_levels >= 25', earned: false },
  { id: 'all_skills_50', name: 'TOEFL Ready', description: 'Todas no nível 50 — PRONTO PARA O TOEFL!', icon: '🎓', condition: 'all_levels >= 50', earned: false },

  // Special badges
  { id: 'first_simulado', name: 'Primeiro Simulado', description: 'Completou o primeiro simulado TOEFL real', icon: '📋', condition: 'simulado_done', earned: false },
  { id: 'placement_done', name: 'Nivelado', description: 'Completou o teste de nivelamento', icon: '📊', condition: 'placement_done', earned: false },
  { id: 'perfect_lesson', name: 'Perfeição', description: '100% de acerto em uma lição', icon: '💯', condition: 'perfect_lesson', earned: false },
  { id: 'night_owl', name: 'Coruja Noturna', description: 'Estudou depois das 23h', icon: '🦉', condition: 'study_after_23', earned: false },
  { id: 'early_bird', name: 'Madrugador', description: 'Estudou antes das 7h', icon: '🐦', condition: 'study_before_7', earned: false },
]

export function getEarnedBadges(): Badge[] {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem(BADGES_KEY)
  if (!saved) return []
  return JSON.parse(saved)
}

export function saveBadges(badges: Badge[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(BADGES_KEY, JSON.stringify(badges))
}

export function checkAndAwardBadges(progress: {
  streak: number
  xp: number
  reading_level: number
  listening_level: number
  speaking_level: number
  writing_level: number
  vocabulary_level: number
  grammar_level: number
  placementDone: boolean
}): Badge[] {
  const earned = getEarnedBadges()
  const earnedIds = new Set(earned.map(b => b.id))
  const newBadges: Badge[] = []

  const levels = [
    progress.reading_level, progress.listening_level,
    progress.speaking_level, progress.writing_level,
    progress.vocabulary_level, progress.grammar_level,
  ]
  const maxLevel = Math.max(...levels)
  const minLevel = Math.min(...levels)
  const hour = new Date().getHours()

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue

    let shouldAward = false

    if (badge.condition.startsWith('streak >=')) {
      const val = parseInt(badge.condition.split('>= ')[1])
      shouldAward = progress.streak >= val
    } else if (badge.condition.startsWith('xp >=')) {
      const val = parseInt(badge.condition.split('>= ')[1])
      shouldAward = progress.xp >= val
    } else if (badge.condition.startsWith('any_level >=')) {
      const val = parseInt(badge.condition.split('>= ')[1])
      shouldAward = maxLevel >= val
    } else if (badge.condition.startsWith('all_levels >=')) {
      const val = parseInt(badge.condition.split('>= ')[1])
      shouldAward = minLevel >= val
    } else if (badge.condition === 'placement_done') {
      shouldAward = progress.placementDone
    } else if (badge.condition === 'study_after_23') {
      shouldAward = hour >= 23
    } else if (badge.condition === 'study_before_7') {
      shouldAward = hour < 7
    }

    if (shouldAward) {
      const awardedBadge = { ...badge, earned: true, earnedDate: new Date().toISOString() }
      newBadges.push(awardedBadge)
    }
  }

  if (newBadges.length > 0) {
    saveBadges([...earned, ...newBadges])
  }

  return newBadges
}

export function getTotalBadgesEarned(): number {
  return getEarnedBadges().length
}

export function getTotalBadges(): number {
  return allBadges.length
}
