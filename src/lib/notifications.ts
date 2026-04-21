// Push notification system for U-Fluent
const NOTIFICATION_KEY = 'intoefl_notification_settings'

export interface NotificationSettings {
  enabled: boolean
  hour: number // 0-23
  minute: number // 0-59
  lastNotificationDate?: string
}

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return { enabled: false, hour: 20, minute: 0 }
  const saved = localStorage.getItem(NOTIFICATION_KEY)
  if (!saved) return { enabled: false, hour: 20, minute: 0 }
  return JSON.parse(saved)
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(settings))
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    return registration
  } catch {
    return null
  }
}

export function generateNotificationMessage(progress: {
  streak: number
  lastActiveDate: string
  reading_level: number
  listening_level: number
  speaking_level: number
  writing_level: number
  vocabulary_level: number
  grammar_level: number
}): { title: string; body: string } {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0]

  // Hasn't studied in 2+ days — urgency
  if (progress.lastActiveDate <= twoDaysAgo && progress.streak > 0) {
    return {
      title: '🔥 Seu streak está em perigo!',
      body: `Seu streak de ${progress.streak} dias vai zerar amanhã. 10 minutos salvam ele.`
    }
  }

  // Hasn't studied today
  if (progress.lastActiveDate !== today) {
    // Find weakest skill
    const skills = [
      { name: 'Reading', level: progress.reading_level },
      { name: 'Listening', level: progress.listening_level },
      { name: 'Speaking', level: progress.speaking_level },
      { name: 'Writing', level: progress.writing_level },
      { name: 'Vocabulary', level: progress.vocabulary_level },
      { name: 'Grammar', level: progress.grammar_level },
    ]
    const weakest = skills.reduce((min, s) => s.level < min.level ? s : min, skills[0])
    const strongest = skills.reduce((max, s) => s.level > max.level ? s : max, skills[0])

    const messages = [
      {
        title: `📖 Falta pouco pro nível ${weakest.level + 1}!`,
        body: `Você está no nível ${weakest.level} de ${weakest.name}. Uma lição de 10 min te leva mais perto.`
      },
      {
        title: `🎯 ${progress.streak} dias de streak!`,
        body: `Não quebre agora! Sua lição de hoje está esperando.`
      },
      {
        title: '💪 Hora de estudar inglês!',
        body: `Seu ${weakest.name} precisa de atenção. 15 minutos fazem diferença.`
      },
      {
        title: `⭐ Nível ${strongest.level} em ${strongest.name}!`,
        body: `Impressionante! Mas seu ${weakest.name} (nível ${weakest.level}) precisa de amor.`
      },
    ]

    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Already studied today — motivational
  return {
    title: '🌟 Parabéns pelo estudo de hoje!',
    body: `Streak de ${progress.streak} dias! Cada lição te aproxima do TOEFL.`
  }
}

export function scheduleLocalNotification(settings: NotificationSettings, message: { title: string; body: string }): void {
  if (!settings.enabled || typeof window === 'undefined') return
  if (Notification.permission !== 'granted') return

  const now = new Date()
  const scheduledTime = new Date()
  scheduledTime.setHours(settings.hour, settings.minute, 0, 0)

  // If time already passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1)
  }

  const delay = scheduledTime.getTime() - now.getTime()

  setTimeout(() => {
    new Notification(message.title, {
      body: message.body,
      icon: '/icon-192.png',
      tag: 'intoefl-daily',
    })
  }, delay)
}
