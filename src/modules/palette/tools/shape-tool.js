export class ShapeTool {
  constructor({ drawingCtx, overlayCtx, getLineWidth }) {
    this.drawingCtx = drawingCtx
    this.overlayCtx = overlayCtx
    this.getLineWidth = getLineWidth
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
    if (this.getLineWidth) {
      this.overlayCtx.lineWidth = this.getLineWidth()
    }
    this.drawShape(this.overlayCtx, this.startCoordinates, coordinates)
  }

  end(coordinates) {
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    if (this.startCoordinates) {
      if (this.getLineWidth) {
        this.drawingCtx.lineWidth = this.getLineWidth()
      }
      this.drawShape(this.drawingCtx, this.startCoordinates, coordinates)
    }
    this.startCoordinates = null
  }
}
