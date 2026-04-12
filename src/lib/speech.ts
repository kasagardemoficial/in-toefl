// Web Speech API — pronunciation checker (cost: R$0)

export function checkSpeechSupport(): boolean {
  if (typeof window === 'undefined') return false
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
}

export function listenForSpeech(
  expectedText: string,
  acceptedVariations: string[] = [],
  onResult: (matched: boolean, transcript: string) => void,
  onError: (error: string) => void
): void {
  const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition

  if (!SpeechRecognition) {
    onError('Seu navegador não suporta reconhecimento de voz.')
    return
  }

  const recognition = new (SpeechRecognition as new () => SpeechRecognition)()
  recognition.lang = 'en-US'
  recognition.interimResults = false
  recognition.maxAlternatives = 3

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const results = event.results[0]
    let matched = false
    let bestTranscript = ''

    for (let i = 0; i < results.length; i++) {
      const transcript = results[i].transcript.toLowerCase().trim()
      bestTranscript = bestTranscript || transcript

      const expected = expectedText.toLowerCase().trim()
      const allAccepted = [expected, ...acceptedVariations.map(v => v.toLowerCase().trim())]

      if (allAccepted.some(accepted =>
        transcript.includes(accepted) || accepted.includes(transcript)
      )) {
        matched = true
        bestTranscript = transcript
        break
      }
    }

    onResult(matched, bestTranscript)
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (event.error === 'no-speech') {
      onError('Não detectei nenhuma fala. Tente novamente.')
    } else if (event.error === 'not-allowed') {
      onError('Permissão de microfone negada. Ative nas configurações do navegador.')
    } else {
      onError(`Erro: ${event.error}`)
    }
  }

  recognition.start()
}

// Interface types for Web Speech API
interface SpeechRecognition extends EventTarget {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  readonly length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}
