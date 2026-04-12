'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { markPlacementDone, addXP } from '@/lib/storage'
import placementData from '@/data/placement.json'

interface Question {
  id: string
  section: string
  difficulty: string
  cefr: string
  instruction_pt: string
  passage?: string
  question: string
  options: string[]
  correct: string
  explanation_pt: string
  transcript?: string
}

const questions = placementData.questions as Question[]

export default function PlacementPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [scores, setScores] = useState({ reading: 0, listening: 0, vocabulary: 0, grammar: 0 })
  const [done, setDone] = useState(false)

  const q = questions[current]
  const progressPct = Math.round((current / questions.length) * 100)

  function handleAnswer(option: string) {
    if (showResult) return
    setSelected(option)
    setShowResult(true)

    const letter = option.charAt(0)
    if (letter === q.correct) {
      setScores(prev => ({
        ...prev,
        [q.section]: prev[q.section as keyof typeof prev] + 1,
      }))
    }
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
      setSelected(null)
      setShowResult(false)
    } else {
      finishPlacement()
    }
  }

  function finishPlacement() {
    const total = questions.length
    const totalCorrect = scores.reading + scores.listening + scores.vocabulary + scores.grammar
    const pct = Math.round((totalCorrect / total) * 100)

    let startLevel = 1
    if (pct >= 86) startLevel = 45
    else if (pct >= 71) startLevel = 35
    else if (pct >= 51) startLevel = 25
    else if (pct >= 31) startLevel = 15

    const clampedLevel = startLevel

    markPlacementDone({
      reading: clampedLevel,
      listening: clampedLevel,
      speaking: clampedLevel,
      writing: clampedLevel,
      vocabulary: clampedLevel,
    })

    addXP(100)
    setDone(true)
  }

  if (done) {
    const totalCorrect = scores.reading + scores.listening + scores.vocabulary + scores.grammar
    const pct = Math.round((totalCorrect / questions.length) * 100)
    let cefr = 'A1'
    let desc = 'Iniciante — Vamos começar do zero!'
    if (pct >= 86) { cefr = 'C1'; desc = 'Avançado — Direto para os simulados!' }
    else if (pct >= 71) { cefr = 'B2'; desc = 'Intermediário-Avançado — Pronto para o formato TOEFL!' }
    else if (pct >= 51) { cefr = 'B1'; desc = 'Intermediário — Base sólida, vamos treinar TOEFL!' }
    else if (pct >= 31) { cefr = 'A2'; desc = 'Básico — Boa base, vamos fortalecer!' }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <span className="text-6xl mb-4">🎯</span>
        <h2 className="text-2xl font-bold mb-2">Resultado do Nivelamento</h2>
        <p className="text-4xl font-bold text-blue-400 mb-2">{cefr}</p>
        <p className="text-slate-300 mb-2">{desc}</p>
        <p className="text-sm text-slate-400 mb-6">
          Acertou {totalCorrect} de {questions.length} ({pct}%)
        </p>

        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6">
          <div className="bg-[#1e293b] rounded-xl p-3 border border-[#334155]">
            <p className="text-xs text-slate-400">Reading</p>
            <p className="font-bold">{scores.reading}/10</p>
          </div>
          <div className="bg-[#1e293b] rounded-xl p-3 border border-[#334155]">
            <p className="text-xs text-slate-400">Listening</p>
            <p className="font-bold">{scores.listening}/10</p>
          </div>
          <div className="bg-[#1e293b] rounded-xl p-3 border border-[#334155]">
            <p className="text-xs text-slate-400">Vocabulary</p>
            <p className="font-bold">{scores.vocabulary}/10</p>
          </div>
          <div className="bg-[#1e293b] rounded-xl p-3 border border-[#334155]">
            <p className="text-xs text-slate-400">Grammar</p>
            <p className="font-bold">{scores.grammar}/5</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
        >
          Começar a Estudar
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/')} className="text-slate-400 text-2xl">
          ✕
        </button>
        <div className="flex-1 bg-[#334155] rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-sm text-slate-400">
          {current + 1}/{questions.length}
        </span>
      </div>

      {/* Section badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs px-2 py-1 rounded-full ${
          q.section === 'reading' ? 'bg-blue-900 text-blue-300' :
          q.section === 'listening' ? 'bg-purple-900 text-purple-300' :
          q.section === 'vocabulary' ? 'bg-red-900 text-red-300' :
          'bg-yellow-900 text-yellow-300'
        }`}>
          {q.section.toUpperCase()}
        </span>
        <span className="text-xs text-slate-500">{q.cefr} — {q.difficulty}</span>
      </div>

      {/* Question */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-[#334155] mb-4">
        <p className="text-sm text-blue-400 mb-3">{q.instruction_pt}</p>

        {q.passage && (
          <div className="bg-[#0f172a] rounded-xl p-4 mb-4">
            <p className="text-white leading-relaxed text-sm">{q.passage}</p>
          </div>
        )}

        {q.transcript && (
          <div className="bg-[#0f172a] rounded-xl p-4 mb-4 border-l-4 border-purple-500">
            <p className="text-xs text-purple-400 mb-1">🎧 Transcrição (no app final será áudio):</p>
            <p className="text-white text-sm italic">{q.transcript}</p>
          </div>
        )}

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

      {/* Explanation */}
      {showResult && (
        <div className="bg-[#1e293b] rounded-xl p-4 mb-4 border border-[#334155]">
          <p className="text-sm text-slate-300">{q.explanation_pt}</p>
        </div>
      )}

      {/* Next */}
      {showResult && (
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {current < questions.length - 1 ? 'Próxima' : 'Ver Resultado'}
        </button>
      )}
    </div>
  )
}
