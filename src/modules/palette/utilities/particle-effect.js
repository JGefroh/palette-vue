export class ParticleEffect {
  constructor() {
    this.particles = []
    this.animationId = null
    this.overlayCanvas = null
    this.overlayCtx = null
  }

  setOverlayContext(overlayCanvas, overlayCtx) {
    this.overlayCanvas = overlayCanvas
    this.overlayCtx = overlayCtx
  }

  createConfetti(x, y, color, count = 8) {
    if (!this.overlayCtx) return

    const particles = []
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count
      const speed = 2 + Math.random() * 3
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        color,
        life: 1,
        gravity: 0.15,
        size: 3 + Math.random() * 2
      })
    }
    this.particles.push(...particles)
    this.animate()
  }

  animate() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    if (!this.overlayCtx || !this.overlayCanvas) return

    const frame = () => {
      this.particles = this.particles.filter(p => p.life > 0)

      this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height)

      this.particles.forEach(p => {
        p.vy += p.gravity
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.02

        this.overlayCtx.save()
        this.overlayCtx.globalAlpha = p.life
        this.overlayCtx.fillStyle = p.color
        this.overlayCtx.beginPath()
        this.overlayCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        this.overlayCtx.fill()
        this.overlayCtx.restore()
      })

      if (this.particles.length > 0) {
        this.animationId = requestAnimationFrame(frame)
      } else {
        this.animationId = null
      }
    }

    frame()
  }
}

export const particleEffect = new ParticleEffect()
