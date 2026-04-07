// Handles rotating a selection
export class SelectRotator {
  constructor(select) {
    this.select = select
    this.startCoordinates = null
    this.startAngle = null
    this.originBounds = null
    this.selectedImageData = null
  }

  initiate(coordinates) {
    this.startCoordinates = { x: coordinates.x, y: coordinates.y }
    this.originBounds = { ...this.select.selectionBounds }

    const center = this.getCenter(this.originBounds)
    this.startAngle = Math.atan2(
      coordinates.y - center.y,
      coordinates.x - center.x
    )

    const { x, y, width, height } = this.originBounds
    this.selectedImageData = this.select.drawingCtx.getImageData(x, y, width, height)
    this.select.drawingCtx.clearRect(x, y, width, height)
  }

  updatePreview(coordinates, shiftKey) {
    const center = this.getCenter(this.originBounds)
    const currentAngle = Math.atan2(
      coordinates.y - center.y,
      coordinates.x - center.x
    )

    let angle = currentAngle - this.startAngle

    if (shiftKey) {
      const snapAngle = Math.PI / 12 // 15 degrees
      angle = Math.round(angle / snapAngle) * snapAngle
    }

    this.drawRotatedImage(this.select.overlayCtx, angle)
    this.drawRotatedOutline(this.select.overlayCtx, angle)
  }

  finalize(coordinates, shiftKey) {
    const center = this.getCenter(this.originBounds)
    const currentAngle = Math.atan2(
      coordinates.y - center.y,
      coordinates.x - center.x
    )

    let angle = currentAngle - this.startAngle

    if (shiftKey) {
      const snapAngle = Math.PI / 12
      angle = Math.round(angle / snapAngle) * snapAngle
    }

    this.drawRotatedImage(this.select.drawingCtx, angle)
    this.cleanup()
  }

  drawRotatedImage(ctx, angle) {
    if (!this.selectedImageData) return

    const center = this.getCenter(this.originBounds)
    const { width, height } = this.originBounds

    ctx.save()
    ctx.translate(center.x, center.y)
    ctx.rotate(angle)
    ctx.translate(-width / 2, -height / 2)

    this.select.imageDrawer.drawImageData(
      ctx,
      this.selectedImageData,
      0,
      0,
      this.select.mode,
      width,
      height
    )

    ctx.restore()
  }

  drawRotatedOutline(ctx, angle) {
    const center = this.getCenter(this.originBounds)
    const { width, height } = this.originBounds

    ctx.save()
    ctx.translate(center.x, center.y)
    ctx.rotate(angle)
    ctx.translate(-width / 2, -height / 2)

    this.select.outline.drawSelectionOutline(ctx, 0, 0, width, height)

    ctx.restore()
  }

  getCenter(bounds) {
    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2
    }
  }

  cleanup() {
    this.startCoordinates = null
    this.startAngle = null
    this.originBounds = null
    this.selectedImageData = null
  }
}
