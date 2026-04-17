// Audio file mapping: skill + level → MP3 path

export function getAudioPath(skill: string, level: number): string | null {
  if (skill === 'listening') {
    if (level >= 1 && level <= 10) return `/audio/listening/listening-nivel-${String(level).padStart(2, '0')}.mp3`
    if (level >= 11 && level <= 12) return `/audio/listening/listening-nivel-11-12.mp3`
    if (level >= 13 && level <= 14) return `/audio/listening/listening-nivel-13-14.mp3`
    if (level >= 14 && level <= 16) return `/audio/listening/listening-nivel-14-16.mp3`
    // Levels 17-30: use TOEFL exercises from Internet Archive
    if (level >= 17 && level <= 18) return `/audio/toefl-exercises/01.Exercise1516.mp3`
    if (level === 19) return `/audio/toefl-exercises/01.Exercise17.mp3`
    if (level === 20) return `/audio/toefl-exercises/03.Exercise18.mp3`
    if (level === 21) return `/audio/toefl-exercises/04.Exercise19.mp3`
    if (level === 22) return `/audio/toefl-exercises/05.Exercise20.mp3`
    if (level === 23) return `/audio/toefl-exercises/06.Exercise21.mp3`
    if (level === 24) return `/audio/toefl-exercises/07.Exercise22.mp3`
    if (level === 25) return `/audio/toefl-exercises/08.Exercise23.mp3`
    if (level === 26) return `/audio/toefl-exercises/09.Exercise24.mp3`
    if (level === 27) return `/audio/toefl-exercises/10.Exercise25.mp3`
    if (level === 28) return `/audio/toefl-exercises/11.Exercise26.mp3`
    if (level === 29) return `/audio/toefl-exercises/12.Exercise27.mp3`
    if (level === 30) return `/audio/toefl-exercises/13.Exercise28.mp3`
    if (level >= 31 && level <= 35) return `/audio/listening/scripts-31-35.mp3`
    if (level >= 36 && level <= 38) return `/audio/listening/scripts-36-38.mp3`
    if (level >= 39 && level <= 42) return `/audio/listening/scripts-39-42.mp3`
    if (level >= 43 && level <= 45) return `/audio/listening/scripts-43-45.mp3`
    if (level >= 46 && level <= 50) return `/audio/listening/scripts-46-50.mp3`
  }

  if (skill === 'vocabulary') {
    if (level >= 1 && level <= 10) return `/audio/vocabulary/vocab-nivel-${String(level).padStart(2, '0')}.mp3`
    if (level >= 11 && level <= 18) return `/audio/vocabulary/vocab-nivel-11-18.mp3`
    if (level >= 19 && level <= 25) return `/audio/vocabulary/vocab-nivel-19-25.mp3`
    if (level >= 26 && level <= 30) return `/audio/vocabulary/vocab-nivel-26-30.mp3`
  }

  if (skill === 'speaking') {
    if (level >= 1 && level <= 10) return `/audio/speaking/speaking-modelos-nivel-01-10.mp3`
    if (level >= 11 && level <= 18) return `/audio/speaking/speaking-nivel-11-18.mp3`
    if (level >= 19 && level <= 25) return `/audio/speaking/speaking-nivel-19-25.mp3`
  }

  return null
}

// Use browser TTS as fallback when no audio file available
export function speakText(text: string, rate: number = 0.85): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = rate

  // Try to find a good English voice
  const voices = window.speechSynthesis.getVoices()
  const enVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Samantha'))
    || voices.find(v => v.lang === 'en-US')
    || voices.find(v => v.lang.startsWith('en'))
  if (enVoice) utterance.voice = enVoice

  window.speechSynthesis.speak(utterance)
}
