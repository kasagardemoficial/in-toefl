// Sound Effects System — Web Audio API (zero cost, no files needed)

let audioContext: AudioContext | null = null

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  try {
    const ctx = getContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch {
    // Audio not supported
  }
}

export function playCorrect() {
  const ctx = getContext()
  // Happy ascending notes
  playTone(523, 0.15, 'sine', 0.25) // C5
  setTimeout(() => playTone(659, 0.15, 'sine', 0.25), 100) // E5
  setTimeout(() => playTone(784, 0.2, 'sine', 0.3), 200) // G5
}

export function playWrong() {
  // Low descending buzz
  playTone(200, 0.3, 'square', 0.15)
  setTimeout(() => playTone(150, 0.3, 'square', 0.1), 150)
}

export function playLevelUp() {
  // Triumphant fanfare
  const notes = [523, 659, 784, 1047] // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, 'sine', 0.3), i * 150)
  })
  // Final chord
  setTimeout(() => {
    playTone(1047, 0.5, 'sine', 0.2)
    playTone(784, 0.5, 'sine', 0.15)
    playTone(659, 0.5, 'sine', 0.1)
  }, 600)
}

export function playCombo() {
  // Quick ascending ping
  playTone(880, 0.1, 'sine', 0.2) // A5
  setTimeout(() => playTone(1108, 0.15, 'sine', 0.25), 80) // C#6
}

export function playStreakFreeze() {
  // Ice crack sound
  playTone(2000, 0.05, 'square', 0.15)
  setTimeout(() => playTone(3000, 0.05, 'square', 0.1), 50)
  setTimeout(() => playTone(1500, 0.1, 'sine', 0.2), 100)
}

export function playBadge() {
  // Magical chime
  const notes = [784, 988, 1175, 1568] // G5, B5, D6, G6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'sine', 0.2), i * 120)
  })
}

export function playClick() {
  playTone(800, 0.05, 'sine', 0.1)
}

export function playXP() {
  // Coin collect
  playTone(1318, 0.08, 'sine', 0.2)
  setTimeout(() => playTone(1568, 0.1, 'sine', 0.2), 60)
}
