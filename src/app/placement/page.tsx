'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { markPlacementDone, addXP } from '@/lib/storage'
import placementData from '@/data/placement.json'
import { playCorrect, playWrong, playLevelUp } from '@/lib/sounds'
import { launchConfetti } from '@/lib/confetti'

interface Question {
  id: string
  section: string
  question: string
  options: string[]
  correct: string
  explanation_pt: string
}

interface LevelData {
  cefr: string
  mapped_level: number
  description: string
  questions: Question[]
}

const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1']
const CEFR_COLORS: Record<string, string> = { A1: '#8CB369', A2: '#5B9BD5', B1: '#F4A261', B2: '#9B59B6', C1: '#E76F51' }
const CEFR_ICONS: Record<string, string> = { A1: '🌱', A2: '🌿', B1: '🌳', B2: '🏔️', C1: '🎯' }

const levels = (placementData as { levels: Record<string, LevelData> }).levels

export default function PlacementPage() {
  const router = useRouter()
  const [currentLevel, setCurrentLevel] = useState('B1') // Start at middle
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [results, setResults] = useState<Record<string, { correct: number; total: number }>>({
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
    C1: { correct: 0, total: 0 },
  })
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [done, setDone] = useState(false)
  const [questionsUsed, setQuestionsUsed] = useState<Record<string, number>>({
    A1: 0, A2: 0, B1: 0, B2: 0, C1: 0,
  })
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)
  const [consecutiveWrong, setConsecutiveWrong] = useState(0)

  const getQuestion = useCallback((): Question | null => {
    const levelData = levels[currentLevel]
    if (!levelData) return null
    const idx = questionsUsed[currentLevel]
    if (idx >= levelData.questions.length) return null
    return levelData.questions[idx]
  }, [currentLevel, questionsUsed])

  const question = getQuestion()

  function confirmAnswer() {
    if (!selected || !question) return
    setShowResult(true)
    setTotalAnswered(t => t + 1)

    const isCorrect = selected.charAt(0) === question.correct
    const levelIdx = CEFR_ORDER.indexOf(currentLevel)

    setResults(prev => ({
      ...prev,
      [currentLevel]: {
        correct: prev[currentLevel].correct + (isCorrect ? 1 : 0),
        total: prev[currentLevel].total + 1,
      }
    }))

    setQuestionsUsed(prev => ({ ...prev, [currentLevel]: prev[currentLevel] + 1 }))

    if (isCorrect) {
      playCorrect()
      setConsecutiveCorrect(c => c + 1)
      setConsecutiveWrong(0)
    } else {
      playWrong()
      setConsecutiveWrong(c => c + 1)
      setConsecutiveCorrect(0)
    }
  }

  function nextQuestion() {
    const isCorrect = selected?.charAt(0) === question?.correct
    const levelIdx = CEFR_ORDER.indexOf(currentLevel)

    // Adaptive logic
    let nextLevel = currentLevel
    if (isCorrect && consecutiveCorrect >= 2 && levelIdx < CEFR_ORDER.length - 1) {
      nextLevel = CEFR_ORDER[levelIdx + 1]
      setConsecutiveCorrect(0)
    } else if (!isCorrect && consecutiveWrong >= 1 && levelIdx > 0) {
      nextLevel = CEFR_ORDER[levelIdx - 1]
      setConsecutiveWrong(0)
    }

    // Check if we should stop (enough data or max questions)
    const totalAtNext = questionsUsed[nextLevel]
    const maxPerLevel = levels[nextLevel]?.questions.length || 10

    if (totalAnswered >= 15 || (totalAtNext >= maxPerLevel && nextLevel === currentLevel)) {
      finishTest()
      return
    }

    setCurrentLevel(nextLevel)
    setSelected(null)
    setShowResult(false)
  }

  function finishTest() {
    // Determine final level: highest CEFR where accuracy >= 60%
    let finalLevel = 'A1'
    let finalMapped = 1

    for (const cefr of CEFR_ORDER) {
      const r = results[cefr]
      if (r.total >= 2 && (r.correct / r.total) >= 0.6) {
        finalLevel = cefr
        finalMapped = levels[cefr].mapped_level
      }
    }

    // If got some C1 right but not enough, still place at B2
    if (results['C1'].correct > 0 && finalLevel === 'B1') {
      finalLevel = 'B2'
      finalMapped = levels['B2'].mapped_level
    }

    markPlacementDone({
      reading: finalMapped,
      listening: finalMapped,
      speaking: finalMapped,
      writing: finalMapped,
      vocabulary: finalMapped,
      grammar: finalMapped,
    })

    addXP(100)
    playLevelUp()
    launchConfetti()
    setDone(true)
  }

  // Result screen
  if (done) {
    let finalLevel = 'A1'
    for (const cefr of CEFR_ORDER) {
      const r = results[cefr]
      if (r.total >= 2 && (r.correct / r.total) >= 0.6) finalLevel = cefr
    }
    if (results['C1'].correct > 0 && finalLevel === 'B1') finalLevel = 'B2'

    const levelData = levels[finalLevel]
    const totalCorrect = Object.values(results).reduce((sum, r) => sum + r.correct, 0)

    const descriptions: Record<string, string> = {
      A1: 'Você está começando do zero. Vamos construir sua base em inglês!',
      A2: 'Você tem uma base. Vamos fortalecer e expandir seu vocabulário!',
      B1: 'Bom nível intermediário! Hora de começar o formato TOEFL.',
      B2: 'Nível avançado! Você está quase pronto para o TOEFL.',
      C1: 'Excelente! Vá direto para os simulados e pratique o formato da prova.',
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', background: 'white' }}>
        <img src={finalLevel === 'C1' ? '/mascot/master.png' : finalLevel === 'B2' ? '/mascot/athlete.png' : finalLevel === 'B1' ? '/mascot/detective.png' : '/mascot/study.png'} alt="Resultado" style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '12px' }} />

        <p style={{ fontSize: '0.7rem', color: '#999', marginBottom: '4px' }}>Seu nível é</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '2rem' }}>{CEFR_ICONS[finalLevel]}</span>
          <span style={{ fontSize: '3rem', fontWeight: 800, color: CEFR_COLORS[finalLevel] }}>{finalLevel}</span>
        </div>
        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>{levelData.description}</p>
        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '20px', maxWidth: '320px' }}>{descriptions[finalLevel]}</p>

        {/* Score by level */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {CEFR_ORDER.map(cefr => {
            const r = results[cefr]
            if (r.total === 0) return null
            const pct = Math.round((r.correct / r.total) * 100)
            return (
              <div key={cefr} style={{ background: '#F7F7F7', borderRadius: '10px', padding: '8px 14px', border: `1px solid ${pct >= 60 ? CEFR_COLORS[cefr] : '#E8E8E8'}`, textAlign: 'center' }}>
                <p style={{ fontSize: '0.65rem', color: '#999', margin: 0 }}>{cefr}</p>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: pct >= 60 ? CEFR_COLORS[cefr] : '#999', margin: '2px 0' }}>{r.correct}/{r.total}</p>
                <p style={{ fontSize: '0.6rem', color: pct >= 60 ? '#4CAF50' : '#999', margin: 0 }}>{pct}%</p>
              </div>
            )
          })}
        </div>

        <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '20px' }}>
          Acertou {totalCorrect} de {totalAnswered} · Nível {levelData.mapped_level} de 50
        </p>

        <button onClick={() => router.push('/')} className="jolingo-btn" style={{ maxWidth: '320px' }}>
          COMEÇAR A ESTUDAR
        </button>
      </div>
    )
  }

  if (!question) {
    finishTest()
    return null
  }

  const levelColor = CEFR_COLORS[currentLevel]
  const progressPct = Math.round((totalAnswered / 15) * 100)

  return (
    <div style={{ minHeight: '100vh', padding: '16px', maxWidth: '500px', margin: '0 auto', background: 'white' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#999' }}>✕</button>
        <div style={{ flex: 1, background: '#E8E8E8', borderRadius: '6px', height: '8px' }}>
          <div style={{ width: `${progressPct}%`, background: levelColor, height: '8px', borderRadius: '6px', transition: 'all 0.3s' }} />
        </div>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: levelColor, background: levelColor + '18', padding: '3px 10px', borderRadius: '8px' }}>
          {CEFR_ICONS[currentLevel]} {currentLevel}
        </span>
        <span style={{ fontSize: '0.7rem', color: '#999' }}>{totalAnswered + 1}/15</span>
      </div>

      {/* Level indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
        {CEFR_ORDER.map(cefr => (
          <div key={cefr} style={{ width: '40px', height: '4px', borderRadius: '2px', background: cefr === currentLevel ? CEFR_COLORS[cefr] : '#E8E8E8', transition: 'background 0.3s' }} />
        ))}
      </div>

      {/* Section badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '8px', background: '#F7F7F7', color: '#999', fontWeight: 600 }}>
          {question.section === 'grammar' ? '📐 Gramática' : question.section === 'vocabulary' ? '📝 Vocabulário' : '📖 Reading'}
        </span>
      </div>

      {/* Question */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '18px', border: '1px solid #E8E8E8', marginBottom: '12px' }}>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '16px', lineHeight: 1.5 }}>{question.question}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {question.options.map((opt) => {
            const letter = opt.charAt(0)
            let bg = '#F7F7F7'
            let border = '#E8E8E8'
            if (showResult) {
              if (letter === question.correct) { bg = '#E8F5E9'; border = '#4CAF50' }
              else if (letter === selected?.charAt(0)) { bg = '#FFEBEE'; border = '#EF5350' }
            } else if (selected === opt) {
              bg = '#F0F7EA'; border = levelColor
            }
            return (
              <button
                key={opt}
                onClick={() => !showResult && setSelected(opt)}
                disabled={showResult}
                style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '12px', border: `2px solid ${border}`, background: bg, fontSize: '0.9rem', cursor: showResult ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {/* Verify / Next */}
      {!showResult && selected && (
        <button onClick={confirmAnswer} className="jolingo-btn">VERIFICAR</button>
      )}

      {showResult && (
        <>
          <div style={{ background: '#F7F7F7', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
            <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.5, margin: 0 }}>{question.explanation_pt}</p>
          </div>
          <button onClick={nextQuestion} className="jolingo-btn">
            {totalAnswered >= 14 ? 'VER RESULTADO' : 'PRÓXIMA'}
          </button>
        </>
      )}
    </div>
  )
}
