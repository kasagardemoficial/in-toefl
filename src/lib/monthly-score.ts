// Monthly TOEFL Score Estimation
const MONTHLY_KEY = 'intoefl_monthly_scores'

export interface MonthlyScore {
  date: string // ISO date
  reading: number // 0-30
  listening: number // 0-30
  speaking: number // 0-30
  writing: number // 0-30
  total: number // 0-120
}

export function getMonthlyScores(): MonthlyScore[] {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem(MONTHLY_KEY)
  if (!saved) return []
  return JSON.parse(saved)
}

export function saveMonthlyScore(score: MonthlyScore): void {
  if (typeof window === 'undefined') return
  const scores = getMonthlyScores()
  scores.push(score)
  // Keep only last 12 months
  if (scores.length > 12) scores.shift()
  localStorage.setItem(MONTHLY_KEY, JSON.stringify(scores))
}

export function estimateTOEFLScore(progress: {
  reading_level: number
  listening_level: number
  speaking_level: number
  writing_level: number
  vocabulary_level: number
  grammar_level: number
}, simuladoAccuracy?: number): MonthlyScore {
  const maxLevel = 50

  // Reading: based on reading + vocabulary levels + simulado accuracy
  const readingRaw = ((progress.reading_level + progress.vocabulary_level * 0.3) / (maxLevel * 1.3)) * 30
  const reading = Math.min(30, Math.round(readingRaw * (simuladoAccuracy ? (0.7 + simuladoAccuracy * 0.3) : 1)))

  // Listening: based on listening level
  const listeningRaw = (progress.listening_level / maxLevel) * 30
  const listening = Math.min(30, Math.round(listeningRaw))

  // Speaking: based on speaking + grammar levels
  const speakingRaw = ((progress.speaking_level + progress.grammar_level * 0.3) / (maxLevel * 1.3)) * 30
  const speaking = Math.min(30, Math.round(speakingRaw))

  // Writing: based on writing + grammar + vocabulary levels
  const writingRaw = ((progress.writing_level + progress.grammar_level * 0.2 + progress.vocabulary_level * 0.2) / (maxLevel * 1.4)) * 30
  const writing = Math.min(30, Math.round(writingRaw))

  const total = reading + listening + speaking + writing

  return {
    date: new Date().toISOString().split('T')[0],
    reading,
    listening,
    speaking,
    writing,
    total,
  }
}

export function getLastMonthScore(): MonthlyScore | null {
  const scores = getMonthlyScores()
  if (scores.length === 0) return null
  return scores[scores.length - 1]
}

export function getScoreImprovement(): { improved: boolean; diff: number; message: string } {
  const scores = getMonthlyScores()
  if (scores.length < 2) {
    return { improved: true, diff: 0, message: 'Primeira avaliação! Vamos ver sua evolução mês a mês.' }
  }

  const current = scores[scores.length - 1]
  const previous = scores[scores.length - 2]
  const diff = current.total - previous.total

  if (diff > 0) {
    return { improved: true, diff, message: `+${diff} pontos desde a última avaliação! 📈` }
  } else if (diff < 0) {
    return { improved: false, diff, message: `${diff} pontos. Não desanime — continue praticando! 💪` }
  }
  return { improved: true, diff: 0, message: 'Mesma nota. Foque nas habilidades mais fracas! 🎯' }
}

export function isTimeForMonthlySimulado(): boolean {
  const scores = getMonthlyScores()
  if (scores.length === 0) return true

  const lastScore = scores[scores.length - 1]
  const lastDate = new Date(lastScore.date)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

  return daysDiff >= 28 // ~1 month
}

export function getTOEFLReadinessLevel(total: number): { level: string; color: string; message: string } {
  if (total >= 100) return { level: 'Pronto!', color: '#00B894', message: 'Você está pronto para o TOEFL! Agende sua prova!' }
  if (total >= 80) return { level: 'Quase lá', color: '#00D2D3', message: 'Muito perto da meta! Foque nos detalhes.' }
  if (total >= 60) return { level: 'Progredindo', color: '#FDCB6E', message: 'Bom progresso! Continue praticando.' }
  if (total >= 40) return { level: 'Construindo base', color: '#FF6B6B', message: 'Base sendo construída. Mantenha a consistência!' }
  return { level: 'Iniciando', color: '#FD79A8', message: 'Você está começando. Cada lição conta!' }
}
