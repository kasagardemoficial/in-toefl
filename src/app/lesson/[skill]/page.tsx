'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProgress, saveProgress, addXP } from '@/lib/storage'
import { getOnboarding } from '@/lib/onboarding'
import { recordDailyActivity } from '@/lib/weekly-review'
import { estimateTOEFLScore } from '@/lib/monthly-score'
import { shareProgress } from '@/lib/share'
import { analyzeWriting, WritingFeedback } from '@/lib/writing-feedback'
import { evaluateSpeaking, AudioRecorder, SpeakingFeedback } from '@/lib/speaking-recorder'
import { getAudioPath, speakText } from '@/lib/audio'
import { playCorrect, playWrong, playLevelUp, playCombo } from '@/lib/sounds'
import { launchConfetti } from '@/lib/confetti'
import { getHearts, loseHeart, getCombo, addCombo, resetCombo, addLeagueXP, getDailyChallenge, updateDailyProgress } from '@/lib/gamification'
import { Exercise } from '@/types'

// Import exercise data
import readingData from '@/data/reading.json'
import vocabularyData from '@/data/vocabulary.json'
import speakingData from '@/data/speaking.json'
import writingData from '@/data/writing.json'
import grammarData from '@/data/grammar.json'
import listeningData from '@/data/listening.json'

