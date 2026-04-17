'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProgress, resetProgress } from '@/lib/storage'
import { getOnboarding } from '@/lib/onboarding'
import { getTotalBadgesEarned, getTotalBadges } from '@/lib/badges'
import { estimateTOEFLScore, getTOEFLReadinessLevel } from '@/lib/monthly-score'
import { shareProgress } from '@/lib/share'
import { UserProgress } from '@/types'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

const skills = [
  { key: 'reading', label: 'Reading', sublabel: 'Leitura', icon: '/mascot/icon_reading.png', color: '#8CB369' },
  { key: 'listening', label: 'Listening', sublabel: 'Escuta', icon: '/mascot/icon_listening.png', color: '#5B9BD5' },
  { key: 'speaking', label: 'Speaking', sublabel: 'Fala', icon: '/mascot/icon_speaking.png', color: '#F4A261' },
  { key: 'writing', label: 'Writing', sublabel: 'Escrita', icon: '/mascot/icon_writing.png', color: '#E76F51' },
  { key: 'vocabulary', label: 'Vocabulary', sublabel: 'Palavras', icon: '/mascot/icon_vocabulary.png', color: '#9B59B6' },
  { key: 'grammar', label: 'Grammar', sublabel: 'Gramática', icon: '/mascot/icon_grammar.png', color: '#3498DB' },
]

