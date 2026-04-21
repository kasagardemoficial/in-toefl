'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentWeekData, getLastWeekData, getWeeklyHistory, getStudyDaysThisWeek, WeeklyData } from '@/lib/weekly-review'
import { getProgress } from '@/lib/storage'

export default function ReviewPage() {
  const router = useRouter()
  const [current, setCurrent] = useState<WeeklyData | null>(null)
  const [lastWeek, setLastWeek] = useState<WeeklyData | null>(null)
  const [history, setHistory] = useState<WeeklyData[]>([])
  const [studiedDays, setStudiedDays] = useState<number[]>([])

  useEffect(() => {
    setCurrent(getCurrentWeekData())
    setLastWeek(getLastWeekData())
    setHistory(getWeeklyHistory().weeks)
    setStudiedDays(getStudyDaysThisWeek())
  }, [])

  if (!current) return null

  const progress = getProgress()
  const allLevels = [progress.reading_level, progress.listening_level, progress.speaking_level, progress.writing_level, progress.vocabulary_level, progress.grammar_level]
  const totalLevels = allLevels.reduce((a, b) => a + b, 0)

  function getDiff(key: keyof WeeklyData) {
    if (!lastWeek || !current) return null
    const curr = current[key] as number
    const prev = lastWeek[key] as number
    const diff = curr - prev
    if (diff === 0) return null
    return diff
  }

  function formatDiff(diff: number | null) {
    if (diff === null) return ''
    if (diff > 0) return `+${diff}`
    return `${diff}`
  }

  function diffColor(diff: number | null) {
    if (diff === null) return '#999'
    return diff > 0 ? '#4CAF50' : '#EF5350'
  }

  const maxHistoryXP = Math.max(...history.map(w => w.xpEarned), current.xpEarned, 1)

  return (
    <div className="page-shell page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>←</button>
        <img src="/mascot/study.png" alt="Review" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Review Semanal</h1>
          <p style={{ fontSize: '0.7rem', color: '#999', margin: 0 }}>Semana de {new Date(current.weekStart).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Dias estudados', value: current.daysStudied, max: 7, unit: '/7', icon: '📅', key: 'daysStudied' as keyof WeeklyData },
          { label: 'Exercícios', value: current.exercisesDone, unit: '', icon: '📝', key: 'exercisesDone' as keyof WeeklyData },
          { label: 'XP ganho', value: current.xpEarned, unit: '', icon: '⭐', key: 'xpEarned' as keyof WeeklyData },
          { label: 'Níveis avançados', value: current.levelsGained, unit: '', icon: '📈', key: 'levelsGained' as keyof WeeklyData },
        ].map((stat) => {
          const diff = getDiff(stat.key)
          return (
            <div key={stat.label} style={{ background: '#F7F7F7', borderRadius: '16px', padding: '16px', border: '1px solid #E8E8E8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.2rem' }}>{stat.icon}</span>
                {diff !== null && (
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: diffColor(diff), background: diff > 0 ? '#E8F5E9' : '#FFEBEE', padding: '2px 6px', borderRadius: '8px' }}>
                    {formatDiff(diff)}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1A1A', margin: '4px 0 2px' }}>{stat.value}{stat.unit}</p>
              <p style={{ fontSize: '0.7rem', color: '#999', margin: 0 }}>{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Days streak visualization */}
      <div style={{ background: '#F0F7EA', borderRadius: '16px', padding: '16px', marginBottom: '24px', border: '1px solid #D4E8C4' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B9A4B', marginBottom: '12px' }}>Dias da semana</p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, i) => {
            const dayOfWeek = new Date().getDay()
            const currentDayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1
            const studied = studiedDays.includes(i)
            const isToday = i === currentDayIdx
            return (
              <div key={day} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: studied ? '#8CB369' : isToday ? '#FFF3E0' : '#E8E8E8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: isToday ? '2px solid #FF7043' : 'none',
                  fontSize: '0.9rem'
                }}>
                  {studied ? '✓' : isToday ? '•' : ''}
                </div>
                <p style={{ fontSize: '0.6rem', color: '#999', margin: '4px 0 0', fontWeight: isToday ? 700 : 400 }}>{day}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Skill levels summary */}
      <div style={{ background: '#F7F7F7', borderRadius: '16px', padding: '16px', marginBottom: '24px', border: '1px solid #E8E8E8' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px' }}>Nível atual por habilidade</p>
        {[
          { label: 'Reading', level: progress.reading_level, emoji: '📖', color: '#8CB369' },
          { label: 'Listening', level: progress.listening_level, emoji: '🎧', color: '#5B9BD5' },
          { label: 'Speaking', level: progress.speaking_level, emoji: '🎤', color: '#F4A261' },
          { label: 'Writing', level: progress.writing_level, emoji: '✏️', color: '#E76F51' },
          { label: 'Vocabulary', level: progress.vocabulary_level, emoji: '📚', color: '#9B59B6' },
          { label: 'Grammar', level: progress.grammar_level, emoji: '📐', color: '#3498DB' },
        ].map((skill) => {
          const pct = Math.round((skill.level / 50) * 100)
          return (
            <div key={skill.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: skill.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>{skill.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{skill.label}</span>
                  <span style={{ fontSize: '0.7rem', color: skill.color, fontWeight: 700 }}>Nv {skill.level}</span>
                </div>
                <div style={{ height: '4px', background: '#E8E8E8', borderRadius: '2px' }}>
                  <div style={{ height: '4px', background: skill.color, borderRadius: '2px', width: `${pct}%`, transition: 'width 0.3s' }} />
                </div>
              </div>
            </div>
          )
        })}
        <div style={{ textAlign: 'center', marginTop: '8px', padding: '8px', background: '#F0F7EA', borderRadius: '10px' }}>
          <span style={{ fontSize: '0.75rem', color: '#6B9A4B', fontWeight: 700 }}>Total: {totalLevels} níveis alcançados</span>
        </div>
      </div>

      {/* History chart */}
      {history.length > 0 && (
        <div style={{ background: '#F7F7F7', borderRadius: '16px', padding: '16px', marginBottom: '24px', border: '1px solid #E8E8E8' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px' }}>XP por semana</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px' }}>
            {[...history.slice(-8), current].map((week, i) => {
              const h = Math.max(8, (week.xpEarned / maxHistoryXP) * 90)
              const isCurrent = i === [...history.slice(-8), current].length - 1
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.55rem', color: '#999' }}>{week.xpEarned}</span>
                  <div style={{ width: '100%', height: `${h}px`, background: isCurrent ? '#8CB369' : '#D4E8C4', borderRadius: '4px 4px 0 0' }} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Motivation */}
      <div style={{ textAlign: 'center', padding: '16px' }}>
        <img src="/mascot/success.png" alt="Continue!" style={{ width: '60px', height: '60px', objectFit: 'contain', margin: '0 auto 8px' }} />
        <p style={{ fontSize: '0.85rem', color: '#8CB369', fontWeight: 700 }}>
          {current.daysStudied >= 7 ? 'Semana perfeita! Incrível!' :
           current.daysStudied >= 5 ? 'Ótima semana! Continue assim!' :
           current.daysStudied >= 3 ? 'Bom progresso! Pode melhorar!' :
           'Vamos estudar mais esta semana!'}
        </p>
      </div>
    </div>
  )
}
