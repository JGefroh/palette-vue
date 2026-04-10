import { Shape } from './shape.js'
import { globalState } from '../persistence/global-state.js'
import { inputHandler } from '../input/input-handler.js'

export class ShapeRectangle extends Shape {
  constructor(dependencies) {
    super(dependencies)
    this.name = 'Rectangle'
    this.fillIcon = 'fa-solid fa-square'
    this.outlineIcon = 'fa-regular fa-square'
    this.unsubscribeConstrainSquare = null
    this.unsubscribeUnconstrainSquare = null
  }

  static new(drawingCtx, overlayCtx) {
    return new ShapeRectangle({ drawingCtx, overlayCtx })
  }

  get label() {
    return 'Rectangle'
  }

  start(coordinates) {
    super.start(coordinates)
    globalState.set('constrainToSquare', false)
    this.unsubscribeConstrainSquare = inputHandler.onCommand('constrainSquare', () => {
      globalState.set('constrainToSquare', true)
    })
    this.unsubscribeUnconstrainSquare = inputHandler.onCommand('unconstrainSquare', () => {
      globalState.set('constrainToSquare', false)
    })
    if (inputHandler.getMode().shift) {
      globalState.set('constrainToSquare', true)
    }
  }

  end(coordinates) {
    if (this.unsubscribeConstrainSquare) {
      this.unsubscribeConstrainSquare()
    }
    if (this.unsubscribeUnconstrainSquare) {
      this.unsubscribeUnconstrainSquare()
    }
    super.end(coordinates)
  }

  drawShape(ctx, startCoords, endCoords) {
    let x = startCoords.x
    let y = startCoords.y
    let width = Math.abs(endCoords.x - startCoords.x)
    let height = Math.abs(endCoords.y - startCoords.y)

    if (globalState.get('constrainToSquare')) {
      const side = Math.max(width, height)
      if (endCoords.x < startCoords.x) {
        x = startCoords.x - side
      }
      if (endCoords.y < startCoords.y) {
        y = startCoords.y - side
      }
      width = side
      height = side
    } else {
      x = Math.min(startCoords.x, endCoords.x)
      y = Math.min(startCoords.y, endCoords.y)
    }

    ctx.save()
    ctx.beginPath()
    const radius = this.mode === 'fill' ? globalState.get('selectedSize') / 2 : 0
    ctx.roundRect(x, y, width, height, radius)
    this.mode === 'fill' ? ctx.fill() : ctx.stroke()
    ctx.restore()
  }
}
