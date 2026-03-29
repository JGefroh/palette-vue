export class CanvasStateManager {
  constructor(dependencies) {
    this.drawingCtx = dependencies.drawingCtx
    this.history = []
    this.future = []
  }

  saveState() {
    const state = this.getState()
    this.history.push(state)
  }

  branchFuture() {
    this.future = []
  }

  undo() {
    if (this.history.length) {
      const currentState = this.getState()
      this.future.push(currentState)
      const state = this.history.pop()
      this.drawingCtx.putImageData(state, 0, 0)
    }
  }

  redo() {
    if (this.future.length) {
      const currentState = this.getState()
      this.history.push(currentState)
      const state = this.future.pop()
      this.drawingCtx.putImageData(state, 0, 0)
    }
  }

  getState() {
    return this.drawingCtx.getImageData(0, 0, this.drawingCtx.canvas.width, this.drawingCtx.canvas.height)
  }
}
