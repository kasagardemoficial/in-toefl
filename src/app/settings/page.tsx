'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProgress, resetProgress, saveProgress } from '@/lib/storage'
import { getOnboarding } from '@/lib/onboarding'
import { refillHearts, getHearts } from '@/lib/gamification'

export default function SettingsPage() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [hearts, setHearts] = useState(5)

  useEffect(() => {
    const saved = localStorage.getItem('intoefl_dark_mode')
    if (saved === 'true') {
      setDarkMode(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }
    setHearts(getHearts().hearts)
  }, [])

  function toggleDarkMode() {
    const newVal = !darkMode
    setDarkMode(newVal)
    localStorage.setItem('intoefl_dark_mode', String(newVal))
    if (newVal) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  const onboarding = getOnboarding()
  const progress = getProgress()
  const allLevels = [progress.reading_level, progress.listening_level, progress.speaking_level, progress.writing_level, progress.vocabulary_level, progress.grammar_level]
  const totalLevels = allLevels.reduce((a, b) => a + b, 0)

  return (
    <div className="page-shell page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => router.push('/')} className="tap-feedback" style={{ width: '40px', height: '40px', borderRadius: '14px', border: '2px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>←</button>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>Configurações</h1>
      </div>

      {/* Profile */}
      <div className="page-hero" style={{ marginBottom: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <img src="/mascot/main.png" alt="Perfil" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '14px' }} />
          <div>
            <p style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>{onboarding.name || 'Aluno'}</p>
            <p style={{ fontSize: '0.7rem', color: '#999', margin: 0 }}>{totalLevels} níveis alcançados · {progress.xp} XP</p>
          </div>
        </div>
      </div>

      {/* Settings list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

        {/* Dark mode */}
        <button onClick={toggleDarkMode} className="jolingo-option tap-feedback" style={{ width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>{darkMode ? '🌙' : '☀️'}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>Modo Escuro</p>
              <p style={{ fontSize: '0.65rem', color: '#999', margin: 0 }}>{darkMode ? 'Ativado' : 'Desativado'}</p>
            </div>
          </div>
          <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: darkMode ? '#8CB369' : '#E8E8E8', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: darkMode ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </div>
        </button>

        {/* Refill hearts */}
        <button onClick={() => { refillHearts(); setHearts(5); alert('Corações recarregados!') }} className="jolingo-option tap-feedback" style={{ width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>❤️</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>Recarregar Corações</p>
            <p style={{ fontSize: '0.65rem', color: '#999', margin: 0 }}>Atualmente: {hearts}/5 · Recarrega a cada 4 horas</p>
          </div>
        </button>

        {/* Redo placement */}
        <button onClick={() => { const p = getProgress(); p.placementDone = false; saveProgress(p); router.push('/') }} className="jolingo-option tap-feedback" style={{ width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>Refazer Teste de Nivelamento</p>
            <p style={{ fontSize: '0.65rem', color: '#999', margin: 0 }}>Recalcular seu nível em todas as habilidades</p>
          </div>
        </button>

        {/* Redo onboarding */}
        <button onClick={() => { localStorage.removeItem('intoefl_onboarding'); router.push('/welcome') }} className="jolingo-option tap-feedback" style={{ width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>👤</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>Alterar Perfil</p>
            <p style={{ fontSize: '0.65rem', color: '#999', margin: 0 }}>Nome, objetivo, tempo diário, nível</p>
          </div>
        </button>

        {/* About */}
        <button onClick={() => router.push('/sobre')} className="jolingo-option tap-feedback" style={{ width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>Sobre o In-TOEFL</p>
            <p style={{ fontSize: '0.65rem', color: '#999', margin: 0 }}>Versão 1.0 · 100% gratuito</p>
          </div>
        </button>

        {/* Reset */}
        <button onClick={() => { if (confirm('Tem certeza? Todo seu progresso será perdido permanentemente.')) { resetProgress(); localStorage.removeItem('intoefl_onboarding'); router.push('/welcome') } }} style={{ width: '100%', background: '#FFF5F5', borderRadius: '14px', padding: '14px 16px', border: '1px solid #FFCDD2', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
          <span style={{ fontSize: '1.2rem' }}>🗑️</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0, color: '#EF5350' }}>Resetar Todo o Progresso</p>
            <p style={{ fontSize: '0.65rem', color: '#999', margin: 0 }}>Esta ação não pode ser desfeita</p>
          </div>
        </button>
      </div>
    </div>
  )
}
