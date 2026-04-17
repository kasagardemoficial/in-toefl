// Confetti animation — pure canvas, no dependencies

export function launchConfetti(duration: number = 3000) {
  if (typeof window === 'undefined') return

  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const colors = ['#8CB369', '#FFC107', '#5B9BD5', '#F4A261', '#E76F51', '#9B59B6', '#FF7043', '#00BCD4']

  interface Particle {
    x: number; y: number; w: number; h: number
    color: string; angle: number; speed: number
    rotationSpeed: number; opacity: number
    vx: number; vy: number; gravity: number
  }

  const particles: Particle[] = []
  const count = 120

  for (let i = 0; i < count; i++) {
    particles.push({
      x: canvas.width * 0.5 + (Math.random() - 0.5) * canvas.width * 0.5,
      y: canvas.height * 0.3,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 3 + 1,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      opacity: 1,
      vx: (Math.random() - 0.5) * 12,
      vy: -(Math.random() * 15 + 5),
      gravity: 0.3 + Math.random() * 0.2,
    })
  }

  const startTime = Date.now()

  function animate() {
    const elapsed = Date.now() - startTime
    if (elapsed > duration) {
      document.body.removeChild(canvas)
      return
    }

    ctx!.clearRect(0, 0, canvas.width, canvas.height)

    for (const p of particles) {
      p.vy += p.gravity
      p.x += p.vx
      p.y += p.vy
      p.angle += p.rotationSpeed
      p.vx *= 0.99
      p.opacity = Math.max(0, 1 - elapsed / duration)

      ctx!.save()
      ctx!.translate(p.x, p.y)
      ctx!.rotate(p.angle)
      ctx!.globalAlpha = p.opacity
      ctx!.fillStyle = p.color
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx!.restore()
    }

    requestAnimationFrame(animate)
  }

  animate()
}
