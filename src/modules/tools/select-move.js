// Handles moving a selection
export class SelectMove {
  constructor(select) {
    this.select = select
    this.clickOffset = null
    this.selectedImageData = null
  }

  initiate(coordinates) {
    this.clickOffset = {
      x: coordinates.x - this.select.selectionBounds.x,
      y: coordinates.y - this.select.selectionBounds.y
    }
    const { x, y, width, height } = this.select.selectionBounds
    this.selectedImageData = this.select.drawingCtx.getImageData(x, y, width, height)
    this.select.drawingCtx.clearRect(x, y, width, height)
  }

  updatePreview(coordinates) {
    const newX = coordinates.x - this.clickOffset.x
    const newY = coordinates.y - this.clickOffset.y
    this.select.imageDrawer.drawImageData(this.select.overlayCtx, this.selectedImageData, newX, newY, this.select.mode)
    this.select.outline.drawSelectionOutline(this.select.overlayCtx, newX, newY, this.select.selectionBounds.width, this.select.selectionBounds.height)
  }

  finalize(coordinates) {
    const newX = coordinates.x - this.clickOffset.x
    const newY = coordinates.y - this.clickOffset.y
    this.select.imageDrawer.drawImageData(this.select.drawingCtx, this.selectedImageData, newX, newY, this.select.mode)
    this.cleanup()
  }

  cleanup() {
    this.clickOffset = null
    this.selectedImageData = null
  }
}
