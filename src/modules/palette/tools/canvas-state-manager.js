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
      return this.history.pop()
    }
    return null
  }

  redo() {
    if (this.future.length) {
      const currentState = this.getState()
      this.history.push(currentState)
      return this.future.pop()
    }
    return null
  }

  getState() {
    return this.drawingCtx.getImageData(0, 0, this.drawingCtx.canvas.width, this.drawingCtx.canvas.height)
  }
}
