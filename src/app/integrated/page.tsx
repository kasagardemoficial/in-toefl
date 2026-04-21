'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addXP } from '@/lib/storage'
import { analyzeWriting } from '@/lib/writing-feedback'
import { speakText } from '@/lib/audio'
import integratedData from '@/data/integrated-tasks.json'

interface IntegratedTask {
  id: string
  topic: string
  reading_passage: string
  listening_transcript: string
  speaking_prompt: string
  writing_prompt: string
  model_speaking: string
  model_writing: string
}

export default function IntegratedPage() {
  const router = useRouter()
  const [selectedTask, setSelectedTask] = useState<IntegratedTask | null>(null)
  const [step, setStep] = useState(0) // 0=list, 1=reading, 2=listening, 3=choose, 4=speaking, 5=writing, 6=result
  const [userText, setUserText] = useState('')
  const [showModel, setShowModel] = useState(false)
  const [timer, setTimer] = useState(0)
  const [mode, setMode] = useState<'speaking' | 'writing' | null>(null)

  const tasks = integratedData as IntegratedTask[]

  // Task list
  if (!selectedTask) {
    return (
      <div className="page-shell page-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>←</button>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Integrated Tasks</h1>
            <p style={{ fontSize: '0.7rem', color: '#999', margin: 0 }}>Ler + Ouvir + Escrever/Falar</p>
          </div>
        </div>

        <div style={{ background: '#F0F7EA', borderRadius: '16px', padding: '14px', marginBottom: '16px', border: '1px solid #D4E8C4' }}>
          <p style={{ fontSize: '0.75rem', color: '#6B9A4B', margin: 0, lineHeight: 1.5 }}>
            Integrated Tasks combinam habilidades como no TOEFL real. Você lê um texto, ouve uma palestra, e depois escreve ou fala sobre os dois.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tasks.map((task, i) => (
            <button key={task.id} onClick={() => { setSelectedTask(task); setStep(1); setTimer(0); setUserText(''); setShowModel(false); setMode(null) }}
              style={{ width: '100%', background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E8E8E8', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #8CB36920, #5B9BD520)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '1.2rem' }}>🔗</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, margin: '0 0 2px', fontSize: '0.95rem' }}>Task {i + 1}: {task.topic}</p>
                  <p style={{ color: '#999', margin: 0, fontSize: '0.7rem' }}>📖 Read → 🎧 Listen → ✍️🗣️ Respond</p>
                </div>
                <span style={{ color: '#E8E8E8' }}>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Step 1: Reading
  if (step === 1) {
    return (
      <div style={{ minHeight: '100vh', padding: '16px', maxWidth: '500px', margin: '0 auto', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => { setSelectedTask(null); setStep(0) }} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' }}>✕</button>
          <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '8px', background: '#8CB36918', color: '#8CB369', fontWeight: 700 }}>📖 STEP 1: READING</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: '0.7rem', color: '#999' }}>3 min</span>
        </div>

        <div style={{ background: '#F7F7F7', borderRadius: '14px', padding: '16px', marginBottom: '16px', border: '1px solid #E8E8E8' }}>
          <p style={{ fontSize: '0.7rem', color: '#8CB369', fontWeight: 700, marginBottom: '8px' }}>Leia o texto com atenção — você precisará dele depois:</p>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#1A1A1A' }}>{selectedTask.reading_passage}</p>
        </div>

        <button onClick={() => setStep(2)} className="jolingo-btn">
          LI O TEXTO — PRÓXIMO PASSO
        </button>
      </div>
    )
  }

  // Step 2: Listening
  if (step === 2) {
    return (
      <div style={{ minHeight: '100vh', padding: '16px', maxWidth: '500px', margin: '0 auto', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' }}>←</button>
          <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '8px', background: '#5B9BD518', color: '#5B9BD5', fontWeight: 700 }}>🎧 STEP 2: LISTENING</span>
        </div>

        <div style={{ background: '#F7F7F7', borderRadius: '14px', padding: '16px', marginBottom: '12px', borderLeft: '3px solid #5B9BD5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <p style={{ fontSize: '0.7rem', color: '#5B9BD5', fontWeight: 700, margin: 0 }}>🎧 Ouça a resposta/palestra:</p>
            <button onClick={() => speakText(selectedTask.listening_transcript, 0.85)} style={{ background: '#5B9BD5', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: 'white', fontSize: '0.7rem', fontWeight: 700 }}>
              🔊 Ouvir
            </button>
          </div>
          <details>
            <summary style={{ fontSize: '0.7rem', color: '#999', cursor: 'pointer' }}>Ver transcrição</summary>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#1A1A1A', fontStyle: 'italic', marginTop: '8px' }}>{selectedTask.listening_transcript}</p>
          </details>
        </div>

        <div style={{ background: '#FFF3E0', borderRadius: '12px', padding: '12px', marginBottom: '16px', border: '1px solid #FFE0B2' }}>
          <p style={{ fontSize: '0.7rem', color: '#E65100', margin: 0 }}>💡 No TOEFL real, você ouve o áudio apenas UMA vez e não pode ver a transcrição. Tente ouvir sem ler!</p>
        </div>

        <button onClick={() => setStep(3)} className="jolingo-btn">
          OUVI — PRÓXIMO PASSO
        </button>
      </div>
    )
  }

  // Step 3: Choose Speaking or Writing
  if (step === 3) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', background: 'white' }}>
        <img src="/mascot/detective.png" alt="Escolha" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '12px' }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px' }}>Agora é sua vez!</h2>
        <p style={{ color: '#999', fontSize: '0.8rem', marginBottom: '24px' }}>Combine o que leu e ouviu para responder:</p>

        <button onClick={() => { setMode('speaking'); setStep(4) }}
          style={{ width: '100%', maxWidth: '320px', background: '#FFF3E0', borderRadius: '14px', padding: '16px', border: '2px solid #F4A261', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>🗣️</span>
          <div>
            <p style={{ fontWeight: 700, margin: 0, color: '#E65100' }}>Speaking Task</p>
            <p style={{ fontSize: '0.7rem', color: '#999', margin: 0 }}>Fale sua resposta (60 segundos)</p>
          </div>
        </button>

        <button onClick={() => { setMode('writing'); setStep(5) }}
          style={{ width: '100%', maxWidth: '320px', background: '#FFEBEE', borderRadius: '14px', padding: '16px', border: '2px solid #E76F51', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>✍️</span>
          <div>
            <p style={{ fontWeight: 700, margin: 0, color: '#C62828' }}>Writing Task</p>
            <p style={{ fontSize: '0.7rem', color: '#999', margin: 0 }}>Escreva sua resposta (20 minutos)</p>
          </div>
        </button>
      </div>
    )
  }

  // Step 4: Speaking response
  if (step === 4) {
    return (
      <div style={{ minHeight: '100vh', padding: '16px', maxWidth: '500px', margin: '0 auto', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' }}>←</button>
          <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '8px', background: '#F4A26118', color: '#F4A261', fontWeight: 700 }}>🗣️ STEP 3: SPEAKING</span>
        </div>

        <div style={{ background: '#FFF3E0', borderRadius: '14px', padding: '14px', marginBottom: '16px', border: '1px solid #FFE0B2' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E65100', marginBottom: '4px' }}>{selectedTask.speaking_prompt}</p>
          <p style={{ fontSize: '0.7rem', color: '#999', margin: 0 }}>Tempo: 60 segundos. Combine informações do texto e da palestra.</p>
        </div>

        {!showModel && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '16px' }}>Grave sua resposta falando em voz alta, depois compare com o modelo.</p>
            <button onClick={() => { setShowModel(true); addXP(20) }} className="jolingo-btn" style={{ maxWidth: '300px' }}>
              VER RESPOSTA MODELO
            </button>
          </div>
        )}

        {showModel && (
          <div>
            <div style={{ background: '#E8F5E9', borderRadius: '14px', padding: '14px', marginBottom: '12px', border: '1px solid #C8E6C9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontSize: '0.7rem', color: '#4CAF50', fontWeight: 700, margin: 0 }}>Resposta modelo:</p>
                <button onClick={() => speakText(selectedTask.model_speaking, 0.85)} style={{ background: '#4CAF50', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', color: 'white', fontSize: '0.65rem' }}>🔊 Ouvir</button>
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#2E7D32' }}>{selectedTask.model_speaking}</p>
            </div>
            <button onClick={() => { setStep(6); addXP(30) }} className="jolingo-btn">
              FINALIZAR
            </button>
          </div>
        )}
      </div>
    )
  }

  // Step 5: Writing response
  if (step === 5) {
    const feedback = showModel ? analyzeWriting(userText) : null
    return (
      <div style={{ minHeight: '100vh', padding: '16px', maxWidth: '500px', margin: '0 auto', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' }}>←</button>
          <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '8px', background: '#E76F5118', color: '#E76F51', fontWeight: 700 }}>✍️ STEP 3: WRITING</span>
        </div>

        <div style={{ background: '#FFEBEE', borderRadius: '14px', padding: '14px', marginBottom: '12px', border: '1px solid #FFCDD2' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#C62828', marginBottom: '4px' }}>{selectedTask.writing_prompt}</p>
          <p style={{ fontSize: '0.7rem', color: '#999', margin: 0 }}>Escreva 150-225 palavras. Combine informações do texto e da palestra.</p>
        </div>

        <textarea
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="Write your response here..."
          style={{ width: '100%', minHeight: '200px', padding: '14px', borderRadius: '14px', border: '1px solid #E8E8E8', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7 }}
        />
        <p style={{ fontSize: '0.65rem', color: '#999', textAlign: 'right' }}>
          {userText.trim().split(/\s+/).filter(w => w).length} palavras
        </p>

        {!showModel && (
          <button onClick={() => { setShowModel(true); addXP(20) }} className="jolingo-btn">
            ANALISAR MEU TEXTO
          </button>
        )}

        {showModel && feedback && (
          <div>
            {/* Score */}
            <div style={{ background: feedback.score >= 20 ? '#E8F5E9' : feedback.score >= 10 ? '#FFF3E0' : '#FFEBEE', borderRadius: '12px', padding: '14px', marginBottom: '10px', textAlign: 'center' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: feedback.score >= 20 ? '#4CAF50' : feedback.score >= 10 ? '#F4A261' : '#EF5350', margin: '0 0 4px' }}>{feedback.score}/30</p>
              <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>{feedback.overallFeedback}</p>
            </div>

            {/* Suggestions */}
            {feedback.suggestions.map((s, i) => (
              <p key={i} style={{ fontSize: '0.7rem', color: '#E65100', margin: '4px 0' }}>→ {s}</p>
            ))}

            {/* Model answer */}
            <details style={{ marginTop: '12px' }}>
              <summary style={{ fontSize: '0.75rem', color: '#8CB369', cursor: 'pointer', fontWeight: 600 }}>Ver resposta modelo</summary>
              <div style={{ background: '#F0F7EA', borderRadius: '10px', padding: '12px', marginTop: '6px' }}>
                <p style={{ fontSize: '0.8rem', color: '#2E7D32', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{selectedTask.model_writing}</p>
              </div>
            </details>

            <button onClick={() => { setStep(6); addXP(30) }} className="jolingo-btn" style={{ marginTop: '16px' }}>
              FINALIZAR
            </button>
          </div>
        )}
      </div>
    )
  }

  // Step 6: Done
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', background: 'white' }}>
      <img src="/mascot/success.png" alt="Parabéns" style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '12px' }} />
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>Integrated Task Concluída!</h2>
      <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '4px' }}>{selectedTask.topic}</p>
      <p style={{ color: '#8CB369', fontSize: '0.8rem', fontWeight: 600, marginBottom: '24px' }}>+50 XP</p>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => { setSelectedTask(null); setStep(0); setUserText(''); setShowModel(false) }}
          className="jolingo-btn" style={{ background: 'white', color: '#8CB369', border: '2px solid #8CB369' }}>
          OUTRAS TASKS
        </button>
        <button onClick={() => router.push('/')} className="jolingo-btn">
          VOLTAR
        </button>
      </div>
    </div>
  )
}
