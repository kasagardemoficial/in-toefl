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

const sectionColors: Record<string, { bg: string; text: string; border: string }> = {
  reading: { bg: '#E8F5E9', text: '#8CB369', border: '#8CB369' },
  listening: { bg: '#EDE7F6', text: '#9B59B6', border: '#9B59B6' },
  vocabulary: { bg: '#FFF3E0', text: '#F4A261', border: '#F4A261' },
  grammar: { bg: '#E3F2FD', text: '#5B9BD5', border: '#5B9BD5' },
}

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

    markPlacementDone({
      reading: startLevel,
      listening: startLevel,
      speaking: startLevel,
      writing: startLevel,
      vocabulary: startLevel,
      grammar: startLevel,
    })

    addXP(100)
    setDone(true)
  }

  if (done) {
    const totalCorrect = scores.reading + scores.listening + scores.vocabulary + scores.grammar
    const pct = Math.round((totalCorrect / questions.length) * 100)
    let cefr = 'A1'
    let desc = 'Iniciante — Vamos começar do zero!'
    let mascot = '/mascot/study.png'
    if (pct >= 86) { cefr = 'C1'; desc = 'Avançado — Direto para os simulados!'; mascot = '/mascot/master.png' }
    else if (pct >= 71) { cefr = 'B2'; desc = 'Intermediário-Avançado — Pronto para o formato TOEFL!'; mascot = '/mascot/athlete.png' }
    else if (pct >= 51) { cefr = 'B1'; desc = 'Intermediário — Base sólida, vamos treinar TOEFL!'; mascot = '/mascot/detective.png' }
    else if (pct >= 31) { cefr = 'A2'; desc = 'Básico — Boa base, vamos fortalecer!'; mascot = '/mascot/resilient.png' }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', background: 'white' }}>
        <img src={mascot} alt="Resultado" style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '12px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>Resultado do Nivelamento</h2>
        <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#8CB369', marginBottom: '4px' }}>{cefr}</p>
        <p style={{ color: '#666', marginBottom: '4px', fontSize: '0.9rem' }}>{desc}</p>
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '24px' }}>
          Acertou {totalCorrect} de {questions.length} ({pct}%)
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', maxWidth: '280px', marginBottom: '24px' }}>
          {[
            { label: 'Reading', score: scores.reading, total: 10, color: '#8CB369' },
            { label: 'Listening', score: scores.listening, total: 10, color: '#9B59B6' },
            { label: 'Vocabulary', score: scores.vocabulary, total: 10, color: '#F4A261' },
            { label: 'Grammar', score: scores.grammar, total: 5, color: '#5B9BD5' },
          ].map((s) => (
            <div key={s.label} style={{ background: '#F7F7F7', borderRadius: '12px', padding: '12px', border: '1px solid #E8E8E8' }}>
              <p style={{ fontSize: '0.7rem', color: '#999', margin: '0 0 2px' }}>{s.label}</p>
              <p style={{ fontWeight: 800, fontSize: '1.1rem', color: s.color, margin: 0 }}>{s.score}/{s.total}</p>
            </div>
          ))}
        </div>

        <button onClick={() => router.push('/')} className="jolingo-btn" style={{ maxWidth: '320px' }}>
          COMEÇAR A ESTUDAR
        </button>
      </div>
    )
  }

  const sc = sectionColors[q.section] || sectionColors.reading

  return (
    <div style={{ minHeight: '100vh', padding: '16px', maxWidth: '500px', margin: '0 auto', background: 'white' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999', padding: '4px' }}>
          ✕
        </button>
        <div style={{ flex: 1, background: '#E8E8E8', borderRadius: '6px', height: '8px' }}>
          <div style={{ width: `${progressPct}%`, background: '#8CB369', height: '8px', borderRadius: '6px', transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: '0.8rem', color: '#999', fontWeight: 600 }}>
          {current + 1}/{questions.length}
        </span>
      </div>

      {/* Section badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px', background: sc.bg, color: sc.text, fontWeight: 700 }}>
          {q.section.toUpperCase()}
        </span>
        <span style={{ fontSize: '0.7rem', color: '#999' }}>{q.cefr} — {q.difficulty}</span>
      </div>

      {/* Question card */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #E8E8E8', marginBottom: '16px' }}>
        <p style={{ fontSize: '0.85rem', color: sc.text, marginBottom: '12px' }}>{q.instruction_pt}</p>

        {q.passage && (
          <div style={{ background: '#F7F7F7', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <p style={{ color: '#1A1A1A', lineHeight: 1.6, fontSize: '0.9rem' }}>{q.passage}</p>
          </div>
        )}

        {q.transcript && (
          <div style={{ background: '#F7F7F7', borderRadius: '12px', padding: '16px', marginBottom: '16px', borderLeft: `4px solid ${sc.border}` }}>
            <p style={{ fontSize: '0.7rem', color: sc.text, marginBottom: '4px' }}>🎧 Transcrição (no app final será áudio):</p>
            <p style={{ color: '#1A1A1A', fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.5 }}>{q.transcript}</p>
          </div>
        )}

        <p style={{ fontWeight: 700, marginBottom: '16px', fontSize: '0.95rem' }}>{q.question}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {q.options.map((opt) => {
            const letter = opt.charAt(0)
            let bg = '#F7F7F7'
            let border = '#E8E8E8'
            if (showResult) {
              if (letter === q.correct) { bg = '#E8F5E9'; border = '#4CAF50' }
              else if (letter === selected?.charAt(0)) { bg = '#FFEBEE'; border = '#EF5350' }
            } else if (selected === opt) {
              bg = '#F0F7EA'; border = '#8CB369'
            }
            return (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={showResult}
                style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '12px', border: `2px solid ${border}`, background: bg, fontSize: '0.9rem', cursor: showResult ? 'default' : 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {/* Explanation */}
      {showResult && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #E8E8E8' }}>
          <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>{q.explanation_pt}</p>
        </div>
      )}

      {/* Next */}
      {showResult && (
        <button onClick={handleNext} className="jolingo-btn">
          {current < questions.length - 1 ? 'PRÓXIMA' : 'VER RESULTADO'}
        </button>
      )}
    </div>
  )
}
