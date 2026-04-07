// Handles selection outline rendering
export class SelectOutline {
  constructor(select) {
    this.select = select
    this.handleRadius = 5
  }

  drawSelectionOutline(ctx, x, y, width, height) {
    ctx.save()
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.rect(x, y, width, height)
    ctx.stroke()

    ctx.setLineDash([])
    ctx.fillStyle = '#000000'
    this.drawCornerHandle(ctx, x, y)
    this.drawCornerHandle(ctx, x + width, y)
    this.drawCornerHandle(ctx, x, y + height)
    this.drawCornerHandle(ctx, x + width, y + height)

    ctx.restore()
  }

  drawCornerHandle(ctx, x, y) {
    ctx.beginPath()
    ctx.arc(x, y, this.handleRadius, 0, Math.PI * 2)
    ctx.fill()
  }
}
