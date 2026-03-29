export class Pencil {
  constructor(dependencies) {
    this.drawingCtx = dependencies.drawingCtx
    this.overlayCtx = dependencies.overlayCtx
    this.getLineWidth = dependencies.getLineWidth
    this.strokeStartCoordinates = null
  }

  get label() {
    return 'Pencil'
  }

  start(coordinates) {
    this.strokeStartCoordinates = { x: coordinates.x, y: coordinates.y }
    this.initializeStroke(coordinates)
  }

  preProcess(coordinates) {
    this.clearOverlay()
  }

  process(coordinates) {
    this.drawCursorPreview(coordinates)
    this.drawLine(coordinates)
  }

  end(coordinates) {
    this.finalizeStroke(coordinates)
  }

  initializeStroke(coordinates) {
    this.drawingCtx.beginPath()
    this.drawingCtx.moveTo(coordinates.x, coordinates.y)
  }

  clearOverlay() {
    this.overlayCtx.save()
    this.overlayCtx.fillStyle = '#FFFFFF'
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    this.overlayCtx.restore()
  }

  drawCursorPreview(coordinates) {
    this.overlayCtx.save()
    this.overlayCtx.beginPath()
    this.overlayCtx.arc(coordinates.x, coordinates.y, this.getLineWidth() / 2, 0, 2 * Math.PI, false)
    this.overlayCtx.fill()
    this.overlayCtx.restore()
  }

  drawLine(coordinates) {
    this.drawingCtx.lineTo(coordinates.x, coordinates.y)
    this.drawingCtx.stroke()
    this.drawingCtx.beginPath()
    this.drawingCtx.moveTo(coordinates.x, coordinates.y)
  }

  finalizeStroke(coordinates) {
    // If no movement occurred, draw a point
    if (this.strokeStartCoordinates &&
        coordinates.x === this.strokeStartCoordinates.x &&
        coordinates.y === this.strokeStartCoordinates.y) {
      this.drawingCtx.arc(coordinates.x, coordinates.y, this.getLineWidth() / 2, 0, 2 * Math.PI)
      this.drawingCtx.fill()
    } else {
      this.drawingCtx.lineTo(coordinates.x, coordinates.y)
      this.drawingCtx.stroke()
    }
  }

}
