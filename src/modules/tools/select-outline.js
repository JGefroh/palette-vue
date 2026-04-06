// Handles selection outline rendering
export class SelectOutline {
  constructor(select) {
    this.select = select
  }

  drawSelectionOutline(ctx, x, y, width, height) {
    ctx.save()
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.rect(x, y, width, height)
    ctx.stroke()
    ctx.restore()
  }
}
