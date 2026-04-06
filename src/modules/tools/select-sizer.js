// Handles sizing a new selection box while dragging
export class SelectSizer {
  constructor(select) {
    this.select = select
    this.startCoordinates = null
  }

  initiate(coordinates) {
    this.startCoordinates = { x: coordinates.x, y: coordinates.y }
    this.select.overlayCtx.clearRect(0, 0, this.select.overlayCtx.canvas.width, this.select.overlayCtx.canvas.height)
  }

  updatePreview(coordinates) {
    const bounds = this.select.calculateSelectionBounds(this.startCoordinates, coordinates)
    this.select.outline.drawSelectionOutline(this.select.overlayCtx, bounds.x, bounds.y, bounds.width, bounds.height)
  }

  finalize(coordinates) {
    this.select.selectionBounds = this.select.calculateSelectionBounds(this.startCoordinates, coordinates)
    this.startCoordinates = null
  }

  cleanup() {
    this.startCoordinates = null
  }
}
