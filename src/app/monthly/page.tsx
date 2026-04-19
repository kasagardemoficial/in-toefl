'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProgress } from '@/lib/storage'
import { estimateTOEFLScore, saveMonthlyScore, getMonthlyScores, getScoreImprovement, getTOEFLReadinessLevel, MonthlyScore } from '@/lib/monthly-score'

export default function MonthlyPage() {
  const router = useRouter()
  const [score, setScore] = useState<MonthlyScore | null>(null)
  const [history, setHistory] = useState<MonthlyScore[]>([])
  const [showResult, setShowResult] = useState(false)
  const [improvement, setImprovement] = useState<{ improved: boolean; diff: number; message: string } | null>(null)

  useEffect(() => {
    setHistory(getMonthlyScores())
  }, [])

  function runEstimation() {
    const progress = getProgress()
    const estimated = estimateTOEFLScore(progress)
    saveMonthlyScore(estimated)
    setScore(estimated)
    setImprovement(getScoreImprovement())
    setHistory(getMonthlyScores())
    setShowResult(true)
  }

  const readiness = score ? getTOEFLReadinessLevel(score.total) : null
  const maxHistoryTotal = Math.max(...history.map(s => s.total), score?.total || 0, 1)

  // Pre-test screen
  if (!showResult) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', background: 'white' }}>
        <button onClick={() => router.push('/')} style={{ position: 'absolute', top: '16px', left: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>←</button>

        <img src="/mascot/detective.png" alt="Simulado Mensal" style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '12px' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>Simulado Mensal</h1>
        <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '24px', maxWidth: '320px', lineHeight: 1.5 }}>
          Calcule sua nota estimada no TOEFL com base no seu progresso atual nas 6 habilidades.
        </p>

        {history.length > 0 && (
          <div style={{ background: '#F7F7F7', borderRadius: '16px', padding: '16px', marginBottom: '24px', maxWidth: '320px', width: '100%', border: '1px solid #E8E8E8' }}>
            <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '8px' }}>Última avaliação</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#8CB369', margin: 0 }}>{history[history.length - 1].total}/120</p>
                <p style={{ fontSize: '0.7rem', color: '#999', margin: 0 }}>{new Date(history[history.length - 1].date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                {['Reading', 'Listening', 'Speaking', 'Writing'].map((skill, i) => {
                  const keys = ['reading', 'listening', 'speaking', 'writing'] as const
                  return (
                    <p key={skill} style={{ fontSize: '0.65rem', color: '#999', margin: '1px 0' }}>
                      {skill}: {history[history.length - 1][keys[i]]}/30
                    </p>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <button onClick={runEstimation} className="jolingo-btn" style={{ maxWidth: '320px' }}>
          CALCULAR NOTA TOEFL
        </button>

        <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '12px' }}>
          Baseado nos seus {getProgress().reading_level + getProgress().listening_level + getProgress().speaking_level + getProgress().writing_level + getProgress().vocabulary_level + getProgress().grammar_level} níveis completados
        </p>
      </div>
    )
  }

  // Result screen
  return (
    <div style={{ minHeight: '100vh', padding: '16px', maxWidth: '500px', margin: '0 auto', background: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>←</button>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Nota TOEFL Estimada</h1>
      </div>

      {/* Score card */}
      <div style={{ background: 'linear-gradient(135deg, #F0F7EA, #E8F5E9)', borderRadius: '20px', padding: '24px', textAlign: 'center', marginBottom: '20px', border: '1px solid #D4E8C4' }}>
        <img src={score!.total >= 80 ? '/mascot/master.png' : score!.total >= 40 ? '/mascot/athlete.png' : '/mascot/study.png'} alt="Score" style={{ width: '80px', height: '80px', objectFit: 'contain', margin: '0 auto 8px' }} />
        <p style={{ fontSize: '3.5rem', fontWeight: 800, color: '#8CB369', margin: '0 0 4px' }}>{score!.total}</p>
        <p style={{ fontSize: '0.85rem', color: '#6B9A4B', fontWeight: 600, marginBottom: '8px' }}>de 120 pontos</p>

        {readiness && (
          <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '20px', background: readiness.color + '20', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: readiness.color }}>{readiness.level}</span>
          </div>
        )}
        <p style={{ fontSize: '0.75rem', color: '#666', maxWidth: '280px', margin: '0 auto' }}>{readiness?.message}</p>

        {improvement && (
          <div style={{ marginTop: '12px', padding: '8px 12px', background: 'white', borderRadius: '10px', display: 'inline-block' }}>
            <span style={{ fontSize: '0.75rem', color: improvement.improved ? '#4CAF50' : '#EF5350', fontWeight: 600 }}>
              {improvement.message}
            </span>
          </div>
        )}
      </div>

      {/* Section scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Reading', value: score!.reading, color: '#8CB369', emoji: '📖' },
          { label: 'Listening', value: score!.listening, color: '#5B9BD5', emoji: '🎧' },
          { label: 'Speaking', value: score!.speaking, color: '#F4A261', emoji: '🎤' },
          { label: 'Writing', value: score!.writing, color: '#E76F51', emoji: '✏️' },
        ].map((section) => (
          <div key={section.label} style={{ background: '#F7F7F7', borderRadius: '16px', padding: '14px', border: '1px solid #E8E8E8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: section.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>{section.emoji}</div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{section.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: section.color }}>{section.value}</span>
              <span style={{ fontSize: '0.75rem', color: '#999' }}>/30</span>
            </div>
            <div style={{ height: '4px', background: '#E8E8E8', borderRadius: '2px', marginTop: '6px' }}>
              <div style={{ height: '4px', background: section.color, borderRadius: '2px', width: `${Math.round((section.value / 30) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* TOEFL score breakdown reference */}
      <div style={{ background: '#F7F7F7', borderRadius: '16px', padding: '16px', marginBottom: '20px', border: '1px solid #E8E8E8' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '10px' }}>Referência TOEFL iBT</p>
        {[
          { range: '100-120', label: 'Excelente — Top universidades (MIT, Harvard, Stanford)', color: '#00B894' },
          { range: '80-99', label: 'Bom — Maioria das universidades aceita', color: '#00D2D3' },
          { range: '60-79', label: 'Intermediário — Algumas universidades', color: '#FDCB6E' },
          { range: '40-59', label: 'Básico — Precisa melhorar', color: '#FF6B6B' },
          { range: '0-39', label: 'Iniciante — Continue praticando', color: '#FD79A8' },
        ].map((ref) => (
          <div key={ref.range} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ref.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.7rem', color: '#1A1A1A' }}><strong>{ref.range}:</strong> {ref.label}</span>
          </div>
        ))}
      </div>

      {/* History chart */}
      {history.length > 1 && (
        <div style={{ background: '#F7F7F7', borderRadius: '16px', padding: '16px', marginBottom: '20px', border: '1px solid #E8E8E8' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px' }}>Evolução mensal</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px' }}>
            {history.map((s, i) => {
              const h = Math.max(12, (s.total / maxHistoryTotal) * 100)
              const isLast = i === history.length - 1
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: isLast ? '#8CB369' : '#999' }}>{s.total}</span>
                  <div style={{ width: '100%', height: `${h}px`, background: isLast ? '#8CB369' : '#D4E8C4', borderRadius: '6px 6px 0 0' }} />
                  <span style={{ fontSize: '0.5rem', color: '#999' }}>{new Date(s.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => router.push('/simulado')} className="jolingo-btn" style={{ flex: 1, background: 'white', color: '#8CB369', border: '2px solid #8CB369' }}>
          SIMULADO REAL
        </button>
        <button onClick={() => router.push('/')} className="jolingo-btn" style={{ flex: 1 }}>
          CONTINUAR ESTUDANDO
        </button>
      </div>
    </div>
  )
}
