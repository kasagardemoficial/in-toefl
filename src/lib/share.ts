// Share progress to Stories / Social Media
// Generates a canvas image with user stats

export async function generateShareImage(data: {
  name: string
  streak: number
  xp: number
  toeflScore: number
  topSkill: string
  topLevel: number
  overallPct: number
}): Promise<Blob | null> {
  if (typeof window === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 1920)
  gradient.addColorStop(0, '#F0F7EA')
  gradient.addColorStop(1, '#FFFFFF')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1080, 1920)

  // Green accent bar at top
  ctx.fillStyle = '#8CB369'
  ctx.fillRect(0, 0, 1080, 8)

  // App name
  ctx.fillStyle = '#8CB369'
  ctx.font = 'bold 64px Nunito, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('In-TOEFL', 540, 200)

  ctx.fillStyle = '#999999'
  ctx.font = '32px Nunito, sans-serif'
  ctx.fillText('Do Zero ao TOEFL', 540, 250)

  // User name
  ctx.fillStyle = '#1A1A1A'
  ctx.font = 'bold 48px Nunito, sans-serif'
  ctx.fillText(`${data.name}`, 540, 400)

  // TOEFL Score - big
  ctx.fillStyle = '#8CB369'
  ctx.font = 'bold 180px Nunito, sans-serif'
  ctx.fillText(`${data.toeflScore}`, 540, 650)

  ctx.fillStyle = '#999999'
  ctx.font = '36px Nunito, sans-serif'
  ctx.fillText('Nota TOEFL Estimada (de 120)', 540, 710)

  // Progress bar
  const barX = 140
  const barW = 800
  const barY = 780
  const barH = 24
  ctx.fillStyle = '#E8E8E8'
  roundRect(ctx, barX, barY, barW, barH, 12)
  ctx.fillStyle = '#8CB369'
  roundRect(ctx, barX, barY, barW * (data.overallPct / 100), barH, 12)

  ctx.fillStyle = '#6B9A4B'
  ctx.font = 'bold 28px Nunito, sans-serif'
  ctx.fillText(`${data.overallPct}% completo`, 540, 850)

  // Stats cards
  const stats = [
    { icon: '🔥', value: `${data.streak}`, label: 'Dias seguidos' },
    { icon: '⭐', value: `${data.xp}`, label: 'XP total' },
    { icon: '📈', value: `${data.topSkill}`, label: `Nível ${data.topLevel}` },
  ]

  const cardW = 240
  const cardGap = 30
  const startX = (1080 - (cardW * 3 + cardGap * 2)) / 2

  stats.forEach((stat, i) => {
    const x = startX + i * (cardW + cardGap)
    const y = 920

    // Card background
    ctx.fillStyle = '#FFFFFF'
    roundRect(ctx, x, y, cardW, 200, 20)
    ctx.strokeStyle = '#E8E8E8'
    ctx.lineWidth = 2
    ctx.strokeRect(x + 1, y + 1, cardW - 2, 198)

    // Icon
    ctx.font = '48px sans-serif'
    ctx.fillText(stat.icon, x + cardW / 2, y + 60)

    // Value
    ctx.fillStyle = '#1A1A1A'
    ctx.font = 'bold 36px Nunito, sans-serif'
    ctx.fillText(stat.value, x + cardW / 2, y + 120)

    // Label
    ctx.fillStyle = '#999999'
    ctx.font = '22px Nunito, sans-serif'
    ctx.fillText(stat.label, x + cardW / 2, y + 160)
  })

  // Motivational text
  ctx.fillStyle = '#1A1A1A'
  ctx.font = 'bold 40px Nunito, sans-serif'
  ctx.fillText('Estou aprendendo inglês', 540, 1280)
  ctx.fillText('do zero até o TOEFL! 🚀', 540, 1340)

  // CTA
  ctx.fillStyle = '#8CB369'
  roundRect(ctx, 240, 1440, 600, 80, 40)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 32px Nunito, sans-serif'
  ctx.fillText('Baixe grátis: In-TOEFL', 540, 1492)

  // Footer
  ctx.fillStyle = '#CCCCCC'
  ctx.font = '24px Nunito, sans-serif'
  ctx.fillText('100% gratuito · Método Kumon · Em português', 540, 1600)

  // Bottom bar
  ctx.fillStyle = '#8CB369'
  ctx.fillRect(0, 1912, 1080, 8)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

export async function shareProgress(data: Parameters<typeof generateShareImage>[0]): Promise<void> {
  const blob = await generateShareImage(data)
  if (!blob) return

  const file = new File([blob], 'intoefl-progresso.png', { type: 'image/png' })

  // Try native share (mobile)
  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: 'Meu progresso no In-TOEFL',
      text: `Estou com nota TOEFL estimada de ${data.toeflScore}/120! 🚀 Aprenda inglês do zero: In-TOEFL`,
      files: [file],
    })
  } else {
    // Fallback: download image
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'intoefl-progresso.png'
    a.click()
    URL.revokeObjectURL(url)
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
  ctx.fill()
}
