// Speaking Recording & Evaluation System
// Records audio, transcribes via Web Speech API, evaluates response

export interface SpeakingFeedback {
  transcript: string
  duration: number // seconds
  wordCount: number
  wordsPerMinute: number
  keyPhrasesHit: number
  keyPhrasesTotal: number
  fluencyScore: number // 0-10
  contentScore: number // 0-10
  overallScore: number // 0-30
  feedback: string
  suggestions: string[]
}

export function evaluateSpeaking(
  transcript: string,
  targetText: string,
  acceptedVariations: string[],
  duration: number
): SpeakingFeedback {
  const words = transcript.trim().split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length
  const wordsPerMinute = duration > 0 ? Math.round((wordCount / duration) * 60) : 0

  // Key phrases check
  const allPhrases = [
    ...acceptedVariations,
    ...targetText.toLowerCase().split(/\s+/).filter(w => w.length > 4),
  ]
  const uniquePhrases = [...new Set(allPhrases)]
  const transcriptLower = transcript.toLowerCase()
  const keyPhrasesHit = uniquePhrases.filter(p => transcriptLower.includes(p.toLowerCase())).length
  const keyPhrasesTotal = Math.max(1, uniquePhrases.length)

  // Fluency score (based on WPM and duration)
  let fluencyScore = 0
  // TOEFL expects ~120-150 WPM for speaking
  if (wordsPerMinute >= 100 && wordsPerMinute <= 180) fluencyScore += 5
  else if (wordsPerMinute >= 60) fluencyScore += 3
  else if (wordsPerMinute >= 30) fluencyScore += 1

  // Duration (TOEFL speaking tasks are 45-60 seconds)
  if (duration >= 30 && duration <= 90) fluencyScore += 3
  else if (duration >= 15) fluencyScore += 1

  // Word count
  if (wordCount >= 50) fluencyScore += 2
  else if (wordCount >= 30) fluencyScore += 1

  fluencyScore = Math.min(10, fluencyScore)

  // Content score
  const hitRate = keyPhrasesHit / keyPhrasesTotal
  let contentScore = Math.round(hitRate * 10)

  // Bonus for longer, structured responses
  if (transcript.includes('because') || transcript.includes('for example') || transcript.includes('however')) contentScore += 1
  if (transcript.includes('first') || transcript.includes('second')) contentScore += 1
  contentScore = Math.min(10, contentScore)

  // Overall (0-30 TOEFL scale)
  const overallScore = Math.min(30, Math.round((fluencyScore + contentScore) * 1.5))

  // Feedback
  const suggestions: string[] = []
  let feedback = ''

  if (wordCount < 20) {
    feedback = 'Resposta muito curta. Tente elaborar mais suas ideias.'
    suggestions.push('Fale por pelo menos 30 segundos')
    suggestions.push('Use a estrutura: opinião + razão + exemplo')
  } else if (wordsPerMinute < 60) {
    feedback = 'Fale um pouco mais rápido — tente manter um ritmo natural.'
    suggestions.push('Pratique lendo textos em voz alta para melhorar fluência')
  } else if (hitRate < 0.3) {
    feedback = 'Tente incluir mais detalhes relevantes na sua resposta.'
    suggestions.push('Ouça a pergunta com atenção e inclua palavras-chave')
  } else if (overallScore >= 25) {
    feedback = 'Excelente! Resposta fluente e bem estruturada.'
  } else if (overallScore >= 20) {
    feedback = 'Muito bom! Continue praticando para ganhar mais fluência.'
  } else if (overallScore >= 15) {
    feedback = 'Bom progresso! Foque em organizar suas ideias antes de falar.'
    suggestions.push('Antes de falar, pense: qual é minha opinião? Quais são 2 razões?')
  } else {
    feedback = 'Continue praticando! Cada tentativa te deixa mais confiante.'
    suggestions.push('Comece respondendo em frases simples e vá aumentando')
  }

  if (!suggestions.length && overallScore < 25) {
    suggestions.push('Use conectores: First, Second, For example, In conclusion')
    suggestions.push('Pratique a pronúncia das palavras-chave do tema')
  }

  return {
    transcript, duration, wordCount, wordsPerMinute,
    keyPhrasesHit, keyPhrasesTotal,
    fluencyScore, contentScore, overallScore,
    feedback, suggestions,
  }
}

// Audio recorder using MediaRecorder API
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private startTime: number = 0

  async start(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(stream)
      this.chunks = []
      this.startTime = Date.now()

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data)
      }

      this.mediaRecorder.start()
      return true
    } catch {
      return false
    }
  }

  stop(): Promise<{ blob: Blob; duration: number }> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve({ blob: new Blob(), duration: 0 })
        return
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' })
        const duration = Math.round((Date.now() - this.startTime) / 1000)

        // Stop all tracks
        this.mediaRecorder?.stream.getTracks().forEach(t => t.stop())

        resolve({ blob, duration })
      }

      this.mediaRecorder.stop()
    })
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }
}
