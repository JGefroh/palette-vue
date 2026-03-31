import { ShapeTool } from './shape-tool.js'

export class Line extends ShapeTool {
  constructor(dependencies) {
    super(dependencies)
    this.name = 'Line'
    this.icon = 'fa-minus'
    this.shortcut = 'l'
  }

  static new(drawingCtx, overlayCtx, getLineWidth) {
    return new Line({ drawingCtx, overlayCtx, getLineWidth })
  }

  get label() {
    return 'Line'
  }

  drawShape(ctx, startCoords, endCoords) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(startCoords.x, startCoords.y)
    ctx.lineTo(endCoords.x, endCoords.y)
    ctx.stroke()
    ctx.restore()
  }
}
