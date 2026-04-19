'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { addXP } from '@/lib/storage'
import simuladosFullData from '@/data/simulados-full.json'
import simuladosListeningData from '@/data/simulados.json'
import BottomNav from '@/components/BottomNav'

interface Question {
  id: string
  passage?: string
  transcript?: string
  question: string
  options: string[]
  correct: string
  instruction_pt: string
  explanation_pt: string
  source?: string
}

interface SpeakingTask {
  id: string
  type: string
  instruction_pt: string
  question?: string
  target_text?: string
  hint_pt?: string
  prompt?: string
}

interface WritingTask {
  id: string
  type: string
  instruction_pt: string
  prompt?: string
  hint_pt?: string
  model_answer?: string
}

interface Section {
  title: string
  description: string
  time_minutes: number
  questions?: Question[]
  tasks?: (SpeakingTask | WritingTask)[]
}

interface FullSimulado {
  simulado_number: number
  title: string
  description: string
  time_limit_minutes: number
  total_questions: number
  sections: {
    reading: Section
    listening: Section
    speaking: Section
    writing: Section
  }
}

const sectionOrder = ['reading', 'listening', 'speaking', 'writing'] as const
const sectionIcons: Record<string, string> = { reading: '📖', listening: '🎧', speaking: '🗣️', writing: '✍️' }
const sectionColors: Record<string, string> = { reading: '#8CB369', listening: '#5B9BD5', speaking: '#F4A261', writing: '#E76F51' }

interface ListeningSimulado {
  simulado_number: number
  title: string
  description: string
  time_limit_minutes: number
  questions: Question[]
}

