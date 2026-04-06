import { Shape } from './shape.js'

export class ShapeCircle extends Shape {
  constructor(dependencies) {
    super(dependencies)
    this.name = 'Circle'
    this.fillIcon = 'fa-circle'
    this.outlineIcon = 'fa-circle-o'
  }

  static new(drawingCtx, overlayCtx) {
    return new ShapeCircle({ drawingCtx, overlayCtx })
  }

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
    this.mode === 'fill' ? ctx.fill() : ctx.stroke()
    ctx.restore()
  }
}
