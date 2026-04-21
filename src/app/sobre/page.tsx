'use client'

import Link from 'next/link'

export default function SobrePage() {
  return (
    <div className="page-content" style={{ minHeight: '100vh', background: 'white' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '48px 24px 32px' }}>
        <img src="/mascot/main.png" alt="Mascot" style={{ width: '120px', height: '120px', objectFit: 'contain', margin: '0 auto 8px' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#8CB369', marginBottom: '4px' }}>U-Fluent</h1>
        <p style={{ fontSize: '1.1rem', color: '#1A1A1A', fontWeight: 700, marginBottom: '8px' }}>Do Zero ao TOEFL</p>
        <p style={{ color: '#999', maxWidth: '340px', margin: '0 auto 24px', lineHeight: 1.6, fontSize: '0.85rem' }}>
          Aprenda inglês do zero e passe no TOEFL. 100% em português. 100% gratuito.
        </p>
        <Link href="/welcome" className="jolingo-btn" style={{ display: 'inline-block', maxWidth: '300px', textDecoration: 'none' }}>
          COMEÇAR AGORA — GRÁTIS
        </Link>
        <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '8px' }}>Sem cadastro. Sem cartão. Sem pegadinha.</p>
      </div>

      {/* Numbers */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '0 24px', marginBottom: '32px' }}>
        {[
          { value: '3.000+', label: 'Exercícios' },
          { value: '963', label: 'Questões TOEFL' },
          { value: '300', label: 'Níveis' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8CB369', margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: '0.65rem', color: '#999', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Comparison */}
      <div style={{ padding: '0 24px', maxWidth: '500px', margin: '0 auto 32px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '16px' }}>Por que escolher o U-Fluent?</h2>
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid #E8E8E8', borderBottom: '4px solid #E8E8E8' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ background: '#F0F7EA' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700, color: '#6B9A4B' }}>Recurso</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 800, color: '#8CB369' }}>U-Fluent</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#999' }}>Duolingo</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', color: '#999' }}>Magoosh</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Preço', us: 'Grátis', duo: 'Grátis*', mag: 'R$750' },
                { feature: 'Em português', us: '✅', duo: '❌', mag: '❌' },
                { feature: 'Do zero', us: '✅', duo: '✅', mag: '❌' },
                { feature: 'Foco no TOEFL', us: '✅', duo: '❌', mag: '✅' },
                { feature: 'Questões reais', us: '963', duo: '0', mag: '~400' },
                { feature: 'Simulados 4 seções', us: '10', duo: '0', mag: '3' },
                { feature: 'Integrated tasks', us: '10', duo: '0', mag: '✅' },
                { feature: 'Correção de writing', us: '✅', duo: '❌', mag: '❌' },
              ].map((row, i) => (
                <tr key={row.feature} style={{ background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                  <td style={{ padding: '8px', fontWeight: 600, borderTop: '1px solid #F0F0F0' }}>{row.feature}</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700, color: '#8CB369', borderTop: '1px solid #F0F0F0' }}>{row.us}</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#999', borderTop: '1px solid #F0F0F0' }}>{row.duo}</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#999', borderTop: '1px solid #F0F0F0' }}>{row.mag}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.6rem', color: '#CCC', marginTop: '4px' }}>*Duolingo Plus custa R$45/mês</p>
      </div>

      {/* How it works */}
      <div style={{ padding: '0 24px', maxWidth: '500px', margin: '0 auto 32px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '16px' }}>Como funciona</h2>
        {[
          { step: '1', title: 'Teste de nível adaptativo', desc: '15 questões inteligentes que descobrem seu nível exato (A1 a C1)', color: '#5B9BD5' },
          { step: '2', title: 'Estude 30 min por dia', desc: '6 habilidades com exercícios progressivos. Só avança com 90%+', color: '#8CB369' },
          { step: '3', title: 'Simulados TOEFL reais', desc: '10 simulados completos com 4 seções e timer. Questões de provas aposentadas', color: '#F4A261' },
          { step: '4', title: 'Passe no TOEFL', desc: 'Acompanhe sua nota estimada (0-120) e saiba quando está pronto', color: '#9B59B6' },
        ].map(item => (
          <div key={item.step} style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>{item.step}</div>
            <div>
              <p style={{ fontWeight: 700, margin: '0 0 2px', fontSize: '0.9rem' }}>{item.title}</p>
              <p style={{ fontSize: '0.75rem', color: '#999', margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Features grid */}
      <div style={{ padding: '0 24px', maxWidth: '500px', margin: '0 auto 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { emoji: '🎧', title: 'Listening', desc: 'Áudio em todos os 50 níveis' },
            { emoji: '🎤', title: 'Speaking', desc: 'Gravação + avaliação de fluência' },
            { emoji: '✏️', title: 'Writing', desc: 'Análise inteligente com nota 0-30' },
            { emoji: '📖', title: 'Reading', desc: 'Textos acadêmicos de 700+ palavras' },
            { emoji: '🔗', title: 'Integrated', desc: 'Ler + ouvir + escrever combinados' },
            { emoji: '🏆', title: 'Gamificação', desc: 'Ligas, combos, corações, badges' },
          ].map(f => (
            <div key={f.title} style={{ background: '#F7F7F7', borderRadius: '14px', padding: '14px', border: '2px solid #E8E8E8', borderBottom: '4px solid #E8E8E8' }}>
              <span style={{ fontSize: '1.3rem' }}>{f.emoji}</span>
              <p style={{ fontWeight: 700, fontSize: '0.8rem', margin: '4px 0 2px' }}>{f.title}</p>
              <p style={{ fontSize: '0.65rem', color: '#999', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ padding: '0 24px', maxWidth: '500px', margin: '0 auto 32px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '16px' }}>Perguntas frequentes</h2>
        {[
          { q: 'Preciso saber inglês para começar?', a: 'Não! O app começa do zero absoluto. As instruções são 100% em português.' },
          { q: 'É realmente grátis?', a: 'Sim. Sem assinatura, sem anúncios, sem compras dentro do app. Tudo liberado.' },
          { q: 'As questões são reais do TOEFL?', a: 'Sim. Temos 963 questões de provas TOEFL aposentadas (dataset MIT, licença livre).' },
          { q: 'Quanto tempo leva para passar no TOEFL?', a: 'Depende do seu nível. Estudando 30 min/dia: ~12 meses do zero, ~6 meses se já fala inglês.' },
          { q: 'Funciona no celular?', a: 'Sim! É um PWA — funciona em qualquer navegador e pode ser instalado na tela inicial.' },
        ].map(faq => (
          <details key={faq.q} style={{ marginBottom: '8px', background: '#F7F7F7', borderRadius: '12px', border: '1px solid #E8E8E8', overflow: 'hidden' }}>
            <summary style={{ padding: '12px 14px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {faq.q} <span style={{ color: '#999', fontSize: '0.8rem' }}>+</span>
            </summary>
            <p style={{ padding: '0 14px 12px', fontSize: '0.8rem', color: '#666', margin: 0, lineHeight: 1.5 }}>{faq.a}</p>
          </details>
        ))}
      </div>

      {/* Final CTA */}
      <div style={{ textAlign: 'center', padding: '0 24px 48px' }}>
        <img src="/mascot/success.png" alt="Success" style={{ width: '80px', height: '80px', objectFit: 'contain', margin: '0 auto 8px' }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>Comece agora. É grátis.</h2>
        <p style={{ color: '#999', fontSize: '0.8rem', marginBottom: '20px' }}>30 min/dia. Do zero ao TOEFL.</p>
        <Link href="/welcome" className="jolingo-btn" style={{ display: 'inline-block', maxWidth: '300px', textDecoration: 'none' }}>
          COMEÇAR AGORA
        </Link>
      </div>

      {/* Footer */}
      <div style={{ background: '#F7F7F7', padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.65rem', color: '#999', margin: '0 0 4px' }}>
          TOEFL® é marca registrada do ETS. Este app não é afiliado ao ETS.
        </p>
        <p style={{ fontSize: '0.6rem', color: '#CCC', margin: 0 }}>© 2026 U-Fluent. Todos os direitos reservados.</p>
      </div>
    </div>
  )
}