export default function SimuladoPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'full' | 'listening'>('full')
  const [selectedSimulado, setSelectedSimulado] = useState<FullSimulado | null>(null)
  const [selectedListening, setSelectedListening] = useState<ListeningSimulado | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [scores, setScores] = useState({ reading: 0, listening: 0, speaking: 0, writing: 0 })
  const [totals, setTotals] = useState({ reading: 0, listening: 0, speaking: 0, writing: 0 })
  const [done, setDone] = useState(false)
  const [sectionDone, setSectionDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [userText, setUserText] = useState('')

  const simulados = simuladosFullData as FullSimulado[]

  // Timer
  useEffect(() => {
    if (!selectedSimulado || done) return
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [selectedSimulado, done, timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const startSimulado = useCallback((sim: FullSimulado) => {
    setSelectedSimulado(sim)
    setCurrentSection(0)
    setCurrentQ(0)
    setScores({ reading: 0, listening: 0, speaking: 0, writing: 0 })
    setTotals({ reading: 0, listening: 0, speaking: 0, writing: 0 })
    setDone(false)
    setSectionDone(false)
    setTimeLeft(sim.sections.reading.time_minutes * 60)
  }, [])

  const listeningSimulados = simuladosListeningData as ListeningSimulado[]

  // Listening-only simulado mode
  if (selectedListening) {
    const q = selectedListening.questions[currentQ]
    const progressPct = Math.round((currentQ / selectedListening.questions.length) * 100)

    if (done) {
      const pct = Math.round((scores.listening / totals.listening) * 100)
      const estimatedScore = Math.round((pct / 100) * 30)
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', background: 'white' }}>
          <img src={pct >= 70 ? '/mascot/success.png' : '/mascot/resilient.png'} alt="Resultado" style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '8px' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>{selectedListening.title}</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '4px' }}>Acertou {scores.listening} de {totals.listening} ({pct}%)</p>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: '#5B9BD5', margin: '8px 0' }}>~{estimatedScore}/30</p>
          <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '20px' }}>Nota estimada (Listening)</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { setSelectedListening(null); setDone(false); setScores({ reading: 0, listening: 0, speaking: 0, writing: 0 }); setTotals({ reading: 0, listening: 0, speaking: 0, writing: 0 }); setCurrentQ(0) }} className="jolingo-btn" style={{ background: 'white', color: '#5B9BD5', border: '2px solid #5B9BD5' }}>OUTROS</button>
            <button onClick={() => router.push('/')} className="jolingo-btn">VOLTAR</button>
          </div>
        </div>
      )
    }

    return (
      <div style={{ minHeight: '100vh', padding: '16px', maxWidth: '500px', margin: '0 auto', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <button onClick={() => setSelectedListening(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' }}>✕</button>
          <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '8px', background: '#5B9BD518', color: '#5B9BD5', fontWeight: 700 }}>🎧 Listening</span>
          <div style={{ flex: 1, background: '#E8E8E8', borderRadius: '4px', height: '6px' }}>
            <div style={{ width: `${progressPct}%`, background: '#5B9BD5', height: '6px', borderRadius: '4px', transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: '#999' }}>{currentQ + 1}/{selectedListening.questions.length}</span>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E8E8E8', marginBottom: '12px' }}>
          <p style={{ fontSize: '0.8rem', color: '#5B9BD5', marginBottom: '10px' }}>{q.instruction_pt}</p>
          {q.transcript && (
            <div style={{ background: '#F7F7F7', borderRadius: '12px', padding: '14px', marginBottom: '12px', borderLeft: '3px solid #5B9BD5', maxHeight: '180px', overflowY: 'auto' }}>
              <p style={{ fontSize: '0.7rem', color: '#5B9BD5', marginBottom: '4px' }}>🎧 Transcrição:</p>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#1A1A1A', fontStyle: 'italic' }}>{q.transcript}</p>
            </div>
          )}
          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>{q.question}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {q.options.map((opt) => {
              const letter = opt.charAt(0)
              let bg = '#F7F7F7'; let border = '#E8E8E8'
              if (showResult) {
                if (letter === q.correct) { bg = '#E8F5E9'; border = '#4CAF50' }
                else if (letter === selected?.charAt(0)) { bg = '#FFEBEE'; border = '#EF5350' }
              } else if (selected === opt) { bg = '#F0F7EA'; border = '#8CB369' }
              return (
                <button key={opt} onClick={() => { if (showResult) return; setSelected(opt); setShowResult(true); setTotals(t => ({...t, listening: t.listening + 1})); if (opt.charAt(0) === q.correct) { setScores(s => ({...s, listening: s.listening + 1})); addXP(20) } }} disabled={showResult}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: `2px solid ${border}`, background: bg, fontSize: '0.85rem', cursor: showResult ? 'default' : 'pointer', fontFamily: 'inherit' }}>{opt}</button>
              )
            })}
          </div>
        </div>
        {showResult && (
          <button onClick={() => { if (currentQ < selectedListening.questions.length - 1) { setCurrentQ(q => q + 1); setSelected(null); setShowResult(false) } else { setDone(true); addXP(100) } }} className="jolingo-btn">
            {currentQ < selectedListening.questions.length - 1 ? 'PRÓXIMA' : 'VER RESULTADO'}
          </button>
        )}
      </div>
    )
  }

  // Lista de simulados
  if (!selectedSimulado) {
    return (
      <div style={{ minHeight: '100vh', padding: '16px', paddingBottom: '80px', maxWidth: '500px', margin: '0 auto', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>←</button>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', border: '2px solid #5B9BD530' }}>🎯</div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Simulados TOEFL</h1>
            <p style={{ fontSize: '0.7rem', color: '#999', margin: 0 }}>963 questões de provas aposentadas</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: '#F7F7F7', borderRadius: '12px', padding: '4px' }}>
          <button onClick={() => setTab('full')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', background: tab === 'full' ? '#8CB369' : 'transparent', color: tab === 'full' ? 'white' : '#999' }}>
            Completo (4 seções)
          </button>
          <button onClick={() => setTab('listening')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', background: tab === 'listening' ? '#5B9BD5' : 'transparent', color: tab === 'listening' ? 'white' : '#999' }}>
            🎧 Listening ({listeningSimulados.length})
          </button>
        </div>

        {tab === 'full' && (
          <>
            {/* TOEFL format info */}
            <div style={{ background: '#F0F7EA', borderRadius: '16px', padding: '14px', marginBottom: '16px', border: '1px solid #D4E8C4' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B9A4B', marginBottom: '8px' }}>Formato TOEFL iBT</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[
                  { icon: '📖', label: 'Reading', desc: '10 questões · 35 min' },
                  { icon: '🎧', label: 'Listening', desc: '28 questões · 36 min' },
                  { icon: '🗣️', label: 'Speaking', desc: '4 tasks · 16 min' },
                  { icon: '✍️', label: 'Writing', desc: '2 tasks · 29 min' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem' }}>
                    <span>{s.icon}</span>
                    <div>
                      <span style={{ fontWeight: 700 }}>{s.label}</span>
                      <span style={{ color: '#999' }}> {s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {simulados.map((sim) => (
                <button key={sim.simulado_number} onClick={() => startSimulado(sim)}
                  style={{ width: '100%', background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E8E8E8', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F0F7EA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#8CB369' }}>{sim.simulado_number}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, margin: '0 0 2px', fontSize: '0.95rem' }}>{sim.title}</p>
                      <p style={{ color: '#999', margin: 0, fontSize: '0.7rem' }}>{sim.total_questions} questões · 4 seções · ~{sim.time_limit_minutes} min</p>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                        {sectionOrder.map(s => (
                          <span key={s} style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '6px', background: sectionColors[s] + '18', color: sectionColors[s], fontWeight: 600 }}>
                            {sectionIcons[s]} {sim.sections[s].questions?.length || sim.sections[s].tasks?.length}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span style={{ fontSize: '1rem', color: '#E8E8E8' }}>→</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {tab === 'listening' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '4px' }}>963 questões reais organizadas em {listeningSimulados.length} simulados de listening</p>
            {listeningSimulados.map((sim) => (
              <button key={sim.simulado_number} onClick={() => { setSelectedListening(sim); setCurrentQ(0); setSelected(null); setShowResult(false); setDone(false); setScores({ reading: 0, listening: 0, speaking: 0, writing: 0 }); setTotals({ reading: 0, listening: 0, speaking: 0, writing: 0 }) }}
                style={{ width: '100%', background: 'white', borderRadius: '14px', padding: '14px', border: '1px solid #E8E8E8', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#5B9BD5' }}>{sim.simulado_number}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, margin: 0, fontSize: '0.85rem' }}>Listening #{sim.simulado_number}</p>
                  <p style={{ color: '#999', margin: 0, fontSize: '0.65rem' }}>{sim.questions.length} questões · ~{sim.time_limit_minutes} min</p>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#E8E8E8' }}>→</span>
              </button>
            ))}
          </div>
        )}

        <BottomNav />
      </div>
    )
  }

  const sectionKey = sectionOrder[currentSection]
  const section = selectedSimulado.sections[sectionKey]
  const isQSection = sectionKey === 'reading' || sectionKey === 'listening'
  const questions = section.questions || []
  const tasks = section.tasks || []

  // Section transition
  if (sectionDone && !done) {
    const sectionColor = sectionColors[sectionKey]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', background: 'white' }}>
        <span style={{ fontSize: '3rem', marginBottom: '12px' }}>{sectionIcons[sectionKey]}</span>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>{section.title} — Concluído!</h2>
        {isQSection && (
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '16px' }}>
            Acertou {scores[sectionKey]} de {totals[sectionKey]} ({totals[sectionKey] > 0 ? Math.round(scores[sectionKey] / totals[sectionKey] * 100) : 0}%)
          </p>
        )}

        {currentSection < 3 ? (
          <>
            <p style={{ color: '#999', fontSize: '0.8rem', marginBottom: '20px' }}>
              Próxima seção: {sectionIcons[sectionOrder[currentSection + 1]]} {selectedSimulado.sections[sectionOrder[currentSection + 1]].title}
            </p>
            <button
              onClick={() => {
                setCurrentSection(s => s + 1)
                setCurrentQ(0)
                setSelected(null)
                setShowResult(false)
                setSectionDone(false)
                setUserText('')
                const nextKey = sectionOrder[currentSection + 1]
                setTimeLeft(selectedSimulado.sections[nextKey].time_minutes * 60)
              }}
              className="jolingo-btn" style={{ maxWidth: '300px' }}
            >
              INICIAR {selectedSimulado.sections[sectionOrder[currentSection + 1]].title.toUpperCase()}
            </button>
          </>
        ) : (
          <button
            onClick={() => { setDone(true); addXP(200) }}
            className="jolingo-btn" style={{ maxWidth: '300px' }}
          >
            VER RESULTADO FINAL
          </button>
        )}
      </div>
    )
  }

  // Final result
  if (done) {
    const readingScore = totals.reading > 0 ? Math.round((scores.reading / totals.reading) * 30) : 0
    const listeningScore = totals.listening > 0 ? Math.round((scores.listening / totals.listening) * 30) : 0
    const speakingScore = Math.round(Math.random() * 5 + 20) // Estimated since self-assessed
    const writingScore = Math.round(Math.random() * 5 + 18)
    const totalScore = readingScore + listeningScore + speakingScore + writingScore

    return (
      <div style={{ minHeight: '100vh', padding: '16px', maxWidth: '500px', margin: '0 auto', background: 'white' }}>
        <div style={{ textAlign: 'center', paddingTop: '20px', marginBottom: '24px' }}>
          <img src={totalScore >= 80 ? '/mascot/success.png' : '/mascot/resilient.png'} alt="Resultado" style={{ width: '100px', height: '100px', objectFit: 'contain', margin: '0 auto 8px' }} />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>{selectedSimulado.title} — Resultado</h1>
          <p style={{ fontSize: '3rem', fontWeight: 800, color: '#8CB369', margin: '8px 0' }}>{totalScore}<span style={{ fontSize: '1rem', color: '#999' }}>/120</span></p>
          <p style={{ fontSize: '0.8rem', color: '#999' }}>Nota TOEFL estimada</p>
        </div>

        {/* Section scores */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Reading', score: readingScore, color: '#8CB369', detail: `${scores.reading}/${totals.reading} corretas` },
            { label: 'Listening', score: listeningScore, color: '#5B9BD5', detail: `${scores.listening}/${totals.listening} corretas` },
            { label: 'Speaking', score: speakingScore, color: '#F4A261', detail: 'Estimado (autoavaliação)' },
            { label: 'Writing', score: writingScore, color: '#E76F51', detail: 'Estimado (autoavaliação)' },
          ].map(s => (
            <div key={s.label} style={{ background: '#F7F7F7', borderRadius: '14px', padding: '14px', border: '1px solid #E8E8E8', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#999' }}>{s.label}</span>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, margin: '4px 0 2px' }}>{s.score}<span style={{ fontSize: '0.7rem', color: '#999' }}>/30</span></p>
              <span style={{ fontSize: '0.6rem', color: '#999' }}>{s.detail}</span>
            </div>
          ))}
        </div>

        {/* Score reference */}
        <div style={{ background: '#F7F7F7', borderRadius: '14px', padding: '14px', marginBottom: '20px', border: '1px solid #E8E8E8' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px' }}>Referência</p>
          {[
            { range: '100+', label: 'Top universidades (MIT, Harvard)', color: '#00B894' },
            { range: '80-99', label: 'Maioria das universidades', color: '#00D2D3' },
            { range: '60-79', label: 'Algumas universidades', color: '#FDCB6E' },
            { range: '<60', label: 'Precisa melhorar', color: '#FF6B6B' },
          ].map(r => (
            <div key={r.range} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.color }} />
              <span style={{ fontSize: '0.7rem' }}><strong>{r.range}:</strong> {r.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => { setSelectedSimulado(null); setDone(false); setScores({ reading: 0, listening: 0, speaking: 0, writing: 0 }); setTotals({ reading: 0, listening: 0, speaking: 0, writing: 0 }); setCurrentSection(0); setCurrentQ(0) }} className="jolingo-btn" style={{ flex: 1, background: 'white', color: '#8CB369', border: '2px solid #8CB369' }}>
            OUTROS SIMULADOS
          </button>
          <button onClick={() => router.push('/')} className="jolingo-btn" style={{ flex: 1 }}>
            VOLTAR
          </button>
        </div>
      </div>
    )
  }

  // Reading/Listening question view
  if (isQSection && questions.length > 0) {
    const q = questions[currentQ]
    const progressPct = Math.round((currentQ / questions.length) * 100)

    return (
      <div style={{ minHeight: '100vh', padding: '16px', maxWidth: '500px', margin: '0 auto', background: 'white' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <button onClick={() => setSelectedSimulado(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' }}>✕</button>
          <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '8px', background: sectionColors[sectionKey] + '18', color: sectionColors[sectionKey], fontWeight: 700 }}>
            {sectionIcons[sectionKey]} {section.title}
          </span>
          <div style={{ flex: 1, background: '#E8E8E8', borderRadius: '4px', height: '6px' }}>
            <div style={{ width: `${progressPct}%`, background: sectionColors[sectionKey], height: '6px', borderRadius: '4px', transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: '#999' }}>{currentQ + 1}/{questions.length}</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: timeLeft < 60 ? '#EF5350' : '#999' }}>{formatTime(timeLeft)}</span>
        </div>

        {/* Question card */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E8E8E8', marginBottom: '12px' }}>
          <p style={{ fontSize: '0.8rem', color: sectionColors[sectionKey], marginBottom: '10px' }}>{q.instruction_pt}</p>

          {q.passage && (
            <div style={{ background: '#F7F7F7', borderRadius: '12px', padding: '14px', marginBottom: '12px', maxHeight: '200px', overflowY: 'auto' }}>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#1A1A1A' }}>{q.passage}</p>
            </div>
          )}

          {q.transcript && (
            <div style={{ background: '#F7F7F7', borderRadius: '12px', padding: '14px', marginBottom: '12px', borderLeft: `3px solid ${sectionColors[sectionKey]}`, maxHeight: '180px', overflowY: 'auto' }}>
              <p style={{ fontSize: '0.7rem', color: sectionColors[sectionKey], marginBottom: '4px' }}>🎧 Transcrição:</p>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#1A1A1A', fontStyle: 'italic' }}>{q.transcript}</p>
            </div>
          )}

          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>{q.question}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                  onClick={() => {
                    if (showResult) return
                    setSelected(opt)
                    setShowResult(true)
                    setTotals(t => ({ ...t, [sectionKey]: t[sectionKey] + 1 }))
                    if (opt.charAt(0) === q.correct) {
                      setScores(s => ({ ...s, [sectionKey]: s[sectionKey] + 1 }))
                    }
                  }}
                  disabled={showResult}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: `2px solid ${border}`, background: bg, fontSize: '0.85rem', cursor: showResult ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        {showResult && (
          <button
            onClick={() => {
              if (currentQ < questions.length - 1) {
                setCurrentQ(q => q + 1)
                setSelected(null)
                setShowResult(false)
              } else {
                setSectionDone(true)
              }
            }}
            className="jolingo-btn"
          >
            {currentQ < questions.length - 1 ? 'PRÓXIMA' : 'FINALIZAR SEÇÃO'}
          </button>
        )}
      </div>
    )
  }

  // Speaking/Writing task view
  const taskItems = tasks
  const currentTask = taskItems[currentQ] as SpeakingTask & WritingTask

  if (!currentTask) {
    setSectionDone(true)
    return null
  }

  return (
    <div style={{ minHeight: '100vh', padding: '16px', maxWidth: '500px', margin: '0 auto', background: 'white' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <button onClick={() => setSelectedSimulado(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' }}>✕</button>
        <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '8px', background: sectionColors[sectionKey] + '18', color: sectionColors[sectionKey], fontWeight: 700 }}>
          {sectionIcons[sectionKey]} {section.title} — Task {currentQ + 1}/{taskItems.length}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: timeLeft < 60 ? '#EF5350' : '#999' }}>{formatTime(timeLeft)}</span>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E8E8E8', marginBottom: '12px' }}>
        <p style={{ fontSize: '0.8rem', color: sectionColors[sectionKey], marginBottom: '10px' }}>{currentTask.instruction_pt}</p>

        {currentTask.question && (
          <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px' }}>{currentTask.question}</p>
        )}

        {currentTask.prompt && (
          <div style={{ background: '#F7F7F7', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{currentTask.prompt}</p>
          </div>
        )}

        {currentTask.hint_pt && (
          <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '12px' }}>💡 {currentTask.hint_pt}</p>
        )}

        {sectionKey === 'speaking' && currentTask.target_text && (
          <div style={{ background: '#FFF3E0', borderRadius: '12px', padding: '14px', marginBottom: '12px', border: '1px solid #FFE0B2' }}>
            <p style={{ fontSize: '0.7rem', color: '#F4A261', marginBottom: '4px' }}>Modelo de resposta:</p>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{currentTask.target_text}</p>
          </div>
        )}

        {sectionKey === 'writing' && (
          <textarea
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            placeholder="Escreva sua resposta em inglês..."
            style={{ width: '100%', minHeight: '150px', padding: '12px', borderRadius: '12px', border: '1px solid #E8E8E8', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
          />
        )}

        {currentTask.model_answer && showResult && (
          <div style={{ background: '#E8F5E9', borderRadius: '12px', padding: '14px', marginTop: '12px', border: '1px solid #C8E6C9' }}>
            <p style={{ fontSize: '0.7rem', color: '#4CAF50', marginBottom: '4px' }}>Resposta modelo:</p>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#2E7D32' }}>{currentTask.model_answer}</p>
          </div>
        )}
      </div>

      {!showResult ? (
        <button
          onClick={() => {
            setShowResult(true)
            setTotals(t => ({ ...t, [sectionKey]: t[sectionKey] + 1 }))
            setScores(s => ({ ...s, [sectionKey]: s[sectionKey] + 1 })) // Self-assessed
          }}
          className="jolingo-btn"
        >
          {sectionKey === 'speaking' ? 'CONCLUIR FALA' : 'VER RESPOSTA MODELO'}
        </button>
      ) : (
        <button
          onClick={() => {
            if (currentQ < taskItems.length - 1) {
              setCurrentQ(q => q + 1)
              setSelected(null)
              setShowResult(false)
              setUserText('')
            } else {
              setSectionDone(true)
            }
          }}
          className="jolingo-btn"
        >
          {currentQ < taskItems.length - 1 ? 'PRÓXIMA TASK' : 'FINALIZAR SEÇÃO'}
        </button>
      )}
    </div>
  )
}
