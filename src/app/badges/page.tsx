'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { allBadges, getEarnedBadges, Badge } from '@/lib/badges'
import BottomNav from '@/components/BottomNav'
import { IconChevronLeft } from '@/components/Icons'

export default function BadgesPage() {
  const router = useRouter()
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([])

  useEffect(() => {
    setEarnedBadges(getEarnedBadges())
  }, [])

  const earnedIds = new Set(earnedBadges.map(b => b.id))
  const pct = Math.round((earnedBadges.length / allBadges.length) * 100)

  return (
    <div className="page-shell page-content safe-bottom">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => router.push('/')} className="tap-feedback" style={{ width: '40px', height: '40px', borderRadius: '14px', border: '2px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <IconChevronLeft size={18} />
        </button>
        <span className="icon-bubble gold">🏆</span>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>Conquistas</h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>{earnedBadges.length} de {allBadges.length} desbloqueadas</p>
        </div>
      </div>

      {/* Progress */}
      <div className="page-hero" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--xp-gold-dark)' }}>PROGRESSO</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--xp-gold-dark)' }}>{pct}%</span>
        </div>
        <div className="jolingo-progress" style={{ height: '10px' }}>
          <div className="jolingo-progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #FFD76D, #FFC107)' }} />
        </div>
      </div>

      {/* Badges grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        {allBadges.map((badge) => {
          const isEarned = earnedIds.has(badge.id)
          const earned = earnedBadges.find(b => b.id === badge.id)
          return (
            <div
              key={badge.id}
              className={`jolingo-card flat ${isEarned ? 'success' : ''}`}
              style={{
                textAlign: 'center',
                padding: '14px 8px',
                opacity: isEarned ? 1 : 0.4,
                borderColor: isEarned ? 'rgba(255, 193, 7, 0.3)' : undefined,
              }}
            >
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '4px', filter: isEarned ? 'none' : 'grayscale(1)' }}>
                {badge.icon}
              </span>
              <p style={{ fontSize: '0.72rem', fontWeight: 800, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{badge.name}</p>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{badge.description}</p>
              {earned?.earnedDate && (
                <p style={{ fontSize: '0.55rem', color: 'var(--xp-gold-dark)', marginTop: '4px', fontWeight: 700 }}>
                  {new Date(earned.earnedDate).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          )
        })}
      </div>
      <BottomNav />
    </div>
  )
}
