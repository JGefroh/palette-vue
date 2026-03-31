import { CanvasStateService } from './canvas-state-service.js'

class GlobalCanvasManager {
  constructor() {
    this.drawingCtx = null
    this.overlayCtx = null
    this.onContextsReady = null
    this.stateManager = null
  }

  setContexts(drawingCtx, overlayCtx) {
    this.drawingCtx = drawingCtx
    this.overlayCtx = overlayCtx
    this.stateManager = new CanvasStateService({ drawingCtx })
    this.onContextsReady?.()
  }

  getDrawingContext() {
    return this.drawingCtx
  }

  getOverlayContext() {
    return this.overlayCtx
  }

  getStateManager() {
    return this.stateManager
  }

  saveDrawingState() {
    this.stateManager?.saveState()
    this.stateManager?.branchFuture()
  }

  persistCanvas(tabId) {
    this.stateManager?.save(`palette-canvas-${tabId}`)
  }

  undoDrawing() {
    this.stateManager?.undo()
  }

  redoDrawing() {
    this.stateManager?.redo()
  }

  loadCanvas(tabId) {
    this.stateManager?.load(`palette-canvas-${tabId}`)
  }
}

export const globalCanvasManager = new GlobalCanvasManager()
