import { ShapeTool } from './shape-tool.js'

export class Rectangle extends ShapeTool {
  get label() {
    return 'Rectangle'
  }

  drawShape(ctx, startCoords, endCoords) {
    const x = Math.min(startCoords.x, endCoords.x)
    const y = Math.min(startCoords.y, endCoords.y)
    const width = Math.abs(endCoords.x - startCoords.x)
    const height = Math.abs(endCoords.y - startCoords.y)

    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, width, height)
    this.mode === 'fill' ? ctx.fill() : ctx.stroke()
    ctx.restore()
  }
}