const dataMap: Record<string, unknown[]> = {
  reading: readingData,
  vocabulary: vocabularyData,
  speaking: speakingData,
  writing: writingData,
  grammar: grammarData,
  listening: listeningData,
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const skill = params.skill as string

  const [currentExercise, setCurrentExercise] = useState(0)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [lessonDone, setLessonDone] = useState(false)
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null)
  const [userText, setUserText] = useState('')
  const [showModel, setShowModel] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [showLevelPicker, setShowLevelPicker] = useState(false)
  const [writingFeedback, setWritingFeedback] = useState<WritingFeedback | null>(null)
  const [speakingFeedback, setSpeakingFeedback] = useState<SpeakingFeedback | null>(null)
  const [hearts, setHearts] = useState(5)
  const [combo, setCombo] = useState(0)
  const [comboMultiplier, setComboMultiplier] = useState(1)
  const [xpPopup, setXpPopup] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recorder] = useState(() => typeof window !== 'undefined' ? new AudioRecorder() : null)

  function loadLevel(level: number) {
    const data = dataMap[skill]
    if (!data) return

    const levelData = data.find((l: unknown) => (l as { level: number }).level === level) as {
      exercises?: Exercise[]
      words?: Array<{ exercise: Exercise } & Record<string, unknown>>
    } | undefined

    if (!levelData) return

    if (skill === 'vocabulary' && levelData.words) {
      setExercises(levelData.words.map((w: unknown) => {
        const word = w as { id: string; word: string; translation_pt: string; example_en: string; exercise: Exercise }
        return {
          ...word.exercise,
          id: word.id,
          passage: word.word,
          explanation_pt: `'${word.word}' = ${word.translation_pt}. Exemplo: ${word.example_en}`,
        }
      }))
    } else if (levelData.exercises) {
      setExercises(levelData.exercises)
    }

    setCurrentExercise(0)
    setSelected(null)
    setShowResult(false)
    setCorrect(0)
    setTotal(0)
    setLessonDone(false)
    setCombo(0)
    setComboMultiplier(1)
    setHearts(getHearts().hearts)
    setUserText('')
    setShowModel(false)
  }

  useEffect(() => {
    const progress = getProgress()
    const levelKey = `${skill}_level` as keyof typeof progress
    const level = (progress[levelKey] as number) || 1
    setCurrentLevel(level)
    loadLevel(level)
  }, [skill])

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <p className="text-[#999] mb-4">Carregando exercícios...</p>
        <button onClick={() => router.push('/')} className="text-[#8CB369] underline">
          Voltar
        </button>
      </div>
    )
  }

  const ex = exercises[currentExercise]

  function selectOption(option: string) {
    if (showResult) return
    setSelected(option)
  }

  function confirmAnswer() {
    if (showResult || !selected) return
    setShowResult(true)
    setTotal(t => t + 1)
    const option = selected

    // For fill_blank exercises, correct is the full word (e.g. "goes")
    // For multiple choice, correct is a letter (e.g. "B")
    const isCorrect = ex.type === 'fill_blank'
      ? option === ex.correct
      : option.charAt(0) === ex.correct

    if (isCorrect) {
      setCorrect(c => c + 1)
      setFlash('correct')
      playCorrect()
      const comboData = addCombo()
      setCombo(comboData.current)
      setComboMultiplier(comboData.multiplier)
      const xpGain = 10 * comboData.multiplier
      addXP(xpGain)
      addLeagueXP(xpGain)
      updateDailyProgress(1)
      setXpPopup(xpGain)
      setTimeout(() => setXpPopup(null), 1200)
      if (comboData.current >= 5 && comboData.current % 5 === 0) playCombo()
    } else {
      setFlash('wrong')
      playWrong()
      const comboData = resetCombo()
      setCombo(comboData.current)
      setComboMultiplier(comboData.multiplier)
      const remaining = loseHeart()
      setHearts(remaining)
    }

    setTimeout(() => setFlash(null), 500)
  }

  function handleNext() {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(c => c + 1)
      setSelected(null)
      setShowResult(false)
      setUserText('')
      setShowModel(false)
    } else {
      finishLesson()
    }
  }

  function finishLesson() {
    const pct = Math.round((correct / total) * 100)
    setLessonDone(true)

    // Record activity for weekly review
    const xpGained = pct >= 90 ? 50 + (correct * 10) : correct * 10
    recordDailyActivity(total, xpGained)

    if (pct >= 90) {
      playLevelUp()
      launchConfetti()
      const progress = getProgress()
      const levelKey = `${skill}_level` as keyof typeof progress
      const currentLevel = progress[levelKey] as number
      ;(progress as unknown as Record<string, unknown>)[levelKey] = currentLevel + 1
      addXP(50)
      addLeagueXP(50)
      saveProgress(progress)
    }
  }

  if (lessonDone) {
    const pct = Math.round((correct / total) * 100)
    const passed = pct >= 90
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <img src={passed ? '/mascot/success.png' : '/mascot/resilient.png'} alt={passed ? 'Parabéns!' : 'Quase lá!'} style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '8px' }} />
        <h2 className="text-2xl font-bold mb-2">
          {passed ? 'Parabéns!' : 'Quase lá!'}
        </h2>
        <p className="text-lg text-[#666] mb-2">
          Você acertou {correct} de {total} ({pct}%)
        </p>
        <p className="text-sm text-[#999] mb-6">
          {passed
            ? 'Você avançou de nível! +50 XP'
            : 'Precisa de 90% para avançar. Tente novamente!'}
        </p>

        <div className="w-full max-w-xs bg-[#E8E8E8] rounded-full h-4 mb-6">
          <div
            className={`h-4 rounded-full progress-fill ${passed ? 'bg-[#8CB369]' : 'bg-yellow-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/')}
            className="bg-white border border-[#E8E8E8] text-[#1A1A1A] font-semibold py-3 px-6 rounded-xl"
          >
            Voltar
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#8CB369] hover:bg-[#6B9A4B] text-[#1A1A1A] font-semibold py-3 px-6 rounded-xl"
          >
            {passed ? 'Próximo Nível' : 'Tentar de Novo'}
          </button>
        </div>
        {passed && (
          <button
            onClick={() => {
              const p = getProgress()
              const onb = getOnboarding()
              const score = estimateTOEFLScore(p)
              const allLvls = [p.reading_level, p.listening_level, p.speaking_level, p.writing_level, p.vocabulary_level, p.grammar_level]
              const maxIdx = allLvls.indexOf(Math.max(...allLvls))
              const skillNames = ['Reading', 'Listening', 'Speaking', 'Writing', 'Vocabulary', 'Grammar']
              shareProgress({
                name: onb.name || 'Aluno',
                streak: p.streak,
                xp: p.xp,
                toeflScore: score.total,
                topSkill: skillNames[maxIdx],
                topLevel: allLvls[maxIdx],
                overallPct: Math.round((allLvls.reduce((a, b) => a + b, 0) / 300) * 100),
              })
            }}
            style={{ marginTop: '16px', background: 'none', border: '1px solid #D4E8C4', borderRadius: '20px', padding: '10px 24px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: '#6B9A4B', fontFamily: 'inherit' }}
          >
            📤 Compartilhar nos Stories
          </button>
        )}
      </div>
    )
  }

  const progressPct = Math.round(((currentExercise) / exercises.length) * 100)
  const skillIcons: Record<string, string> = {
    reading: '/mascot/icon_reading.png',
    listening: '/mascot/icon_listening.png',
    speaking: '/mascot/icon_speaking.png',
    writing: '/mascot/icon_writing.png',
    vocabulary: '/mascot/icon_vocabulary.png',
    grammar: '/mascot/icon_grammar.png',
  }

  return (
    <div className={`min-h-screen p-4 max-w-lg mx-auto ${flash === 'correct' ? 'flash-correct' : flash === 'wrong' ? 'flash-wrong' : ''}`}>
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/')} className="text-[#999] text-2xl">
          ✕
        </button>
        {/* Hearts */}
        <div style={{ display: 'flex', gap: '2px', fontSize: '0.8rem' }}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ opacity: i < hearts ? 1 : 0.2 }}>{i < hearts ? '❤️' : '🖤'}</span>
          ))}
        </div>
        <img src={skillIcons[skill] || '/mascot/main.png'} alt={skill} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
        <div className="flex-1 bg-[#E8E8E8] rounded-full h-3">
          <div
            className="bg-[#8CB369] h-3 rounded-full progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <button
          onClick={() => setShowLevelPicker(!showLevelPicker)}
          style={{ background: '#F0F7EA', border: '1px solid #D4E8C4', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, color: '#6B9A4B', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
        >
          Nv {currentLevel} ▾
        </button>
        <span className="text-sm text-[#999]">
          {currentExercise + 1}/{exercises.length}
        </span>
      </div>

      {/* Combo & XP */}
      {combo >= 3 && (
        <div className="combo-pop" style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <div className={comboMultiplier >= 3 ? 'pulse-glow' : ''} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: comboMultiplier >= 3 ? '#FFF3E0' : '#F0F7EA', border: `1px solid ${comboMultiplier >= 3 ? '#FFB74D' : '#D4E8C4'}`, borderRadius: '20px', padding: '4px 14px' }}>
            <span style={{ fontSize: '0.8rem' }}>🔥</span>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: comboMultiplier >= 3 ? '#FF7043' : '#8CB369' }}>{combo} combo!</span>
            {comboMultiplier > 1 && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FFC107' }}>×{comboMultiplier} XP</span>}
          </div>
        </div>
      )}
      {xpPopup && (
        <div className="xp-float" style={{ left: '50%', top: '80px' }}>+{xpPopup} XP</div>
      )}

      {/* Level picker with categories */}
      {showLevelPicker && (
        <div style={{ background: 'white', border: '1px solid #E8E8E8', borderRadius: '16px', padding: '16px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1.2rem', padding: '2px' }}>←</button>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>Escolher nível</p>
            <button onClick={() => setShowLevelPicker(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          </div>

          {/* Category buttons */}
          {[
            { label: '🌱 Básico', sub: 'Níveis 1-15', range: [1, 15], color: '#8CB369', bg: '#F0F7EA' },
            { label: '🌳 Intermediário', sub: 'Níveis 16-30', range: [16, 30], color: '#5B9BD5', bg: '#E3F2FD' },
            { label: '🏔️ Avançado', sub: 'Níveis 31-45', range: [31, 45], color: '#F4A261', bg: '#FFF3E0' },
            { label: '🎯 TOEFL', sub: 'Níveis 46-50', range: [46, 50], color: '#9B59B6', bg: '#EDE7F6' },
          ].map((cat) => {
            const progress = getProgress()
            const levelKey = `${skill}_level` as keyof typeof progress
            const userLevel = (progress[levelKey] as number) || 1
            const hasUnlocked = userLevel >= cat.range[0]
            return (
              <div key={cat.label} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', padding: '8px 10px', background: cat.bg, borderRadius: '10px', border: `1px solid ${cat.color}30` }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: cat.color }}>{cat.label}</span>
                  <span style={{ fontSize: '0.6rem', color: '#999' }}>{cat.sub}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', paddingLeft: '4px' }}>
                  {Array.from({ length: cat.range[1] - cat.range[0] + 1 }, (_, i) => cat.range[0] + i).map((lvl) => {
                    const isUnlocked = lvl <= userLevel
                    const isCurrent = lvl === currentLevel
                    return (
                      <button
                        key={lvl}
                        onClick={() => {
                          if (isUnlocked) {
                            setCurrentLevel(lvl)
                            loadLevel(lvl)
                            setShowLevelPicker(false)
                          }
                        }}
                        style={{
                          padding: '10px 0', borderRadius: '10px', border: isCurrent ? `2px solid ${cat.color}` : '1px solid #E8E8E8',
                          cursor: isUnlocked ? 'pointer' : 'default',
                          background: isCurrent ? cat.color : isUnlocked ? 'white' : '#F7F7F7',
                          color: isCurrent ? 'white' : isUnlocked ? cat.color : '#D0D0D0',
                          fontWeight: 700, fontSize: '0.8rem', fontFamily: 'inherit',
                          opacity: isUnlocked ? 1 : 0.4,
                        }}
                      >
                        {lvl}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <p style={{ fontSize: '0.65rem', color: '#999', marginTop: '8px', textAlign: 'center' }}>
            Níveis bloqueados precisam de 90%+ para desbloquear
          </p>
        </div>
      )}

      {/* Exercise */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8E8E8] mb-4">
        <p className="text-sm text-[#8CB369] mb-3">{ex.instruction_pt}</p>

        {/* Listening audio + transcript */}
        {ex.transcript && (
          <div className="bg-[#F7F7F7] rounded-xl p-4 mb-4 border-l-4 border-[#5B9BD5]">
            {/* Audio player or TTS button */}
            {(() => {
              const audioPath = getAudioPath(skill, currentLevel)
              if (audioPath) {
                return (
                  <div style={{ marginBottom: '8px' }}>
                    <p className="text-xs text-[#5B9BD5] mb-2">🎧 Ouça o áudio:</p>
                    <audio controls style={{ width: '100%', height: '36px', borderRadius: '8px' }} preload="none">
                      <source src={audioPath} type="audio/mpeg" />
                    </audio>
                  </div>
                )
              }
              return (
                <button
                  onClick={() => speakText(ex.transcript || '')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#EDE7F6', border: '1px solid #CE93D8', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', marginBottom: '8px', fontFamily: 'inherit', fontSize: '0.8rem', color: '#7B1FA2', fontWeight: 600 }}
                >
                  🔊 Ouvir (voz do navegador)
                </button>
              )
            })()}
            <details>
              <summary style={{ fontSize: '0.7rem', color: '#5B9BD5', cursor: 'pointer', marginBottom: '4px' }}>Ver transcrição</summary>
              <p className="text-[#1A1A1A] leading-relaxed italic text-sm">{ex.transcript}</p>
            </details>
          </div>
        )}

        {/* Passage or Sentence (for fill_blank) */}
        {(ex.passage || ex.sentence) && !ex.transcript && (
          <div className="bg-[#F7F7F7] rounded-xl p-4 mb-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p className="text-[#1A1A1A] leading-relaxed" style={{ flex: 1 }}>{ex.passage || ex.sentence}</p>
              <button onClick={() => speakText(ex.passage || ex.sentence || '')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '2px 4px', flexShrink: 0 }} title="Ouvir">🔊</button>
            </div>
          </div>
        )}

        {/* Question */}
        {ex.question && (
          <p className="font-semibold mb-4">{ex.question}</p>
        )}

        {/* Scene description for speaking "describe" type */}
        {ex.type === 'describe' && ex.hint_pt && (
          <div className="bg-[#F7F7F7] rounded-xl p-3 mb-3 border-l-4 border-[#F4A261]">
            <p className="text-xs text-[#F4A261] mb-1">Cena para descrever:</p>
            <p className="text-[#1A1A1A] text-sm">{ex.hint_pt}</p>
          </div>
        )}

        {/* Multiple Choice / Fill Blank */}
        {ex.options && ex.type !== 'free_write' && ex.type !== 'guided_write' && (
          <>
            <div className="space-y-2">
              {ex.options.map((opt) => {
                const isCorrectOpt = ex.type === 'fill_blank' ? opt === ex.correct : opt.charAt(0) === ex.correct
                const isSelectedOpt = ex.type === 'fill_blank' ? opt === selected : opt.charAt(0) === selected?.charAt(0)
                let bg = 'bg-[#F7F7F7] border-[#E8E8E8]'
                if (showResult) {
                  if (isCorrectOpt) bg = 'bg-[#E8F5E9] border-[#4CAF50]'
                  else if (isSelectedOpt) bg = 'bg-[#FFEBEE] border-[#EF5350]'
                } else if (selected === opt) {
                  bg = 'bg-[#F0F7EA] border-[#8CB369]'
                }
                return (
                  <button
                    key={opt}
                    onClick={() => selectOption(opt)}
                    disabled={showResult}
                    className={`w-full text-left p-3 rounded-xl border ${bg} transition-colors`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
            {selected && !showResult && (
              <button
                onClick={confirmAnswer}
                style={{ width: '100%', marginTop: '12px', padding: '14px', borderRadius: '12px', border: 'none', background: '#8CB369', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                VERIFICAR
              </button>
            )}
          </>
        )}

        {/* Reorder */}
        {ex.type === 'reorder' && ex.words && (
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {ex.words.map((w, i) => (
                <button
                  key={i}
                  onClick={() => setUserText(prev => prev ? `${prev} ${w}` : w)}
                  className="bg-[#F7F7F7] border border-[#E8E8E8] px-3 py-2 rounded-lg text-sm hover:border-[#8CB369]"
                >
                  {w}
                </button>
              ))}
            </div>
            <div className="bg-[#F7F7F7] rounded-xl p-3 min-h-[40px] mb-3">
              <p className="text-[#1A1A1A]">{userText || '...'}</p>
            </div>
            {!showResult && (
              <div className="flex gap-2">
                <button onClick={() => setUserText('')} className="text-sm text-[#999] underline">
                  Limpar
                </button>
                <button
                  onClick={() => {
                    setShowResult(true)
                    setTotal(t => t + 1)
                    const normalize = (s: string) => s.toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim()
                    if (normalize(userText) === normalize(ex.correct_sentence || '')) {
                      setCorrect(c => c + 1)
                      setFlash('correct')
                      addXP(10)
                    } else {
                      setFlash('wrong')
                    }
                    setTimeout(() => setFlash(null), 500)
                  }}
                  className="bg-[#8CB369] text-[#1A1A1A] px-4 py-2 rounded-lg text-sm"
                >
                  Verificar
                </button>
              </div>
            )}
            {showResult && (
              <p className="text-sm text-[#4CAF50] mt-2">
                Resposta correta: {ex.correct_sentence}
              </p>
            )}
          </div>
        )}

        {/* Free Write with Feedback */}
        {(ex.type === 'free_write' || ex.type === 'guided_write') && (
          <div>
            {ex.prompt && <p className="font-semibold mb-2">{ex.prompt}</p>}
            {ex.hint_pt && <p className="text-xs text-[#999] mb-3">{ex.hint_pt}</p>}
            {ex.scene_pt && <p className="text-sm text-[#666] mb-3">{ex.scene_pt}</p>}
            <textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Escreva sua resposta em inglês..."
              className="w-full bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl p-3 text-[#1A1A1A] min-h-[120px] resize-none focus:border-[#8CB369] focus:outline-none"
              style={{ fontSize: '0.9rem', lineHeight: 1.6 }}
            />
            <p style={{ fontSize: '0.65rem', color: '#999', textAlign: 'right', marginTop: '4px' }}>
              {userText.trim().split(/\s+/).filter(w => w).length} palavras
            </p>
            {!showModel && (
              <button
                onClick={() => {
                  const fb = analyzeWriting(userText)
                  setWritingFeedback(fb)
                  setShowModel(true)
                  setShowResult(true)
                  setTotal(t => t + 1)
                  if (fb.score >= 15) setCorrect(c => c + 1)
                  addXP(Math.max(5, fb.score))
                }}
                className="mt-2 bg-[#8CB369] text-[#1A1A1A] px-4 py-2 rounded-lg text-sm font-semibold"
              >
                ANALISAR MEU TEXTO
              </button>
            )}
            {/* Writing Feedback */}
            {showModel && writingFeedback && (
              <div style={{ marginTop: '12px' }}>
                {/* Score */}
                <div style={{ background: writingFeedback.score >= 20 ? '#E8F5E9' : writingFeedback.score >= 10 ? '#FFF3E0' : '#FFEBEE', borderRadius: '12px', padding: '14px', marginBottom: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: writingFeedback.score >= 20 ? '#4CAF50' : writingFeedback.score >= 10 ? '#F4A261' : '#EF5350', margin: '0 0 4px' }}>{writingFeedback.score}/30</p>
                  <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>{writingFeedback.overallFeedback}</p>
                </div>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                  <div style={{ background: '#F7F7F7', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#1A1A1A' }}>{writingFeedback.wordCount}</p>
                    <p style={{ fontSize: '0.6rem', color: '#999', margin: 0 }}>Palavras</p>
                  </div>
                  <div style={{ background: '#F7F7F7', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#1A1A1A' }}>{writingFeedback.paragraphCount}</p>
                    <p style={{ fontSize: '0.6rem', color: '#999', margin: 0 }}>Parágrafos</p>
                  </div>
                  <div style={{ background: '#F7F7F7', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#1A1A1A' }}>{writingFeedback.vocabularyLevel}</p>
                    <p style={{ fontSize: '0.6rem', color: '#999', margin: 0 }}>Vocabulário</p>
                  </div>
                </div>
                {/* Connectors */}
                {writingFeedback.connectorsUsed.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4CAF50', marginBottom: '4px' }}>Conectores usados:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {writingFeedback.connectorsUsed.map(c => (
                        <span key={c} style={{ fontSize: '0.65rem', background: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: '6px' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Grammar issues */}
                {writingFeedback.grammarIssues.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#EF5350', marginBottom: '4px' }}>Erros encontrados:</p>
                    {writingFeedback.grammarIssues.map((issue, i) => (
                      <p key={i} style={{ fontSize: '0.7rem', color: '#C62828', margin: '2px 0', paddingLeft: '8px', borderLeft: '2px solid #EF5350' }}>{issue}</p>
                    ))}
                  </div>
                )}
                {/* Suggestions */}
                {writingFeedback.suggestions.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#F4A261', marginBottom: '4px' }}>Sugestões:</p>
                    {writingFeedback.suggestions.map((s, i) => (
                      <p key={i} style={{ fontSize: '0.7rem', color: '#E65100', margin: '2px 0' }}>→ {s}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Model answer */}
            {showModel && ex.model_answer && (
              <details style={{ marginTop: '10px' }}>
                <summary style={{ fontSize: '0.75rem', color: '#8CB369', cursor: 'pointer', fontWeight: 600 }}>Ver resposta modelo</summary>
                <div style={{ background: '#F0F7EA', borderRadius: '10px', padding: '12px', marginTop: '6px' }}>
                  <p style={{ fontSize: '0.8rem', color: '#2E7D32', lineHeight: 1.6 }}>{ex.model_answer}</p>
                </div>
              </details>
            )}
          </div>
        )}

        {/* Speaking with Recording & Feedback */}
        {(ex.type === 'repeat' || ex.type === 'guided_response' || ex.type === 'describe') && (
          <div>
            {ex.phonetic_hint && (
              <p className="text-xs text-[#999] mb-1">{ex.phonetic_hint}</p>
            )}
            {ex.tip_pt && (
              <p className="text-xs text-[#F4A261] mb-3">💡 {ex.tip_pt}</p>
            )}
            {ex.target_text && (
              <div className="bg-[#F7F7F7] rounded-xl p-3 mb-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p className="text-[#5B9BD5] font-semibold" style={{ flex: 1 }}>{ex.target_text}</p>
                  <button onClick={() => speakText(ex.target_text || '', 0.75)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '2px 4px' }} title="Ouvir pronúncia">🔊</button>
                </div>
              </div>
            )}
            {!showResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Record button */}
                <button
                  onClick={async () => {
                    if (isRecording && recorder) {
                      setIsRecording(false)
                      const { blob, duration } = await recorder.stop()
                      const url = URL.createObjectURL(blob)
                      setAudioUrl(url)

                      // Also use speech recognition for transcript
                      import('@/lib/speech').then(({ listenForSpeech, checkSpeechSupport }) => {
                        if (!checkSpeechSupport()) {
                          // No speech recognition — evaluate without transcript
                          const fb = evaluateSpeaking('', ex.target_text || '', ex.accepted_variations || [], duration)
                          setSpeakingFeedback(fb)
                          setShowResult(true)
                          setTotal(t => t + 1)
                          setCorrect(c => c + 1)
                          addXP(10)
                          return
                        }
                        listenForSpeech(
                          ex.target_text || '',
                          ex.accepted_variations || [],
                          (matched, transcript) => {
                            setUserText(transcript)
                            const fb = evaluateSpeaking(transcript, ex.target_text || '', ex.accepted_variations || [], duration)
                            setSpeakingFeedback(fb)
                            setShowResult(true)
                            setTotal(t => t + 1)
                            if (fb.overallScore >= 15) setCorrect(c => c + 1)
                            addXP(Math.max(5, Math.round(fb.overallScore / 2)))
                          },
                          () => {
                            const fb = evaluateSpeaking('', ex.target_text || '', ex.accepted_variations || [], duration)
                            setSpeakingFeedback(fb)
                            setShowResult(true)
                            setTotal(t => t + 1)
                            setCorrect(c => c + 1)
                            addXP(10)
                          }
                        )
                      })
                    } else if (recorder) {
                      const started = await recorder.start()
                      if (started) setIsRecording(true)
                      else alert('Não foi possível acessar o microfone. Verifique as permissões.')
                    }
                  }}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: isRecording ? '#EF5350' : '#F4A261', color: 'white', transition: 'all 0.2s' }}
                >
                  {isRecording ? '⏹ PARAR GRAVAÇÃO' : '🎤 GRAVAR RESPOSTA'}
                </button>
                {isRecording && (
                  <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#EF5350', fontWeight: 600 }}>
                    🔴 Gravando... Fale sua resposta em inglês
                  </p>
                )}
                {/* Fallback: text-only speech recognition */}
                <button
                  onClick={() => {
                    import('@/lib/speech').then(({ listenForSpeech, checkSpeechSupport }) => {
                      if (!checkSpeechSupport()) { alert('Seu navegador não suporta reconhecimento de voz. Use o Chrome.'); return }
                      listenForSpeech(
                        ex.target_text || '', ex.accepted_variations || [],
                        (matched, transcript) => {
                          setUserText(transcript)
                          const fb = evaluateSpeaking(transcript, ex.target_text || '', ex.accepted_variations || [], 30)
                          setSpeakingFeedback(fb)
                          setShowResult(true)
                          setTotal(t => t + 1)
                          if (fb.overallScore >= 15) setCorrect(c => c + 1)
                          addXP(Math.max(5, Math.round(fb.overallScore / 2)))
                        },
                        (error) => alert(error)
                      )
                    })
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #E8E8E8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', color: '#999', background: 'white' }}
                >
                  🎙️ Falar sem gravar (só reconhecimento)
                </button>
              </div>
            )}
            {/* Speaking Feedback */}
            {showResult && (
              <div style={{ marginTop: '12px' }}>
                {/* Audio playback */}
                {audioUrl && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ fontSize: '0.7rem', color: '#999', marginBottom: '4px' }}>Sua gravação:</p>
                    <audio controls src={audioUrl} style={{ width: '100%', height: '36px' }} />
                  </div>
                )}
                {/* Transcript */}
                {userText && (
                  <div style={{ background: '#F7F7F7', borderRadius: '10px', padding: '10px', marginBottom: '10px' }}>
                    <p style={{ fontSize: '0.7rem', color: '#999', marginBottom: '2px' }}>O que você disse:</p>
                    <p style={{ fontSize: '0.85rem', color: '#1A1A1A', fontStyle: 'italic' }}>&quot;{userText}&quot;</p>
                  </div>
                )}
                {/* Score */}
                {speakingFeedback && (
                  <>
                    <div style={{ background: speakingFeedback.overallScore >= 20 ? '#E8F5E9' : speakingFeedback.overallScore >= 10 ? '#FFF3E0' : '#FFEBEE', borderRadius: '12px', padding: '14px', marginBottom: '10px', textAlign: 'center' }}>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: speakingFeedback.overallScore >= 20 ? '#4CAF50' : speakingFeedback.overallScore >= 10 ? '#F4A261' : '#EF5350', margin: '0 0 4px' }}>{speakingFeedback.overallScore}/30</p>
                      <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>{speakingFeedback.feedback}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                      <div style={{ background: '#F7F7F7', borderRadius: '8px', padding: '6px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>{speakingFeedback.wordCount}</p>
                        <p style={{ fontSize: '0.55rem', color: '#999', margin: 0 }}>Palavras</p>
                      </div>
                      <div style={{ background: '#F7F7F7', borderRadius: '8px', padding: '6px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>{speakingFeedback.wordsPerMinute}</p>
                        <p style={{ fontSize: '0.55rem', color: '#999', margin: 0 }}>Palavras/min</p>
                      </div>
                      <div style={{ background: '#F7F7F7', borderRadius: '8px', padding: '6px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>{speakingFeedback.fluencyScore}/10</p>
                        <p style={{ fontSize: '0.55rem', color: '#999', margin: 0 }}>Fluência</p>
                      </div>
                    </div>
                    {speakingFeedback.suggestions.length > 0 && (
                      <div>
                        {speakingFeedback.suggestions.map((s, i) => (
                          <p key={i} style={{ fontSize: '0.7rem', color: '#E65100', margin: '2px 0' }}>→ {s}</p>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explanation */}
      {showResult && ex.explanation_pt && (
        <div className="bg-white rounded-xl p-4 mb-4 border border-[#E8E8E8]">
          <p className="text-sm text-[#666]">{ex.explanation_pt}</p>
        </div>
      )}

      {/* Next button */}
      {showResult && (
        <button
          onClick={handleNext}
          className="w-full bg-[#8CB369] hover:bg-[#6B9A4B] text-[#1A1A1A] font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {currentExercise < exercises.length - 1 ? 'Próximo' : 'Finalizar'}
        </button>
      )}
    </div>
  )
}
