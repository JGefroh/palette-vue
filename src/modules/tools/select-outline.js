// Handles selection outline rendering
export class SelectOutline {
  constructor(select) {
    this.select = select
    this.resizeHandleRadius = 3
    this.rotationRingRadius = 4
  }

  drawSelectionOutline(ctx, x, y, width, height) {
    ctx.save()

    // Outline
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 0.75
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.rect(x, y, width, height)
    ctx.stroke()

    ctx.setLineDash([])

    // Resize handles (filled circles at corners)
    ctx.fillStyle = '#000000'
    this.drawResizeHandle(ctx, x, y)
    this.drawResizeHandle(ctx, x + width, y)
    this.drawResizeHandle(ctx, x, y + height)
    this.drawResizeHandle(ctx, x + width, y + height)

    // Rotation grab rings
    this.drawRotationGrabs(ctx, x, y, width, height)

    ctx.restore()
  }

  drawResizeHandle(ctx, x, y) {
    ctx.beginPath()
    ctx.arc(x, y, this.resizeHandleRadius, 0, Math.PI * 2)
    ctx.fill()
  }

  drawRotationGrabs(ctx, x, y, width, height) {
    const minDist = this.select.cornerThreshold
    const maxDist = this.select.rotationThreshold
    const midDist = (minDist + maxDist) / 2

    const corners = [
      { x: x, y: y, angle: Math.PI + Math.PI / 4 },
      { x: x + width, y: y, angle: -Math.PI / 4 },
      { x: x, y: y + height, angle: Math.PI - Math.PI / 4 },
      { x: x + width, y: y + height, angle: Math.PI / 4 }
    ]

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.fillStyle = 'transparent'

    for (const corner of corners) {
      const grabX = corner.x + Math.cos(corner.angle) * midDist
      const grabY = corner.y + Math.sin(corner.angle) * midDist

      ctx.beginPath()
      ctx.arc(grabX, grabY, this.rotationRingRadius, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
}
