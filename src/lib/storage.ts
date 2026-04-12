// Local storage manager — no backend needed for v1
import { UserProgress } from '@/types'

const STORAGE_KEY = 'intoefl_progress'

const defaultProgress: UserProgress = {
  userId: 'local',
  reading_level: 1,
  listening_level: 1,
  speaking_level: 1,
  writing_level: 1,
  vocabulary_level: 1,
  grammar_level: 1,
  xp: 0,
  streak: 0,
  lastActiveDate: '',
  placementDone: false,
}

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return defaultProgress
  return JSON.parse(saved)
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function updateLevel(skill: string, level: number): void {
  const progress = getProgress()
  const key = `${skill}_level` as keyof UserProgress
  ;(progress as unknown as Record<string, unknown>)[key] = level
  saveProgress(progress)
}

export function addXP(amount: number): void {
  const progress = getProgress()
  progress.xp += amount
  saveProgress(progress)
}

export function updateStreak(): void {
  const progress = getProgress()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (progress.lastActiveDate === today) return
  if (progress.lastActiveDate === yesterday) {
    progress.streak += 1
  } else {
    progress.streak = 1
  }
  progress.lastActiveDate = today
  saveProgress(progress)
}

export function markPlacementDone(levels: Record<string, number>): void {
  const progress = getProgress()
  progress.placementDone = true
  progress.reading_level = levels.reading || 1
  progress.listening_level = levels.listening || 1
  progress.speaking_level = levels.speaking || 1
  progress.writing_level = levels.writing || 1
  progress.vocabulary_level = levels.vocabulary || 1
  saveProgress(progress)
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
