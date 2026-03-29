export class CanvasClearer {
  constructor(drawingCtx) {
    this.drawingCtx = drawingCtx
  }

  clear() {
    if (confirm('Are you sure?')) {
      this.drawingCtx.clearRect(0, 0, this.drawingCtx.canvas.width, this.drawingCtx.canvas.height)
      return true
    }
    return false
  }
}
