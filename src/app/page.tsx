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

const skillInfo = [
  { key: 'reading', label: 'Reading', sublabel: 'Leitura', icon: '/mascot/icon_reading.png', color: '#8CB369' },
  { key: 'listening', label: 'Listening', sublabel: 'Escuta', icon: '/mascot/icon_listening.png', color: '#5B9BD5' },
  { key: 'speaking', label: 'Speaking', sublabel: 'Fala', icon: '/mascot/icon_speaking.png', color: '#F4A261' },
  { key: 'writing', label: 'Writing', sublabel: 'Escrita', icon: '/mascot/icon_writing.png', color: '#E76F51' },
  { key: 'vocabulary', label: 'Vocabulary', sublabel: 'Palavras', icon: '/mascot/icon_vocabulary.png', color: '#9B59B6' },
  { key: 'grammar', label: 'Grammar', sublabel: 'Gramática', icon: '/mascot/icon_grammar.png', color: '#3498DB' },
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
    <div style={{ minHeight: '100vh', paddingBottom: '80px', background: 'white', maxWidth: '500px', margin: '0 auto' }}>
      {/* Badge notification */}
      {newBadges.length > 0 && (
        <div className="badge-unlock" style={{ position: 'fixed', top: '16px', left: '16px', right: '16px', zIndex: 50, background: '#8CB369', borderRadius: '12px', padding: '14px', textAlign: 'center', color: 'white', boxShadow: '0 4px 20px rgba(140,179,105,0.4)' }}>
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
          <Link href="/settings" style={{ fontSize: '1.1rem', padding: '4px', textDecoration: 'none' }} title="Configurações">
            ⚙️
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFF3E0', borderRadius: '20px', padding: '6px 12px' }}>
            <span className="streak-fire" style={{ fontSize: '1rem' }}>🔥</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FF7043' }}>{progress.streak}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFF8E1', borderRadius: '20px', padding: '6px 12px' }}>
            <span style={{ fontSize: '0.8rem' }}>⭐</span>
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

      {/* League + Daily Challenge */}
      <div style={{ padding: '0 20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* League */}
          {(() => {
            const league = getLeague()
            return (
              <div style={{ flex: 1, background: '#F7F7F7', borderRadius: '14px', padding: '12px', border: '1px solid #E8E8E8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{league.icon}</span>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '0.8rem', margin: 0, color: league.color }}>Liga {league.league}</p>
                    <p style={{ fontSize: '0.6rem', color: '#999', margin: 0 }}>{league.weeklyXP} XP esta semana</p>
                  </div>
                </div>
                <div style={{ height: '4px', background: '#E8E8E8', borderRadius: '2px' }}>
                  <div style={{ height: '4px', background: league.color, borderRadius: '2px', width: `${Math.min(100, (league.weeklyXP / (league.weeklyXP + Math.max(1, league.xpToNext))) * 100)}%`, transition: 'width 0.3s' }} />
                </div>
                <p style={{ fontSize: '0.55rem', color: '#999', margin: '4px 0 0' }}>{league.xpToNext > 0 ? `${league.xpToNext} XP para ${league.nextLeague}` : 'Liga máxima!'}</p>
              </div>
            )
          })()}
          {/* Daily Challenge */}
          {(() => {
            const daily = getDailyChallenge()
            return (
              <div style={{ flex: 1, background: daily.completed ? '#E8F5E9' : '#FFF3E0', borderRadius: '14px', padding: '12px', border: `1px solid ${daily.completed ? '#C8E6C9' : '#FFE0B2'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1rem' }}>{daily.completed ? '✅' : '🎯'}</span>
                  <p style={{ fontWeight: 700, fontSize: '0.7rem', margin: 0, color: daily.completed ? '#4CAF50' : '#E65100' }}>Desafio Diário</p>
                </div>
                <p style={{ fontSize: '0.65rem', color: '#666', margin: '0 0 6px', lineHeight: 1.3 }}>{daily.description}</p>
                <div style={{ height: '4px', background: '#E8E8E8', borderRadius: '2px' }}>
                  <div style={{ height: '4px', background: daily.completed ? '#4CAF50' : '#FF9800', borderRadius: '2px', width: `${Math.min(100, (daily.progress / Math.max(1, daily.goal)) * 100)}%` }} />
                </div>
                <p style={{ fontSize: '0.55rem', color: '#999', margin: '4px 0 0' }}>{daily.progress}/{daily.goal} · +{daily.reward} XP</p>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Word of the Day */}
      {(() => {
        const academicWords = [
          { word: 'analyze', pron: '/ˈænəlaɪz/', pt: 'analisar', ex: 'Scientists analyze data to find patterns.' },
          { word: 'significant', pron: '/sɪɡˈnɪfɪkənt/', pt: 'significativo', ex: 'There was a significant improvement in results.' },
          { word: 'establish', pron: '/ɪˈstæblɪʃ/', pt: 'estabelecer', ex: 'The university was established in 1900.' },
          { word: 'contribute', pron: '/kənˈtrɪbjuːt/', pt: 'contribuir', ex: 'Many factors contribute to climate change.' },
          { word: 'demonstrate', pron: '/ˈdemənstreɪt/', pt: 'demonstrar', ex: 'The study demonstrates a clear correlation.' },
          { word: 'perspective', pron: '/pərˈspektɪv/', pt: 'perspectiva', ex: 'We should consider different perspectives.' },
          { word: 'fundamental', pron: '/ˌfʌndəˈmentl/', pt: 'fundamental', ex: 'Education is a fundamental right.' },
          { word: 'evaluate', pron: '/ɪˈvæljueɪt/', pt: 'avaliar', ex: 'We need to evaluate the effectiveness of this program.' },
          { word: 'hypothesis', pron: '/haɪˈpɑːθəsɪs/', pt: 'hipótese', ex: 'The hypothesis was confirmed by the experiment.' },
          { word: 'phenomenon', pron: '/fɪˈnɑːmɪnɑːn/', pt: 'fenômeno', ex: 'Climate change is a global phenomenon.' },
          { word: 'inevitable', pron: '/ɪnˈevɪtəbl/', pt: 'inevitável', ex: 'Change is inevitable in any growing organization.' },
          { word: 'comprehensive', pron: '/ˌkɑːmprɪˈhensɪv/', pt: 'abrangente', ex: 'The report provides a comprehensive analysis.' },
          { word: 'controversial', pron: '/ˌkɑːntrəˈvɜːrʃl/', pt: 'controverso', ex: 'This remains a controversial topic among scientists.' },
          { word: 'subsequent', pron: '/ˈsʌbsɪkwənt/', pt: 'subsequente', ex: 'Subsequent studies confirmed the initial findings.' },
        ]
        const dayNum = Math.floor(Date.now() / 86400000)
        const todayWord = academicWords[dayNum % academicWords.length]
        return (
          <div style={{ padding: '0 20px', marginBottom: '12px' }}>
            <div style={{ background: '#F7F7F7', borderRadius: '14px', padding: '12px 14px', border: '1px solid #E8E8E8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9B59B6' }}>📚 Palavra do Dia</span>
                <span style={{ fontSize: '0.55rem', color: '#999' }}>TOEFL Academic</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A1A1A' }}>{todayWord.word}</span>
                <span style={{ fontSize: '0.65rem', color: '#999' }}>{todayWord.pron}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#9B59B6', margin: '0 0 4px', fontWeight: 600 }}>{todayWord.pt}</p>
              <p style={{ fontSize: '0.7rem', color: '#666', margin: 0, fontStyle: 'italic' }}>"{todayWord.ex}"</p>
            </div>
          </div>
        )
      })()}

      {/* Motivational */}
      <div style={{ padding: '0 20px', marginBottom: '12px' }}>
        <p style={{ textAlign: 'center', color: '#8CB369', fontSize: '0.75rem', fontWeight: 600 }}>{phrase}</p>
      </div>

      {/* Continue button */}
      <div style={{ padding: '0 20px', marginBottom: '20px' }}>
        <Link href={`/lesson/${skillInfo[maxIdx].key}`} className="jolingo-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src={skillInfo[maxIdx].icon} alt={skillInfo[maxIdx].label} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
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
              <Link key={skill.key} href={`/lesson/${skill.key}`} className="jolingo-card" style={{ textDecoration: 'none', color: '#1A1A1A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <img src={skill.icon} alt={skill.label} style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }} />
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

      {/* Quick actions */}
      <div style={{ padding: '0 20px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '12px' }}>Explorar</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {[
            { href: '/simulado', icon: '/mascot/card_simulados.png', label: 'Simulados', sub: 'TOEFL Real' },
            { href: '/badges', icon: '/mascot/card_conquistas.png', label: 'Conquistas', sub: `${getTotalBadgesEarned()}/${getTotalBadges()}` },
            { href: '/progress', icon: '/mascot/card_progresso.png', label: 'Progresso', sub: 'Detalhado' },
            { href: '/integrated', icon: '🔗', label: 'Integrated', sub: 'Ler+Ouvir+Escrever' },
            { href: '/review', icon: '📅', label: 'Review', sub: 'Semanal' },
            { href: '/monthly', icon: '🎯', label: 'Nota TOEFL', sub: 'Estimada' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="jolingo-card" style={{ textDecoration: 'none', color: '#1A1A1A', textAlign: 'center', padding: '14px 8px' }}>
              {item.icon.startsWith('/') ? (
                <img src={item.icon} alt={item.label} style={{ width: '48px', height: '48px', objectFit: 'contain', margin: '0 auto 4px', display: 'block', borderRadius: '10px' }} />
              ) : (
                <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{item.icon}</div>
              )}
              <p style={{ fontWeight: 700, fontSize: '0.75rem', margin: 0 }}>{item.label}</p>
              <p style={{ color: '#999', fontSize: '0.6rem', margin: 0 }}>{item.sub}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
          {[
            { value: progress.streak, label: 'Streak', color: '#FF7043' },
            { value: progress.xp, label: 'XP', color: '#FFC107' },
            { value: getTotalBadgesEarned(), label: 'Badges', color: '#8CB369' },
            { value: Math.max(...allLevels), label: 'Max Nv', color: '#5B9BD5' },
          ].map((stat) => (
            <div key={stat.label} className="jolingo-stat">
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: stat.color, margin: 0 }}>{stat.value}</p>
              <p style={{ fontSize: '0.6rem', color: '#999', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
