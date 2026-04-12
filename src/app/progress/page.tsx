'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProgress, resetProgress } from '@/lib/storage'
import { UserProgress } from '@/types'

const skills = [
  { key: 'reading', label: 'Reading', icon: '📖' },
  { key: 'listening', label: 'Listening', icon: '🎧' },
  { key: 'speaking', label: 'Speaking', icon: '🗣️' },
  { key: 'writing', label: 'Writing', icon: '✍️' },
  { key: 'vocabulary', label: 'Vocabulary', icon: '📝' },
  { key: 'grammar', label: 'Grammar', icon: '📐' },
]

export default function ProgressPage() {
  const router = useRouter()
  const [progress, setProgress] = useState<UserProgress | null>(null)

  useEffect(() => {
    setProgress(getProgress())
  }, [])

  if (!progress) return null

  const totalLevels = 50

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/')} className="text-slate-400 text-2xl">
          ←
        </button>
        <h1 className="text-xl font-bold">Meu Progresso</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] text-center">
          <span className="text-3xl streak-fire">🔥</span>
          <p className="text-xl font-bold mt-1">{progress.streak}</p>
          <p className="text-xs text-slate-400">Streak</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] text-center">
          <span className="text-3xl">⭐</span>
          <p className="text-xl font-bold mt-1 text-yellow-400">{progress.xp}</p>
          <p className="text-xs text-slate-400">XP Total</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] text-center">
          <span className="text-3xl">📅</span>
          <p className="text-xl font-bold mt-1">{progress.lastActiveDate ? new Date(progress.lastActiveDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '--'}</p>
          <p className="text-xs text-slate-400">Último dia</p>
        </div>
      </div>

      {/* Skills detail */}
      <div className="space-y-4 mb-8">
        {skills.map((skill) => {
          const level = progress[`${skill.key}_level` as keyof UserProgress] as number
          const pct = Math.round((level / totalLevels) * 100)
          const phase = level <= 40 ? 'Fase 1' : level <= 80 ? 'Fase 2' : 'Fase 3'
          return (
            <div key={skill.key} className="bg-[#1e293b] rounded-xl p-4 border border-[#334155]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{skill.icon}</span>
                  <span className="font-semibold">{skill.label}</span>
                </div>
                <span className="text-sm text-slate-400">{phase}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-[#334155] rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full progress-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-16 text-right">Nível {level}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          if (confirm('Tem certeza que deseja resetar todo o progresso?')) {
            resetProgress()
            router.push('/')
          }
        }}
        className="w-full text-sm text-red-400 underline text-center"
      >
        Resetar progresso
      </button>
    </div>
  )
}
