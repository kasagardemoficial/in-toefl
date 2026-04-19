'use client'

import { useEffect, useState } from 'react'
import { getProgress, updateStreak, saveProgress } from '@/lib/storage'
import { isOnboardingDone, getOnboarding } from '@/lib/onboarding'
import { checkAndAwardBadges, getTotalBadgesEarned, getTotalBadges } from '@/lib/badges'
import { getLeague, getDailyChallenge } from '@/lib/gamification'
import { UserProgress } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { IconSettings, IconFlame, IconStar } from '@/components/Icons'

const skillInfo = [
  { key: 'reading', label: 'Reading', sublabel: 'Leitura', emoji: '📖', color: '#8CB369' },
  { key: 'listening', label: 'Listening', sublabel: 'Escuta', emoji: '🎧', color: '#5B9BD5' },
  { key: 'speaking', label: 'Speaking', sublabel: 'Fala', emoji: '🎤', color: '#F4A261' },
  { key: 'writing', label: 'Writing', sublabel: 'Escrita', emoji: '✏️', color: '#E76F51' },
  { key: 'vocabulary', label: 'Vocabulary', sublabel: 'Palavras', emoji: '📚', color: '#9B59B6' },
  { key: 'grammar', label: 'Grammar', sublabel: 'Gramática', emoji: '📐', color: '#3498DB' },
]

const phrases = [
  '💪 Cada lição te aproxima do TOEFL!',
  '🌟 Consistência é a chave!',
  '🚀 Você está construindo seu futuro!',
  '🎯 Foco no objetivo!',
  '⭐ Grandes conquistas, pequenos passos!',
]

