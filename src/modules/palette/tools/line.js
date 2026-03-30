import { ShapeTool } from './shape-tool.js'

export class Line extends ShapeTool {
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
