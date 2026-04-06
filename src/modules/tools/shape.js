import { globalState } from '../persistence/global-state.js'

export class Shape {
  constructor({ drawingCtx, overlayCtx }) {
    this.drawingCtx = drawingCtx
    this.overlayCtx = overlayCtx
    this.startCoordinates = null
    this.mode = 'outline'
  }

  get label() {
    throw new Error(`${this.constructor.name} must implement label getter`)
  }

  drawShape(ctx, startCoords, endCoords) {
    throw new Error(`${this.constructor.name} must implement drawShape(ctx, startCoords, endCoords)`)
  }

  start(coordinates) {
    this.startCoordinates = { x: coordinates.x, y: coordinates.y }
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
      this.drawShape(this.drawingCtx, this.startCoordinates, coordinates)
      this.startCoordinates = null
    }
  }
}
