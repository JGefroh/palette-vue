export class CanvasStateService {
  constructor(dependencies) {
    this.drawingCtx = dependencies.drawingCtx
    this.history = []
    this.future = []
    this.lastSavedDataUrl = null
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

  save(key = 'palette-drawing') {
    const dataUrl = this.drawingCtx.canvas.toDataURL()
    localStorage.setItem(key, dataUrl)
    this.lastSavedDataUrl = dataUrl
  }

  load(key = 'palette-drawing') {
    const dataUrl = localStorage.getItem(key)
    if (dataUrl) {
      const img = new Image()
      img.onload = () => {
        this.drawingCtx.clearRect(0, 0, this.drawingCtx.canvas.width, this.drawingCtx.canvas.height)
        this.drawingCtx.drawImage(img, 0, 0)
        this.lastSavedDataUrl = dataUrl
      }
      img.src = dataUrl
    }
  }

  hasUnsavedChanges() {
    const currentDataUrl = this.drawingCtx.canvas.toDataURL()
    return this.lastSavedDataUrl === null || currentDataUrl !== this.lastSavedDataUrl
  }
}
