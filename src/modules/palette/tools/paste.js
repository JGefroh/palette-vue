import { inputHandler } from '../utilities/input-handler.js'

export class Paste {
  constructor({ drawingCtx, overlayCtx }) {
    this.drawingCtx = drawingCtx
    this.overlayCtx = overlayCtx
    this.canvas = drawingCtx.canvas
    this.name = 'Paste'
    this.icon = 'fa-paste'
    this.shortcut = null
    this.currentCoordinates = { x: 0, y: 0 }
    this.handleMouseMove = null
  }

  static new(drawingCtx, overlayCtx) {
    return new Paste({ drawingCtx, overlayCtx })
  }

  get label() {
    return 'Paste'
  }

  getCoordinatesFromMouseEvent(event) {
    const bounds = this.canvas.getBoundingClientRect()
    return {
      x: (event.clientX - bounds.left) * (this.canvas.width / bounds.width),
      y: (event.clientY - bounds.top) * (this.canvas.height / bounds.height)
    }
  }

  start(coordinates) {
    inputHandler.registerCommand('cmd+v', 'paste', () => {
      this.paste()
    })

    this.handleMouseMove = (e) => {
      this.currentCoordinates = this.getCoordinatesFromMouseEvent(e)
    }
    window.addEventListener('mousemove', this.handleMouseMove)
  }

  process(coordinates) {
    this.currentCoordinates = coordinates
  }

  end(coordinates) {
    if (this.handleMouseMove) {
      window.removeEventListener('mousemove', this.handleMouseMove)
    }
  }

  paste() {
    navigator.clipboard.read().then(items => {
      for (let item of items) {
        if (item.types.includes('image/png')) {
          item.getType('image/png').then(blob => {
            const img = new Image()
            img.onload = () => {
              const x = this.currentCoordinates.x - img.width / 2
              const y = this.currentCoordinates.y - img.height / 2
              this.drawingCtx.drawImage(img, x, y)
            }
            img.src = URL.createObjectURL(blob)
          })
          break
        }
      }
    }).catch(err => {
      console.error('Failed to read clipboard:', err)
    })
  }
}
