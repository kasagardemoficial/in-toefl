'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { allBadges, getEarnedBadges, Badge } from '@/lib/badges'
import BottomNav from '@/components/BottomNav'

export default function BadgesPage() {
  const router = useRouter()
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([])

  useEffect(() => {
    setEarnedBadges(getEarnedBadges())
  }, [])

  const earnedIds = new Set(earnedBadges.map(b => b.id))

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto" style={{ paddingBottom: '80px' }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/')} className="text-[#999] text-2xl">←</button>
        <img src="/mascot/card_conquistas.png" alt="Conquistas" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '10px' }} />
        <h1 className="text-xl font-bold">Conquistas</h1>
        <span className="text-sm text-[#999] ml-auto">{earnedBadges.length}/{allBadges.length}</span>
      </div>

      {/* Progress */}
      <div className="bg-[#F7F7F7] rounded-xl p-4 border border-[#E8E8E8] mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-[#999]">Conquistas desbloqueadas</span>
          <span className="text-sm font-semibold text-yellow-400">{earnedBadges.length}/{allBadges.length}</span>
        </div>
        <div className="w-full bg-[#E8E8E8] rounded-full h-3">
          <div
            className="bg-[#FFC107] h-3 rounded-full progress-fill"
            style={{ width: `${Math.round((earnedBadges.length / allBadges.length) * 100)}%` }}
          />
        </div>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-3 gap-3">
        {allBadges.map((badge) => {
          const isEarned = earnedIds.has(badge.id)
          const earned = earnedBadges.find(b => b.id === badge.id)
          return (
            <div
              key={badge.id}
              className={`rounded-xl p-3 text-center border transition-all ${
                isEarned
                  ? 'bg-[#F7F7F7] border-[#FFC107]'
                  : 'bg-[#F7F7F7]/50 border-[#E8E8E8] opacity-40'
              }`}
            >
              <span className={`text-3xl block mb-1 ${isEarned ? '' : 'grayscale'}`}>
                {badge.icon}
              </span>
              <p className="text-xs font-semibold truncate">{badge.name}</p>
              <p className="text-[10px] text-[#999] truncate">{badge.description}</p>
              {earned?.earnedDate && (
                <p className="text-[9px] text-yellow-600 mt-1">
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
