class GlobalCanvasManager {
  constructor() {
    this.drawingCtx = null
    this.overlayCtx = null
    this.onContextsReady = null
  }

  setContexts(drawingCtx, overlayCtx) {
    this.drawingCtx = drawingCtx
    this.overlayCtx = overlayCtx
    this.onContextsReady?.()
  }

  getDrawingContext() {
    return this.drawingCtx
  }

  getOverlayContext() {
    return this.overlayCtx
  }
}

export const globalCanvasManager = new GlobalCanvasManager()
