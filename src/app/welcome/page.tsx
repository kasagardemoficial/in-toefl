'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveOnboarding, OnboardingData } from '@/lib/onboarding'

const goals = [
  { value: 'study_abroad', label: 'Estudar no exterior', desc: 'Mestrado, doutorado, intercâmbio', icon: '🎓' },
  { value: 'medical', label: 'Estágio/Residência médica', desc: 'USMLE, estágio em hospital', icon: '🏥' },
  { value: 'work', label: 'Trabalhar fora', desc: 'Carreira internacional', icon: '💼' },
  { value: 'immigration', label: 'Imigrar', desc: 'Morar em outro país', icon: '✈️' },
  { value: 'personal', label: 'Crescimento pessoal', desc: 'Aprender por prazer', icon: '🌱' },
]

const times = [
  { value: 10, label: '10 min/dia', desc: 'Progresso em ~24 meses', icon: '🐢' },
  { value: 20, label: '20 min/dia', desc: 'Progresso em ~15 meses', icon: '🚶', recommended: true },
  { value: 30, label: '30 min/dia', desc: 'Progresso em ~12 meses', icon: '🚀' },
]

const levels = [
  { value: 'zero', label: 'Iniciante', desc: 'Não sei nada de inglês', icon: '🌱' },
  { value: 'basic', label: 'Básico', desc: 'Sei palavras soltas e frases simples', icon: '🌿' },
  { value: 'intermediate', label: 'Intermediário', desc: 'Consigo me comunicar com dificuldade', icon: '🌳' },
  { value: 'advanced', label: 'Avançado', desc: 'Falo bem mas preciso do TOEFL', icon: '🏔️' },
]

