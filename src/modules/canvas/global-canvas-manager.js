import { globalState } from '../persistence/global-state.js'

class GlobalCanvasManager {
  constructor() {
    this.drawingCtx = null
    this.overlayCtx = null
    this.onContextsReady = null
    this.history = []
    this.future = []
    this.lastSavedDataUrl = null
  }

  setDrawingContext(drawingCtx) {
    this.drawingCtx = drawingCtx
    this.checkContextsReady()
  }

  setOverlayContext(overlayCtx) {
    this.overlayCtx = overlayCtx
    this.checkContextsReady()
  }

  checkContextsReady() {
    if (this.drawingCtx && this.overlayCtx) {
      this.onContextsReady?.()
    }
  }

  setContexts(drawingCtx, overlayCtx) {
    this.drawingCtx = drawingCtx
    this.overlayCtx = overlayCtx
    this.checkContextsReady()
  }

  getDrawingContext() {
    return this.drawingCtx
  }

  getOverlayContext() {
    return this.overlayCtx
  }

  getImageData() {
    return this.drawingCtx.getImageData(0, 0, this.drawingCtx.canvas.width, this.drawingCtx.canvas.height)
  }

  saveDrawingState() {
    const imageData = this.getImageData()
    this.history.push(imageData)
    this.future = []
  }

  undoDrawing() {
    if (this.history.length) {
      const currentImageData = this.getImageData()
      this.future.push(currentImageData)
      const imageData = this.history.pop()
      this.drawingCtx.putImageData(imageData, 0, 0)
      this.persistCanvas(globalState.get('selectedTab').id)
    }
  }

  redoDrawing() {
    if (this.future.length) {
      const currentImageData = this.getImageData()
      this.history.push(currentImageData)
      const imageData = this.future.pop()
      this.drawingCtx.putImageData(imageData, 0, 0)
      this.persistCanvas(globalState.get('selectedTab').id)
    }
  }

  clear() {
    this.drawingCtx.clearRect(0, 0, this.drawingCtx.canvas.width, this.drawingCtx.canvas.height)
    this.persistCanvas(globalState.get('selectedTab').id)
  }

  persistCanvas(tabId) {
    const dataUrl = this.drawingCtx.canvas.toDataURL()
    globalState.set(`${tabId}`, dataUrl)
    globalState.set(`${tabId}-width`, this.drawingCtx.canvas.width)
    globalState.set(`${tabId}-height`, this.drawingCtx.canvas.height)
    this.lastSavedDataUrl = dataUrl
  }

  deleteCanvas(tabId) {
    globalState.delete(`${tabId}`)
    globalState.delete(`${tabId}-width`)
    globalState.delete(`${tabId}-height`)
  }

  loadCanvas(tabId) {
    if (!this.drawingCtx) return

    const dataUrl = globalState.get(`${tabId}`)
    const width = globalState.get(`${tabId}-width`)
    const height = globalState.get(`${tabId}-height`)

    if (width && height) {
      this.drawingCtx.canvas.width = width
      this.drawingCtx.canvas.height = height
    }

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

export const globalCanvasManager = new GlobalCanvasManager()
