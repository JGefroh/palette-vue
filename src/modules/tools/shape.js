import { globalState } from '../persistence/global-state.js'

export class Shape {
  constructor({ drawingCtx, overlayCtx }) {
    this.drawingCtx = drawingCtx
    this.overlayCtx = overlayCtx
    this.startCoordinates = null
    this.mode = 'outline'
    this.startTime = null
    this.lastDrawnOffset = null
  }

  get label() {
    throw new Error(`${this.constructor.name} must implement label getter`)
  }

  drawShape(ctx, startCoords, endCoords) {
    throw new Error(`${this.constructor.name} must implement drawShape(ctx, startCoords, endCoords)`)
  }

  start(coordinates) {
    this.startCoordinates = { x: coordinates.x, y: coordinates.y }
    this.startTime = Date.now()
  }

  preProcess(coordinates) {
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
  }

  process(coordinates) {
    if (!this.startCoordinates) return
    this.overlayCtx.lineWidth = globalState.get('selectedSize')
    this.overlayCtx.lineCap = 'round'
    this.overlayCtx.lineJoin = 'round'
    this.drawShape(this.overlayCtx, this.startCoordinates, coordinates)
  }

  end(coordinates) {
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    if (this.startCoordinates) {
      this.drawingCtx.lineWidth = globalState.get('selectedSize')
      this.drawingCtx.lineCap = 'round'
      this.drawingCtx.lineJoin = 'round'

      const isStamp = this.detectStamp(coordinates)
      if (isStamp) {
        this.drawStamp(this.drawingCtx, coordinates)
      } else {
        this.drawShape(this.drawingCtx, this.startCoordinates, coordinates)
        this.lastDrawnOffset = {
          x: coordinates.x - this.startCoordinates.x,
          y: coordinates.y - this.startCoordinates.y
        }
      }
      this.startCoordinates = null
      this.startTime = null
    }
  }

  detectStamp(coordinates) {
    if (!this.startTime) return false
    const elapsed = Date.now() - this.startTime
    const distance = Math.sqrt(
      Math.pow(coordinates.x - this.startCoordinates.x, 2) +
      Math.pow(coordinates.y - this.startCoordinates.y, 2)
    )
    return elapsed < 150 && distance < 5
  }

  drawStamp(ctx, coordinates) {
    if (!this.lastDrawnOffset) return

    this.drawShape(ctx,
      {
        x: coordinates.x - this.lastDrawnOffset.x / 2,
        y: coordinates.y - this.lastDrawnOffset.y / 2
      },
      {
        x: coordinates.x + this.lastDrawnOffset.x / 2,
        y: coordinates.y + this.lastDrawnOffset.y / 2
      }
    )
  }

  deselect() {
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
  }
}
