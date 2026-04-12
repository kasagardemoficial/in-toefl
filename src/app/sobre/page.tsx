'use client'

import Link from 'next/link'

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      {/* Hero */}
      <div className="text-center px-6 pt-16 pb-12">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          In-TOEFL
        </h1>
        <p className="text-xl text-slate-300 mb-2">Do Zero ao TOEFL</p>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          O primeiro app do mundo que leva do zero absoluto em inglês até passar no TOEFL.
          Em português. De graça.
        </p>
        <Link
          href="/welcome"
          className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-10 rounded-2xl text-lg transition-all hover:scale-105"
        >
          Começar Agora — Grátis
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 px-6 max-w-lg mx-auto mb-12">
        <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] text-center">
          <p className="text-2xl font-bold text-blue-400">300</p>
          <p className="text-xs text-slate-400">Níveis</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] text-center">
          <p className="text-2xl font-bold text-purple-400">1.843</p>
          <p className="text-xs text-slate-400">Exercícios</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] text-center">
          <p className="text-2xl font-bold text-green-400">963</p>
          <p className="text-xs text-slate-400">Questões TOEFL Reais</p>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 max-w-lg mx-auto mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Por que o In-TOEFL?</h2>

        <div className="space-y-4">
          <div className="bg-[#1e293b] rounded-xl p-5 border border-[#334155]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🇧🇷</span>
              <div>
                <h3 className="font-semibold mb-1">Feito para brasileiros</h3>
                <p className="text-sm text-slate-400">Instruções em português. Erros comuns de brasileiros. Dicas de pronúncia específicas. Falsos cognatos explicados.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-xl p-5 border border-[#334155]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📐</span>
              <div>
                <h3 className="font-semibold mb-1">6 habilidades completas</h3>
                <p className="text-sm text-slate-400">Reading, Listening, Speaking, Writing, Vocabulary e Grammar. Cada uma com 50 níveis independentes.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-xl p-5 border border-[#334155]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold mb-1">Método Kumon</h3>
                <p className="text-sm text-slate-400">Só avança quando domina (90%+ de acerto). 30 minutos por dia. Disciplina que funciona.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-xl p-5 border border-[#334155]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="font-semibold mb-1">Questões TOEFL reais</h3>
                <p className="text-sm text-slate-400">963 questões de provas TOEFL aposentadas (dataset MIT). 10 simulados completos. Formato idêntico à prova real.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-xl p-5 border border-[#334155]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🗣️</span>
              <div>
                <h3 className="font-semibold mb-1">Speaking com verificação de pronúncia</h3>
                <p className="text-sm text-slate-400">Fale no microfone e o app verifica se sua pronúncia está correta. Treina todas as 4 tasks do TOEFL Speaking.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-xl p-5 border border-[#334155]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <h3 className="font-semibold mb-1">100% gratuito</h3>
                <p className="text-sm text-slate-400">Sem assinatura. Sem compras. Sem anúncios. Acesso completo a todo o conteúdo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Journey */}
      <div className="px-6 max-w-lg mx-auto mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Sua jornada</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-lg font-bold shrink-0">1</div>
            <div>
              <h3 className="font-semibold">Fase 1 — English Base</h3>
              <p className="text-sm text-slate-400">Níveis 1-20. Do zero ao intermediário. Vocabulário, gramática básica, primeiras conversas.</p>
            </div>
          </div>
          <div className="w-0.5 h-8 bg-[#334155] ml-6"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-lg font-bold shrink-0">2</div>
            <div>
              <h3 className="font-semibold">Fase 2 — TOEFL Training</h3>
              <p className="text-sm text-slate-400">Níveis 21-40. Textos acadêmicos, lectures, essays, vocabulário avançado. Formato TOEFL.</p>
            </div>
          </div>
          <div className="w-0.5 h-8 bg-[#334155] ml-6"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-lg font-bold shrink-0">3</div>
            <div>
              <h3 className="font-semibold">Fase 3 — Pronto para o TOEFL</h3>
              <p className="text-sm text-slate-400">Níveis 41-50. Simulados reais, estratégias de prova, nível C1. Passe no TOEFL!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Who is it for */}
      <div className="px-6 max-w-lg mx-auto mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Para quem?</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] text-center">
            <span className="text-2xl block mb-2">🎓</span>
            <p className="text-sm font-semibold">Universitários</p>
            <p className="text-xs text-slate-400">Mestrado e doutorado no exterior</p>
          </div>
          <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] text-center">
            <span className="text-2xl block mb-2">🏥</span>
            <p className="text-sm font-semibold">Médicos</p>
            <p className="text-xs text-slate-400">Estágio e residência fora</p>
          </div>
          <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] text-center">
            <span className="text-2xl block mb-2">💼</span>
            <p className="text-sm font-semibold">Profissionais</p>
            <p className="text-xs text-slate-400">Carreira internacional</p>
          </div>
          <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] text-center">
            <span className="text-2xl block mb-2">✈️</span>
            <p className="text-sm font-semibold">Imigrantes</p>
            <p className="text-xs text-slate-400">Morar em outro país</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center px-6 pb-16">
        <h2 className="text-2xl font-bold mb-4">Comece agora. É grátis.</h2>
        <p className="text-slate-400 mb-6 max-w-sm mx-auto">
          30 minutos por dia. 12-15 meses. Do zero ao TOEFL.
        </p>
        <Link
          href="/welcome"
          className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-10 rounded-2xl text-lg transition-all hover:scale-105"
        >
          Começar Agora — Grátis
        </Link>
        <p className="text-xs text-slate-600 mt-4">Sem cadastro. Sem cartão de crédito. Sem pegadinha.</p>
      </div>
    </div>
  )
}
