export class ParticleEffect {
  constructor() {
    this.particles = []
    this.animationId = null
    this.canvas = null
    this.ctx = null
  }

  initialize() {
    if (this.canvas) return

    this.canvas = document.createElement('canvas')
    this.canvas.style.position = 'fixed'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.zIndex = '1000'
    this.canvas.style.pointerEvents = 'none'
    this.ctx = this.canvas.getContext('2d')

    this.resizeCanvas()
    window.addEventListener('resize', () => this.resizeCanvas())
    document.body.appendChild(this.canvas)
  }

  resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
    }
  }

  createConfetti(x, y, color, count = 8) {
    this.initialize()

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

    if (!this.ctx || !this.canvas) return

    const frame = () => {
      this.particles = this.particles.filter(p => p.life > 0)

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      this.particles.forEach(p => {
        p.vy += p.gravity
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.02

        this.ctx.save()
        this.ctx.globalAlpha = p.life
        this.ctx.fillStyle = p.color
        this.ctx.beginPath()
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.restore()
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
