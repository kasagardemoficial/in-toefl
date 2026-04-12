'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addXP } from '@/lib/storage'
import simuladosData from '@/data/simulados.json'

interface Question {
  id: string
  transcript: string
  question: string
  options: string[]
  correct: string
  instruction_pt: string
  explanation_pt: string
  source: string
}

interface Simulado {
  simulado_number: number
  title: string
  description: string
  time_limit_minutes: number
  questions: Question[]
}

export default function SimuladoPage() {
  const router = useRouter()
  const [selectedSimulado, setSelectedSimulado] = useState<Simulado | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)

  const simulados = simuladosData as Simulado[]

  // Lista de simulados
  if (!selectedSimulado) {
    return (
      <div className="min-h-screen p-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/')} className="text-slate-400 text-2xl">←</button>
          <h1 className="text-xl font-bold">Simulados TOEFL Reais</h1>
        </div>

        <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] mb-4">
          <p className="text-sm text-slate-400">
            Questões REAIS de provas TOEFL aposentadas (dataset MIT TOEFL-QA).
            963 questões de listening organizadas em 10 simulados.
          </p>
        </div>

        <div className="space-y-3">
          {simulados.map((sim) => (
            <button
              key={sim.simulado_number}
              onClick={() => setSelectedSimulado(sim)}
              className="w-full bg-[#1e293b] rounded-xl p-4 border border-[#334155] hover:border-blue-500 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{sim.title}</h3>
                  <p className="text-xs text-slate-400">{sim.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-blue-400">{sim.questions.length}q</span>
                  <p className="text-xs text-slate-500">{sim.time_limit_minutes}min</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Resultado
  if (done) {
    const pct = Math.round((correct / selectedSimulado.questions.length) * 100)
    const estimatedScore = Math.round((pct / 100) * 30) // TOEFL listening max = 30
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <span className="text-6xl mb-4">{pct >= 70 ? '🎉' : '💪'}</span>
        <h2 className="text-2xl font-bold mb-2">{selectedSimulado.title} — Resultado</h2>
        <p className="text-lg text-slate-300 mb-1">
          Acertou {correct} de {selectedSimulado.questions.length} ({pct}%)
        </p>
        <p className="text-2xl font-bold text-blue-400 mb-4">
          Nota estimada: ~{estimatedScore}/30 (Listening)
        </p>
        <p className="text-xs text-slate-500 mb-6">
          Fonte: TOEFL-QA Dataset (MIT) — Questões reais de provas aposentadas
        </p>
        <div className="flex gap-3">
          <button onClick={() => { setSelectedSimulado(null); setDone(false); setCorrect(0); setCurrentQ(0); }} className="bg-[#1e293b] border border-[#334155] text-white py-3 px-6 rounded-xl">
            Outros Simulados
          </button>
          <button onClick={() => router.push('/')} className="bg-blue-600 text-white py-3 px-6 rounded-xl">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  // Questão atual
  const q = selectedSimulado.questions[currentQ]
  const progressPct = Math.round((currentQ / selectedSimulado.questions.length) * 100)

  function handleAnswer(option: string) {
    if (showResult || !selectedSimulado) return
    setSelected(option)
    setShowResult(true)
    if (option.charAt(0) === q.correct) {
      setCorrect(c => c + 1)
      addXP(20)
    }
  }

  function handleNext() {
    if (!selectedSimulado) return
    if (currentQ < selectedSimulado.questions.length - 1) {
      setCurrentQ(c => c + 1)
      setSelected(null)
      setShowResult(false)
    } else {
      setDone(true)
      addXP(100)
    }
  }

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setSelectedSimulado(null)} className="text-slate-400 text-2xl">✕</button>
        <div className="flex-1 bg-[#334155] rounded-full h-3">
          <div className="bg-purple-500 h-3 rounded-full progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-sm text-slate-400">{currentQ + 1}/{selectedSimulado.questions.length}</span>
      </div>

      {/* Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-1 rounded-full bg-purple-900 text-purple-300">TOEFL REAL</span>
        <span className="text-xs text-slate-500">{selectedSimulado.title}</span>
      </div>

      {/* Transcript */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-[#334155] mb-4">
        <p className="text-sm text-purple-400 mb-2">{q.instruction_pt}</p>

        <div className="bg-[#0f172a] rounded-xl p-4 mb-4 border-l-4 border-purple-500 max-h-48 overflow-y-auto">
          <p className="text-xs text-purple-400 mb-1">🎧 Transcrição da lecture/conversa REAL do TOEFL:</p>
          <p className="text-white text-sm leading-relaxed italic">{q.transcript}</p>
        </div>

        <p className="font-semibold mb-4">{q.question}</p>

        <div className="space-y-2">
          {q.options.map((opt) => {
            const letter = opt.charAt(0)
            let bg = 'bg-[#0f172a] border-[#334155]'
            if (showResult) {
              if (letter === q.correct) bg = 'bg-green-900/30 border-green-500'
              else if (letter === selected?.charAt(0)) bg = 'bg-red-900/30 border-red-500'
            } else if (selected === opt) {
              bg = 'bg-blue-900/30 border-blue-500'
            }
            return (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={showResult}
                className={`w-full text-left p-3 rounded-xl border ${bg} transition-colors text-sm`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {/* Source */}
      {showResult && (
        <div className="bg-[#1e293b] rounded-xl p-3 mb-4 border border-[#334155]">
          <p className="text-xs text-slate-500">Fonte: {q.source}</p>
        </div>
      )}

      {/* Next */}
      {showResult && (
        <button
          onClick={handleNext}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {currentQ < selectedSimulado.questions.length - 1 ? 'Próxima' : 'Ver Resultado'}
        </button>
      )}
    </div>
  )
}