export default function Home() {
  const router = useRouter()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [phrase] = useState(phrases[Math.floor(Math.random() * phrases.length)])
  const [newBadges, setNewBadges] = useState<string[]>([])

  useEffect(() => {
    if (!isOnboardingDone()) { router.push('/welcome'); return }
    updateStreak()
    const p = getProgress()

    // Auto-fix: if placement was done but grammar stayed at 1 (bug fix)
    if (p.placementDone && p.grammar_level === 1) {
      const otherLevels = [p.reading_level, p.listening_level, p.speaking_level, p.writing_level, p.vocabulary_level]
      const avg = Math.round(otherLevels.reduce((a, b) => a + b, 0) / otherLevels.length)
      if (avg > 5) {
        p.grammar_level = avg
        saveProgress(p)
      }
    }

    setProgress(p)
    const awarded = checkAndAwardBadges(p)
    if (awarded.length > 0) {
      setNewBadges(awarded.map(b => `${b.icon} ${b.name}`))
      setTimeout(() => setNewBadges([]), 5000)
    }
  }, [router])

  if (!progress) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <img src="/mascot/main.png" alt="In-TOEFL" style={{ width: '80px', height: '80px', objectFit: 'contain' }} className="streak-fire" />
    </div>
  )

  // Placement screen — give user choice, don't block
  if (!progress.placementDone) return (
    <div style={{ minHeight: '100vh', padding: '24px', background: 'white', maxWidth: '500px', margin: '0 auto' }}>
      {/* Welcome header */}
      {/* Back button */}
      <div style={{ padding: '12px 0' }}>
        <button onClick={() => { const p = getProgress(); p.placementDone = true; saveProgress(p); setProgress({...p}) }} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#999' }}>← Voltar</button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <img src="/mascot/main.png" alt="In-TOEFL" style={{ width: '100px', height: '100px', objectFit: 'contain', margin: '0 auto 8px' }} />
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8CB369', marginBottom: '4px' }}>Bem-vindo ao In-TOEFL!</h1>
        <p style={{ color: '#999', fontSize: '0.85rem' }}>O que você quer fazer primeiro?</p>
      </div>

      {/* Option 1: Placement test */}
      <button onClick={() => router.push('/placement')} style={{ width: '100%', background: '#F0F7EA', borderRadius: '16px', padding: '18px', marginBottom: '12px', border: '2px solid #8CB369', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'inherit' }}>
        <img src="/mascot/detective.png" alt="Teste" style={{ width: '52px', height: '52px', objectFit: 'contain', flexShrink: 0 }} />
        <div>
          <p style={{ fontWeight: 800, fontSize: '0.95rem', margin: '0 0 2px', color: '#1A1A1A' }}>Fazer Teste de Nivelamento</p>
          <p style={{ fontSize: '0.75rem', color: '#6B9A4B', margin: '0 0 2px' }}>15 questões adaptativas · ~5 min · Descubra seu nível</p>
          <span style={{ fontSize: '0.65rem', color: '#8CB369', fontWeight: 700, background: '#E8F5E9', padding: '2px 8px', borderRadius: '8px' }}>RECOMENDADO</span>
        </div>
      </button>

      {/* Option 2: Start from level 1 */}
      <button onClick={() => { const p = getProgress(); p.placementDone = true; saveProgress(p); setProgress({...p}) }} style={{ width: '100%', background: 'white', borderRadius: '16px', padding: '18px', marginBottom: '12px', border: '1px solid #E8E8E8', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'inherit' }}>
        <img src="/mascot/study.png" alt="Começar" style={{ width: '52px', height: '52px', objectFit: 'contain', flexShrink: 0 }} />
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 2px', color: '#1A1A1A' }}>Começar do Nível 1</p>
          <p style={{ fontSize: '0.75rem', color: '#999', margin: 0 }}>Pular o teste e ir direto para os exercícios</p>
        </div>
      </button>

      {/* Option 3: Explore first */}
      <button onClick={() => { const p = getProgress(); p.placementDone = true; saveProgress(p); setProgress({...p}) }} style={{ width: '100%', background: 'white', borderRadius: '16px', padding: '18px', marginBottom: '24px', border: '1px solid #E8E8E8', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'inherit' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>👀</div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 2px', color: '#1A1A1A' }}>Explorar o App Primeiro</p>
          <p style={{ fontSize: '0.75rem', color: '#999', margin: 0 }}>Conhecer as habilidades, simulados e conquistas</p>
        </div>
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#999' }}>
        Você pode fazer o teste de nivelamento a qualquer momento
      </p>
    </div>
  )

  const totalLevels = 50
  const onboarding = getOnboarding()
  const allLevels = [progress.reading_level, progress.listening_level, progress.speaking_level, progress.writing_level, progress.vocabulary_level, progress.grammar_level]
  const overallProgress = Math.round((allLevels.reduce((a, b) => a + b, 0) / (totalLevels * 6)) * 100)
  const maxIdx = allLevels.indexOf(Math.max(...allLevels))

  return (
    <div className="page-content safe-bottom" style={{ minHeight: '100vh', background: 'white', maxWidth: '500px', margin: '0 auto' }}>
      {/* Badge notification */}
      {newBadges.length > 0 && (
        <div className="badge-unlock" style={{ position: 'fixed', top: '16px', left: '16px', right: '16px', zIndex: 50, background: '#8CB369', borderRadius: '16px', padding: '14px', textAlign: 'center', color: 'white', boxShadow: '0 8px 30px rgba(140,179,105,0.4)' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>🎉 Nova conquista!</p>
          <p>{newBadges.join(' • ')}</p>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#999', fontSize: '0.75rem', margin: 0 }}>Bem-vindo de volta</p>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{onboarding.name || 'Aluno'} 👋</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/settings" style={{ padding: '6px', textDecoration: 'none', color: '#AFAFAF', display: 'flex' }} title="Configurações">
            <IconSettings size={20} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFF3E0', borderRadius: '20px', padding: '6px 12px' }}>
            <IconFlame size={16} color="#FF7043" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FF7043' }}>{progress.streak}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFF8E1', borderRadius: '20px', padding: '6px 12px' }}>
            <IconStar size={14} color="#FFC107" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFC107' }}>{progress.xp}</span>
          </div>
        </div>
      </div>

      {/* Progress card */}
      <div style={{ padding: '0 20px', marginBottom: '16px' }}>
        <div style={{ background: '#F0F7EA', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <p style={{ color: '#6B9A4B', fontSize: '0.7rem', fontWeight: 700, margin: 0 }}>
                {overallProgress < 40 ? 'FASE 1 — ENGLISH BASE' : overallProgress < 80 ? 'FASE 2 — TOEFL TRAINING' : 'FASE 3 — SIMULADOS'}
              </p>
              <p style={{ color: '#666', fontSize: '0.75rem', margin: '2px 0 0' }}>Progresso geral</p>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8CB369' }}>{overallProgress}%</span>
          </div>
          <div className="jolingo-progress"><div className="jolingo-progress-fill" style={{ width: `${overallProgress}%` }} /></div>
        </div>
      </div>

      {/* Daily info row */}
      <div style={{ padding: '0 20px', marginBottom: '16px' }}>
        {(() => {
          const daily = getDailyChallenge()
          const league = getLeague()
          return (
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="tap-feedback" style={{ flex: 1, background: '#F7F7F7', borderRadius: '14px', padding: '10px 12px', border: '2px solid #E8E8E8', borderBottom: '4px solid #E8E8E8' }}>
                <p style={{ fontSize: '0.6rem', color: '#999', margin: '0 0 2px', fontWeight: 600 }}>{league.icon} Liga {league.league}</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: league.color, margin: 0 }}>{league.weeklyXP} XP</p>
              </div>
              <Link href="/review" className="tap-feedback" style={{ flex: 1, background: daily.completed ? '#E8F5E9' : '#FFF8E1', borderRadius: '14px', padding: '10px 12px', border: `2px solid ${daily.completed ? '#C8E6C9' : '#FFE0B2'}`, borderBottom: `4px solid ${daily.completed ? '#C8E6C9' : '#FFE0B2'}`, textDecoration: 'none', color: '#1A1A1A' }}>
                <p style={{ fontSize: '0.6rem', color: daily.completed ? '#4CAF50' : '#E65100', margin: '0 0 2px', fontWeight: 600 }}>{daily.completed ? '✅' : '🎯'} Desafio</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666', margin: 0 }}>{daily.progress}/{daily.goal}</p>
              </Link>
            </div>
          )
        })()}
      </div>

      {/* Continue button */}
      <div style={{ padding: '0 20px', marginBottom: '20px' }}>
        <Link href={`/lesson/${skillInfo[maxIdx].key}`} className="jolingo-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.2rem' }}>{skillInfo[maxIdx].emoji}</span>
          CONTINUAR {skillInfo[maxIdx].label.toUpperCase()} — NÍVEL {allLevels[maxIdx]}
        </Link>
      </div>

      {/* Skills */}
      <div style={{ padding: '0 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Habilidades</h2>
          <Link href="/progress" style={{ fontSize: '0.75rem', color: '#8CB369', textDecoration: 'none', fontWeight: 700 }}>Ver tudo →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {skillInfo.map((skill, i) => {
            const level = allLevels[i]
            const pct = Math.round((level / totalLevels) * 100)
            return (
              <Link key={skill.key} href={`/lesson/${skill.key}`} className="jolingo-card tap-feedback" style={{ textDecoration: 'none', color: '#1A1A1A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: skill.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, border: `2px solid ${skill.color}30` }}>{skill.emoji}</div>
                  <div>
                    <p style={{ fontWeight: 700, margin: 0, fontSize: '0.85rem' }}>{skill.label}</p>
                    <p style={{ color: '#999', margin: 0, fontSize: '0.65rem' }}>{skill.sublabel}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#999' }}>Nível {level}</span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: skill.color, background: skill.color + '15', padding: '2px 6px', borderRadius: '6px' }}>{pct}% →</span>
                </div>
                <div className="jolingo-progress" style={{ height: '6px' }}>
                  <div className="jolingo-progress-fill" style={{ width: `${pct}%`, background: skill.color }} />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick actions — consistent SVG icons */}
      <div style={{ padding: '0 20px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '12px' }}>Explorar</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {[
            { href: '/simulado', color: '#5B9BD5', bg: '#E3F2FD', label: 'Simulados', sub: 'TOEFL' },
            { href: '/badges', color: '#FFC107', bg: '#FFF8E1', label: 'Conquistas', sub: `${getTotalBadgesEarned()}/${getTotalBadges()}` },
            { href: '/integrated', color: '#9B59B6', bg: '#F3E5F5', label: 'Integrated', sub: 'Ler+Ouvir' },
            { href: '/review', color: '#FF7043', bg: '#FBE9E7', label: 'Review', sub: 'Semanal' },
            { href: '/monthly', color: '#8CB369', bg: '#F0F7EA', label: 'Nota TOEFL', sub: 'Estimada' },
            { href: '/progress', color: '#3498DB', bg: '#E8F4FD', label: 'Progresso', sub: 'Detalhado' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="jolingo-card tap-feedback" style={{ textDecoration: 'none', color: '#1A1A1A', textAlign: 'center', padding: '14px 8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', border: `1px solid ${item.color}20` }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
              </div>
              <p style={{ fontWeight: 700, fontSize: '0.75rem', margin: 0 }}>{item.label}</p>
              <p style={{ color: '#999', fontSize: '0.6rem', margin: 0 }}>{item.sub}</p>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
