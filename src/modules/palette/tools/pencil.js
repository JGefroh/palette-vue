export class Pencil {
  constructor(dependencies) {
    this.drawingCtx = dependencies.drawingCtx
    this.overlayCtx = dependencies.overlayCtx
    this.getLineWidth = dependencies.getLineWidth
    this.onSaveState = dependencies.onSaveState
    this.onBranchFuture = dependencies.onBranchFuture
    this.onMouseDown = dependencies.onMouseDown
    this.onMouseUp = dependencies.onMouseUp
    this.isMouseDown = false
  }

  get label() {
    return 'Pencil'
  }

  start(coordinates) {
    if (!this.isMouseDown) {
      this.initializeStroke(coordinates)
      this.onMouseDown()
    }
    this.isMouseDown = true
  }

  preProcess(coordinates) {
    this.clearOverlay()
  }

  process(coordinates) {
    this.drawCursorPreview(coordinates)
    if (this.isMouseDown) {
      this.drawLine(coordinates)
    }
  }

  end(coordinates) {
    this.finalizeStroke(coordinates)
  }

  initializeStroke(coordinates) {
    this.onSaveState()
    this.onBranchFuture()
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
    this.overlayCtx.strokeStyle = '#000000'
    this.overlayCtx.beginPath()
    this.overlayCtx.arc(coordinates.x, coordinates.y, this.getLineWidth() / 2, 0, 2 * Math.PI, false)
    this.overlayCtx.fill()
    this.overlayCtx.stroke()
    this.overlayCtx.restore()
  }

  drawLine(coordinates) {
    this.drawingCtx.lineTo(coordinates.x, coordinates.y)
    this.drawingCtx.stroke()
    this.drawingCtx.beginPath()
    this.drawingCtx.moveTo(coordinates.x, coordinates.y)
  }

  finalizeStroke(coordinates) {
    this.drawingCtx.lineTo(coordinates.x, coordinates.y)
    this.drawingCtx.stroke()
    this.isMouseDown = false
    this.onMouseUp()
  }

}
