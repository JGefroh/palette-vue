// Handles idle state with visible selection outline
export class SelectIdle {
  constructor(select) {
    this.select = select
  }

  restore() {
    if (!this.select.selectionBounds) return
    const { x, y, width, height } = this.select.selectionBounds
    this.select.outline.drawSelectionOutline(this.select.overlayCtx, x, y, width, height)
  }
}