export default function WelcomePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    name: '',
    email: '',
    goal: 'study_abroad',
    dailyMinutes: 20,
    currentLevel: 'zero',
    completed: false,
  })

  function next() { setStep(s => s + 1) }
  function back() { if (step > 0) setStep(s => s - 1) }

  function finish() {
    saveOnboarding({ ...data, completed: true })
    router.push('/')
  }

  // Step 0: Splash
  if (step === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', background: 'white' }}>
        <img src="/mascot/main.png" alt="In-TOEFL Mascot" style={{ width: '160px', height: '160px', objectFit: 'contain', marginBottom: '8px' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#8CB369', marginBottom: '8px', fontFamily: 'Nunito, sans-serif' }}>In-TOEFL</h1>
        <p style={{ fontSize: '1rem', color: '#666', marginBottom: '4px' }}>Do Zero ao TOEFL</p>
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '40px', maxWidth: '300px', lineHeight: 1.5 }}>
          Aprenda inglês do zero e passe no TOEFL. Em português. De graça.
        </p>
        <button onClick={next} className="jolingo-btn" style={{ maxWidth: '320px' }}>
          COMEÇAR AGORA
        </button>
        <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '16px' }}>
          ● 100% gratuito — Sem cartão de crédito
        </p>
      </div>
    )
  }

  // Step 5: Ready
  if (step === 5) {
    const goalLabel = goals.find(g => g.value === data.goal)?.label
    const levelLabel = levels.find(l => l.value === data.currentLevel)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', background: 'white' }}>
        <div style={{ fontSize: '60px', marginBottom: '12px' }} className="confetti-burst">🚀</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>Tudo pronto, {data.name}!</h1>
        <p style={{ color: '#999', marginBottom: '24px', fontSize: '0.9rem' }}>Seu plano personalizado:</p>
        <div style={{ background: '#F7F7F7', borderRadius: '16px', padding: '20px', marginBottom: '24px', maxWidth: '340px', width: '100%', textAlign: 'left' }}>
          {[
            { label: 'Objetivo', value: goalLabel },
            { label: 'Meta diária', value: `${data.dailyMinutes} min/dia` },
            { label: 'Nível atual', value: `${levelLabel?.icon} ${levelLabel?.label}` },
            { label: 'Previsão', value: data.dailyMinutes === 30 ? '~12 meses' : data.dailyMinutes === 20 ? '~15 meses' : '~24 meses', green: true },
          ].map((item, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ color: '#999', fontSize: '0.85rem' }}>{item.label}</span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: item.green ? '#8CB369' : '#1A1A1A' }}>{item.value}</span>
              </div>
              {i < 3 && <div style={{ height: '1px', background: '#E8E8E8' }} />}
            </div>
          ))}
        </div>
        <button onClick={finish} className="jolingo-btn" style={{ maxWidth: '320px' }}>
          {data.currentLevel === 'zero' || data.currentLevel === 'basic' ? 'COMEÇAR A APRENDER!' : 'FAZER TESTE DE NÍVEL'}
        </button>
      </div>
    )
  }

  const titles = ['', 'Como posso te chamar?', 'Qual é seu objetivo?', 'Quanto tempo por dia?', 'Qual seu nível de inglês?']

  return (
    <div style={{ minHeight: '100vh', padding: '24px', background: 'white', maxWidth: '500px', margin: '0 auto' }}>
      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        {step > 1 && (
          <button onClick={back} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}>←</button>
        )}
        <div style={{ flex: 1, display: 'flex', gap: '4px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ flex: 1, height: '6px', borderRadius: '3px', background: i <= step ? '#8CB369' : '#E8E8E8', transition: 'background 0.3s' }} />
          ))}
        </div>
        <span style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600 }}>{step} / 4</span>
      </div>

      {/* Mascot + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <img src="/mascot/thinking.png" alt="Mascot" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
        <div style={{ background: 'white', border: '2px solid #E8E8E8', borderRadius: '16px', padding: '12px 16px' }}>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{titles[step]}</p>
        </div>
      </div>
      <p style={{ color: '#999', fontSize: '0.8rem', marginBottom: '24px', marginLeft: '52px' }}>
        {step === 1 && 'Vamos personalizar sua experiência'}
        {step === 2 && 'Isso nos ajuda a personalizar seu caminho'}
        {step === 3 && 'Escolha uma meta realista'}
        {step === 4 && 'Começaremos no lugar certo'}
      </p>

      {/* Step 1: Name + Email */}
      {step === 1 && (
        <div>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Seu nome ou apelido"
            style={{ width: '100%', padding: '16px', fontSize: '1rem', border: '2px solid #E8E8E8', borderBottom: '4px solid #E8E8E8', borderRadius: '16px', outline: 'none', textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontWeight: 600, boxSizing: 'border-box', marginBottom: '12px' }}
            autoFocus
          />
          <input
            type="email"
            value={data.email || ''}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            placeholder="Seu email (para salvar progresso)"
            style={{ width: '100%', padding: '14px', fontSize: '0.9rem', border: '2px solid #E8E8E8', borderBottom: '4px solid #E8E8E8', borderRadius: '16px', outline: 'none', textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontWeight: 500, boxSizing: 'border-box', color: '#666' }}
          />
          <p style={{ fontSize: '0.65rem', color: '#999', textAlign: 'center', marginTop: '6px' }}>Usaremos para lembretes de estudo e salvar seu progresso</p>
          <div style={{ marginTop: '24px' }}>
            <button onClick={next} disabled={!data.name.trim()} className="jolingo-btn" style={{ opacity: data.name.trim() ? 1 : 0.4 }}>
              CONTINUAR
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Goal */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {goals.map((g) => (
            <button key={g.value} onClick={() => { setData({ ...data, goal: g.value as OnboardingData['goal'] }); next() }} className="jolingo-option">
              <span style={{ fontSize: '1.5rem' }}>{g.icon}</span>
              <div>
                <p style={{ fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>{g.label}</p>
                <p style={{ color: '#999', margin: 0, fontSize: '0.75rem' }}>{g.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 3: Time */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {times.map((t) => (
            <button key={t.value} onClick={() => { setData({ ...data, dailyMinutes: t.value as 10 | 20 | 30 }); next() }} className="jolingo-option" style={t.recommended ? { borderColor: '#8CB369', background: '#F0F7EA' } : {}}>
              <span style={{ fontSize: '1.8rem' }}>{t.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, margin: 0, fontSize: '1rem' }}>{t.label}</p>
                <p style={{ color: '#999', margin: 0, fontSize: '0.75rem' }}>{t.desc}</p>
              </div>
              {t.recommended && <span className="jolingo-badge">Recomendado</span>}
            </button>
          ))}
        </div>
      )}

      {/* Step 4: Level */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {levels.map((l) => (
            <button key={l.value} onClick={() => { setData({ ...data, currentLevel: l.value as OnboardingData['currentLevel'] }); next() }} className="jolingo-option">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F0F7EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{l.icon}</div>
              <div>
                <p style={{ fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>{l.label}</p>
                <p style={{ color: '#999', margin: 0, fontSize: '0.75rem' }}>{l.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
