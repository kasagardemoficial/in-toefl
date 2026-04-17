'use client'

import Link from 'next/link'

export default function SobrePage() {
  return (
    <div className="min-h-screen" style={{ background: 'white' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '60px 24px 40px' }}>
        <img src="/mascot/main.png" alt="In-TOEFL Mascot" style={{ width: '140px', height: '140px', objectFit: 'contain', margin: '0 auto 12px' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#8CB369', marginBottom: '8px', fontFamily: 'Nunito, sans-serif' }}>
          In-TOEFL
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '4px' }}>Do Zero ao TOEFL</p>
        <p style={{ color: '#999', maxWidth: '360px', margin: '0 auto 32px', lineHeight: 1.6, fontSize: '0.9rem' }}>
          O primeiro app do mundo que leva do zero absoluto em inglês até passar no TOEFL.
          Em português. De graça.
        </p>
        <Link
          href="/welcome"
          className="jolingo-btn"
          style={{ display: 'inline-block', maxWidth: '320px', textDecoration: 'none' }}
        >
          COMEÇAR AGORA — GRÁTIS
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', padding: '0 24px', maxWidth: '500px', margin: '0 auto 40px' }}>
        {[
          { value: '300', label: 'Níveis', color: '#8CB369' },
          { value: '1.959', label: 'Exercícios', color: '#9B59B6' },
          { value: '963', label: 'Questões TOEFL', color: '#5B9BD5' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#F7F7F7', borderRadius: '16px', padding: '16px', border: '1px solid #E8E8E8', textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, margin: 0 }}>{stat.value}</p>
            <p style={{ fontSize: '0.7rem', color: '#999', margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: '0 24px', maxWidth: '500px', margin: '0 auto 40px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '24px' }}>Por que o In-TOEFL?</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: '🇧🇷', title: 'Feito para brasileiros', desc: 'Instruções em português. Erros comuns de brasileiros. Dicas de pronúncia específicas. Falsos cognatos explicados.' },
            { icon: '📐', title: '6 habilidades completas', desc: 'Reading, Listening, Speaking, Writing, Vocabulary e Grammar. Cada uma com 50 níveis independentes.' },
            { icon: '🎯', title: 'Método Kumon', desc: 'Só avança quando domina (90%+ de acerto). 30 minutos por dia. Disciplina que funciona.' },
            { icon: '📋', title: 'Questões TOEFL', desc: '963 questões de provas TOEFL aposentadas (dataset MIT). 10 simulados completos com 4 seções + 34 simulados de listening.' },
            { icon: '🗣️', title: 'Speaking com verificação de pronúncia', desc: 'Fale no microfone e o app verifica se sua pronúncia está correta. Treina todas as 4 tasks do TOEFL Speaking.' },
            { icon: '💰', title: '100% gratuito', desc: 'Sem assinatura. Sem compras. Sem anúncios. Acesso completo a todo o conteúdo.' },
          ].map((feature) => (
            <div key={feature.title} style={{ background: '#F7F7F7', borderRadius: '16px', padding: '16px', border: '1px solid #E8E8E8', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{feature.icon}</span>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: '4px', fontSize: '0.95rem' }}>{feature.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#999', margin: 0, lineHeight: 1.5 }}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Journey */}
      <div style={{ padding: '0 24px', maxWidth: '500px', margin: '0 auto 40px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '24px' }}>Sua jornada</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { num: 1, color: '#5B9BD5', title: 'Fase 1 — English Base', desc: 'Níveis 1-20. Do zero ao intermediário. Vocabulário, gramática básica, primeiras conversas.', mascot: '/mascot/study.png' },
            { num: 2, color: '#9B59B6', title: 'Fase 2 — TOEFL Training', desc: 'Níveis 21-40. Textos acadêmicos, lectures, essays, vocabulário avançado. Formato TOEFL.', mascot: '/mascot/detective.png' },
            { num: 3, color: '#8CB369', title: 'Fase 3 — Pronto para o TOEFL', desc: 'Níveis 41-50. Simulados reais, estratégias de prova, nível C1. Passe no TOEFL!', mascot: '/mascot/master.png' },
          ].map((phase) => (
            <div key={phase.num} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img src={phase.mascot} alt={phase.title} style={{ width: '56px', height: '56px', objectFit: 'contain', flexShrink: 0 }} />
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: phase.color, marginBottom: '2px' }}>{phase.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#999', margin: 0, lineHeight: 1.5 }}>{phase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Who is it for */}
      <div style={{ padding: '0 24px', maxWidth: '500px', margin: '0 auto 40px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '24px' }}>Para quem?</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { icon: '🎓', title: 'Universitários', desc: 'Mestrado e doutorado no exterior' },
            { icon: '🏥', title: 'Médicos', desc: 'Estágio e residência fora' },
            { icon: '💼', title: 'Profissionais', desc: 'Carreira internacional' },
            { icon: '✈️', title: 'Imigrantes', desc: 'Morar em outro país' },
          ].map((item) => (
            <div key={item.title} style={{ background: '#F7F7F7', borderRadius: '16px', padding: '16px', border: '1px solid #E8E8E8', textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '4px' }}>{item.icon}</span>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 2px' }}>{item.title}</p>
              <p style={{ fontSize: '0.7rem', color: '#999', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Comece agora. É grátis.</h2>
        <p style={{ color: '#999', marginBottom: '24px', maxWidth: '320px', margin: '0 auto 24px', fontSize: '0.9rem' }}>
          30 minutos por dia. 12-15 meses. Do zero ao TOEFL.
        </p>
        <Link
          href="/welcome"
          className="jolingo-btn"
          style={{ display: 'inline-block', maxWidth: '320px', textDecoration: 'none' }}
        >
          COMEÇAR AGORA — GRÁTIS
        </Link>
        <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '16px' }}>Sem cadastro. Sem cartão de crédito. Sem pegadinha.</p>
      </div>
    </div>
  )
}
