'use client'

import { useEffect, useState } from 'react'
import { getProgress, updateStreak, saveProgress } from '@/lib/storage'
import { isOnboardingDone, getOnboarding } from '@/lib/onboarding'
import { UserProgress } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const skillInfo = [
  { key: 'reading', label: 'Reading', icon: '📖', color: 'bg-blue-500' },
  { key: 'listening', label: 'Listening', icon: '🎧', color: 'bg-purple-500' },
  { key: 'speaking', label: 'Speaking', icon: '🗣️', color: 'bg-green-500' },
  { key: 'writing', label: 'Writing', icon: '✍️', color: 'bg-yellow-500' },
  { key: 'vocabulary', label: 'Vocabulary', icon: '📝', color: 'bg-red-500' },
  { key: 'grammar', label: 'Grammar', icon: '📐', color: 'bg-orange-500' },
]

export default function Home() {
  const router = useRouter()
  const [progress, setProgress] = useState<UserProgress | null>(null)

  useEffect(() => {
    if (!isOnboardingDone()) {
      router.push('/welcome')
      return
    }
    updateStreak()
    setProgress(getProgress())
  }, [router])

  if (!progress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
      </div>
    )
  }

  if (!progress.placementDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="text-4xl font-bold mb-2">In-TOEFL</h1>
        <p className="text-lg text-slate-400 mb-2">Do Zero ao TOEFL</p>
        <p className="text-sm text-slate-500 mb-8 max-w-sm">
          O app que leva do zero absoluto em inglês até passar no TOEFL.
          Para universitários brasileiros que querem estudar e trabalhar fora.
        </p>

        <div className="bg-[#1e293b] rounded-2xl p-6 mb-6 max-w-sm w-full border border-[#334155]">
          <h2 className="text-xl font-semibold mb-3">Teste de Nivelamento</h2>
          <p className="text-slate-400 text-sm mb-4">
            35 questões em ~15 minutos. Vamos descobrir seu nível atual de inglês
            para montar seu plano personalizado.
          </p>
          <Link
            href="/placement"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl text-center transition-colors"
          >
            Começar Teste
          </Link>
        </div>

        <button
          onClick={() => {
            const p = getProgress()
            p.placementDone = true
            saveProgress(p)
            setProgress({ ...p })
          }}
          className="text-slate-500 text-sm underline hover:text-slate-300"
        >
          Pular teste (começar do nível 1)
        </button>
      </div>
    )
  }

  const totalLevels = 50
  const overallProgress = Math.round(
    ((progress.reading_level + progress.listening_level + progress.speaking_level +
      progress.writing_level + progress.vocabulary_level + progress.grammar_level) / (totalLevels * 6)) * 100
  )

  return (
    <div className="min-h-screen p-4 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Olá, {getOnboarding().name || 'Aluno'}!</h1>
          <p className="text-slate-400 text-sm">Sua lição de hoje</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-2xl streak-fire">🔥</span>
            <p className="text-xs text-slate-400">{progress.streak} dias</p>
          </div>
          <div className="text-center">
            <span className="text-lg font-bold text-yellow-400">{progress.xp}</span>
            <p className="text-xs text-slate-400">XP</p>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-[#1e293b] rounded-2xl p-4 mb-6 border border-[#334155]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">Progresso geral</span>
          <span className="text-sm font-semibold text-blue-400">{overallProgress}%</span>
        </div>
        <div className="w-full bg-[#334155] rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full progress-fill"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {overallProgress < 40 ? 'Fase 1 — English Base' :
           overallProgress < 80 ? 'Fase 2 — TOEFL Training' :
           'Fase 3 — Simulados'}
        </p>
      </div>

      {/* Skills */}
      <div className="space-y-3 mb-6">
        {skillInfo.map((skill) => {
          const level = progress[`${skill.key}_level` as keyof UserProgress] as number
          const pct = Math.round((level / totalLevels) * 100)
          return (
            <Link
              key={skill.key}
              href={`/lesson/${skill.key}`}
              className="block bg-[#1e293b] rounded-xl p-4 border border-[#334155] hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{skill.icon}</span>
                  <div>
                    <h3 className="font-semibold">{skill.label}</h3>
                    <p className="text-xs text-slate-400">Nível {level} de {totalLevels}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-300">{pct}%</span>
                </div>
              </div>
              <div className="mt-2 w-full bg-[#334155] rounded-full h-2">
                <div
                  className={`${skill.color} h-2 rounded-full progress-fill`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/progress"
          className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] text-center hover:border-blue-500 transition-colors"
        >
          <span className="text-2xl block mb-1">📊</span>
          <span className="text-sm">Progresso</span>
        </Link>
        <Link
          href="/simulado"
          className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] text-center hover:border-blue-500 transition-colors"
        >
          <span className="text-2xl block mb-1">📋</span>
          <span className="text-sm">Simulados</span>
        </Link>
        <Link
          href="/badges"
          className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] text-center hover:border-yellow-500 transition-colors"
        >
          <span className="text-2xl block mb-1">🏆</span>
          <span className="text-sm">Conquistas</span>
        </Link>
      </div>
    </div>
  )
}
