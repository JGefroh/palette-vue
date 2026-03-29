import { ShapeTool } from './shape-tool.js'

export class Circle extends ShapeTool {
  get label() {
    return 'Circle'
  }

  drawShape(ctx, startCoords, endCoords) {
    const centerX = (startCoords.x + endCoords.x) / 2
    const centerY = (startCoords.y + endCoords.y) / 2
    const radius = Math.sqrt(
      Math.pow(endCoords.x - centerX, 2) + Math.pow(endCoords.y - centerY, 2)
    )

    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.restore()
  }
}
