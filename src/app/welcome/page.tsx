'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveOnboarding, OnboardingData } from '@/lib/onboarding'
import { IconChevronLeft, IconFlame, IconStar, IconTarget } from '@/components/Icons'

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

  function next() { setStep((s) => s + 1) }
  function back() { if (step > 0) setStep((s) => s - 1) }

  function finish() {
    saveOnboarding({ ...data, completed: true })
    router.push('/')
  }

  if (step === 0) {
    return (
      <div className="page-shell page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <section className="page-hero" style={{ width: '100%', textAlign: 'center', padding: '28px 22px' }}>
          <img src="/mascot/main.png" alt="In-TOEFL Mascot" style={{ width: '160px', height: '160px', objectFit: 'contain', margin: '0 auto 14px' }} />
          <span className="kicker" style={{ marginBottom: '12px' }}>Do zero ao TOEFL</span>
          <h1 style={{ fontSize: '2.3rem', fontWeight: 900, margin: '0 0 8px', color: 'var(--primary-dark)' }}>In-TOEFL</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 auto 10px', maxWidth: '320px' }}>
            Aprenda inglês do zero em português e construa a base certa para passar no TOEFL.
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 auto 24px', maxWidth: '320px', lineHeight: 1.6 }}>
            Uma jornada guiada com gamificação, prática real e trilha estruturada para universitários brasileiros.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', marginBottom: '24px' }}>
            <div className="jolingo-stat">
              <span className="icon-bubble red small"><IconFlame size={15} /></span>
              <p style={{ margin: '8px 0 2px', fontWeight: 900, fontSize: '0.86rem' }}>Streak</p>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.68rem' }}>Hábito diário</p>
            </div>
            <div className="jolingo-stat">
              <span className="icon-bubble gold small"><IconStar size={14} /></span>
              <p style={{ margin: '8px 0 2px', fontWeight: 900, fontSize: '0.86rem' }}>XP</p>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.68rem' }}>Motivação real</p>
            </div>
            <div className="jolingo-stat">
              <span className="icon-bubble blue small"><IconTarget size={15} /></span>
              <p style={{ margin: '8px 0 2px', fontWeight: 900, fontSize: '0.86rem' }}>TOEFL</p>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.68rem' }}>Meta clara</p>
            </div>
          </div>

          <button onClick={next} className="jolingo-btn" style={{ maxWidth: '340px', margin: '0 auto' }}>
            Começar agora
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '16px' }}>
            100% gratuito — sem cartão de crédito
          </p>
        </section>
      </div>
    )
  }

  if (step === 5) {
    const goalLabel = goals.find((g) => g.value === data.goal)?.label
    const levelLabel = levels.find((l) => l.value === data.currentLevel)

    return (
      <div className="page-shell page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <section className="page-hero" style={{ width: '100%', textAlign: 'center', padding: '28px 22px' }}>
          <img src="/mascot/success.png" alt="Tudo pronto" style={{ width: '132px', height: '132px', objectFit: 'contain', margin: '0 auto 6px' }} />
          <div className="confetti-burst" style={{ fontSize: '3rem', marginBottom: '8px' }}>🚀</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 6px' }}>Tudo pronto, {data.name}!</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0 auto 20px', fontSize: '0.92rem', maxWidth: '320px' }}>
            Preparamos um ponto de partida mais certeiro para sua jornada rumo ao TOEFL.
          </p>

          <div className="jolingo-card active" style={{ maxWidth: '360px', margin: '0 auto 20px', textAlign: 'left' }}>
            {[
              { label: 'Objetivo', value: goalLabel },
              { label: 'Meta diária', value: `${data.dailyMinutes} min/dia` },
              { label: 'Nível atual', value: `${levelLabel?.icon} ${levelLabel?.label}` },
              { label: 'Previsão', value: data.dailyMinutes === 30 ? '~12 meses' : data.dailyMinutes === 20 ? '~15 meses' : '~24 meses', highlight: true },
            ].map((item, i) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 700 }}>{item.label}</span>
                  <span style={{ color: item.highlight ? 'var(--primary-dark)' : 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 900, textAlign: 'right' }}>{item.value}</span>
                </div>
                {i < 3 && <div className="jolingo-divider" />}
              </div>
            ))}
          </div>

          <button onClick={finish} className="jolingo-btn" style={{ maxWidth: '340px', margin: '0 auto' }}>
            {data.currentLevel === 'zero' || data.currentLevel === 'basic' ? 'Começar a aprender' : 'Fazer teste de nível'}
          </button>
        </section>
      </div>
    )
  }

  const titles = ['', 'Como posso te chamar?', 'Qual é seu objetivo?', 'Quanto tempo você tem por dia?', 'Qual é seu nível de inglês?']
  const descriptions = {
    1: 'Vamos personalizar a experiência para que o app pareça feito para você.',
    2: 'Seu objetivo ajuda a priorizar o tipo de conteúdo e o ritmo de estudo.',
    3: 'Escolha uma meta realista para manter consistência sem sobrecarga.',
    4: 'Assim começamos no ponto certo, sem te deixar perdido nem entediado.',
  } as Record<number, string>

  return (
    <div className="page-shell page-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
        {step > 1 ? (
          <button
            onClick={back}
            className="tap-feedback"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              border: '2px solid var(--border)',
              background: 'var(--bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <IconChevronLeft size={18} />
          </button>
        ) : (
          <div style={{ width: '42px' }} />
        )}

        <div style={{ flex: 1 }}>
          <div className="jolingo-progress" style={{ height: '12px' }}>
            <div className="jolingo-progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        <span className="stat-pill" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{step}/4</span>
      </div>

      <section className="page-hero" style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '10px' }}>
          <img src="/mascot/thinking.png" alt="Mascote" style={{ width: '74px', height: '74px', objectFit: 'contain', flexShrink: 0 }} />
          <div className="speech-bubble" style={{ maxWidth: '100%' }}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: '1rem' }}>{titles[step]}</p>
          </div>
        </div>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.6 }}>{descriptions[step]}</p>
      </section>

      {step === 1 && (
        <section className="jolingo-card" style={{ display: 'grid', gap: '12px' }}>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Seu nome ou apelido"
            autoFocus
            style={{ padding: '16px', textAlign: 'center', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 800 }}
          />
          <input
            type="email"
            value={data.email || ''}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            placeholder="Seu email (para salvar progresso)"
            style={{ padding: '15px', textAlign: 'center', fontSize: '0.92rem', fontFamily: 'inherit', fontWeight: 700 }}
          />
          <p style={{ margin: '-2px 0 2px', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Usaremos o email para lembretes e para salvar seu progresso com segurança.
          </p>
          <button onClick={next} disabled={!data.name.trim()} className="jolingo-btn">
            Continuar
          </button>
        </section>
      )}

      {step === 2 && (
        <section style={{ display: 'grid', gap: '12px' }}>
          {goals.map((g) => (
            <button
              key={g.value}
              onClick={() => {
                setData({ ...data, goal: g.value as OnboardingData['goal'] })
                next()
              }}
              className="jolingo-option"
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                {g.icon}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 900, fontSize: '0.95rem' }}>{g.label}</p>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{g.desc}</p>
              </div>
            </button>
          ))}
        </section>
      )}

      {step === 3 && (
        <section style={{ display: 'grid', gap: '12px' }}>
          {times.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setData({ ...data, dailyMinutes: t.value as 10 | 20 | 30 })
                next()
              }}
              className="jolingo-option"
              style={t.recommended ? { borderColor: 'var(--primary)', background: 'linear-gradient(180deg, var(--primary-bg) 0%, var(--bg-card) 100%)' } : {}}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', flexShrink: 0 }}>
                {t.icon}
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: '0.98rem' }}>{t.label}</p>
                  {t.recommended && <span className="jolingo-badge">Recomendado</span>}
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{t.desc}</p>
              </div>
            </button>
          ))}
        </section>
      )}

      {step === 4 && (
        <section style={{ display: 'grid', gap: '12px' }}>
          {levels.map((l) => (
            <button
              key={l.value}
              onClick={() => {
                setData({ ...data, currentLevel: l.value as OnboardingData['currentLevel'] })
                next()
              }}
              className="jolingo-option"
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                {l.icon}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 900, fontSize: '0.95rem' }}>{l.label}</p>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{l.desc}</p>
              </div>
            </button>
          ))}
        </section>
      )}
    </div>
  )
}