export default function ProgressPage() {
  const router = useRouter()
  const [progress, setProgress] = useState<UserProgress | null>(null)

  useEffect(() => {
    setProgress(getProgress())
  }, [])

  if (!progress) return null

  const totalLevels = 50
  const onboarding = getOnboarding()
  const allLevels = skills.map(s => progress[`${s.key}_level` as keyof UserProgress] as number)
  const overallPct = Math.round((allLevels.reduce((a, b) => a + b, 0) / (totalLevels * 6)) * 100)
  const toeflScore = estimateTOEFLScore(progress)
  const readiness = getTOEFLReadinessLevel(toeflScore.total)
  const strongestIdx = allLevels.indexOf(Math.max(...allLevels))
  const weakestIdx = allLevels.indexOf(Math.min(...allLevels))

  return (
    <div style={{ minHeight: '100vh', padding: '16px', paddingBottom: '40px', maxWidth: '500px', margin: '0 auto', background: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>←</button>
        <img src="/mascot/card_progresso.png" alt="Progresso" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '10px' }} />
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Meu Progresso</h1>
          <p style={{ fontSize: '0.7rem', color: '#999', margin: 0 }}>{onboarding.name || 'Aluno'}</p>
        </div>
      </div>

      {/* TOEFL Score card */}
      <div style={{ background: 'linear-gradient(135deg, #F0F7EA, #E8F5E9)', borderRadius: '20px', padding: '20px', textAlign: 'center', marginBottom: '16px', border: '1px solid #D4E8C4' }}>
        <p style={{ fontSize: '0.7rem', color: '#6B9A4B', fontWeight: 700, marginBottom: '4px' }}>NOTA TOEFL ESTIMADA</p>
        <p style={{ fontSize: '3rem', fontWeight: 800, color: '#8CB369', margin: '0 0 4px' }}>{toeflScore.total}<span style={{ fontSize: '1rem', color: '#999' }}>/120</span></p>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '16px', background: readiness.color + '20', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: readiness.color }}>{readiness.level}</span>
        </div>
        <p style={{ fontSize: '0.7rem', color: '#666', maxWidth: '260px', margin: '0 auto' }}>{readiness.message}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
          {[
            { label: 'R', value: toeflScore.reading, color: '#8CB369' },
            { label: 'L', value: toeflScore.listening, color: '#5B9BD5' },
            { label: 'S', value: toeflScore.speaking, color: '#F4A261' },
            { label: 'W', value: toeflScore.writing, color: '#E76F51' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: '0.6rem', color: '#999', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => shareProgress({
            name: onboarding.name || 'Aluno',
            streak: progress.streak,
            xp: progress.xp,
            toeflScore: toeflScore.total,
            topSkill: skills[strongestIdx].label,
            topLevel: allLevels[strongestIdx],
            overallPct,
          })}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', background: 'white', border: '1px solid #D4E8C4', borderRadius: '20px', padding: '8px 20px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: '#6B9A4B', fontFamily: 'inherit' }}
        >
          📤 Compartilhar nos Stories
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { value: progress.streak, label: 'Streak', icon: '🔥', color: '#FF7043' },
          { value: progress.xp, label: 'XP', icon: '⭐', color: '#FFC107' },
          { value: getTotalBadgesEarned(), label: 'Badges', icon: '🏆', color: '#8CB369' },
          { value: `${overallPct}%`, label: 'Geral', icon: '📈', color: '#5B9BD5' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#F7F7F7', borderRadius: '12px', padding: '12px 8px', border: '1px solid #E8E8E8', textAlign: 'center' }}>
            <span style={{ fontSize: '1rem' }}>{stat.icon}</span>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: stat.color, margin: '2px 0 0' }}>{stat.value}</p>
            <p style={{ fontSize: '0.6rem', color: '#999', margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Strongest / Weakest */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: '#E8F5E9', borderRadius: '14px', padding: '14px', border: '1px solid #C8E6C9' }}>
          <p style={{ fontSize: '0.65rem', color: '#4CAF50', fontWeight: 700, marginBottom: '6px' }}>MAIS FORTE</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={skills[strongestIdx].icon} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>{skills[strongestIdx].label}</p>
              <p style={{ fontSize: '0.7rem', color: '#4CAF50', margin: 0 }}>Nível {allLevels[strongestIdx]}</p>
            </div>
          </div>
        </div>
        <div style={{ background: '#FFF3E0', borderRadius: '14px', padding: '14px', border: '1px solid #FFE0B2' }}>
          <p style={{ fontSize: '0.65rem', color: '#F4A261', fontWeight: 700, marginBottom: '6px' }}>PRECISA FOCAR</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={skills[weakestIdx].icon} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>{skills[weakestIdx].label}</p>
              <p style={{ fontSize: '0.7rem', color: '#F4A261', margin: 0 }}>Nível {allLevels[weakestIdx]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills detail */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '12px' }}>Habilidades</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {skills.map((skill, i) => {
            const level = allLevels[i]
            const pct = Math.round((level / totalLevels) * 100)
            const phase = level <= 20 ? 'English Base' : level <= 40 ? 'TOEFL Training' : 'Simulados'
            return (
              <Link key={skill.key} href={`/lesson/${skill.key}`} style={{ textDecoration: 'none', color: '#1A1A1A' }}>
                <div style={{ background: '#F7F7F7', borderRadius: '14px', padding: '14px', border: '1px solid #E8E8E8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={skill.icon} alt={skill.label} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <p style={{ fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>{skill.label}</p>
                        <p style={{ color: '#999', margin: 0, fontSize: '0.65rem' }}>{skill.sublabel} · {phase}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 800, color: skill.color, margin: 0, fontSize: '0.9rem' }}>Nv {level}</p>
                      <p style={{ fontSize: '0.65rem', color: '#999', margin: 0 }}>{pct}%</p>
                    </div>
                  </div>
                  <div style={{ height: '6px', background: '#E8E8E8', borderRadius: '3px' }}>
                    <div style={{ height: '6px', background: skill.color, borderRadius: '3px', width: `${pct}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
        <Link href="/review" style={{ textDecoration: 'none', color: '#1A1A1A' }}>
          <div style={{ background: '#F7F7F7', borderRadius: '14px', padding: '14px', border: '1px solid #E8E8E8', textAlign: 'center' }}>
            <span style={{ fontSize: '1.2rem' }}>📅</span>
            <p style={{ fontWeight: 700, fontSize: '0.8rem', margin: '4px 0 0' }}>Review Semanal</p>
          </div>
        </Link>
        <Link href="/monthly" style={{ textDecoration: 'none', color: '#1A1A1A' }}>
          <div style={{ background: '#F7F7F7', borderRadius: '14px', padding: '14px', border: '1px solid #E8E8E8', textAlign: 'center' }}>
            <span style={{ fontSize: '1.2rem' }}>🎯</span>
            <p style={{ fontWeight: 700, fontSize: '0.8rem', margin: '4px 0 0' }}>Nota TOEFL</p>
          </div>
        </Link>
      </div>

      {/* Info */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '0.7rem', color: '#999' }}>
          Último acesso: {progress.lastActiveDate ? new Date(progress.lastActiveDate).toLocaleDateString('pt-BR') : '--'}
        </p>
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          if (confirm('Tem certeza que deseja resetar todo o progresso? Esta ação não pode ser desfeita.')) {
            resetProgress()
            router.push('/')
          }
        }}
        style={{ display: 'block', width: '100%', textAlign: 'center', fontSize: '0.75rem', color: '#EF5350', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        Resetar todo o progresso
      </button>
      <BottomNav />
    </div>
  )
}
