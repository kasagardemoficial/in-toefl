'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { allBadges, getEarnedBadges, Badge } from '@/lib/badges'

export default function BadgesPage() {
  const router = useRouter()
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([])

  useEffect(() => {
    setEarnedBadges(getEarnedBadges())
  }, [])

  const earnedIds = new Set(earnedBadges.map(b => b.id))

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/')} className="text-slate-400 text-2xl">←</button>
        <h1 className="text-xl font-bold">Conquistas</h1>
        <span className="text-sm text-slate-400 ml-auto">{earnedBadges.length}/{allBadges.length}</span>
      </div>

      {/* Progress */}
      <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-slate-400">Conquistas desbloqueadas</span>
          <span className="text-sm font-semibold text-yellow-400">{earnedBadges.length}/{allBadges.length}</span>
        </div>
        <div className="w-full bg-[#334155] rounded-full h-3">
          <div
            className="bg-yellow-500 h-3 rounded-full progress-fill"
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
                  ? 'bg-[#1e293b] border-yellow-500/50'
                  : 'bg-[#1e293b]/50 border-[#334155] opacity-40'
              }`}
            >
              <span className={`text-3xl block mb-1 ${isEarned ? '' : 'grayscale'}`}>
                {badge.icon}
              </span>
              <p className="text-xs font-semibold truncate">{badge.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{badge.description}</p>
              {earned?.earnedDate && (
                <p className="text-[9px] text-yellow-600 mt-1">
                  {new Date(earned.earnedDate).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
