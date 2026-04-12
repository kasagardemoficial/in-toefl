'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveOnboarding, OnboardingData } from '@/lib/onboarding'

const steps = [
  { id: 'welcome', title: '' },
  { id: 'name', title: 'Como posso te chamar?' },
  { id: 'goal', title: 'Qual é seu objetivo?' },
  { id: 'time', title: 'Quanto tempo por dia?' },
  { id: 'level', title: 'Qual seu nível de inglês?' },
  { id: 'ready', title: '' },
]

const goals = [
  { value: 'study_abroad', label: 'Estudar no exterior', icon: '🎓', desc: 'Mestrado, doutorado, intercâmbio' },
  { value: 'medical', label: 'Estágio/Residência médica', icon: '🏥', desc: 'USMLE, estágio em hospital' },
  { value: 'work', label: 'Trabalhar fora', icon: '💼', desc: 'Carreira internacional' },
  { value: 'immigration', label: 'Imigrar', icon: '✈️', desc: 'Morar em outro país' },
  { value: 'personal', label: 'Crescimento pessoal', icon: '🌱', desc: 'Aprender por prazer' },
]

const times = [
  { value: 10, label: '10 min/dia', desc: 'Casual — progresso em ~24 meses', icon: '🐢' },
  { value: 20, label: '20 min/dia', desc: 'Regular — progresso em ~15 meses', icon: '🚶' },
  { value: 30, label: '30 min/dia', desc: 'Intensivo — progresso em ~12 meses', icon: '🚀' },
]

const levels = [
  { value: 'zero', label: 'Zero', desc: 'Não sei nada de inglês', icon: '🌱' },
  { value: 'basic', label: 'Básico', desc: 'Sei palavras soltas e frases simples', icon: '🌿' },
  { value: 'intermediate', label: 'Intermediário', desc: 'Consigo me comunicar mas com dificuldade', icon: '🌳' },
  { value: 'advanced', label: 'Avançado', desc: 'Falo bem mas preciso me preparar para o TOEFL', icon: '🏔️' },
]

export default function WelcomePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    name: '',
    goal: 'study_abroad',
    dailyMinutes: 20,
    currentLevel: 'zero',
    completed: false,
  })

  function next() {
    if (step < steps.length - 1) {
      setStep(s => s + 1)
    }
  }

  function finish() {
    const finalData = { ...data, completed: true }
    saveOnboarding(finalData)
    router.push('/')
  }

  const progressPct = Math.round((step / (steps.length - 1)) * 100)

  // Step 0: Welcome
  if (step === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
        <div className="text-6xl mb-6">🎯</div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          In-TOEFL
        </h1>
        <p className="text-xl text-slate-300 mb-2">Do Zero ao TOEFL</p>
        <p className="text-sm text-slate-500 mb-8 max-w-xs">
          O único app que leva do zero absoluto em inglês até passar no TOEFL. Em português. De graça.
        </p>
        <button
          onClick={next}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-2xl text-lg transition-all hover:scale-105"
        >
          Começar
        </button>
        <p className="text-xs text-slate-600 mt-4">Leva menos de 1 minuto</p>
      </div>
    )
  }

  // Step 5: Ready
  if (step === 5) {
    const goalLabel = goals.find(g => g.value === data.goal)?.label || data.goal
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
        <div className="text-6xl mb-6">🚀</div>
        <h1 className="text-3xl font-bold mb-3">Tudo pronto, {data.name}!</h1>
        <p className="text-slate-400 mb-6 max-w-sm">
          Seu plano personalizado está configurado.
        </p>

        <div className="bg-[#1e293b] rounded-2xl p-5 mb-6 max-w-sm w-full border border-[#334155] text-left space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm">Objetivo</span>
            <span className="text-white text-sm font-semibold">{goalLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm">Meta diária</span>
            <span className="text-white text-sm font-semibold">{data.dailyMinutes} min/dia</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm">Nível atual</span>
            <span className="text-white text-sm font-semibold">{levels.find(l => l.value === data.currentLevel)?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm">Previsão</span>
            <span className="text-green-400 text-sm font-semibold">
              {data.dailyMinutes === 30 ? '~12 meses' : data.dailyMinutes === 20 ? '~15 meses' : '~24 meses'}
            </span>
          </div>
        </div>

        <button
          onClick={finish}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-12 rounded-2xl text-lg transition-all hover:scale-105 mb-3"
        >
          {data.currentLevel === 'zero' || data.currentLevel === 'basic'
            ? 'Começar do Nível 1'
            : 'Fazer Teste de Nivelamento'}
        </button>
        <p className="text-xs text-slate-600">
          {data.currentLevel === 'zero' || data.currentLevel === 'basic'
            ? 'Você começará do zero — sem teste'
            : 'Um teste rápido vai definir seu nível exato'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen p-6 bg-[#0f172a]">
      {/* Progress */}
      <div className="w-full bg-[#334155] rounded-full h-2 mb-8">
        <div className="bg-blue-500 h-2 rounded-full progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center">{steps[step].title}</h2>

      {/* Step 1: Name */}
      {step === 1 && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Seu nome ou apelido"
            className="w-full max-w-sm bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-4 text-white text-center text-lg focus:border-blue-500 focus:outline-none mb-6"
            autoFocus
          />
          <button
            onClick={next}
            disabled={!data.name.trim()}
            className={`py-3 px-8 rounded-xl font-semibold transition-all ${
              data.name.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                : 'bg-[#334155] text-slate-600 cursor-not-allowed'
            }`}
          >
            Continuar
          </button>
        </div>
      )}

      {/* Step 2: Goal */}
      {step === 2 && (
        <div className="flex-1 flex flex-col items-center">
          <div className="space-y-3 w-full max-w-sm">
            {goals.map((g) => (
              <button
                key={g.value}
                onClick={() => { setData({ ...data, goal: g.value as OnboardingData['goal'] }); next(); }}
                className={`w-full text-left p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                  data.goal === g.value
                    ? 'bg-blue-900/30 border-blue-500'
                    : 'bg-[#1e293b] border-[#334155] hover:border-blue-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <p className="font-semibold">{g.label}</p>
                    <p className="text-xs text-slate-400">{g.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Time */}
      {step === 3 && (
        <div className="flex-1 flex flex-col items-center">
          <div className="space-y-3 w-full max-w-sm">
            {times.map((t) => (
              <button
                key={t.value}
                onClick={() => { setData({ ...data, dailyMinutes: t.value as 10 | 20 | 30 }); next(); }}
                className={`w-full text-left p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                  data.dailyMinutes === t.value
                    ? 'bg-blue-900/30 border-blue-500'
                    : 'bg-[#1e293b] border-[#334155] hover:border-blue-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <p className="font-semibold">{t.label}</p>
                    <p className="text-xs text-slate-400">{t.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Level */}
      {step === 4 && (
        <div className="flex-1 flex flex-col items-center">
          <div className="space-y-3 w-full max-w-sm">
            {levels.map((l) => (
              <button
                key={l.value}
                onClick={() => { setData({ ...data, currentLevel: l.value as OnboardingData['currentLevel'] }); next(); }}
                className={`w-full text-left p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                  data.currentLevel === l.value
                    ? 'bg-blue-900/30 border-blue-500'
                    : 'bg-[#1e293b] border-[#334155] hover:border-blue-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{l.icon}</span>
                  <div>
                    <p className="font-semibold">{l.label}</p>
                    <p className="text-xs text-slate-400">{l.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
