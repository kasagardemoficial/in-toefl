'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProgress, saveProgress, addXP } from '@/lib/storage'
import { Exercise } from '@/types'

// Import exercise data
import readingData from '@/data/reading.json'
import vocabularyData from '@/data/vocabulary.json'
import speakingData from '@/data/speaking.json'
import writingData from '@/data/writing.json'
import grammarData from '@/data/grammar.json'
import listeningData from '@/data/listening.json'

const dataMap: Record<string, unknown[]> = {
  reading: readingData,
  vocabulary: vocabularyData,
  speaking: speakingData,
  writing: writingData,
  grammar: grammarData,
  listening: listeningData,
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const skill = params.skill as string

  const [currentExercise, setCurrentExercise] = useState(0)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [lessonDone, setLessonDone] = useState(false)
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null)
  const [userText, setUserText] = useState('')
  const [showModel, setShowModel] = useState(false)

  useEffect(() => {
    const progress = getProgress()
    const levelKey = `${skill}_level` as keyof typeof progress
    const level = (progress[levelKey] as number) || 1

    const data = dataMap[skill]
    if (!data) return

    // Find the level data
    const levelData = data.find((l: unknown) => (l as { level: number }).level === level) as {
      exercises?: Exercise[]
      words?: Array<{ exercise: Exercise } & Record<string, unknown>>
    } | undefined

    if (!levelData) return

    if (skill === 'vocabulary' && levelData.words) {
      setExercises(levelData.words.map((w: unknown) => {
        const word = w as { id: string; word: string; translation_pt: string; example_en: string; exercise: Exercise }
        return {
          ...word.exercise,
          id: word.id,
          passage: word.word,
          explanation_pt: `'${word.word}' = ${word.translation_pt}. Exemplo: ${word.example_en}`,
        }
      }))
    } else if (levelData.exercises) {
      setExercises(levelData.exercises)
    }
  }, [skill])

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <p className="text-slate-400 mb-4">Carregando exercícios...</p>
        <button onClick={() => router.push('/')} className="text-blue-400 underline">
          Voltar
        </button>
      </div>
    )
  }

  const ex = exercises[currentExercise]

  function handleAnswer(option: string) {
    if (showResult) return
    setSelected(option)
    setShowResult(true)
    setTotal(t => t + 1)

    // For fill_blank exercises, correct is the full word (e.g. "goes")
    // For multiple choice, correct is a letter (e.g. "B")
    const isCorrect = ex.type === 'fill_blank'
      ? option === ex.correct
      : option.charAt(0) === ex.correct

    if (isCorrect) {
      setCorrect(c => c + 1)
      setFlash('correct')
      addXP(10)
    } else {
      setFlash('wrong')
    }

    setTimeout(() => setFlash(null), 500)
  }

  function handleNext() {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(c => c + 1)
      setSelected(null)
      setShowResult(false)
      setUserText('')
      setShowModel(false)
    } else {
      finishLesson()
    }
  }

  function finishLesson() {
    const pct = Math.round((correct / total) * 100)
    setLessonDone(true)

    if (pct >= 90) {
      const progress = getProgress()
      const levelKey = `${skill}_level` as keyof typeof progress
      const currentLevel = progress[levelKey] as number
      ;(progress as unknown as Record<string, unknown>)[levelKey] = currentLevel + 1
      addXP(50)
      saveProgress(progress)
    }
  }

  if (lessonDone) {
    const pct = Math.round((correct / total) * 100)
    const passed = pct >= 90
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <span className="text-6xl mb-4">{passed ? '🎉' : '💪'}</span>
        <h2 className="text-2xl font-bold mb-2">
          {passed ? 'Parabéns!' : 'Quase lá!'}
        </h2>
        <p className="text-lg text-slate-300 mb-2">
          Você acertou {correct} de {total} ({pct}%)
        </p>
        <p className="text-sm text-slate-400 mb-6">
          {passed
            ? 'Você avançou de nível! +50 XP'
            : 'Precisa de 90% para avançar. Tente novamente!'}
        </p>

        <div className="w-full max-w-xs bg-[#334155] rounded-full h-4 mb-6">
          <div
            className={`h-4 rounded-full progress-fill ${passed ? 'bg-green-500' : 'bg-yellow-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/')}
            className="bg-[#1e293b] border border-[#334155] text-white font-semibold py-3 px-6 rounded-xl"
          >
            Voltar
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl"
          >
            {passed ? 'Próximo Nível' : 'Tentar de Novo'}
          </button>
        </div>
      </div>
    )
  }

  const progressPct = Math.round(((currentExercise) / exercises.length) * 100)

  return (
    <div className={`min-h-screen p-4 max-w-lg mx-auto ${flash === 'correct' ? 'flash-correct' : flash === 'wrong' ? 'flash-wrong' : ''}`}>
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
          {currentExercise + 1}/{exercises.length}
        </span>
      </div>

      {/* Exercise */}
      <div className="bg-[#1e293b] rounded-2xl p-5 border border-[#334155] mb-4">
        <p className="text-sm text-blue-400 mb-3">{ex.instruction_pt}</p>

        {/* Listening transcript (until real audio is available) */}
        {ex.transcript && (
          <div className="bg-[#0f172a] rounded-xl p-4 mb-4 border-l-4 border-purple-500">
            <p className="text-xs text-purple-400 mb-1">🎧 Ouça (transcrição — áudio em breve):</p>
            <p className="text-white leading-relaxed italic text-sm">{ex.transcript}</p>
          </div>
        )}

        {/* Passage or Sentence (for fill_blank) */}
        {(ex.passage || ex.sentence) && !ex.transcript && (
          <div className="bg-[#0f172a] rounded-xl p-4 mb-4">
            <p className="text-white leading-relaxed">{ex.passage || ex.sentence}</p>
          </div>
        )}

        {/* Question */}
        {ex.question && (
          <p className="font-semibold mb-4">{ex.question}</p>
        )}

        {/* Scene description for speaking "describe" type */}
        {ex.type === 'describe' && ex.hint_pt && (
          <div className="bg-[#0f172a] rounded-xl p-3 mb-3 border-l-4 border-yellow-500">
            <p className="text-xs text-yellow-400 mb-1">Cena para descrever:</p>
            <p className="text-white text-sm">{ex.hint_pt}</p>
          </div>
        )}

        {/* Multiple Choice / Fill Blank */}
        {ex.options && ex.type !== 'free_write' && ex.type !== 'guided_write' && (
          <div className="space-y-2">
            {ex.options.map((opt) => {
              const isCorrectOpt = ex.type === 'fill_blank' ? opt === ex.correct : opt.charAt(0) === ex.correct
              const isSelectedOpt = ex.type === 'fill_blank' ? opt === selected : opt.charAt(0) === selected?.charAt(0)
              let bg = 'bg-[#0f172a] border-[#334155]'
              if (showResult) {
                if (isCorrectOpt) bg = 'bg-green-900/30 border-green-500'
                else if (isSelectedOpt) bg = 'bg-red-900/30 border-red-500'
              } else if (selected === opt) {
                bg = 'bg-blue-900/30 border-blue-500'
              }
              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={showResult}
                  className={`w-full text-left p-3 rounded-xl border ${bg} transition-colors`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {/* Reorder */}
        {ex.type === 'reorder' && ex.words && (
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {ex.words.map((w, i) => (
                <button
                  key={i}
                  onClick={() => setUserText(prev => prev ? `${prev} ${w}` : w)}
                  className="bg-[#0f172a] border border-[#334155] px-3 py-2 rounded-lg text-sm hover:border-blue-500"
                >
                  {w}
                </button>
              ))}
            </div>
            <div className="bg-[#0f172a] rounded-xl p-3 min-h-[40px] mb-3">
              <p className="text-white">{userText || '...'}</p>
            </div>
            {!showResult && (
              <div className="flex gap-2">
                <button onClick={() => setUserText('')} className="text-sm text-slate-400 underline">
                  Limpar
                </button>
                <button
                  onClick={() => {
                    setShowResult(true)
                    setTotal(t => t + 1)
                    const normalize = (s: string) => s.toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim()
                    if (normalize(userText) === normalize(ex.correct_sentence || '')) {
                      setCorrect(c => c + 1)
                      setFlash('correct')
                      addXP(10)
                    } else {
                      setFlash('wrong')
                    }
                    setTimeout(() => setFlash(null), 500)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Verificar
                </button>
              </div>
            )}
            {showResult && (
              <p className="text-sm text-green-400 mt-2">
                Resposta correta: {ex.correct_sentence}
              </p>
            )}
          </div>
        )}

        {/* Free Write */}
        {(ex.type === 'free_write' || ex.type === 'guided_write') && (
          <div>
            {ex.prompt && <p className="font-semibold mb-2">{ex.prompt}</p>}
            {ex.hint_pt && <p className="text-xs text-slate-400 mb-3">{ex.hint_pt}</p>}
            <textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Escreva sua resposta em inglês..."
              className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-3 text-white min-h-[100px] resize-none focus:border-blue-500 focus:outline-none"
            />
            {!showModel && (
              <button
                onClick={() => {
                  setShowModel(true)
                  setShowResult(true)
                  setTotal(t => t + 1)
                  setCorrect(c => c + 1) // Writing is self-assessed in v1
                  addXP(10)
                }}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Ver Resposta Modelo
              </button>
            )}
            {showModel && ex.model_answer && (
              <div className="mt-3 bg-green-900/20 border border-green-800 rounded-xl p-3">
                <p className="text-xs text-green-400 mb-1">Resposta modelo:</p>
                <p className="text-green-200 text-sm">{ex.model_answer}</p>
              </div>
            )}
          </div>
        )}

        {/* Speaking */}
        {(ex.type === 'repeat' || ex.type === 'guided_response' || ex.type === 'describe') && (
          <div>
            {ex.phonetic_hint && (
              <p className="text-xs text-slate-400 mb-1">{ex.phonetic_hint}</p>
            )}
            {ex.tip_pt && (
              <p className="text-xs text-yellow-400 mb-3">💡 {ex.tip_pt}</p>
            )}
            {ex.target_text && (
              <div className="bg-[#0f172a] rounded-xl p-3 mb-3">
                <p className="text-blue-300 font-semibold">{ex.target_text}</p>
              </div>
            )}
            {!showResult && (
              <button
                onClick={() => {
                  import('@/lib/speech').then(({ listenForSpeech, checkSpeechSupport }) => {
                    if (!checkSpeechSupport()) {
                      alert('Seu navegador não suporta reconhecimento de voz. Use o Chrome.')
                      return
                    }
                    listenForSpeech(
                      ex.target_text || '',
                      ex.accepted_variations || [],
                      (matched, transcript) => {
                        setUserText(transcript)
                        setShowResult(true)
                        setTotal(t => t + 1)
                        if (matched) {
                          setCorrect(c => c + 1)
                          setFlash('correct')
                          addXP(15)
                        } else {
                          setFlash('wrong')
                        }
                        setTimeout(() => setFlash(null), 500)
                      },
                      (error) => alert(error)
                    )
                  })
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                🎤 Falar
              </button>
            )}
            {showResult && (
              <div className={`mt-3 p-3 rounded-xl ${userText ? 'border' : ''} ${correct > 0 ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
                {userText && <p className="text-sm">Você disse: &quot;{userText}&quot;</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explanation */}
      {showResult && ex.explanation_pt && (
        <div className="bg-[#1e293b] rounded-xl p-4 mb-4 border border-[#334155]">
          <p className="text-sm text-slate-300">{ex.explanation_pt}</p>
        </div>
      )}

      {/* Next button */}
      {showResult && (
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {currentExercise < exercises.length - 1 ? 'Próximo' : 'Finalizar'}
        </button>
      )}
    </div>
  )
}
